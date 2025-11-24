import {
	type BaseGroup as CoreBaseGroup,
	type BaseItem as CoreBaseItem,
	DragState,
	HALF,
	type Timeline as HTMLTimeline,
	TIME_MAX,
	TIME_MIN,
	UNIT,
	ZERO,
} from "@chronogramme/chronogramme";
import {
	type CSSProperties,
	type HTMLAttributes,
	memo,
	type ReactNode,
	type RefObject,
	type SyntheticEvent,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	DragMoveEventDetail,
	ScrollBoundsChangeEventDetail,
	WindowChangeEventDetail,
} from "../../chronogramme/src/events";
import {
	defaultKeys,
	leftResizeStyle,
	overridableStyles,
	rightResizeStyle,
	selectedAndCanMove,
	selectedAndCanResizeLeft,
	selectedAndCanResizeLeftAndDragLeft,
	selectedAndCanResizeRight,
	selectedAndCanResizeRightAndDragRight,
	selectedStyle,
} from "./constants";
import type { FullRequired } from "./typeUtils";
import { composeEvents, useRender } from "./utils";

const MINUTES_TO_MILLISECONDS = 60 * 1000;
const FIFTEEN_MINUTES = 15 * MINUTES_TO_MILLISECONDS;

type ResizeEdge = "left" | "right";

interface RctToCoreItem<TItem> extends CoreBaseItem {
	originalItem: TItem;
}

interface RctToCoreGroup<TGroup> extends CoreBaseGroup {
	originalGroup: TGroup;
}

function addClass(current: string, optional?: string): string {
	return optional ? current + optional : current;
}

export type BaseItem<
	TItemIdKey extends string = "id",
	TItemGroupKey extends string = "group",
	TItemTitleKey extends string = "title",
	TItemDivTitleKey extends string = "title",
	TItemTimeStartKey extends string = "start_time",
	TItemTimeEndKey extends string = "end_time",
> = {
	canMove?: boolean | undefined;
	canResize?: false | "left" | "right" | "both" | undefined;
} & {
	[K in TItemIdKey]: number;
} & {
	[K in TItemTitleKey]?: string | undefined;
} & {
	[K in TItemDivTitleKey]?: string | undefined;
} & {
	[K in TItemGroupKey]: number;
} & {
	[K in TItemTimeStartKey]: EpochTimeStamp;
} & {
	[K in TItemTimeEndKey]: EpochTimeStamp;
};

export type BaseGroup<
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
> = {
	lineHeight?: number;
} & {
	[K in TGroupIdKey]: number;
} & {
	[K in TGroupTitleKey]?: string | undefined;
} & {
	[K in TGroupRightTitleKey]?: string | undefined;
};

export type RowRenderer<
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TItemIdKey extends string = "id",
	TItemGroupKey extends string = "group",
	TItemTitleKey extends string = "title",
	TItemDivTitleKey extends string = "title",
	TItemTimeStartKey extends string = "start_time",
	TItemTimeEndKey extends string = "end_time",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
	TItem extends BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	> = BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData = undefined,
> = (props: {
	getLayerRootProps: () => { style: CSSProperties };
	group: TGroup;
	itemsWithInteractions: TItem[];
	key: string;
	rowData: TRowData;
}) => ReactNode;

export type GroupRenderer<
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
> = (props: {
	group: TGroup;
	isRightSidebar?: boolean | undefined;
}) => ReactNode;

export type ItemRenderer<
	TItemIdKey extends string = "id",
	TItemGroupKey extends string = "group",
	TItemTitleKey extends string = "title",
	TItemDivTitleKey extends string = "title",
	TItemTimeStartKey extends string = "start_time",
	TItemTimeEndKey extends string = "end_time",
	TItem extends BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	> = BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
