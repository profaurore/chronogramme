import {
	DragMoveEventDetail,
	DragState,
	type Timeline as HTMLTimeline,
	ScrollBoundsChangeEventDetail,
	TIME_MAX,
	TIME_MIN,
	UNIT,
	WindowChangeEventDetail,
	ZERO,
} from "@chronogramme/chronogramme";
import {
	Children,
	type Component,
	type CSSProperties,
	type HTMLAttributes,
	memo,
	type ReactNode,
	type Ref,
	type RefObject,
	type SyntheticEvent,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	DEFAULT_TIME_STEPS,
	defaultKeys,
	minCellWidth,
	timeFactors,
} from "./constants";
import { Group } from "./groups/Group";
import { Row } from "./groups/Row";
import type { ShowPeriod } from "./headers/CustomHeader";
import { DateHeader, type Unit } from "./headers/DateHeader";
import { HeadersContextProvider } from "./headers/HeadersContextProvider";
import { TimelineHeaders } from "./headers/TimelineHeaders";
import { HelpersContextProvider } from "./helpers/HelpersContextProvider";
import { TimelineContextProvider } from "./helpers/TimelineContextProvider";
import { ItemContextProvider } from "./items/ItemContextProvider";
import { TimelineMarkers } from "./markers/TimelineMarkers";
import {
	MILLISECONDS_PER_FIFTEEN_MINUTES,
	MILLISECONDS_PER_HOUR,
	MILLISECONDS_PER_MINUTE,
} from "./utils/dateUtils";
import { getReactChildSecretKey, useRender } from "./utils/reactUtils";
import type {
	FullRequired,
	RctToCoreGroup,
	RctToCoreItem,
} from "./utils/typeUtils";
import {
	type UnsupportedType,
	validateComponentProperties,
} from "./utils/unsupportedUtils";

const defaultOnTimeChange: OnTimeChange = (
	newVisibleTimeStart: number,
	newVisibleTimeEnd: number,
	updateScrollCanvas: UpdateScrollCanvas,
): void => updateScrollCanvas(newVisibleTimeStart, newVisibleTimeEnd);

/**
 * @deprecated Unsupported property from React Calendar Timeline's API. Use
 * the generic `TGroupId` and `TItemId` instead.
 */
export type Id = UnsupportedType<
	number | string,
	"Use the generic `TGroupId` and `TItemId` instead."
>;

export type BaseItem<
	TGroupId,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
> = {
	canMove?: boolean | undefined;
	canResize?: ResizableEdges | undefined;
	className?: string | undefined;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. Provide
	 * an `itemRenderer` function instead.
	 */
	itemProps?: UnsupportedType<
		HTMLAttributes<HTMLDivElement> | undefined,
		"Used by `DefaultItemRenderer`, which is unsupported."
	>;
} & {
	[K in TItemIdKey]: TItemId;
} & {
	[K in TItemTitleKey]?: ReactNode | undefined;
} & {
	[K in TItemDivTitleKey]?: ReactNode | undefined;
} & {
	[K in TItemGroupKey]: TGroupId;
} & {
	[K in TItemTimeStartKey]: EpochTimeStamp;
} & {
	[K in TItemTimeEndKey]: EpochTimeStamp;
};

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `BaseItem` instead.
 */
export type TimelineItemBase<
	TGroupId,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
> = UnsupportedType<
	BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	"Use `BaseItem` instead."
>;

export type BaseGroup<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
> = {
	lineHeight?: number | undefined;

	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. Create
	 * one group per item.
	 */
	stackItems?: UnsupportedType<
		boolean | undefined,
		"Create one group per item."
	>;
} & {
	[K in TGroupIdKey]: TGroupId;
} & {
	[K in TGroupTitleKey]?: string | undefined;
} & {
	[K in TGroupRightTitleKey]?: string | undefined;
};

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `BaseGroup` instead.
 */
export type TimelineGroupBase<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
> = UnsupportedType<
	BaseGroup<TGroupId, TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
	"Use `BaseGroup` instead."
>;

export type ResizeEdge = "left" | "right";

export type ResizableEdges = false | ResizeEdge | "both";

export type HorizontalClassNamesForGroup<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
> = (group: TGroup) => string[];

export type MoveValidator<TItemId> = (
	action: "move",
	itemId: TItemId,
	time: number,
) => number;

export type ResizeValidator<TItemId> = (
	action: "resize",
	itemId: TItemId,
	time: number,
	resizeEdge: ResizeEdge,
) => number;

export type OnBoundsChange = (
	canvasTimeStart: number,
	canvasTimeEnd: number,
) => void;

