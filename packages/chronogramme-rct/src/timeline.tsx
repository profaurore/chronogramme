import {
	type BaseGroup as CoreBaseGroup,
	type BaseItem as CoreBaseItem,
	DragState,
	type Timeline as HTMLTimeline,
	TIME_MAX,
	TIME_MIN,
	UNIT,
	ZERO,
} from "@chronogramme/chronogramme";
import {
	Children,
	type CSSProperties,
	type HTMLAttributes,
	memo,
	type ReactNode,
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
	DragMoveEventDetail,
	ScrollBoundsChangeEventDetail,
	WindowChangeEventDetail,
} from "../../chronogramme/src/events";
import {
	defaultKeys,
	defaultTimeSteps,
	minCellWidth,
	timeFactors,
} from "./constants";
import { Group } from "./groups/Group";
import { Row } from "./groups/Row";
import { DateHeader, type Unit } from "./headers/DateHeader";
import type { ShowPeriod } from "./headers/HeadersContext";
import { HeadersContextProvider } from "./headers/HeadersContextProvider";
import { TimelineHeaders } from "./headers/TimelineHeaders";
import { HelpersContextProvider } from "./helpers/HelpersContextProvider";
import { ItemContextProvider } from "./items/ItemContextProvider";
import {
	MILLISECONDS_PER_FIFTEEN_MINUTES,
	MILLISECONDS_PER_HOUR,
	MILLISECONDS_PER_MINUTE,
} from "./utils/dateUtils";
import { reactChildHasSecretKey, useRender } from "./utils/reactUtils";
import type { FullRequired } from "./utils/typeUtils";

