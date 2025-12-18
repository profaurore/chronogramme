import {
	DragMoveEventDetail,
	DragState,
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
import type { Unit } from "./headers/DateHeader";
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
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
	FullRequired,
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

export type BaseItem<TKeys extends AnyKeys, TGroupId, TItemId> = {
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
	[K in TKeys["itemIdKey"]]: TItemId;
} & {
	[K in TKeys["itemTitleKey"]]?: ReactNode | undefined;
} & {
	[K in TKeys["itemDivTitleKey"]]?: ReactNode | undefined;
} & {
	[K in TKeys["itemGroupKey"]]: TGroupId;
} & {
	[K in TKeys["itemTimeStartKey"]]: EpochTimeStamp;
} & {
	[K in TKeys["itemTimeEndKey"]]: EpochTimeStamp;
};

export type DefaultItem<TGroupId, TItemId> = BaseItem<
	typeof defaultKeys,
	TGroupId,
	TItemId
>;

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `BaseItem` instead.
 */
export type TimelineItemBase<
	TKeys extends AnyKeys,
	TGroupId,
	TItemId,
> = UnsupportedType<
	BaseItem<TKeys, TGroupId, TItemId>,
	"Use `BaseItem` instead."
>;

export type BaseGroup<TKeys extends AnyKeys, TGroupId> = {
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
	[K in TKeys["groupIdKey"]]: TGroupId;
} & {
	[K in TKeys["groupTitleKey"]]?: string | undefined;
} & {
	[K in TKeys["groupRightTitleKey"]]?: string | undefined;
};

export type DefaultGroup<TGroupId> = BaseGroup<typeof defaultKeys, TGroupId>;

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `BaseGroup` instead.
 */
export type TimelineGroupBase<
	TKeys extends AnyKeys,
	TGroupId,
> = UnsupportedType<BaseGroup<TKeys, TGroupId>, "Use `BaseGroup` instead.">;

export type ResizeEdge = "left" | "right";

export type ResizableEdges = false | ResizeEdge | "both";

export type HorizontalClassNamesForGroup<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
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
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
	TRowData,
> {
	getLayerRootProps: GetLayerRootProps;
	group: TGroup;
	itemsWithInteractions: readonly Readonly<TItem>[];
	rowData: TRowData;
}

export type RowRenderer<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
	TRowData,
> = (props: RowRendererProps<TKeys, TGroup, TItem, TRowData>) => ReactNode;

export interface GroupRendererProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TRowData,
> {
	group: TGroup;
	isRightSidebar?: boolean | undefined;
	rowData?: TRowData;
}

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `GroupRendererProps` instead.
 */
export type ReactCalendarGroupRendererProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TRowData,
> = UnsupportedType<
	GroupRendererProps<TKeys, TGroup, TRowData>,
	"Use `GroupRendererProps` instead."
>;

export type GroupRenderer<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TRowData,
> = (props: GroupRendererProps<TKeys, TGroup, TRowData>) => ReactNode;

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
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	getItemProps: GetItemProps;
	getResizeProps: ItemRendererGetResizeProps;
	item: TItem;
	itemContext: ItemRendererItemContext<TGroup["id"]>;
	timelineContext: TimelineContext;
}

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `ItemRendererProps` instead.
 */
export type ReactCalendarItemRendererProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> = UnsupportedType<
	ItemRendererProps<TKeys, TGroup, TItem>,
	"Use `ItemRendererProps` instead."
>;

export type ItemRenderer<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> = (props: ItemRendererProps<TKeys, TGroup, TItem>) => ReactNode;

export interface Keys<
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

export type TimelineKeys<
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
> = UnsupportedType<
	Keys<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	"Use `Keys` instead."
>;

export interface TimelineProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
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
	groupRenderer: GroupRenderer<TKeys, TGroup, TRowData>;
	groups: TGroup[];
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
		| HorizontalClassNamesForGroup<TKeys, TGroup>
		| undefined;
	id?: string | undefined;
	itemHeightRatio?: number | undefined;
	itemRenderer: ItemRenderer<TKeys, TGroup, TItem>;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	itemTouchSendsClick?: UnsupportedType<
		boolean | undefined,
		"No alternative available."
	>;
	items: TItem[];
	keys?: TKeys | undefined;
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
		...args: Parameters<MoveValidator<TItem["id"]>>
	): ReturnType<MoveValidator<TItem["id"]>>;
	moveResizeValidator?(
		...args: Parameters<ResizeValidator<TItem["id"]>>
	): ReturnType<ResizeValidator<TItem["id"]>>;
	onBoundsChange?: OnBoundsChange | undefined;
	onCanvasClick?: OnCanvasClick<TGroup["id"]> | undefined;
	onCanvasContextMenu?: OnCanvasContextMenu<TGroup["id"]> | undefined;
	onCanvasDoubleClick?: OnCanvasDoubleClick<TGroup["id"]> | undefined;
	onItemClick?: OnItemClick<TItem["id"]> | undefined;
	onItemContextMenu?: OnItemContextMenu<TItem["id"]> | undefined;
	onItemDeselect?: OnItemDeselect | undefined;
	onItemDoubleClick?: OnItemDoubleClick<TItem["id"]> | undefined;
	onItemDrag?: OnItemDrag<TGroup["id"], TItem["id"]> | undefined;
	onItemMove?: OnItemMove<TGroup["id"], TItem["id"]> | undefined;
	onItemResize?: OnItemResize<TItem["id"]> | undefined;
	onItemSelect?: OnItemSelect<TItem["id"]> | undefined;
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
	rowRenderer: RowRenderer<TKeys, TGroup, TItem, TRowData>;
	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	scrollRef?: UnsupportedType<
		Ref<HTMLDivElement> | undefined,
		"No alternative available."
	>;
	selected?: TItem["id"][] | undefined;
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
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
	TRowData,