export type OnCanvasClick<TGroupId> = (
	groupId: TGroupId,
	time: number,
	e: SyntheticEvent,
) => void;

export type OnCanvasContextMenu<TGroupId> = (
	groupId: TGroupId,
	time: number,
	e: SyntheticEvent,
) => void;

export type OnCanvasDoubleClick<TGroupId> = (
	groupId: TGroupId,
	time: number,
	e: SyntheticEvent,
) => void;

export type OnItemClick<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

export type OnItemContextMenu<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

export type OnItemDeselect = () => void;

export type OnItemDoubleClick<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

export interface ItemMoveObject<TGroupId, TItemId> {
	eventType: "move";
	itemId: TItemId;
	time: number;
	newGroupId: TGroupId;
}

export interface ItemResizeObject<TItemId> {
	eventType: "resize";
	itemId: TItemId;
	time: number;
	edge: ResizeEdge;
}

export type OnItemDrag<TGroupId, TItemId> = (
	itemDragObject: ItemMoveObject<TGroupId, TItemId> | ItemResizeObject<TItemId>,
) => void;

export type OnItemMove<TGroupId, TItemId> = (
	itemId: TItemId,
	dragTime: number,
	newGroupOrder: TGroupId,
) => void;

export type OnItemResize<TItemId> = (
	itemId: TItemId,
	endTimeOrStartTime: number,
	edge: ResizeEdge,
) => void;

export type OnItemSelect<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

export type UpdateScrollCanvas = (start: number, end: number) => void;

export type OnTimeChange = (
	newVisibleTimeStart: number,
	newVisibleTimeEnd: number,
	updateScrollCanvas: UpdateScrollCanvas,
) => void;

export interface TimelineContext {
	canvasTimeEnd: number;
	canvasTimeStart: number;
	timelineWidth: number;
	visibleTimeEnd: number;
	visibleTimeStart: number;
}

export type OnZoom = (timelineContext: TimelineContext) => void;

export interface ResizeDetector {
	addListener?: Component;
	removeListener?: Component;
}

export type VerticalLineClassNameForTime = (
	startTime: number,
	endTime: number,
) => string[];

export interface TimeSteps {
	second: number;
	minute: number;
	hour: number;
	day: number;
	month: number;
	year: number;
}

export interface GetLayerRootPropsReturnType {
	style: CSSProperties;
}

export type GetLayerRootProps = () => GetLayerRootPropsReturnType;

export interface RowRendererProps<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData,
> {
	getLayerRootProps: GetLayerRootProps;
	group: TGroup;
	itemsWithInteractions: readonly Readonly<TItem>[];
	rowData: TRowData;
}

export type RowRenderer<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData,
> = (
	props: RowRendererProps<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem,
		TRowData
	>,
) => ReactNode;

export interface GroupRendererProps<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
> {
	group: TGroup;
	isRightSidebar?: boolean | undefined;
}

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `GroupRendererProps` instead.
 */
export type ReactCalendarGroupRendererProps<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
> = UnsupportedType<
	GroupRendererProps<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup
	>,
	"Use `GroupRendererProps` instead."
>;

export type GroupRenderer<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
> = (
	props: GroupRendererProps<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup
	>,
) => ReactNode;

export type GetItemProps = (
	params: Pick<
		HTMLAttributes<HTMLDivElement>,
		| "className"
		| "onClick"
		| "onContextMenu"
		| "onDoubleClick"
		| "onMouseDown"
		| "onMouseUp"
		| "onPointerDownCapture"
		| "onTouchEnd"
		| "onTouchStart"
		| "style"
	>,
) => FullRequired<
	Pick<
		HTMLAttributes<HTMLDivElement>,
		"className" | "onPointerDownCapture" | "slot" | "style"
	>
> &
	Pick<
		HTMLAttributes<HTMLDivElement>,
		| "onClick"
		| "onMouseDown"
		| "onMouseUp"
		| "onTouchStart"
		| "onTouchEnd"
		| "onDoubleClick"
		| "onContextMenu"
	>;

export interface ItemRendererGetResizePropsReturnType {
	left: FullRequired<
		Pick<
			HTMLAttributes<HTMLDivElement>,
			"className" | "onPointerDownCapture" | "style"
		>
	>;
	right: FullRequired<
		Pick<
			HTMLAttributes<HTMLDivElement>,
			"className" | "onPointerDownCapture" | "style"
		>
	>;
}

export interface ItemRendererGetResizePropsParameters {
	leftClassName?: string | undefined;
	leftStyle?: CSSProperties | undefined;
	rightClassName?: string | undefined;
	rightStyle?: CSSProperties | undefined;
}