type ResizeEdge = "left" | "right";

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
	children?: ReactNode | undefined;
	className?: string | undefined;
	dragSnap?: number | undefined;
	groupRenderer: GroupRenderer<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup
	>;
	groups: TGroup[];
	headerHeight?: number | undefined;
	hideHeaders?: boolean | undefined;
	horizontalLineClassNamesForGroup?: ((group: TGroup) => string[]) | undefined;
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
	minResizeWidth?: number | undefined;
	moveResizeValidator?(action: "move", itemId: number, time: number): number;
	moveResizeValidator?(
		action: "resize",
		itemId: number,
		time: number,
		resizeEdge: "left" | "right",
	): number;
	onBoundsChange?:
		| ((canvasTimeStart: number, canvasTimeEnd: number) => void)
		| undefined;
	onCanvasClick?:
		| ((groupId: number, time: number, e: SyntheticEvent) => void)
		| undefined;
	onCanvasContextMenu?:
		| ((groupId: number, time: number, e: SyntheticEvent) => void)
		| undefined;
	onCanvasDoubleClick?:
		| ((groupId: number, time: number, e: SyntheticEvent) => void)
		| undefined;
	onItemClick?:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	onItemContextMenu?:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	onItemDeselect?: ((e: SyntheticEvent) => void) | undefined;
	onItemDoubleClick?:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	onItemDrag?:
		| ((
				itemDragObject:
					| {
							eventType: "move";
							itemId: number;
							time: number;
							newGroupId: number;
					  }
					| {
							eventType: "resize";
							itemId: number;
							time: number;
							edge: "left" | "right";
					  },
		  ) => void)
		| undefined;
	onItemMove?:
		| ((itemId: number, dragTime: number, newGroupOrder: number) => void)
		| undefined;
	onItemResize?:
		| ((itemId: number, endTimeOrStartTime: number, edge: ResizeEdge) => void)
		| undefined;
	onItemSelect?:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	onTimeChange?:
		| ((
				newVisibleTimeStart: number,
				newVisibleTimeEnd: number,
				updateScrollCanvas: (start: number, end: number) => void,
		  ) => void)
		| undefined;
	rightSidebarWidth?: number | undefined;
	rowData: TRowData;
	rowRenderer: RowRenderer<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup,
		TRowData
	>;
	selected?: number[] | undefined;
	sidebarWidth?: number | undefined;
	timeSteps?: TimeSteps | undefined;
	visibleTimeEnd: number;
	visibleTimeStart: number;
}

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
	// onItemDeselect, // TODO: For the row context provider
	onItemDoubleClick,
	onItemDrag,
	onItemMove,
	onItemResize,
	onItemSelect,
	onTimeChange,
	rightSidebarWidth = 0,
	rowData,
	rowRenderer,
	selected,
	sidebarWidth = 150,
	timeSteps = defaultTimeSteps,
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
}): ReactNode {
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
							const result = timeline.itemDragMove(detail.x, detail.y);

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

		return;
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

		return;
	}, [onItemResize, timelineRef]);

	useLayoutEffect(() => {
		const timeline = timelineRef.current;

		if (timeline) {
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

		if (timeline) {
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
		groupId: number,
		time: number,
		e: SyntheticEvent,
	) => void = useCallback(
		(groupId, time, e) => {
			setSelectedItemId(undefined);
			onCanvasClick?.(groupId, time, e);
		},
		[onCanvasClick],
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

	if (timeline) {
		const groupIndices = timeline.getVisibleGroupsIter();

		for (const groupIndex of groupIndices) {
			const group = timeline.getGroup(groupIndex);

			if (group) {
				renderedLeftGroups?.push(
					<Group<
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
					>
						group={group}
						groupIndex={groupIndex}
						horizontalLineClassNamesForGroup={horizontalLineClassNamesForGroup}
						itemHeightRatio={itemHeightRatio}
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

	if (!hideHeaders) {
		if (children) {
			const headers: ReactNode[] = [];
			Children.forEach(children, (child) => {
				if (reactChildHasSecretKey(child, TimelineHeaders.secretKey)) {
					headers.push(child);
				}
			});

			if (headers.length > UNIT) {
				throw new Error(
					"more than one <TimelineHeaders /> child found under <Timeline />",
				);
			}

			renderedHeader = headers[0];
		}

		renderedHeader ??= (
			<TimelineHeaders>
				<DateHeader unit="primaryHeader" />
				<DateHeader />
			</TimelineHeaders>
		);
	}

	return (
		<cg-timeline
			class={className}
			h-end-extrema={[rightSidebarWidth, rightSidebarWidth]}
			h-end-size={rightSidebarWidth}
			h-start-extrema={[sidebarWidth, sidebarWidth]}
			h-start-size={sidebarWidth}
			h-window={[visibleTimeStart, visibleTimeEnd]}
			h-extrema={[TIME_MIN, TIME_MAX]}
			v-start-extrema={[headerHeight, headerHeight]}
			v-start-size={headerHeight}
			id={id}
			item-time-snap={dragSnap}
			items-draggable={canMove}
			items-end-resizable={canResize === "right" || canResize === "both"}
			items-start-resizable={canResize === "left" || canResize === "both"}
			line-size={lineHeight}
			timezone-offset={timezoneOffset}
			ref={timelineRef}
		>
			{timeline && (
				<HelpersContextProvider<
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
				>
					timeline={timeline}
				>
					<HeadersContextProvider<
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
					>
						leftSidebarWidth={sidebarWidth}
						rightSidebarWidth={rightSidebarWidth}
						showPeriod={showPeriod}
						timeSteps={timeSteps}
						timeline={timeline}
						timelineUnit={timelineUnit}
					>
						{renderedHeader}
					</HeadersContextProvider>

					{renderedLeftGroups && (
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

					{renderedRightGroups && (
						<div
							className="rct-sidebar rct-sidebar-right"
							slot="bar-h-end"
							style={{ height: "100%", width: "100%" }}
						>
							<div style={{ height: "100%" }}>{renderedRightGroups}</div>
						</div>
					)}
				</HelpersContextProvider>
			)}
		</cg-timeline>
	);
}

const MemoedRenderedTimeline = memo(
	RenderedTimeline,
) as typeof RenderedTimeline;

export interface RctToCoreItem<TItem> extends CoreBaseItem {
	originalItem: TItem;
}

export interface RctToCoreGroup<TGroup> extends CoreBaseGroup {
	originalGroup: TGroup;
}

export interface TimeSteps {
	second: number;
	minute: number;
	hour: number;
	day: number;
	month: number;
	year: number;
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
	lineHeight?: number | undefined;
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
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
	TRowData = undefined,
> = (props: {
	getLayerRootProps: () => { style: CSSProperties };
	group: TGroup;
	// itemsWithInteractions: TItem[]; // TODO: Implement
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

export type GetResizeProps = (
	params?:
		| {
				leftClassName?: string | undefined;
				leftStyle?: CSSProperties | undefined;
				rightClassName?: string | undefined;
				rightStyle?: CSSProperties | undefined;
		  }
		| undefined,
) => {
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
	getItemProps: GetItemProps;
	getResizeProps: GetResizeProps;
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