> = (props: {
	getItemProps: (
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
	getResizeProps: (params?: {
		leftClassName?: string;
		leftStyle?: CSSProperties;
		rightClassName?: string;
		rightStyle?: CSSProperties;
	}) => {
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
	};
	item: TItem;
	itemContext: {
		canMove: boolean;
		canResizeLeft: boolean;
		canResizeRight: boolean;
		dimensions: {
			collisionLeft: number;
			collisionWidth: number;
			height: number;
			left: number;
			stack: boolean;
			top: number;
			width: number;
		};
		dragging: boolean;
		dragOffset: number | undefined;
		dragTime: number | undefined;
		newGroupId: number | undefined;
		resizeEdge: "left" | "right" | undefined;
		resizeOffset: number | undefined;
		resizeTime: number | undefined;
		resizing: boolean;
		selected: boolean;
		title: string | undefined;
		useResizeHandle: boolean;
		width: number;
	};
	key: string;
	timelineContext: {
		canvasTimeEnd: number;
		canvasTimeStart: number;
		timelineWidth: number;
		visibleTimeEnd: number;
		visibleTimeStart: number;
	};
}) => ReactNode;

export interface TimelineKeys<
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TItemIdKey extends string = "id",
	TItemGroupKey extends string = "group",
	TItemTitleKey extends string = "title",
	TItemDivTitleKey extends string = "title",
	TItemTimeStartKey extends string = "start_time",
	TItemTimeEndKey extends string = "end_time",
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

interface TimelineProps<
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TItemIdKey extends string = "id",
	TItemGroupKey extends string = "group",
	TItemTitleKey extends string = "title",
	TItemDivTitleKey extends string = "title",
	TItemTimeStartKey extends string = "start_time",
	TItemTimeEndKey extends string = "end_time",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
	TItem extends BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	> = BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData = undefined,
> {
	canMove?: boolean | undefined;
	canResize?: false | "left" | "right" | "both" | undefined;
	canSelect?: boolean | undefined;
	className?: string | undefined;
	dragSnap?: number | undefined;
	groupRenderer: GroupRenderer<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup
	>;
	groups: TGroup[];
	id?: string | undefined;
	itemHeightRatio?: number | undefined;
	itemRenderer: ItemRenderer<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem
	>;
	items: TItem[];
	keys?: TimelineKeys<
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
	lineHeight?: number | undefined;
	minResizeWidth?: number | undefined;
	moveResizeValidator?(action: "move", itemId: number, time: number): number;
	moveResizeValidator?(
		action: "resize",
		itemId: number,
		time: number,
		resizeEdge: "left" | "right",
	): number;
	onBoundsChange?: (canvasTimeStart: number, canvasTimeEnd: number) => void;
	onItemClick?: (itemId: number, e: SyntheticEvent, time: number) => void;
	onItemContextMenu?: (itemId: number, e: SyntheticEvent, time: number) => void;
	onItemDeselect?: (e: SyntheticEvent) => void;
	onItemDoubleClick?: (itemId: number, e: SyntheticEvent, time: number) => void;
	onItemDrag?: (
		itemDragObject:
			| { eventType: "move"; itemId: number; time: number; newGroupId: number }
			| {
					eventType: "resize";
					itemId: number;
					time: number;
					edge: "left" | "right";
			  },
	) => void;
	onItemMove?: (
		itemId: number,
		dragTime: number,
		newGroupOrder: number,
	) => void;
	onItemResize?(
		itemId: number,
		endTimeOrStartTime: number,
		edge: ResizeEdge,
	): void;
	onItemSelect?: (itemId: number, e: SyntheticEvent, time: number) => void;
	onTimeChange?: (
		newVisibleTimeStart: number,
		newVisibleTimeEnd: number,
		updateScrollCanvas: (start: number, end: number) => void,
	) => void;
	rowData: TRowData;
	rowRenderer: RowRenderer<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TGroup,
		TItem,
		TRowData
	>;
	selected?: number[] | undefined;
	sidebarWidth?: number;
	visibleTimeEnd: number;
	visibleTimeStart: number;
}

export const Timeline = <
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TItemIdKey extends string = "id",
	TItemGroupKey extends string = "group",
	TItemTitleKey extends string = "title",
	TItemDivTitleKey extends string = "title",
	TItemTimeStartKey extends string = "start_time",
	TItemTimeEndKey extends string = "end_time",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
	TItem extends BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	> = BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData = undefined,
>({
	groups,
	items,
	...properties
}: TimelineProps<
	TGroupIdKey,
	TGroupTitleKey,
	TGroupRightTitleKey,
	TItemIdKey,
	TItemGroupKey,
	TItemTitleKey,
	TItemDivTitleKey,
	TItemTimeStartKey,
	TItemTimeEndKey,
	TGroup,
	TItem,
	TRowData
>): ReactNode => {
	const timelineRef =
		useRef<
			InstanceType<
				typeof HTMLTimeline<
					number,
					RctToCoreGroup<TGroup>,
					number,
					RctToCoreItem<TItem>
				>
			>
		>(null);

	const resolvedKeys = (properties.keys ?? defaultKeys) as TimelineKeys<
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

		if (timeline) {
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

		if (timeline) {
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

		if (timeline) {
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

	return (
		<MemoedRenderedTimeline
			{...properties}
			renderIndicator={renderIndicator}
			timelineRef={timelineRef}
		/>
	);
};

function RenderedTimeline<
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TGroup extends BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
	TItem extends BaseItem<
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
	className,
	dragSnap = FIFTEEN_MINUTES,
	groupRenderer,
	id,
	itemHeightRatio = 0.65,
	itemRenderer,
	keys,
	lineHeight = 30,
	moveResizeValidator,
	minResizeWidth = 20,
	onBoundsChange,
	onItemClick,
	onItemContextMenu,
	// onItemDeselect, // TODO: For the row context provider
	onItemDoubleClick,
	onItemDrag,
	onItemMove,
	onItemResize,
	onItemSelect,
	onTimeChange,
	rowData,
	rowRenderer,
	selected,
	sidebarWidth = 150,
	timelineRef,
	visibleTimeEnd,
	visibleTimeStart,
}: Omit<
	TimelineProps<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
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
	renderIndicator: number;
	timelineRef: RefObject<InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	> | null>;
}) {
	const [selectedItemId, setSelectedItemId] = useState<number>();

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

		if (timeline) {
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

		if (timeline) {
			const controller = new AbortController();
			const options = { passive: true, signal: controller.signal };

			itemDragState.addEventListener(
				"move",
				(event) => {
					if (event instanceof CustomEvent) {
						const detail = event.detail;

						if (detail instanceof DragMoveEventDetail) {
							const result = timeline.itemDrag(detail.x, detail.y);

							if (result) {
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

						if (result) {
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

		return undefined;
	}, [onItemDrag, onItemMove, timelineRef]);

	useEffect(() => {
		const itemResizeState = itemResizeStateRef.current;
		const timeline = timelineRef.current;

		if (timeline) {
			const controller = new AbortController();
			const options = { passive: true, signal: controller.signal };

			itemResizeState.addEventListener(
				"move",
				(event) => {
					if (event instanceof CustomEvent) {
						const detail = event.detail;

						if (detail instanceof DragMoveEventDetail) {
							timeline.itemResize(detail.x);
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

						if (result) {
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

		return undefined;
	}, [onItemResize, timelineRef]);

	useLayoutEffect(() => {
		const timeline = timelineRef.current;

		if (timeline) {
			const onScrollBoundsChangeHandler = (event: Event) => {
				if (event instanceof CustomEvent) {
					const detail = event.detail;

					if (detail instanceof ScrollBoundsChangeEventDetail) {
						onBoundsChange?.(detail.hValueStart, detail.hValueEnd);
					}
				}
			};

			const controller = new AbortController();
			// TODO: Implement this event.
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

		if (timeline) {
			const onWindowChangeHandler = (event: Event) => {
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

	const canResizeLeft = canResize === "left" || canResize === "both";
	const canResizeRight = canResize === "right" || canResize === "both";

	const renderedGroups: ReactNode[] = [];
	const renderedItems: ReactNode[] = [];
	const renderedRows: ReactNode[] = [];

	const timeline = timelineRef?.current;

	if (timeline) {
		const draggedItem = timeline.getDraggedItem();
		const resizedItem = timeline.getResizedItem();
		const isResizingStart = timeline.getResizeIsStart();

		const timelineContext = {
			canvasTimeEnd: timeline.getHValue(timeline.scrollWidth),
			canvasTimeStart: timeline.getHValue(ZERO),
			timelineWidth: timeline.hMiddleSize,
			visibleTimeEnd: timeline.hWindowMax,
			visibleTimeStart: timeline.hWindowMin,
		};

		const groupIndices = timeline.getVisibleGroupsIter();

		for (const groupIndex of groupIndices) {
			const group = timeline.getGroup(groupIndex);

			if (!group) {
				continue;
			}

			const groupId = group.id;

			const lineSize = timeline.getGroupLineSize(groupIndex);
			const lineIndices = timeline.getVisibleGroupLinesIter(groupIndex);
			const groupPosition = timeline.getGroupPosition(groupIndex);
			const itemVOffset = HALF * (UNIT - itemHeightRatio) * lineSize;
			const itemVSize = itemHeightRatio * lineSize;

			renderedGroups.push(
				groupRenderer({
					group: group.originalGroup,
					isRightSidebar: false,
				}),
			);

			for (const lineIndex of lineIndices) {
				const linePosition = timeline.getLinePosition(groupIndex, lineIndex);
				const itemIndices = timeline.getVisibleLineItemsIter(
					groupIndex,
					lineIndex,
				);

				const itemVStartPos = groupPosition + linePosition + itemVOffset;

				renderedRows.push(
					rowRenderer({
						getLayerRootProps: () => {
							return {
								slot: "center",
								style: {
									height: `${lineSize.toFixed(4)}px`,
									// TODO: Remove this once rendered in the groups.
									position: "absolute",
									top: `${(groupPosition + linePosition).toFixed(4)}px`,
									left: "0px",
									right: "0px",
								},
							};
						},
						group: group.originalGroup,
						// TODO: Fix this to filter if items are being modified
						itemsWithInteractions: [],
						key: `group-${groupId}-${lineIndex}`,
						rowData,
					}),
				);

				for (const itemIndex of itemIndices) {
					const item = timeline.getItem(groupIndex, lineIndex, itemIndex);

					if (!item) {
						continue;
					}

					const endTime = item.endTime;
					const itemId = item.id;
					const originalItem = item.originalItem;
					const startTime = item.startTime;

					const hStartPos = Math.max(timeline.getHPos(startTime), ZERO);
					const hEndPos = Math.min(
						timeline.getHPos(endTime),
						timeline.hScrollSize,
					);
					const hSize = hEndPos - hStartPos;

					const itemCanMove = item.isDraggable ?? canMove;
					const itemCanResizeLeft =
						(item.isStartResizable ?? canResizeLeft) && hSize >= minResizeWidth;
					const itemCanResizeRight =
						(item.isEndResizable ?? canResizeRight) && hSize >= minResizeWidth;
					const itemIsDragging = itemId === draggedItem?.id;
					const itemIsResizing = itemId === resizedItem?.id;
					const itemIsSelected =
						selectedItemId !== undefined
							? itemId === selectedItemId
							: (selected?.includes(itemId) ?? false);
					const itemIsSelectable = canSelect;

					let dragOffset: number | undefined;
					let dragTime: number | undefined;
					let resizeEdge: "left" | "right" | undefined;
					let resizeOffset: number | undefined;
					let resizeTime: number | undefined;

					if (itemIsDragging) {
						dragOffset = timeline.getDragOffset();
						dragTime = draggedItem.startTime;
					}

					if (itemIsResizing) {
						resizeOffset = timeline.getResizeOffset();

						if (isResizingStart) {
							resizeEdge = "left";
							resizeTime = resizedItem.startTime;
						} else {
							resizeEdge = "right";
							resizeTime = resizedItem.endTime;
						}
					}

					renderedItems.push(
						itemRenderer({
							getItemProps(params) {
								return {
									className: "rct-item",
									onClick: composeEvents(
										function onClick(event) {
											const nativeEvent = event.nativeEvent;

											if (nativeEvent instanceof MouseEvent) {
												event.stopPropagation();

												if (itemIsSelectable) {
													const time = timeline.getHValue(nativeEvent.clientX);

													if (itemIsSelected) {
														onItemClick?.(itemId, event, time);
													} else {
														setSelectedItemId(itemId);
														onItemSelect?.(itemId, event, time);
													}
												}
											}
										},

										params.onClick,
									),
									onMouseDown: params.onMouseDown,
									onPointerDownCapture(event) {
										if (!itemCanMove) {
											return;
										}

										// Because the events need to be captured, not to intefere
										// with the library's native event handling, we need to
										// check for nested event handlers that would have
										// precedence.
										for (const element of event.nativeEvent.composedPath()) {
											if (
												element instanceof HTMLElement &&
												((itemCanResizeLeft &&
													element.classList.contains(
														"rct-item-handler-resize-left",
													)) ||
													(itemCanResizeRight &&
														element.classList.contains(
															"rct-item-handler-resize-right",
														)))
											) {
												return;
											}
										}

										event.stopPropagation();

										itemResizeStateRef.current.reset();
										itemDragStateRef.current.start(event);
										timeline.itemDragStart(itemId, event.clientX);
									},
									onMouseUp: params.onMouseUp,
									onTouchStart: params.onTouchStart,
									onTouchEnd: params.onTouchEnd,
									onDoubleClick: composeEvents(
										function onDoubleClick(event) {
											const nativeEvent = event.nativeEvent;

											if (nativeEvent instanceof PointerEvent) {
												event.stopPropagation();

												onItemDoubleClick?.(
													itemId,
													event,
													timeline.getHValue(nativeEvent.clientX),
												);
											}
										},

										params.onDoubleClick,
									),
									onContextMenu: composeEvents(
										function onContextMenu(event) {
											const nativeEvent = event.nativeEvent;

											if (nativeEvent instanceof PointerEvent) {
												event.stopPropagation();

												if (onItemContextMenu) {
													event.preventDefault();

													onItemContextMenu(
														itemId,
														event,
														timeline.getHValue(nativeEvent.clientX),
													);
												}
											}
										},

										params.onContextMenu,
									),
									slot: "center",
									style: {
										...params.style,
										...overridableStyles,
										...(itemIsSelected ? selectedStyle : {}),
										...(itemIsSelected && itemCanMove
											? selectedAndCanMove
											: {}),
										...(itemIsSelected && itemCanResizeLeft
											? selectedAndCanResizeLeft
											: {}),
										...(itemIsSelected && itemCanResizeLeft && itemIsDragging
											? selectedAndCanResizeLeftAndDragLeft
											: {}),
										...(itemIsSelected && itemCanResizeRight
											? selectedAndCanResizeRight
											: {}),
										...(itemIsSelected && itemCanResizeRight && itemIsDragging
											? selectedAndCanResizeRightAndDragRight
											: {}),
										position: "absolute",
										boxSizing: "border-box",
										slot: "center",
										left: `${hStartPos.toFixed(4)}px`,
										top: `${itemVStartPos.toFixed(4)}px`,
										width: `${hSize.toFixed(4)}px`,
										height: `${itemVSize.toFixed(4)}px`,
										lineHeight: `${itemVSize.toFixed(4)}px`,
									},
								};
							},
							getResizeProps: ({
								leftClassName,
								leftStyle,
								rightClassName,
								rightStyle,
							} = {}) => {
								return {
									left: {
										className: addClass(
											"rct-item-handler rct-item-handler-left rct-item-handler-resize-left ",
											leftClassName,
										),
										onPointerDownCapture(event) {
											if (!itemCanResizeLeft) {
												return;
											}

											event.stopPropagation();

											itemDragStateRef.current.reset();
											itemResizeStateRef.current.start(event);
											timeline.itemStartResizeStart(itemId, event.clientX);
										},
										style: { ...leftResizeStyle, ...leftStyle },
									},
									right: {
										className: addClass(
											"rct-item-handler rct-item-handler-right rct-item-handler-resize-right",
											rightClassName,
										),
										onPointerDownCapture(event) {
											if (!itemCanResizeRight) {
												return;
											}

											event.stopPropagation();

											itemDragStateRef.current.reset();
											itemResizeStateRef.current.start(event);
											timeline.itemEndResizeStart(itemId, event.clientX);
										},
										style: { ...rightResizeStyle, ...rightStyle },
									},
								};
							},
							item: originalItem,
							itemContext: {
								canMove: itemCanMove,
								canResizeLeft: itemCanResizeLeft,
								canResizeRight: itemCanResizeRight,
								dimensions: {
									collisionLeft: startTime,
									collisionWidth: endTime - startTime,
									height: lineSize,
									left: hStartPos,
									stack: false,
									top: itemVStartPos,
									width: hSize,
								},
								dragging: itemIsDragging,
								dragOffset,
								dragTime,
								newGroupId: draggedItem?.groupId,
								resizeEdge,
								resizeOffset,
								resizeTime,
								resizing: itemIsResizing,
								selected: itemIsSelected,
								title: originalItem[resolvedKeys.itemTitleKey],
								useResizeHandle: true,
								width: hSize,
							},
							key: `item-${groupId}-${itemId}`,
							timelineContext,
						}),
					);
				}
			}
		}
	}

	const timezoneOffset = useMemo(() => {
		return new Date().getTimezoneOffset() * MINUTES_TO_MILLISECONDS;
	}, []);

	return (
		<cg-timeline
			class={className}
			h-start-extrema={[sidebarWidth, sidebarWidth]}
			h-start-size={sidebarWidth}
			h-window={[visibleTimeStart, visibleTimeEnd]}
			h-extrema={[TIME_MIN, TIME_MAX]}
			id={id}
			item-time-snap={dragSnap}
			items-draggable={canMove}
			items-end-resizable={canResize === "right" || canResize === "both"}
			items-start-resizable={canResize === "left" || canResize === "both"}
			line-size={lineHeight}
			timezone-offset={timezoneOffset}
			ref={timelineRef}
		>
			{renderedRows}
			{renderedItems}
		</cg-timeline>
	);
}

const MemoedRenderedTimeline = memo(
	RenderedTimeline,
) as typeof RenderedTimeline;