export type ItemRendererGetResizeProps = (
	params?: ItemRendererGetResizePropsParameters | undefined,
) => ItemRendererGetResizePropsReturnType;

export interface ItemDimensions {
	collisionLeft: number;
	collisionWidth: number;
	height: number;
	left: number;
	top: number;
	width: number;
}

export interface ItemRendererItemContext<TGroupId> {
	canMove: boolean;
	canResizeLeft: boolean;
	canResizeRight: boolean;
	dimensions: ItemDimensions;
	dragging: boolean;
	dragOffset: number | undefined;
	dragTime: number | undefined;
	newGroupId: TGroupId | undefined;
	resizeEdge: ResizeEdge | undefined;
	resizeOffset: number | undefined;
	resizeTime: number | undefined;
	resizing: boolean;
	selected: boolean;
	title: ReactNode | undefined;
	useResizeHandle: boolean;
	width: number;
}

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `ItemRendererItemContext` instead.
 */
export type ItemContext<TGroupId> = UnsupportedType<
	ItemRendererItemContext<TGroupId>,
	"Use `ItemRendererItemContext` instead."
>;

export interface ItemRendererProps<
	TGroupId,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
> {
	getItemProps: GetItemProps;
	getResizeProps: ItemRendererGetResizeProps;
	item: TItem;
	itemContext: ItemRendererItemContext<TGroupId>;
	timelineContext: TimelineContext;
}

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `ItemRendererProps` instead.
 */
export type ReactCalendarItemRendererProps<
	TGroupId,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
> = UnsupportedType<
	ItemRendererProps<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem
	>,
	"Use `ItemRendererProps` instead."
>;

export type ItemRenderer<
	TGroupId,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
> = (
	props: ItemRendererProps<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem
	>,
) => ReactNode;

export interface TimelineKeys<
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
> {
	groupIdKey: TGroupIdKey;
	groupTitleKey: TGroupTitleKey;
	groupRightTitleKey: TGroupRightTitleKey;
	itemIdKey: TItemIdKey;
	itemGroupKey: TItemGroupKey;
	itemTitleKey: TItemTitleKey;
	itemDivTitleKey: TItemDivTitleKey;
	itemTimeStartKey: TItemTimeStartKey;
	itemTimeEndKey: TItemTimeEndKey;
}

export interface TimelineProps<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData,
> {
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	canChangeGroup?: UnsupportedType<
		boolean | undefined,
		"No alternative available."
	>;
	canMove?: boolean | undefined;
	canResize?: ResizableEdges | undefined;
	canSelect?: boolean | undefined;
	children?: ReactNode | undefined;
	className?: string | undefined;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	clickTolerance?: UnsupportedType<
		number | undefined,
		"No alternative available."
	>;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	defaultTimeEnd?: UnsupportedType<
		number | undefined,
		"No alternative available."
	>;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	defaultTimeStart?: UnsupportedType<
		number | undefined,
		"No alternative available."
	>;
	dragSnap?: number | undefined;
	groupRenderer: GroupRenderer<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup
	>;
	groups: TGroup[];
	headerHeight?: number | undefined;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	headerRef?: UnsupportedType<Ref<HTMLDivElement>, "No alternative available.">;
	hideHeaders?: boolean | undefined;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	hideHorizontalLines?: UnsupportedType<
		boolean | undefined,
		"No alternative available."
	>;
	horizontalLineClassNamesForGroup?:
		| HorizontalClassNamesForGroup<
				TGroupId,
				TGroupIdKey,
				TGroupTitleKey,
				TGroupRightTitleKey,
				TGroup
		  >
		| undefined;
	id?: string | undefined;
	itemHeightRatio?: number | undefined;
	itemRenderer: ItemRenderer<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem
	>;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	itemTouchSendsClick?: UnsupportedType<
		boolean | undefined,
		"No alternative available."
	>;
	items: TItem[];
	keys?:
		| TimelineKeys<
				TGroupIdKey,
				TGroupTitleKey,
				TGroupRightTitleKey,
				TItemIdKey,
				TItemGroupKey,
				TItemTitleKey,
				TItemDivTitleKey,
				TItemTimeStartKey,
				TItemTimeEndKey
		  >
		| undefined;
	lineHeight?: number | undefined;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	maxZoom?: UnsupportedType<number | undefined, "No alternative available.">;
	minResizeWidth?: number | undefined;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	minZoom?: UnsupportedType<number | undefined, "No alternative available.">;
	moveResizeValidator?(
		...args: Parameters<MoveValidator<TItemId>>
	): ReturnType<MoveValidator<TItemId>>;
	moveResizeValidator?(
		...args: Parameters<ResizeValidator<TItemId>>
	): ReturnType<ResizeValidator<TItemId>>;
	onBoundsChange?: OnBoundsChange | undefined;
	onCanvasClick?: OnCanvasClick<TGroupId> | undefined;
	onCanvasContextMenu?: OnCanvasContextMenu<TGroupId> | undefined;
	onCanvasDoubleClick?: OnCanvasDoubleClick<TGroupId> | undefined;
	onItemClick?: OnItemClick<TItemId> | undefined;
	onItemContextMenu?: OnItemContextMenu<TItemId> | undefined;
	onItemDeselect?: OnItemDeselect | undefined;
	onItemDoubleClick?: OnItemDoubleClick<TItemId> | undefined;
	onItemDrag?: OnItemDrag<TGroupId, TItemId> | undefined;
	onItemMove?: OnItemMove<TGroupId, TItemId> | undefined;
	onItemResize?: OnItemResize<TItemId> | undefined;
	onItemSelect?: OnItemSelect<TItemId> | undefined;
	onTimeChange?: OnTimeChange | undefined;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	onZoom?: UnsupportedType<OnZoom | undefined, "No alternative available.">;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	resizeDetector?: UnsupportedType<
		ResizeDetector | undefined,
		"No alternative available."
	>;
	rightSidebarWidth?: number | undefined;
	rowData: TRowData;
	rowRenderer: RowRenderer<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem,
		TRowData
	>;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	scrollRef?: UnsupportedType<
		Ref<HTMLDivElement> | undefined,
		"No alternative available."
	>;
	selected?: TItemId[] | undefined;
	sidebarWidth?: number | undefined;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. Create
	 * one group per item.
	 */
	stackItems?: UnsupportedType<
		boolean | undefined,
		"Create one group per item."
	>;
	style?: CSSProperties | undefined;
	timeSteps?: TimeSteps | undefined;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	traditionalZoom?: UnsupportedType<
		boolean | undefined,
		"No alternative available."
	>;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	useResizeHandle?: UnsupportedType<
		boolean | undefined,
		"No alternative available."
	>;
	verticalLineClassNameForTime?: VerticalLineClassNameForTime | undefined;
	visibleTimeEnd: number;
	visibleTimeStart: number;
}

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `TimelineProps` instead.
 */
