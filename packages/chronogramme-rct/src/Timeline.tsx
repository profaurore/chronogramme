import {
	type BaseGroup as CoreBaseGroup,
	type BaseItem as CoreBaseItem,
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
import { DateHeader, type Unit } from "./headers/DateHeader";
import type { ShowPeriod } from "./headers/HeadersContext";
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
import type { FullRequired } from "./utils/typeUtils";
import { validateComponentProperties } from "./utils/unsupportedUtils";

export type ResizeEdge = "left" | "right";
type ResizableEdges = false | ResizeEdge | "both";

type HorizontalClassNamesForGroup<
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

type MoveValidator<TItemId> = (
	action: "move",
	itemId: TItemId,
	time: number,
) => number;

type ResizeValidator<TItemId> = (
	action: "resize",
	itemId: TItemId,
	time: number,
	resizeEdge: ResizeEdge,
) => number;

type OnBoundsChange = (canvasTimeStart: number, canvasTimeEnd: number) => void;

type OnCanvasClick<TGroupId> = (
	groupId: TGroupId,
	time: number,
	e: SyntheticEvent,
) => void;

type OnCanvasContextMenu<TGroupId> = (
	groupId: TGroupId,
	time: number,
	e: SyntheticEvent,
) => void;

type OnCanvasDoubleClick<TGroupId> = (
	groupId: TGroupId,
	time: number,
	e: SyntheticEvent,
) => void;

type OnItemClick<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

type OnItemContextMenu<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

type OnItemDeselect = (e: SyntheticEvent) => void;

type OnItemDoubleClick<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

type OnItemDrag<TGroupId, TItemId> = (
	itemDragObject:
		| {
				eventType: "move";
				itemId: TItemId;
				time: number;
				newGroupId: TGroupId;
		  }
		| {
				eventType: "resize";
				itemId: TItemId;
				time: number;
				edge: ResizeEdge;
		  },
) => void;

type OnItemMove<TGroupId, TItemId> = (
	itemId: TItemId,
	dragTime: number,
	newGroupOrder: TGroupId,
) => void;

type OnItemResize<TItemId> = (
	itemId: TItemId,
	endTimeOrStartTime: number,
	edge: ResizeEdge,
) => void;

type OnItemSelect<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

type OnTimeChange = (
	newVisibleTimeStart: number,
	newVisibleTimeEnd: number,
	updateScrollCanvas: (start: number, end: number) => void,
) => void;

export interface TimelineContext {
	canvasTimeEnd: number;
	canvasTimeStart: number;
	timelineWidth: number;
	visibleTimeEnd: number;
	visibleTimeStart: number;
}

type OnZoom = (timelineContext: TimelineContext) => void;

interface ResizeDetector {
	addListener?: Component;
	removeListener?: Component;
}

type VerticalLineClassNameForTime = (
	startTime: number,
	endTime: number,
) => string[];

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
	canChangeGroup?: boolean | undefined;
	canMove?: boolean | undefined;
	canResize?: ResizableEdges | undefined;
	canSelect?: boolean | undefined;
	children?: ReactNode | undefined;
	className?: string | undefined;
	clickTolerance?: number | undefined;
	defaultTimeEnd?: number | undefined;
	defaultTimeStart?: number | undefined;
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
	headerRef?: Ref<HTMLDivElement>;
	hideHeaders?: boolean | undefined;
	hideHorizontalLines?: boolean | undefined;
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
	itemTouchSendsClick?: boolean | undefined;
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
	maxZoom?: number | undefined;
	minResizeWidth?: number | undefined;
	minZoom?: number | undefined;
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
	onZoom?: OnZoom | undefined;
	resizeDetector?: ResizeDetector | undefined;
	rightSidebarWidth?: number | undefined;
	rowData: TRowData;
	rowRenderer: RowRenderer<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup,
		TRowData
	>;
	scrollRef?: Ref<HTMLDivElement> | undefined;
	selected?: TItemId[] | undefined;
	sidebarWidth?: number | undefined;
	stackItems?: boolean | undefined;
	style?: CSSProperties | undefined;
	timeSteps?: TimeSteps | undefined;
	traditionalZoom?: boolean | undefined;
	useResizeHandle?: boolean | undefined;
	verticalLineClassNameForTime?: VerticalLineClassNameForTime | undefined;
	visibleTimeEnd: number;
	visibleTimeStart: number;
}

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
	onTimeChange = (
		newVisibleTimeStart: number,
		newVisibleTimeEnd: number,
		updateScrollCanvas: (start: number, end: number) => void,
	): void => updateScrollCanvas(newVisibleTimeStart, newVisibleTimeEnd),
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

export interface RctToCoreItem<TGroupId, TItemId, TItem>
	extends CoreBaseItem<TGroupId, TItemId> {
	originalItem: TItem;
}

export interface RctToCoreGroup<TGroupId, TGroup>
	extends CoreBaseGroup<TGroupId> {
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
	itemProps?: (HTMLAttributes<HTMLDivElement> | undefined) &
		"This property is unsupported because DefaultItemRenderer is unsupported." & {
			__brand: "Error";
		};
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

export type BaseGroup<
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
> = {
	lineHeight?: number | undefined;
	stackItems?: (boolean | undefined) &
		"This property is unsupported." & { __brand: "Error" };
} & {
	[K in TGroupIdKey]: TGroupId;
} & {
	[K in TGroupTitleKey]?: string | undefined;
} & {
	[K in TGroupRightTitleKey]?: string | undefined;
};

interface GetLayerRootPropsReturnType {
	style: CSSProperties;
}

type GetLayerRootProps = () => GetLayerRootPropsReturnType;

interface RowRendererProps<
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
	TRowData,
> {
	getLayerRootProps: GetLayerRootProps;
	group: TGroup;
	// itemsWithInteractions: TItem[]; // TODO: Implement
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
	TRowData,
> = (
	props: RowRendererProps<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup,
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

interface ItemRendererGetResizePropsParameters {
	leftClassName?: string | undefined;
	leftStyle?: CSSProperties | undefined;
	rightClassName?: string | undefined;
	rightStyle?: CSSProperties | undefined;
}

export type ItemRendererGetResizeProps = (
	params?: ItemRendererGetResizePropsParameters | undefined,
) => ItemRendererGetResizePropsReturnType;

interface Dimensions {
	collisionLeft: number;
	collisionWidth: number;
	height: number;
	left: number;
	stack: boolean;
	top: number;
	width: number;
}

export interface ItemRendererItemContext<TGroupId> {
	canMove: boolean;
	canResizeLeft: boolean;
	canResizeRight: boolean;
	dimensions: Dimensions;
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
	validateComponentProperties(props, UNSUPPORTED_PROPERTIES);

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

	return (
		<MemoedRenderedTimeline
			{...remainingProperties}
			renderIndicator={renderIndicator}
			timelineRef={timelineRef}
		/>
	);
};
