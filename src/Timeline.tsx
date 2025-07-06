import {
	type CSSProperties,
	type HTMLAttributes,
	type ReactNode,
	type SyntheticEvent,
	useEffect,
	useLayoutEffect,
	useReducer,
	useRef,
	useState,
} from "react";
import { WindowChangeEventDetail } from "../lib/events.ts";
import { HALF, UNIT, ZERO } from "../lib/math.ts";
import type {
	BaseGroup,
	BaseItem,
	Timeline as HTMLTimeline,
} from "../lib/Timeline.ts";
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
} from "./constants.ts";
import { composeEvents } from "./utils.ts";

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
	itemHeightRatio = 0.65,
	itemRenderer,
	items,
	lineHeight = 30,
	onItemDeselect,
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
				| "onTouchEnd"
				| "onTouchStart"
				| "style"
			>,
		) => HTMLAttributes<HTMLDivElement>;
		getResizeProps: (params?: {
			leftClassName?: string;
			leftStyle?: CSSProperties;
			rightClassName?: string;
			rightStyle?: CSSProperties;
		}) => {
			left: {
				className: string;
				style: CSSProperties;
			};
			right: {
				className: string;
				style: CSSProperties;
			};
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
	onItemSelect?: (itemId: number, e: SyntheticEvent, time: number) => void;
	onItemDeselect?: (e: SyntheticEvent) => void;
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
	const [, update] = useReducer((x: number) => (x + 1) % 10e9, 0);
	const timelineRef = useRef<HTMLTimeline<number, TGroup, number, TItem>>(null);
	const [selectedItemIds, _setSelectedItemIds] = useState<Set<number>>(
		new Set(),
	);

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

			timeline.addEventListener("windowChange", onWindowChangeHandler);

			return () => {
				timeline.removeEventListener("windowChange", onWindowChangeHandler);
			};
		}

		return;
	}, [onTimeChange]);

	useEffect(() => {
		const timeline = timelineRef.current;
		if (timeline) {
			timeline.addEventListener("renderRequest", update);

			return () => {
				timeline.removeEventListener("renderRequest", update);
			};
		}

		return;
	});

	const renderedGroups: ReactNode[] = [];
	const renderedRows: ReactNode[] = [];
	const renderedItems: ReactNode[] = [];
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
									height: `${lineSize}px`,
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
					const id = item.id;

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
							getItemProps: (params) => {
								return {
									className: "rct-item",
									onClick: composeEvents(params.onClick, (event) => {
										const nativeEvent = event.nativeEvent;

										if (nativeEvent instanceof MouseEvent) {
											event.stopPropagation();

											if (itemIsSelectable) {
												if (itemIsSelected) {
													onItemDeselect?.(event);
												} else {
													onItemSelect?.(
														id,
														event,
														timeline.getHValue(nativeEvent.clientX),
													);
												}
											}
										}
									}),
									onMouseDown: params.onMouseDown,
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
										style: { ...leftResizeStyle, ...leftStyle },
									},
									right: {
										className: addClass(
											"rct-item-handler rct-item-handler-right rct-item-handler-resize-right",
											rightClassName,
										),
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
							key: `item-${groupId}-${id}`,
							timelineContext,
						}),
					);
				}
			}
		}
	}

	return (
		<cg-timeline
			class={className}
			h-start-extrema={[sidebarWidth, sidebarWidth]}
			h-start-size={sidebarWidth}
			h-window={[visibleTimeStart, visibleTimeEnd]}
			line-size={lineHeight}
			ref={timelineRef}
		>
			{renderedRows}
			{renderedItems}
		</cg-timeline>
	);
};