export type ReactCalendarTimelineProps<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData,
> = UnsupportedType<
	TimelineProps<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TGroup,
		TItem,
		TRowData
	>,
	"Use `TimelineProps` instead."
>;

const UNSUPPORTED_PROPERTIES = [
	"canChangeGroup",
	"clickTolerance",
	"defaultTimeEnd",
	"defaultTimeStart",
	"headerRef",
	"hideHorizontalLines",
	"itemTouchSendsClick",
	"maxZoom",
	"minZoom",
	"onZoom",
	"resizeDetector",
	"scrollRef",
	"stackItems",
	"traditionalZoom",
	"useResizeHandle",
] as const;

function RenderedTimeline<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData,
>({
	canMove = true,
	canResize = "right",
	canSelect = true,
	children,
	className,
	dragSnap = MILLISECONDS_PER_FIFTEEN_MINUTES,
	groupRenderer,
	headerHeight = 50,
	hideHeaders,
	horizontalLineClassNamesForGroup,
	id,
	itemHeightRatio = 0.65,
	itemRenderer,
	itemsWithInteractions,
	keys,
	lineHeight = 30,
	moveResizeValidator,
	minResizeWidth = 20,
	onBoundsChange,
	onCanvasClick,
	onCanvasContextMenu,
	onCanvasDoubleClick,
	onItemClick,
	onItemContextMenu,
	onItemDeselect,
	onItemDoubleClick,
	onItemDrag,
	onItemMove,
	onItemResize,
	onItemSelect,
	onTimeChange = defaultOnTimeChange,
	rightSidebarWidth = 0,
	rowData,
	rowRenderer,
	selected,
	sidebarWidth = 150,
	style,
	timeSteps = DEFAULT_TIME_STEPS,
	timelineRef,
	visibleTimeEnd,
	visibleTimeStart,
}: Omit<
	TimelineProps<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TGroup,
		TItem,
		TRowData
	>,
	"groups" | "items"
> & {
	itemsWithInteractions: readonly Readonly<TItem>[];
	renderIndicator: number;
	timelineRef: RefObject<InstanceType<
		typeof HTMLTimeline<
			TGroupId,
			RctToCoreGroup<TGroupId, TGroup>,
			TItemId,
			RctToCoreItem<TGroupId, TItemId, TItem>
		>
	> | null>;
}): ReactNode {
	const [selectedItemId, setSelectedItemId] = useState<TItemId>();

	const itemDragStateRef = useRef(new DragState({ endOnDisconnect: false }));
	const itemResizeStateRef = useRef(new DragState({ endOnDisconnect: false }));

	const resolvedKeys = (keys ?? defaultKeys) as TimelineKeys<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>;

	useEffect(() => {
		const timeline = timelineRef.current;

		if (timeline !== null) {
			if (moveResizeValidator === undefined) {
				timeline.setItemDragValidator(undefined);
				timeline.setItemResizeValidator(undefined);
			} else {
				timeline.setItemDragValidator(
					function itemDragValidator(item, startTime) {
						const validatedStartTime = moveResizeValidator(
							"move",
							item.id,
							startTime,
						);

						const delta = item.endTime - item.startTime;

						return {
							endTime: validatedStartTime + delta,
							startTime: validatedStartTime,
						};
					},
				);

				timeline.setItemResizeValidator(
					function itemResizeValidator(item, isStart, time) {
						const validatedTime = moveResizeValidator(
							"resize",
							item.id,
							time,
							isStart ? "left" : "right",
						);

						return isStart
							? {
									endTime: item.endTime,
									startTime: validatedTime,
								}
							: {
									endTime: validatedTime,
									startTime: item.startTime,
								};
					},
				);
			}
		}
	}, [moveResizeValidator, timelineRef]);

	useEffect(() => {
		const itemDragState = itemDragStateRef.current;
		const timeline = timelineRef.current;

		if (timeline !== null) {
			const controller = new AbortController();
			const options = { passive: true, signal: controller.signal };

			itemDragState.addEventListener(
				"move",
				(event) => {
					if (event instanceof CustomEvent) {
						const detail = event.detail;

						if (detail instanceof DragMoveEventDetail) {
							const result = timeline.itemDragMove(detail.x, detail.y);

							if (result !== undefined) {
								onItemDrag?.({
									eventType: "move",
									itemId: result.id,
									time: result.startTime,
									newGroupId: result.groupId,
								});
							}
						}
					}
				},
				options,
			);

			itemDragState.addEventListener(
				"end",
				(event) => {
					if (event instanceof CustomEvent) {
						// If a move callback is set, skip rendering to avoid a flicker of
						// the item snapping back to it's original size.
						const skipRender = onItemMove !== undefined;
						const result = timeline.itemDragEnd(skipRender);

						if (result !== undefined) {
							onItemMove?.(result.id, result.startTime, result.groupId);
						}
					}
				},
				options,
			);

			itemDragState.addEventListener(
				"cancel",
				() => {
					timeline.itemDragEnd();
				},
				options,
			);

			return () => {
				controller.abort();
			};
		}

		return;
	}, [onItemDrag, onItemMove, timelineRef]);

	useEffect(() => {
		const itemResizeState = itemResizeStateRef.current;
		const timeline = timelineRef.current;

		if (timeline !== null) {
			const controller = new AbortController();
			const options = { passive: true, signal: controller.signal };

			itemResizeState.addEventListener(
				"move",
				(event) => {
					if (event instanceof CustomEvent) {
						const detail = event.detail;

						if (detail instanceof DragMoveEventDetail) {
							timeline.itemResizeMove(detail.x);
						}
					}
				},
				options,
			);

			itemResizeState.addEventListener(
				"end",
				(event) => {
					if (event instanceof CustomEvent) {
						// If a move callback is set, skip rendering to avoid a flicker of
						// the item snapping back to it's original size.
						const skipRender = onItemResize !== undefined;
						const result = timeline.itemResizeEnd(skipRender);

						if (result !== undefined) {
							if (result.isStart) {
								onItemResize?.(result.id, result.startTime, "left");
							} else {
								onItemResize?.(result.id, result.endTime, "right");
							}
						}
					}
				},
				options,
			);

			itemResizeState.addEventListener(
				"cancel",
				() => {
					timeline.itemResizeEnd();
				},
				options,
			);

			return () => {
				controller.abort();
			};
		}

		return;
	}, [onItemResize, timelineRef]);

	useLayoutEffect(() => {
		const timeline = timelineRef.current;

		if (timeline !== null) {
			const onScrollBoundsChangeHandler = (event: Event): void => {
				if (event instanceof CustomEvent) {
					const detail = event.detail;

					if (detail instanceof ScrollBoundsChangeEventDetail) {
						onBoundsChange?.(detail.hValueStart, detail.hValueEnd);
					}
				}
			};

			const controller = new AbortController();
			timeline.addEventListener(
				"scrollBoundsChange",
				onScrollBoundsChangeHandler,
				{
					passive: true,
					signal: controller.signal,
				},
			);

			return () => {
				controller.abort();
			};
		}

		return;
	}, [onBoundsChange, timelineRef]);

	useLayoutEffect(() => {
		const timeline = timelineRef.current;

		if (timeline !== null) {
			const onWindowChangeHandler = (event: Event): void => {
				if (event instanceof CustomEvent) {
					const detail = event.detail;

					if (detail instanceof WindowChangeEventDetail) {
						onTimeChange?.(
							detail.hWindowMin,
							detail.hWindowMax,
							function updateScrollCanvas(start, end) {
								timeline.setHWindow(start, end);
							},
						);
					}
				}
			};

			const controller = new AbortController();
			timeline.addEventListener("windowChange", onWindowChangeHandler, {
				passive: true,
				signal: controller.signal,
			});

			return () => {
				controller.abort();
			};
		}

		return;
	}, [onTimeChange, timelineRef]);

	const onRowClickHandler: (
		groupId: TGroupId,
		time: number,
		e: SyntheticEvent,
	) => void = useCallback(
		(groupId, time, e) => {
			onItemDeselect?.();
			setSelectedItemId(undefined);
			onCanvasClick?.(groupId, time, e);
		},
		[onCanvasClick, onItemDeselect],
	);

	const timezoneOffset = useMemo(
		() => new Date().getTimezoneOffset() * MILLISECONDS_PER_MINUTE,
		[],
	);

	const showPeriod: ShowPeriod = useCallback(
		(from, to) => {
			const zoom = from - to;

			// No closer than 1 hour.
			if (zoom < MILLISECONDS_PER_HOUR) {
				return;
			}

			onTimeChange?.(from, to, function updateScrollCanvas(start, end) {
				timelineRef.current?.setHWindow(start, end);
			});
		},
		[onTimeChange, timelineRef],
	);

	const timelineWidth = timelineRef.current?.hWindowSize ?? ZERO;
	const timelineRange = timelineRef.current?.hWindowRange ?? ZERO;
	const timelineUnit: Unit = useMemo(() => {
		const maxCellsToRender = timelineWidth / minCellWidth;

		let unitCount = timelineRange;

		for (const [unit, factor] of Object.entries(timeFactors) as [
			keyof TimeSteps,
			number,
		][]) {
			unitCount /= factor;

			const cellsToBeRendered = unitCount / timeSteps[unit];

			if (cellsToBeRendered < maxCellsToRender) {
				return unit;
			}
		}

		return "second";
	}, [timeSteps, timelineRange, timelineWidth]);

	const canResizeLeft = canResize === "left" || canResize === "both";
	const canResizeRight = canResize === "right" || canResize === "both";

	const renderedLeftGroups: ReactNode[] | undefined =
		sidebarWidth > ZERO ? [] : undefined;
	const renderedRightGroups: ReactNode[] | undefined =
		rightSidebarWidth > ZERO ? [] : undefined;
	const renderedGroupRows: ReactNode[] = [];

	const timeline = timelineRef?.current;

	if (timeline !== null) {
		const groupIndices = timeline.getVisibleGroupsIter();

		for (const groupIndex of groupIndices) {
			const group = timeline.getGroup(groupIndex);

			if (group !== undefined) {
				renderedLeftGroups?.push(
					<Group<
						TGroupId,
						TGroupIdKey,
						TGroupTitleKey,
						TGroupRightTitleKey,
						TItemId,
						TItemIdKey,
						TItemGroupKey,
						TItemTitleKey,
						TItemDivTitleKey,
						TItemTimeStartKey,
						TItemTimeEndKey,
						TGroup,
						TItem
					>
						group={group}
						groupIndex={groupIndex}
						groupRenderer={groupRenderer}
						key={`group-${group.id}-left`}
						timeline={timeline}
					/>,
				);

				renderedRightGroups?.push(
					<Group<
						TGroupId,
						TGroupIdKey,
						TGroupTitleKey,
						TGroupRightTitleKey,
						TItemId,
						TItemIdKey,
						TItemGroupKey,
						TItemTitleKey,
						TItemDivTitleKey,
						TItemTimeStartKey,
						TItemTimeEndKey,
						TGroup,
						TItem
					>
						group={group}
						groupIndex={groupIndex}
						groupRenderer={groupRenderer}
						isRightSidebar={true}
						key={`group-${group.id}-right`}
						timeline={timeline}
					/>,
				);

				renderedGroupRows.push(
					<Row<
						TGroupId,
						TGroupIdKey,
						TGroupTitleKey,
						TGroupRightTitleKey,
						TItemId,
						TItemIdKey,
						TItemGroupKey,
						TItemTitleKey,
						TItemDivTitleKey,
						TItemTimeStartKey,
						TItemTimeEndKey,
						TGroup,
						TItem,
						TRowData
					>
						group={group}
						groupIndex={groupIndex}
						horizontalLineClassNamesForGroup={horizontalLineClassNamesForGroup}
						itemHeightRatio={itemHeightRatio}
						itemsWithInteractions={itemsWithInteractions}
						key={`group-${group.id}-row`}
						onClick={onRowClickHandler}
						onContextMenu={onCanvasContextMenu}
						onDoubleClick={onCanvasDoubleClick}
						rowData={rowData}
						rowRenderer={rowRenderer}
						timeline={timeline}
					/>,
				);
			}
		}
	}

	let renderedHeader: ReactNode | undefined;

	if (children !== null) {
		const headers: ReactNode[] = [];
		const markers: ReactNode[] = [];

		Children.forEach(children, (child) => {
			switch (getReactChildSecretKey(child)) {
				case TimelineHeaders.secretKey: {
					headers.push(child);
					break;
				}

				case TimelineMarkers.secretKey: {
					markers.push(child);
					break;
				}

				default: {
					if (child !== undefined && child !== false && child !== null) {
						throw new Error(
							"<Timeline /> only expects <TimelineHeaders /> and <TimelineMarkers /> as children",
						);
					}

					break;
				}
			}
		});

		if (headers.length > UNIT) {
			throw new Error(
				"more than one <TimelineHeaders /> child found under <Timeline />",
			);
		}

		if (markers.length > UNIT) {
			throw new Error(
				"more than one <TimelineMarkers /> child found under <Timeline />",
			);
		}

		renderedHeader = headers[ZERO];
	}

	renderedHeader ??= (
		<TimelineHeaders>
			<DateHeader unit="primaryHeader" />
			<DateHeader />
		</TimelineHeaders>
	);

	return (
		<cg-timeline
			class={className}
			h-end-extrema={[rightSidebarWidth, rightSidebarWidth]}
			h-end-size={rightSidebarWidth}
			h-extrema={[TIME_MIN, TIME_MAX]}
			h-start-extrema={[sidebarWidth, sidebarWidth]}
			h-start-size={sidebarWidth}
			h-window={[visibleTimeStart, visibleTimeEnd]}
			id={id}
			item-time-snap={dragSnap}
			items-draggable={canMove}
			items-end-resizable={canResize === "right" || canResize === "both"}
			items-start-resizable={canResize === "left" || canResize === "both"}
			line-size={lineHeight}
			ref={timelineRef}
			style={style}
			timezone-offset={timezoneOffset}
			v-start-extrema={[headerHeight, headerHeight]}
			v-start-size={headerHeight}
		>
			{timeline !== null && (
				<TimelineContextProvider timeline={timeline}>
					<HelpersContextProvider<
						TGroupId,
						TGroupIdKey,
						TGroupTitleKey,
						TGroupRightTitleKey,
						TItemId,
						TItemIdKey,
						TItemGroupKey,
						TItemTitleKey,
						TItemDivTitleKey,
						TItemTimeStartKey,
						TItemTimeEndKey,
						TGroup,
						TItem
					>
						timeline={timeline}
					>
						<HeadersContextProvider<
							TGroupId,
							TGroupIdKey,
							TGroupTitleKey,
							TGroupRightTitleKey,
							TItemId,
							TItemIdKey,
							TItemGroupKey,
							TItemTitleKey,
							TItemDivTitleKey,
							TItemTimeStartKey,
							TItemTimeEndKey,
							TGroup,
							TItem
						>
							leftSidebarWidth={sidebarWidth}
							rightSidebarWidth={rightSidebarWidth}
							showPeriod={showPeriod}
							timeSteps={timeSteps}
							timeline={timeline}
							timelineUnit={timelineUnit}
						>
							{!hideHeaders && renderedHeader}
						</HeadersContextProvider>

						{renderedLeftGroups !== undefined && (
							<div
								className="rct-sidebar"
								slot="bar-h-start"
								style={{ height: "100%", width: "100%" }}
							>
								<div style={{ height: "100%" }}>{renderedLeftGroups}</div>
							</div>
						)}

						<div className="rct-horizontal-lines" slot="center">
							<ItemContextProvider<
								TGroupId,
								TGroupIdKey,
								TGroupTitleKey,
								TGroupRightTitleKey,
								TItemId,
								TItemIdKey,
								TItemGroupKey,
								TItemTitleKey,
								TItemDivTitleKey,
								TItemTimeStartKey,
								TItemTimeEndKey,
								TGroup,
								TItem
							>
								canMove={canMove}
								canResizeLeft={canResizeLeft}
								canResizeRight={canResizeRight}
								canSelect={canSelect}
								itemDragState={itemDragStateRef.current}
								itemRenderer={itemRenderer}
								itemResizeState={itemResizeStateRef.current}
								keys={resolvedKeys}
								minResizeWidth={minResizeWidth}
								onClick={onItemClick}
								onContextMenu={onItemContextMenu}
								onDoubleClick={onItemDoubleClick}
								onSelect={onItemSelect}
								selected={selected}
								selectedItemId={selectedItemId}
								setSelectedItemId={setSelectedItemId}
								timeline={timeline}
							>
								{renderedGroupRows}
							</ItemContextProvider>
						</div>

						{renderedRightGroups !== undefined && (
							<div
								className="rct-sidebar rct-sidebar-right"
								slot="bar-h-end"
								style={{ height: "100%", width: "100%" }}
							>
								<div style={{ height: "100%" }}>{renderedRightGroups}</div>
							</div>
						)}
					</HelpersContextProvider>
				</TimelineContextProvider>
			)}
		</cg-timeline>
	);
}

