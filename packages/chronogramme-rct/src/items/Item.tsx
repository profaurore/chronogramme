import {
	type MouseEventHandler,
	type ReactNode,
	useCallback,
	useMemo,
} from "react";
import {
	type defaultKeys,
	leftResizeStyle,
	overridableStyles,
	rightResizeStyle,
	STYLE_SIZE_PRECISION,
	selectedAndCanMove,
	selectedAndCanResizeLeft,
	selectedAndCanResizeLeftAndDragLeft,
	selectedAndCanResizeRight,
	selectedAndCanResizeRightAndDragRight,
	selectedStyle,
} from "../constants";
import type {
	DefaultItem,
	GetItemProps,
	ItemRendererGetResizeProps,
	ResizeEdge,
} from "../Timeline";
import { composeEvents } from "../utils/reactUtils";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	RctToCoreItem,
} from "../utils/typeUtils";
import { useItemContext } from "./useItemContext";
import { useItemForHelpersContext } from "./useItemForHelpersContext";

interface ItemProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	item: RctToCoreItem<TKeys, TGroup, TItem>;
	vOffsetInGroup: number;
}

export const Item = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>({
	item,
	vOffsetInGroup,
}: ItemProps<TKeys, TGroup, TItem>): ReactNode => {
	const {
		canMove: timelineCanDrag,
		canResizeLeft: timelineCanResizeLeft,
		canResizeRight: timelineCanResizeRight,
		canSelect,
		itemDragState,
		itemRenderer: ItemRendererComponent,
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
	} = useItemContext<TKeys, TGroup, TItem>();

	const {
		renderedHSize: width,
		renderedHStartPos: left,
		renderedVSize: height,
		renderedVStartPosInGroup: top,
	} = useItemForHelpersContext();

	const id = item.id;
	const originalItem = item.originalItem;
	const className = originalItem.className;
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
	let resizeEdge: ResizeEdge | undefined;

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
	const collisionLeft = item.startTime;
	const collisionWidth = endTime - collisionLeft;
	const title = (
		originalItem as unknown as DefaultItem<TGroup["id"], TItem["id"]>
	)[(keys as typeof defaultKeys).itemTitleKey];

	const canvasTimeEnd = timeline.getHCanvasValueMax();
	const canvasTimeStart = timeline.getHCanvasValueMin();
	const timelineWidth = timeline.hMiddleSize;
	const visibleTimeEnd = timeline.hWindowMax;
	const visibleTimeStart = timeline.hWindowMin;

	const onClickHandler: MouseEventHandler<HTMLDivElement> = useCallback(
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
			canSelect,
			itemId,
			onClick,
			onSelect,
			selected,
			setSelectedItemId,
			timeline,
		],
	);

	const onPointerDownCaptureHandler: MouseEventHandler<HTMLDivElement> =
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
				itemDragState,
				itemId,
				itemResizeState,
				timeline,
			],
		);

	const onDoubleClickHandler: MouseEventHandler<HTMLDivElement> = useCallback(
		function onDoubleClickHandlerInner(event) {
			const nativeEvent = event.nativeEvent;

			if (nativeEvent instanceof PointerEvent) {
				event.stopPropagation();

				onDoubleClick?.(itemId, event, timeline.getHValue(nativeEvent.clientX));
			}
		},
		[itemId, onDoubleClick, timeline],
	);

	const onContextMenuHandler: MouseEventHandler<HTMLDivElement> = useCallback(
		function onContextMenuHandlerInner(event) {
			const nativeEvent = event.nativeEvent;

			if (nativeEvent instanceof PointerEvent) {
				event.stopPropagation();

				if (onContextMenu !== undefined) {
					event.preventDefault();

					onContextMenu(itemId, event, timeline.getHValue(nativeEvent.clientX));
				}
			}
		},
		[itemId, onContextMenu, timeline],
	);

	const getItemPropsHandler = useCallback<GetItemProps>(
		(params) => ({
			className: `rct-item ${className ?? ""}`,
			onClick: composeEvents(onClickHandler, params.onClick),
			onMouseDown: params.onMouseDown,
			onPointerDownCapture: onPointerDownCaptureHandler,
			onMouseUp: params.onMouseUp,
			onTouchStart: params.onTouchStart,
			onTouchEnd: params.onTouchEnd,
			onDoubleClick: composeEvents(onDoubleClickHandler, params.onDoubleClick),
			onContextMenu: composeEvents(onContextMenuHandler, params.onContextMenu),
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
				left: `${left.toFixed(STYLE_SIZE_PRECISION)}px`,
				top: `${vOffsetInGroup.toFixed(STYLE_SIZE_PRECISION)}px`,
				width: `${width.toFixed(STYLE_SIZE_PRECISION)}px`,
				height: `${height.toFixed(STYLE_SIZE_PRECISION)}px`,
				lineHeight: `${height.toFixed(STYLE_SIZE_PRECISION)}px`,
			},
		}),
		[
			canMove,
			canResizeLeft,
			canResizeRight,
			className,
			dragging,
			height,
			left,
			onClickHandler,
			onContextMenuHandler,
			onDoubleClickHandler,
			onPointerDownCaptureHandler,
			selected,
			vOffsetInGroup,
			width,
		],
	);

	const onLeftResizerPointerDownCapture: MouseEventHandler<HTMLDivElement> =
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
			[canResizeLeft, itemDragState, itemId, itemResizeState, timeline],
		);

	const onRightResizerPointerDownCapture: MouseEventHandler<HTMLDivElement> =
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
			[canResizeRight, itemDragState, itemId, itemResizeState, timeline],
		);

	const getResizePropsHandler = useCallback<ItemRendererGetResizeProps>(
		({ leftClassName, leftStyle, rightClassName, rightStyle } = {}) => ({
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
		}),
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
		<ItemRendererComponent
			getItemProps={getItemPropsHandler}
			getResizeProps={getResizePropsHandler}
			item={originalItem}
			itemContext={itemContext}
			key={`item-${itemId}`}
			timelineContext={timelineContext}
		/>
	);
};
