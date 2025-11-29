import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { useCallback, useMemo } from "react";
import { ZERO } from "../../chronogramme/src/math";
import {
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
import { useRowItems } from "./rowItemsContext/useRowItems";
import type {
	BaseGroup,
	BaseItem,
	GetItemProps,
	GetResizeProps,
	RctToCoreGroup,
	RctToCoreItem,
} from "./timeline";
import { useTimelineState } from "./timelineStateContext/useTimelineState";
import { composeEvents } from "./utils";

export const Item = <
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
>({
	item,
	itemVStartPos,
	timeline,
}: {
	item: RctToCoreItem<TItem>;
	itemVStartPos: number;
	timeline: HTMLTimeline<
		number,
		RctToCoreGroup<TGroup>,
		number,
		RctToCoreItem<TItem>
	>;
}): React.ReactNode => {
	const {
		canMove,
		canResizeLeft,
		canResizeRight,
		canSelect,
		itemDragStateRef,
		itemResizeStateRef,
		keys,
		minResizeWidth,
		onItemClick,
		onItemContextMenu,
		onItemDoubleClick,
		onItemSelect,
		selected,
		selectedItemId,
		setSelectedItemId,
	} = useTimelineState<
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
		TItem
	>();

	const {
		itemRenderer: ItemComponent,
		itemVSize,
		lineSize,
	} = useRowItems<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem
	>();

	const draggedItem = timeline.getDraggedItem();
	const resizedItem = timeline.getResizedItem();

	const endTime = item.endTime;
	const itemId = item.id;
	const originalItem = item.originalItem;
	const startTime = item.startTime;

	const hStartPos = Math.max(timeline.getHPos(startTime), ZERO);
	const hEndPos = Math.min(timeline.getHPos(endTime), timeline.hScrollSize);
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
	let newGroupId: number | undefined;
	let resizeEdge: "left" | "right" | undefined;
	let resizeOffset: number | undefined;
	let resizeTime: number | undefined;

	if (itemIsDragging) {
		dragOffset = timeline.getDragOffset();
		dragTime = draggedItem.startTime;
		newGroupId = draggedItem.groupId;
	}

	if (itemIsResizing) {
		resizeOffset = timeline.getResizeOffset();

		if (timeline.getResizeIsStart()) {
			resizeEdge = "left";
			resizeTime = resizedItem.startTime;
		} else {
			resizeEdge = "right";
			resizeTime = resizedItem.endTime;
		}
	}

	const onItemClickHandler: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
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
			[
				itemId,
				itemIsSelectable,
				itemIsSelected,
				onItemClick,
				onItemSelect,
				setSelectedItemId,
				timeline.getHValue,
			],
		);

	const onPointerDownCaptureHandler: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
			function onPointerDownCapture(event) {
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
							element.classList.contains("rct-item-handler-resize-left")) ||
							(itemCanResizeRight &&
								element.classList.contains("rct-item-handler-resize-right")))
					) {
						return;
					}
				}

				event.stopPropagation();

				itemResizeStateRef.current.reset();
				itemDragStateRef.current.start(event);
				timeline.itemDragStart(itemId, event.clientX);
			},
			[
				itemCanMove,
				itemCanResizeLeft,
				itemCanResizeRight,
				itemDragStateRef.current.start,
				itemId,
				itemResizeStateRef.current.reset,
				timeline.itemDragStart,
			],
		);

	const onDoubleClickHandler: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
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
			[itemId, onItemDoubleClick, timeline.getHValue],
		);

	const onContextMenuHandler: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
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
			[itemId, onItemContextMenu, timeline.getHValue],
		);

	const getItemPropsHandler = useCallback<GetItemProps>(
		(params) => {
			return {
				className: "rct-item",
				onClick: composeEvents(onItemClickHandler, params.onClick),
				onMouseDown: params.onMouseDown,
				onPointerDownCapture: onPointerDownCaptureHandler,
				onMouseUp: params.onMouseUp,
				onTouchStart: params.onTouchStart,
				onTouchEnd: params.onTouchEnd,
				onDoubleClick: composeEvents(
					onDoubleClickHandler,
					params.onDoubleClick,
				),
				onContextMenu: composeEvents(
					onContextMenuHandler,
					params.onContextMenu,
				),
				slot: "center",
				style: {
					...params.style,
					...overridableStyles,
					...(itemIsSelected ? selectedStyle : {}),
					...(itemIsSelected && itemCanMove ? selectedAndCanMove : {}),
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
		[
			hSize,
			hStartPos,
			itemCanMove,
			itemCanResizeLeft,
			itemCanResizeRight,
			itemIsDragging,
			itemIsSelected,
			itemVSize,
			itemVStartPos,
			onContextMenuHandler,
			onDoubleClickHandler,
			onItemClickHandler,
			onPointerDownCaptureHandler,
		],
	);

	const onLeftResizerPointerDownCapture: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
			function onPointerDownCapture(event) {
				if (!itemCanResizeLeft) {
					return;
				}

				event.stopPropagation();

				itemDragStateRef.current.reset();
				itemResizeStateRef.current.start(event);
				timeline.itemStartResizeStart(itemId, event.clientX);
			},
			[
				itemCanResizeLeft,
				itemDragStateRef.current.reset,
				itemId,
				itemResizeStateRef.current.start,
				timeline.itemStartResizeStart,
			],
		);

	const onRightResizerPointerDownCapture: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
			function onPointerDownCapture(event) {
				if (!itemCanResizeRight) {
					return;
				}

				event.stopPropagation();

				itemDragStateRef.current.reset();
				itemResizeStateRef.current.start(event);
				timeline.itemEndResizeStart(itemId, event.clientX);
			},
			[
				itemCanResizeRight,
				itemDragStateRef.current.reset,
				itemId,
				itemResizeStateRef.current.start,
				timeline.itemEndResizeStart,
			],
		);

	const getResizePropsHandler = useCallback<GetResizeProps>(
		({ leftClassName, leftStyle, rightClassName, rightStyle } = {}) => {
			return {
				left: {
					className:
						"rct-item-handler rct-item-handler-left rct-item-handler-resize-left " +
						(leftClassName ?? ""),
					onPointerDownCapture: onLeftResizerPointerDownCapture,
					style: { ...leftResizeStyle, ...leftStyle },
				},
				right: {
					className:
						"rct-item-handler rct-item-handler-right rct-item-handler-resize-right" +
						(rightClassName ?? ""),
					onPointerDownCapture: onRightResizerPointerDownCapture,
					style: { ...rightResizeStyle, ...rightStyle },
				},
			};
		},
		[onLeftResizerPointerDownCapture, onRightResizerPointerDownCapture],
	);

	const itemContext = useMemo(
		() => ({
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
			newGroupId,
			resizeEdge,
			resizeOffset,
			resizeTime,
			resizing: itemIsResizing,
			selected: itemIsSelected,
			title: originalItem[keys.itemTitleKey],
			useResizeHandle: true,
			width: hSize,
		}),
		[
			dragOffset,
			dragTime,
			endTime,
			hSize,
			hStartPos,
			itemCanMove,
			itemCanResizeLeft,
			itemCanResizeRight,
			itemIsDragging,
			itemIsResizing,
			itemIsSelected,
			itemVStartPos,
			keys.itemTitleKey,
			lineSize,
			newGroupId,
			originalItem[keys.itemTitleKey],
			resizeEdge,
			resizeOffset,
			resizeTime,
			startTime,
		],
	);

	const timelineContext = useMemo(
		() => ({
			canvasTimeEnd: timeline.getHCanvasValueMax(),
			canvasTimeStart: timeline.getHCanvasValueMin(),
			timelineWidth: timeline.hMiddleSize,
			visibleTimeEnd: timeline.hWindowMax,
			visibleTimeStart: timeline.hWindowMin,
		}),
		[
			timeline.getHCanvasValueMax,
			timeline.getHCanvasValueMin,
			timeline.hMiddleSize,
			timeline.hWindowMax,
			timeline.hWindowMin,
		],
	);

	return (
		<ItemComponent
			getItemProps={getItemPropsHandler}
			getResizeProps={getResizePropsHandler}
			item={originalItem}
			itemContext={itemContext}
			key={`item-${itemId}`}
			timelineContext={timelineContext}
		/>
	);
};