const MemoedRenderedTimeline = memo(
	RenderedTimeline,
) as typeof RenderedTimeline;

export const Timeline = <
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData,
>(
	props: TimelineProps<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TGroup,
		TItem,
		TRowData
	>,
): ReactNode => {
	validateComponentProperties("Timeline", props, UNSUPPORTED_PROPERTIES);

	const { groups, items, ...remainingProperties } = props;

	const timelineRef =
		useRef<
			InstanceType<
				typeof HTMLTimeline<
					TGroupId,
					RctToCoreGroup<TGroupId, TGroup>,
					TItemId,
					RctToCoreItem<TGroupId, TItemId, TItem>
				>
			>
		>(null);

	const resolvedKeys = (remainingProperties.keys ??
		defaultKeys) as TimelineKeys<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>;

	useEffect(() => {
		const timeline = timelineRef.current;

		if (timeline !== null) {
			timeline.setGroups(
				groups.map((group) => ({
					id: group[resolvedKeys.groupIdKey],
					lineSize: group.lineHeight,
					originalGroup: group,
				})),
			);
		}
	}, [groups, resolvedKeys.groupIdKey]);

	useMemo(() => {
		const timeline = timelineRef.current;

		if (timeline !== null) {
			timeline.setItems(
				items.map((item) => ({
					endTime: item[resolvedKeys.itemTimeEndKey],
					groupId: item[resolvedKeys.itemGroupKey],
					id: item[resolvedKeys.itemIdKey],
					isDraggable: item.canMove,
					isEndResizable:
						item.canResize &&
						(item.canResize === "right" || item.canResize === "both"),
					isStartResizable:
						item.canResize &&
						(item.canResize === "left" || item.canResize === "both"),
					originalItem: item,
					startTime: item[resolvedKeys.itemTimeStartKey],
				})),
			);
		}
	}, [
		items,
		resolvedKeys.itemGroupKey,
		resolvedKeys.itemIdKey,
		resolvedKeys.itemTimeEndKey,
		resolvedKeys.itemTimeStartKey,
	]);

	const [renderIndicator, render] = useRender();

	useEffect(() => {
		const timeline = timelineRef.current;

		if (timeline !== null) {
			const abortController = new AbortController();
			timeline.addEventListener("renderRequest", render, {
				passive: true,
				signal: abortController.signal,
			});

			return () => {
				abortController.abort();
			};
		}

		return;
	}, [render]);

	const draggedItem = timelineRef.current?.getDraggedItem();
	const resizedItem = timelineRef.current?.getDraggedItem();

	const itemsWithInteractions = useMemo(() => {
		const timelineItems = timelineRef.current?.getItems() ?? [];
		const itemsWithEdited: TItem[] = [];

		for (const item of timelineItems) {
			itemsWithEdited.push(item.originalItem);
		}

		const editedItem = draggedItem ?? resizedItem;
		if (editedItem) {
			const editedItemId = editedItem.id;

			for (const [index, item] of timelineItems.entries()) {
				if (item.id === editedItemId) {
					itemsWithEdited[index] = editedItem.originalItem;
					break;
				}
			}
		}

		return itemsWithEdited;
	}, [draggedItem, resizedItem]);

	return (
		<MemoedRenderedTimeline
			{...remainingProperties}
			itemsWithInteractions={itemsWithInteractions}
			renderIndicator={renderIndicator}
			timelineRef={timelineRef}
		/>
	);
};
