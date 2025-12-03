import { useCallback, useMemo } from "react";
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
} from "../constants";
import type {
	BaseGroup,
	BaseItem,
	GetItemProps,
	GetResizeProps,
	RctToCoreItem,
} from "../timeline";
import { composeEvents } from "../utils/reactUtils";
import { useItemContext } from "./useItemContext";
import { useItemForHelpersContext } from "./useItemForHelpersContext";

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
	vOffsetInGroup,
}: {
	item: RctToCoreItem<TItem>;
	vOffsetInGroup: number;
}): React.ReactNode => {
	const {
		canMove: timelineCanDrag,
		canResizeLeft: timelineCanResizeLeft,
		canResizeRight: timelineCanResizeRight,
		canSelect,
		itemDragState,
		itemRenderer: ItemComponent,
		itemResizeState,
		keys,
		minResizeWidth,
		onClick,
		onContextMenu,
		onDoubleClick,
		onSelect,
		selected: selectedItems,
		selectedItemId,
		setSelectedItemId,
		timeline,
	} = useItemContext<
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
		renderedHSize: width,
		renderedHStartPos: left,
		renderedVSize: height,
		renderedVStartPosInGroup: top,
	} = useItemForHelpersContext();

	const id = item.id;
	const isDraggable = item.isDraggable;
	const isEndResizable = item.isEndResizable;
	const isStartResizable = item.isStartResizable;

	const draggedItem = timeline.getDraggedItem();
	const dragOffset = timeline.getDragOffset();
	const dragTime = draggedItem?.startTime;
	const newGroupId = draggedItem?.groupId;
	const dragging = draggedItem !== undefined && id === draggedItem?.id;
	const canMove = isDraggable ?? timelineCanDrag;

	const resizedItem = timeline.getResizedItem();
	const resizeOffset = timeline.getResizeOffset();
	const resizeIsStart = timeline.getResizeIsStart();
	const resizeTime = resizedItem?.startTime;
	const resizing = resizedItem !== undefined && id === resizedItem?.id;
	const canResizeLeft =
		(isStartResizable ?? timelineCanResizeLeft) && width >= minResizeWidth;
	const canResizeRight =
		(isEndResizable ?? timelineCanResizeRight) && width >= minResizeWidth;
	let resizeEdge: "left" | "right" | undefined;

	if (resizeIsStart !== undefined) {
		if (resizeIsStart) {
			resizeEdge = "left";
		} else {
			resizeEdge = "right";
		}
	}

	const selected =
		selectedItemId !== undefined
			? id === selectedItemId
			: (selectedItems?.includes(id) ?? false);

	const endTime = item.endTime;
	const itemId = item.id;
	const originalItem = item.originalItem;
	const collisionLeft = item.startTime;
	const collisionWidth = endTime - collisionLeft;
	const title = originalItem[keys.itemTitleKey];

	const canvasTimeEnd = timeline.getHCanvasValueMax();
	const canvasTimeStart = timeline.getHCanvasValueMin();
	const timelineWidth = timeline.hMiddleSize;
	const visibleTimeEnd = timeline.hWindowMax;
	const visibleTimeStart = timeline.hWindowMin;

	const onClickHandler: React.MouseEventHandler<HTMLDivElement> = useCallback(
		function onClickHandlerInner(event) {
			const nativeEvent = event.nativeEvent;

			if (nativeEvent instanceof MouseEvent) {
				event.stopPropagation();

				if (canSelect) {
					const time = timeline.getHValue(nativeEvent.clientX);

					if (selected) {
						onClick?.(itemId, event, time);
					} else {
						setSelectedItemId(itemId);
						onSelect?.(itemId, event, time);
					}
				}
			}
		},
		[
			itemId,
			canSelect,
			selected,
			onClick,
			onSelect,
			setSelectedItemId,
			timeline.getHValue,
		],
	);

	const onPointerDownCaptureHandler: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
			function onPointerDownCaptureHandlerInner(event) {
				if (!canMove) {
					return;
				}

				// Because the events need to be captured, not to intefere
				// with the library's native event handling, we need to
				// check for nested event handlers that would have
				// precedence.
				for (const element of event.nativeEvent.composedPath()) {
					if (
						element instanceof HTMLElement &&
						((canResizeLeft &&
							element.classList.contains("rct-item-handler-resize-left")) ||
							(canResizeRight &&
								element.classList.contains("rct-item-handler-resize-right")))
					) {
						return;
					}
				}

				event.stopPropagation();

				itemResizeState.reset();
				itemDragState.start(event);
				timeline.itemDragStart(itemId, event.clientX);
			},
			[
				canMove,
				canResizeLeft,
				canResizeRight,
				itemDragState.start,
				itemId,
				itemResizeState.reset,
				timeline.itemDragStart,
			],
		);

	const onDoubleClickHandler: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
			function onDoubleClickHandlerInner(event) {
				const nativeEvent = event.nativeEvent;

				if (nativeEvent instanceof PointerEvent) {
					event.stopPropagation();

					onDoubleClick?.(
						itemId,
						event,
						timeline.getHValue(nativeEvent.clientX),
					);
				}
			},
			[itemId, onDoubleClick, timeline.getHValue],
		);

	const onContextMenuHandler: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
			function onContextMenuHandlerInner(event) {
				const nativeEvent = event.nativeEvent;

				if (nativeEvent instanceof PointerEvent) {
					event.stopPropagation();

					if (onContextMenu) {
						event.preventDefault();

						onContextMenu(
							itemId,
							event,
							timeline.getHValue(nativeEvent.clientX),
						);
					}
				}
			},
			[itemId, onContextMenu, timeline.getHValue],
		);

	const getItemPropsHandler = useCallback<GetItemProps>(
		(params) => {
			return {
				className: "rct-item",
				onClick: composeEvents(onClickHandler, params.onClick),
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
					...(selected ? selectedStyle : {}),
					...(selected && canMove ? selectedAndCanMove : {}),
					...(selected && canResizeLeft ? selectedAndCanResizeLeft : {}),
					...(selected && canResizeLeft && dragging
						? selectedAndCanResizeLeftAndDragLeft
						: {}),
					...(selected && canResizeRight ? selectedAndCanResizeRight : {}),
					...(selected && canResizeRight && dragging
						? selectedAndCanResizeRightAndDragRight
						: {}),
					position: "absolute",
					boxSizing: "border-box",
					slot: "center",
					left: `${left.toFixed(4)}px`,
					top: `${vOffsetInGroup.toFixed(4)}px`,
					width: `${width.toFixed(4)}px`,
					height: `${height.toFixed(4)}px`,
					lineHeight: `${height.toFixed(4)}px`,
				},
			};
		},
		[
			width,
			left,
			canMove,
			canResizeLeft,
			canResizeRight,
			dragging,
			selected,
			height,
			vOffsetInGroup,
			onContextMenuHandler,
			onDoubleClickHandler,
			onClickHandler,
			onPointerDownCaptureHandler,
		],
	);

	const onLeftResizerPointerDownCapture: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
			function onPointerDownCapture(event) {
				if (!canResizeLeft) {
					return;
				}

				event.stopPropagation();

				itemDragState.reset();
				itemResizeState.start(event);
				timeline.itemStartResizeStart(itemId, event.clientX);
			},
			[
				canResizeLeft,
				itemDragState.reset,
				itemId,
				itemResizeState.start,
				timeline.itemStartResizeStart,
			],
		);

	const onRightResizerPointerDownCapture: React.MouseEventHandler<HTMLDivElement> =
		useCallback(
			function onPointerDownCapture(event) {
				if (!canResizeRight) {
					return;
				}

				event.stopPropagation();

				itemDragState.reset();
				itemResizeState.start(event);
				timeline.itemEndResizeStart(itemId, event.clientX);
			},
			[
				canResizeRight,
				itemDragState.reset,
				itemId,
				itemResizeState.start,
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
			canMove,
			canResizeLeft,
			canResizeRight,
			dimensions: {
				collisionLeft,
				collisionWidth,
				height,
				left,
				stack: false,
				top,
				width,
			},
			dragging,
			dragOffset,
			dragTime,
			newGroupId,
			resizeEdge,
			resizeOffset,
			resizeTime,
			resizing,
			selected,
			title,
			useResizeHandle: true,
			width,
		}),
		[
			canMove,
			canResizeLeft,
			canResizeRight,
			collisionLeft,
			collisionWidth,
			dragging,
			dragOffset,
			dragTime,
			height,
			left,
			newGroupId,
			resizeEdge,
			resizeOffset,
			resizeTime,
			resizing,
			selected,
			title,
			top,
			width,
		],
	);

	const timelineContext = useMemo(
		() => ({
			canvasTimeEnd,
			canvasTimeStart,
			timelineWidth,
			visibleTimeEnd,
			visibleTimeStart,
		}),
		[
			canvasTimeEnd,
			canvasTimeStart,
			timelineWidth,
			visibleTimeEnd,
			visibleTimeStart,
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
