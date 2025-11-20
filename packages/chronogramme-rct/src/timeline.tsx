import {
	type BaseGroup,
	type BaseItem,
	DragState,
	HALF,
	type Timeline as HTMLTimeline,
	UNIT,
	WindowChangeEventDetail,
	ZERO,
} from "@chronogramme/chronogramme";
import {
	type CSSProperties,
	type HTMLAttributes,
	type ReactNode,
	type SyntheticEvent,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { DragMoveEventDetail } from "../../chronogramme/src/events";
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
import type { FullRequired } from "./typeUtils";
import { composeEvents } from "./utils";

type ResizeEdge = "left" | "right";

function addClass(current: string, optional?: string): string {
	return optional ? current + optional : current;
}

export const Timeline = <
	TItem extends BaseItem,
	TGroup extends BaseGroup,
	TRowData,
>({
	className,
	groupRenderer,
	groups,
	id,
	itemHeightRatio = 0.65,
	itemRenderer,
	items,
	lineHeight = 30,
	onItemDeselect,
	onItemMove,
	onItemResize,
	onItemSelect,
	onTimeChange,
	rowData,
	rowRenderer,
	sidebarWidth = 150,
	visibleTimeEnd,
	visibleTimeStart,
}: {
	className?: string;
	groupRenderer: (props: {
		group: TGroup;
		isRightSidebar?: boolean | undefined;
	}) => ReactNode;
	groups: TGroup[];
	id?: string;
	itemHeightRatio?: number;
	itemRenderer: (props: {
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
				top: number | null;
				width: number;
			};
			dragging: boolean;
			dragTime: number | null;
			resizeEdge: "left" | "right" | null;
			resizeStart: number | null;
			resizeTime: number | null;
			resizing: boolean;
			selected: boolean;
			useResizeHandle: boolean;
			width: number;
			dragOffset: number;
			newGroupId: number;
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
	items: TItem[];
	lineHeight?: number;
	onItemDeselect?: (e: SyntheticEvent) => void;
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
	rowRenderer: (props: {
		getLayerRootProps: () => { style: CSSProperties };
		group: TGroup;
		itemsWithInteractions: TItem[];
		key: string;
		rowData: TRowData;
	}) => ReactNode;
	sidebarWidth?: number;
	visibleTimeEnd: number;
	visibleTimeStart: number;
}): ReactNode => {
	const [rendered, setRendered] = useState<{
		groups: ReactNode[];
		items: ReactNode[];
		rows: ReactNode[];
	}>({ groups: [], items: [], rows: [] });
	const [selectedItemIds, _setSelectedItemIds] = useState<Set<number>>(
		new Set(),
	);

	const timelineRef =
		useRef<InstanceType<typeof HTMLTimeline<number, TGroup, number, TItem>>>(
			null,
		);
	const itemDragStateRef = useRef(new DragState({ endOnDisconnect: false }));
	const itemResizeStateRef = useRef(new DragState({ endOnDisconnect: false }));

	const render = useCallback(() => {
		const renderedGroups: ReactNode[] = [];
		const renderedItems: ReactNode[] = [];
		const renderedRows: ReactNode[] = [];

		const timeline = timelineRef?.current;

		if (timeline) {
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
						group,
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
							group,
							// TODO: Fix this to filter if items are being modified
							itemsWithInteractions: items,
							key: `group-${groupId}-${lineIndex}`,
							rowData,
						}),
					);

					for (const itemIndex of itemIndices) {
						const item = timeline.getItem(groupIndex, lineIndex, itemIndex);

						if (!item) {
							continue;
						}

						const startTime = item.startTime;
						const endTime = item.endTime;
						const itemId = item.id;

						const itemCanMove = true;
						const itemCanResizeLeft = true;
						const itemCanResizeRight = true;
						const itemIsDragging = false;
						const itemIsSelected = selectedItemIds.has(item.id);
						const itemIsSelectable = true;

						const hStartPos = Math.max(timeline.getHPos(startTime), ZERO);
						const hEndPos = Math.min(
							timeline.getHPos(endTime),
							timeline.hScrollSize,
						);
						const hSize = hEndPos - hStartPos;

						renderedItems.push(
							itemRenderer({
								getItemProps(params) {
									return {
										className: "rct-item",
										onClick: composeEvents(
											params.onClick,
											function onClick(event) {
												const nativeEvent = event.nativeEvent;

												if (nativeEvent instanceof MouseEvent) {
													event.stopPropagation();

													if (itemIsSelectable) {
														if (itemIsSelected) {
															onItemDeselect?.(event);
														} else {
															onItemSelect?.(
																itemId,
																event,
																timeline.getHValue(nativeEvent.clientX),
															);
														}
													}
												}
											},
										),
										onMouseDown: params.onMouseDown,
										onPointerDownCapture(event) {
											// Because the events need to be captured, not to intefere
											// with the library's native event handling, we need to
											// check for nested event handlers that would have
											// precedence.
											for (const element of event.nativeEvent.composedPath()) {
												if (
													element instanceof HTMLElement &&
													(element.classList.contains(
														"rct-item-handler-resize-left",
													) ||
														element.classList.contains(
															"rct-item-handler-resize-right",
														))
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
										onDoubleClick: params.onDoubleClick,
										onContextMenu: params.onContextMenu,
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
												event.stopPropagation();

												itemDragStateRef.current.reset();
												itemResizeStateRef.current.start(event);
												timeline.itemEndResizeStart(itemId, event.clientX);
											},
											style: { ...rightResizeStyle, ...rightStyle },
										},
									};
								},
								item,
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
									dragging: false,
									dragTime: 0,
									resizeEdge: null,
									resizeStart: null,
									resizeTime: null,
									resizing: false,
									selected: itemIsSelected,
									useResizeHandle: false,
									width: hSize,
									dragOffset: 0,
									newGroupId: 0,
								},
								key: `item-${groupId}-${itemId}`,
								timelineContext,
							}),
						);
					}
				}
			}
		}

		setRendered({
			groups: renderedGroups,
			items: renderedItems,
			rows: renderedRows,
		});
	}, [
		groupRenderer,
		itemHeightRatio,
		itemRenderer,
		items,
		onItemDeselect,
		onItemSelect,
		rowData,
		rowRenderer,
		selectedItemIds,
	]);

	useEffect(() => {
		const timeline = timelineRef.current;

		if (timeline) {
			timeline.setGroups(groups);
		}
	}, [groups]);

	useEffect(() => {
		const timeline = timelineRef.current;

		if (timeline) {
			timeline.setItems(items);
		}
	}, [items]);

	useLayoutEffect(() => {
		const timeline = timelineRef.current;

		if (timeline) {
			const onWindowChangeHandler = (event: Event) => {
				if (event instanceof CustomEvent) {
					const detail = event.detail;

					if (detail instanceof WindowChangeEventDetail) {
						onTimeChange?.(
							timeline.hWindowMin,
							timeline.hWindowMax,
							(start: number, end: number) => {
								timeline.setHWindow(start, end);
							},
						);
					}
				}
			};

			const controller = new AbortController();
			timeline.addEventListener("windowChange", onWindowChangeHandler, {
				signal: controller.signal,
			});

			return () => {
				controller.abort();
			};
		}

		return;
	}, [onTimeChange]);

	useEffect(() => {
		const timeline = timelineRef.current;

		if (timeline) {
			const abortController = new AbortController();
			timeline.addEventListener("renderRequest", render, {
				signal: abortController.signal,
			});

			return () => {
				abortController.abort();
			};
		}

		return;
	}, [render]);

	useEffect(() => {
		const itemDragState = itemDragStateRef.current;
		const timeline = timelineRef.current;

		if (timeline) {
			const controller = new AbortController();
			const options = { signal: controller.signal };

			itemDragState.addEventListener(
				"move",
				(event) => {
					if (event instanceof CustomEvent) {
						const detail = event.detail;

						if (detail instanceof DragMoveEventDetail) {
							timeline.itemDrag(detail.x, detail.y);
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
	}, [onItemMove]);

	useEffect(() => {
		const itemResizeState = itemResizeStateRef.current;
		const timeline = timelineRef.current;

		if (timeline) {
			const controller = new AbortController();
			const options = { signal: controller.signal };

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
							if ("startTime" in result) {
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
	}, [onItemResize]);

	return (
		<cg-timeline
			class={className}
			h-start-extrema={[sidebarWidth, sidebarWidth]}
			h-start-size={sidebarWidth}
			h-window={[visibleTimeStart, visibleTimeEnd]}
			id={id}
			line-size={lineHeight}
			ref={timelineRef}
		>
			{rendered.rows}
			{rendered.items}
		</cg-timeline>
	);
};
