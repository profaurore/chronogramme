import { css, type LinariaClassName } from "@linaria/core";
import {
	type ChangeEvent,
	type ChangeEventHandler,
	type ComponentProps,
	type CSSProperties,
	type EventHandler,
	type FocusEvent,
	type KeyboardEvent,
	type MouseEventHandler,
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import "./styles.css";
import {
	EVEN_MULTIPLE,
	HALF,
	TIME_MAX,
	TIME_MIN,
	UNIT,
	ZERO,
} from "@chronogramme/chronogramme";
import { GroupRow } from "@chronogramme/chronogramme-rct/groups/GroupRow";
import { RowItems } from "@chronogramme/chronogramme-rct/items/RowItems";
import {
	type BaseGroup,
	type BaseItem,
	type Keys as BaseKeys,
	type GroupRenderer,
	type ItemRenderer,
	Timeline as RCTimeline,
	type RowRenderer,
	type TimelineProps,
} from "@chronogramme/chronogramme-rct/Timeline";
import { DOUBLE } from "../../../chronogramme/src/math";
import { CustomMarker } from "../../src/markers/CustomMarker";
import { TimelineMarkers } from "../../src/markers/TimelineMarkers";

const timelineClass: LinariaClassName = css`
	flex: none;
	font-size: 12px;
	height: 400px;
	margin-bottom: 1em;

	&::part(center) {
		background-image: repeating-linear-gradient(135deg, #00f, #f0f 100px);
	}

	&::part(bar-h-start), &::part(bar-h-end) {
		background-color: #0f0;
	}

	&::part(bar-v-start), &::part(bar-v-end) {
		background-color: #f00;
	}

	&::part(corner-h-start-v-start),
		&::part(corner-h-start-v-end),
		&::part(corner-h-end-v-start),
		&::part(corner-h-end-v-end) {
		background-color: #0ff;
	}
`;

const buttonRowClass: LinariaClassName = css`
	align-items: center;
	display: flex;
	gap: 5px;
`;

const headerClass: LinariaClassName = css`
	display:flex;
	flex-direction: column;
	gap: 5px;
	margin-bottom:5px;
`;

const toggleClass: LinariaClassName = css`
	align-items: center;
	border: 1px solid #aaa;
	cursor: pointer;
	border-radius: 4px;
	display: flex;
	gap: 5px;
	height: 100%;
	padding-inline: 7px;
`;

const DAYS_IN_WEEK = 7;
const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_DAY = 86_400_000;
const MILLISECONDS_PER_WEEK = 604_800_000;
const MILLISECONDS_PER_MONTH = 2_592_000_000;
const MILLISECONDS_PER_YEAR = 31_536_000_000;
const MILLISECONDS_PER_DECADE = 315_360_000_000;

const FEW_ITEMS = 1000;
const SOME_ITEMS = 50_000;
const MANY_ITEMS = 250_000;

const DEFAULT_GROUP_ROW_HEIGHT = 20;
const EVEN_GROUP_ROW_HEIGHT = 15;

const GROUP_COUNT = 1000;
const ITEM_BASE_RANGE = 5_000_000_000;
const END_BASE_OFFSET = 10_000_000;
const END_RANDOM_FACTOR = 50_000_000;

const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-CA", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	hourCycle: "h23",
	minute: "2-digit",
	second: "2-digit",
	era: "short",
});

function formatDate(time: number): string {
	try {
		return formatter.format(time);
	} catch {
		return "N/A";
	}
}

function formatDateRange(start: number, end: number): string {
	return `${formatDate(start)} - ${formatDate(end)}`;
}

function datesFromStartDate(start: number): [number, number] {
	return [
		start,
		new Date(start).setDate(new Date(start).getDate() + DAYS_IN_WEEK),
	];
}

function getGroupHeight(index: number, factor: number): number | undefined {
	return index % EVEN_MULTIPLE === ZERO
		? factor * EVEN_GROUP_ROW_HEIGHT
		: undefined;
}

type Keys = BaseKeys<
	"id",
	"title",
	"rightTitle",
	"id",
	"group",
	"title",
	"title",
	"start_time",
	"end_time"
>;
type Item = BaseItem<Keys, number, number | string>;
type Group = BaseGroup<Keys, number>;