> = UnsupportedType<
	TimelineProps<TKeys, TGroup, TItem, TRowData>,
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
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
	TRowData,
>({
	canMove = true,
	canResize = "right",
	canSelect = true,
	children,
	className,
	dragSnap = MILLISECONDS_PER_FIFTEEN_MINUTES,
	groupRenderer,
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
}: Omit<TimelineProps<TKeys, TGroup, TItem, TRowData>, "groups" | "items"> & {
	itemsWithInteractions: readonly Readonly<TItem>[];
	renderIndicator: number;
	timelineRef: RefObject<CoreTimeline<TKeys, TGroup, TItem> | null>;
}): ReactNode {
	const [selectedItemId, setSelectedItemId] = useState<TItem["id"]>();

	// Set a non-zero height so that the header isn't completely removed.
	const [maxHeaderHeight, setMaxHeaderHeight] = useState<number>(
		Number.MIN_VALUE,
	);

	const itemDragStateRef = useRef(new DragState({ endOnDisconnect: false }));
	const itemResizeStateRef = useRef(new DragState({ endOnDisconnect: false }));

	const resolvedKeys = (keys ?? defaultKeys) as TKeys;

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
		groupId: TGroup["id"],
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
					<Group<TKeys, TGroup, TItem, TRowData>
						group={group}
						groupIndex={groupIndex}
						groupRenderer={groupRenderer}
						key={`group-${group.id}-left`}
						rowData={rowData}
						timeline={timeline}
					/>,
				);

				renderedRightGroups?.push(
					<Group<TKeys, TGroup, TItem, TRowData>
						group={group}
						groupIndex={groupIndex}
						groupRenderer={groupRenderer}
						isRightSidebar={true}
						key={`group-${group.id}-right`}
						rowData={rowData}
						timeline={timeline}
					/>,
				);

				renderedGroupRows.push(
					<Row<TKeys, TGroup, TItem, TRowData>
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
	let renderedMarkers: ReactNode | undefined;

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
		renderedMarkers = markers[ZERO];
	}

	renderedHeader ??= <TimelineHeaders />;

	return (
		<cg-timeline
			class={`react-calendar-timeline ${className ?? ""}`}
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
			v-start-extrema={[maxHeaderHeight, maxHeaderHeight]}
			v-start-size={maxHeaderHeight}
		>
			{timeline !== null && (
				<TimelineContextProvider timeline={timeline}>
					<HelpersContextProvider<TKeys, TGroup, TItem> timeline={timeline}>
						<HeadersContextProvider<TKeys, TGroup, TItem>
							leftSidebarWidth={sidebarWidth}
							rightSidebarWidth={rightSidebarWidth}
							setMaxHeight={setMaxHeaderHeight}
							showPeriod={showPeriod}
							timeSteps={timeSteps}
							timeline={timeline}
							timelineUnit={timelineUnit}
						>
							{!hideHeaders && renderedHeader}
						</HeadersContextProvider>

						{renderedLeftGroups !== undefined && (
							<div
								className="rct-outer"
								slot="bar-h-start"
								style={{ height: "100%" }}
							>
								<div className="rct-sidebar" style={{ height: "100%" }}>
									<div style={{ height: "100%" }}>{renderedLeftGroups}</div>
								</div>
							</div>
						)}

						<div className="rct-outer" slot="center" style={{ height: "100%" }}>
							<div className="rct-scroll" style={{ height: "100%" }}>
								<div className="rct-horizontal-lines">
									<ItemContextProvider<TKeys, TGroup, TItem>
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
								{renderedMarkers}
							</div>
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
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
	TRowData,
>(
	props: TimelineProps<TKeys, TGroup, TItem, TRowData>,
): ReactNode => {
	validateComponentProperties("Timeline", props, UNSUPPORTED_PROPERTIES);

	const { groups, items, ...remainingProperties } = props;

	const timelineRef = useRef<CoreTimeline<TKeys, TGroup, TItem>>(null);

	const resolvedKeys = (remainingProperties.keys ??
		defaultKeys) as typeof defaultKeys;

	useEffect(() => {
		const timeline = timelineRef.current;

		if (timeline !== null) {
			timeline.setGroups(
				groups.map((group) => ({
					id: (group as unknown as DefaultGroup<TGroup["id"]>)[
						resolvedKeys.groupIdKey
					],
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
				items.map((item) => {
					const typecastItem = item as unknown as DefaultItem<
						TGroup["id"],
						TItem["id"]
					>;

					return {
						endTime: typecastItem[resolvedKeys.itemTimeEndKey],
						groupId: (
							item as unknown as DefaultItem<TGroup["id"], TItem["id"]>
						)[resolvedKeys.itemGroupKey],
						id: typecastItem[resolvedKeys.itemIdKey],
						isDraggable: item.canMove,
						isEndResizable:
							item.canResize &&
							(item.canResize === "right" || item.canResize === "both"),
						isStartResizable:
							item.canResize &&
							(item.canResize === "left" || item.canResize === "both"),
						originalItem: item,
						startTime: typecastItem[resolvedKeys.itemTimeStartKey],
					};
				}),
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