export function App(): ReactNode {
	const trickleIntervalRef = useRef<number>(null);

	const [[windowStart, windowEnd], setWindow] = useState<[number, number]>(() =>
		datesFromStartDate(Date.now()),
	);

	const [lineHeightFactor, setLineHeightFactor] = useState<number>(UNIT);

	// Bug report: https://github.com/biomejs/biome/issues/3512
	// biome-ignore lint/correctness/useExhaustiveDependencies: Biome bug
	const windowString = useMemo(
		() => formatDateRange(windowStart, windowEnd),
		[windowEnd, windowStart],
	);

	const onStartOfTimeClickHandler: MouseEventHandler = () => {
		setWindow(datesFromStartDate(TIME_MIN));
	};

	const onNowClickHandler: MouseEventHandler = () => {
		setWindow(datesFromStartDate(Date.now()));
	};

	const onEndOfTimeClickHandler: MouseEventHandler = () => {
		setWindow(
			datesFromStartDate(
				new Date(TIME_MAX).setDate(new Date(TIME_MAX).getDate() - DAYS_IN_WEEK),
			),
		);
	};

	const [items, setItems] = useState<Item[]>([]);
	const [groups, setGroups] = useState<Group[]>([]);

	const onAddClickHandler =
		(addCount: number): (() => void) =>
		(): void => {
			setItems((prevItems) => {
				const now = Date.now();
				const groupItemCount = addCount / GROUP_COUNT;
				const indexOffsetFactor = ITEM_BASE_RANGE / groupItemCount;
				const newItems = prevItems.slice(ZERO);
				let prevCount = newItems.length;

				for (let i = ZERO; i < GROUP_COUNT; i += UNIT) {
					for (let j = ZERO; j < groupItemCount; j += UNIT) {
						const startTime =
							now + Math.random() * indexOffsetFactor + j * indexOffsetFactor;

						newItems.push({
							// biome-ignore lint/style/useNamingConvention: Original React Calendar Timeline API
							end_time:
								startTime + END_BASE_OFFSET + Math.random() * END_RANDOM_FACTOR,
							group: i,
							id: prevCount,
							// biome-ignore lint/style/useNamingConvention: Original React Calendar Timeline API
							start_time: startTime,
						});

						prevCount += UNIT;
					}
				}

				return newItems;
			});
		};

	useEffect(() => {
		setGroups((prev) => {
			if (prev.length === ZERO) {
				const newGroups: typeof groups = [];

				for (let i = ZERO; i < GROUP_COUNT; i += UNIT) {
					newGroups.push({
						id: i,
						lineHeight: getGroupHeight(i, lineHeightFactor),
					});
				}

				return newGroups;
			}

			return prev.map((group, index) => ({
				...group,
				lineHeight: getGroupHeight(index, lineHeightFactor),
			}));
		});
	}, [lineHeightFactor]);

	const onItemMoveHandler = useCallback<
		Exclude<
			ComponentProps<
				typeof RCTimeline<Keys, Group, Item, undefined>
			>["onItemMove"],
			undefined
		>
	>((itemId, dragTime, newGroupOrder) => {
		setItems((prev) =>
			prev.map((item) => {
				if (item.id === itemId) {
					const newItem = { ...item };
					newItem.start_time = dragTime;
					newItem.end_time = dragTime + (item.end_time - item.start_time);
					newItem.group = newGroupOrder;

					return newItem;
				}

				return item;
			}),
		);
	}, []);

	const onItemResizeHandler = useCallback<
		Exclude<
			TimelineProps<Keys, Group, Item, undefined>["onItemResize"],
			undefined
		>
	>((itemId, endTimeOrStartTime, edge) => {
		setItems((prev) =>
			prev.map((item) => {
				if (item.id === itemId) {
					const newItem = { ...item };
					if (edge === "left") {
						newItem.start_time = endTimeOrStartTime;
					} else {
						newItem.end_time = endTimeOrStartTime;
					}

					return newItem;
				}

				return item;
			}),
		);
	}, []);

	const onTimeChangeHandler = useCallback<
		Exclude<ComponentProps<typeof RCTimeline>["onTimeChange"], undefined>
	>((newVisibleTimeStart, newVisibleTimeEnd) => {
		setWindow([newVisibleTimeStart, newVisibleTimeEnd]);
	}, []);

	const groupRenderer = useCallback<GroupRenderer<Keys, Group, undefined>>(
		({ group }) => (
			<div
				style={{
					backgroundColor:
						group.id % EVEN_MULTIPLE === ZERO ? "#12345678" : undefined,
				}}
			>{`group-${group.id}`}</div>
		),
		[],
	);

	const rowRenderer = useCallback<RowRenderer<Keys, Group, Item, undefined>>(
		({ group }) => (
			<GroupRow>
				<RowItems />
				<div
					style={{
						backgroundColor:
							group.id % EVEN_MULTIPLE === ZERO ? "#12345678" : undefined,
						height: "100%",
						width: "100%",
					}}
				>
					{group.id}
				</div>
			</GroupRow>
		),
		[],
	);

	const itemRenderer = useCallback<ItemRenderer<Keys, Group, Item>>(
		({ getItemProps, getResizeProps, item }) => {
			const { left: leftResizeProps, right: rightResizeProps } =
				getResizeProps();

			leftResizeProps.style.background = "#f00";
			rightResizeProps.style.background = "#f00";

			leftResizeProps.style.zIndex = -1;
			rightResizeProps.style.zIndex = -1;

			return (
				<div
					{...getItemProps({
						style: { textAlign: "center", whiteSpace: "nowrap" },
					})}
				>
					<div key="left" {...leftResizeProps} />
					<span style={{ pointerEvents: "none" }}>
						{item.group}-{item.id}
					</span>
					<div key="right" {...rightResizeProps} />
				</div>
			);
		},
		[],
	);

	const moveResizeValidator = useCallback<
		Exclude<ComponentProps<typeof RCTimeline>["moveResizeValidator"], undefined>
	>(
		(action, itemId, time, resizeEdge?) => {
			const item = items.find((i) => i.id === itemId);

			if (!item) {
				return time;
			}

			const dayAlignedTime =
				Math.round(time / MILLISECONDS_PER_DAY) * MILLISECONDS_PER_DAY;

			if (action === "move") {
				return dayAlignedTime;
			}

			return resizeEdge === "right"
				? Math.max(
						dayAlignedTime,
						(Math.floor(item.start_time / MILLISECONDS_PER_DAY) + UNIT) *
							MILLISECONDS_PER_DAY,
					)
				: Math.min(
						dayAlignedTime,
						(Math.ceil(item.end_time / MILLISECONDS_PER_DAY) - UNIT) *
							MILLISECONDS_PER_DAY,
					);
		},
		[items],
	);

	const onChangeZoomHandler =
		(windowRange: number): MouseEventHandler =>
		(): void => {
			setWindow(([start]) => [start, start + windowRange]);
		};

	const onSetZoomHandler: EventHandler<FocusEvent | KeyboardEvent> = (
		event: FocusEvent | KeyboardEvent,
	) => {
		if (event instanceof KeyboardEvent && event.key !== "Enter") {
			return;
		}

		const target = event.target;

		if (target instanceof HTMLInputElement) {
			setWindow(([start]) => [
				start,
				start + Number.parseInt(target.value, 10) * MILLISECONDS_PER_DAY,
			]);

			target.value = "";
		}
	};

	const onChangeRowHeightHandler: ChangeEventHandler<HTMLSelectElement> = (
		event: ChangeEvent<HTMLSelectElement>,
	) => {
		const factor = Number.parseFloat(event.target.value);

		if (Number.isFinite(factor) && factor > ZERO) {
			setLineHeightFactor(factor);
		}
	};

	const onTrickleChangeHandler: ChangeEventHandler<HTMLInputElement> = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const trickleInterval = trickleIntervalRef.current;

		if (trickleInterval !== null) {
			window.clearInterval(trickleInterval);
			trickleIntervalRef.current = null;
		}

		const addOne = onAddClickHandler(FEW_ITEMS);
		if (event.target.checked) {
			trickleIntervalRef.current = window.setInterval(() => {
				addOne();
			}, MILLISECONDS_PER_SECOND);
		}
	};

	useEffect(() => {
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);

		const endOfToday = new Date(startOfToday);
		endOfToday.setDate(startOfToday.getDate() + 1);

		const endOfTomorrow = new Date(endOfToday);
		endOfTomorrow.setDate(endOfToday.getDate() + 1);

		setItems([
			{
				// biome-ignore lint/style/useNamingConvention: Original React Calendar Timeline API
				end_time: endOfToday.getTime(),
				group: 0,
				id: "today",
				// biome-ignore lint/style/useNamingConvention: Original React Calendar Timeline API
				start_time: startOfToday.getTime(),
			},
			{
				// biome-ignore lint/style/useNamingConvention: Original React Calendar Timeline API
				end_time: endOfTomorrow.getTime(),
				group: 0,
				id: "tomorrow",
				// biome-ignore lint/style/useNamingConvention: Original React Calendar Timeline API
				start_time: endOfToday.getTime(),
			},
		]);
	}, []);

	const rctId = useId();

	return (
		<>
			<div className={headerClass}>
				<div className={buttonRowClass}>
					<button onClick={onAddClickHandler(SOME_ITEMS)} type="button">
						Add 50k items
					</button>
					<button onClick={onAddClickHandler(MANY_ITEMS)} type="button">
						Add 250k items
					</button>
					<label className={toggleClass}>
						<input type="checkbox" onChange={onTrickleChangeHandler} /> Trickle
					</label>
					<span>{Intl.NumberFormat("en").format(items.length)} items</span>
				</div>

				<div className={buttonRowClass}>
					<button onClick={onStartOfTimeClickHandler} type="button">
						Start of time
					</button>
					<button onClick={onNowClickHandler} type="button">
						Now
					</button>
					<button onClick={onEndOfTimeClickHandler} type="button">
						End of time
					</button>
					<div>{windowString}</div>
				</div>

				<div className={buttonRowClass}>
					<input
						onBlur={onSetZoomHandler}
						onKeyUp={onSetZoomHandler}
						placeholder="Set days"
						size={6}
						type="number"
					/>
					<button
						onClick={onChangeZoomHandler(MILLISECONDS_PER_DECADE)}
						type="button"
					>
						Decade
					</button>
					<button
						onClick={onChangeZoomHandler(MILLISECONDS_PER_YEAR)}
						type="button"
					>
						Year
					</button>
					<button
						onClick={onChangeZoomHandler(MILLISECONDS_PER_MONTH)}
						type="button"
					>
						Month
					</button>
					<button
						onClick={onChangeZoomHandler(MILLISECONDS_PER_WEEK)}
						type="button"
					>
						Week
					</button>
					<button
						onClick={onChangeZoomHandler(MILLISECONDS_PER_DAY)}
						type="button"
					>
						Day
					</button>
				</div>
			</div>

			<div className={buttonRowClass}>
				<select onChange={onChangeRowHeightHandler}>
					<option value={0.5} selected={lineHeightFactor === HALF}>
						50%
					</option>
					<option value={1} selected={lineHeightFactor === UNIT}>
						100%
					</option>
					<option value={2} selected={lineHeightFactor === DOUBLE}>
						200%
					</option>
					<option value={4} selected={lineHeightFactor === DOUBLE * DOUBLE}>
						400%
					</option>
				</select>
			</div>

			<RCTimeline<Keys, Group, Item, undefined>
				id={rctId}
				canResize="both"
				className={timelineClass}
				groupRenderer={groupRenderer}
				groups={groups}
				itemRenderer={itemRenderer}
				items={items}
				lineHeight={DEFAULT_GROUP_ROW_HEIGHT * lineHeightFactor}
				moveResizeValidator={moveResizeValidator}
				onItemMove={onItemMoveHandler}
				onItemResize={onItemResizeHandler}
				onTimeChange={onTimeChangeHandler}
				rowData={undefined}
				rowRenderer={rowRenderer}
				visibleTimeEnd={windowEnd}
				visibleTimeStart={windowStart}
			>
				<TimelineMarkers>
					<CustomMarker date={Date.now()}>
						{({ styles }: { styles: CSSProperties }) => (
							<div style={{ ...styles, backgroundColor: "gold" }} />
						)}
					</CustomMarker>
				</TimelineMarkers>
			</RCTimeline>
		</>
	);
}
