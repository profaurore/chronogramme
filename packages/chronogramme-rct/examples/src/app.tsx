import { css } from "@linaria/core";
import {
	type ComponentProps,
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
	type BaseGroup,
	type BaseItem,
	type Scroller,
	TIME_MAX,
	TIME_MIN,
	type Timeline,
	WindowChangeEventDetail,
} from "@chronogramme/chronogramme";
import { Timeline as RCTimeline } from "@chronogramme/chronogramme-rct";

const timelineClass = css`
	flex: none;
	height: 400px;
	margin-bottom: 1em;
`;

const scrollerClass = css`
	flex: none;
	height: 400px;
	margin-bottom: 1em;
	max-height: 80vh;
	outline: 1px solid #f00;

	&::part(divider-top),
	&::part(divider-left),
	&::part(divider-right),
	&::part(divider-bottom) {
		display: block;
	}
`;

const buttonsClass = css`
	align-items: center;
	display: flex;
	gap: 5px;
`;

const daysInWeek = 7;

const formatter = new Intl.DateTimeFormat("en-CA", {
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
	return formatter.format(time);
}

function formatDateRange(start: number, end: number): string {
	return `${formatDate(start)} - ${formatDate(end)}`;
}

function datesFromStartDate(start: number): [number, number] {
	return [
		start,
		new Date(start).setDate(new Date(start).getDate() + daysInWeek),
	];
}

const GROUP_COUNT = 1000;

export function App(): ReactNode {
	const timelineRef = useRef<Timeline>(null);
	const scrollerRef = useRef<Scroller>(null);

	const [[windowStart, windowEnd], setWindow] = useState<[number, number]>(() =>
		datesFromStartDate(Date.now()),
	);
	const [[extremaStart, extremaEnd], _setExtrema] = useState<[number, number]>([
		TIME_MIN,
		TIME_MAX,
	]);

	// Bug report: https://github.com/biomejs/biome/issues/3512
	// biome-ignore lint/correctness/useExhaustiveDependencies: Biome bug
	const windowString = useMemo(() => {
		return formatDateRange(windowStart, windowEnd);
	}, [windowEnd, windowStart]);

	// Bug report: https://github.com/biomejs/biome/issues/3512
	// biome-ignore lint/correctness/useExhaustiveDependencies: Biome bug
	const extremaString = useMemo(() => {
		return formatDateRange(extremaStart, extremaEnd);
	}, [extremaEnd, extremaStart]);

	const onStartOfTimeClickHandler: MouseEventHandler = () => {
		scrollerRef.current?.setHWindow(...datesFromStartDate(TIME_MIN));
		timelineRef.current?.setHWindow(...datesFromStartDate(TIME_MIN));
	};

	const onNowClickHandler: MouseEventHandler = () => {
		scrollerRef.current?.setHWindow(...datesFromStartDate(Date.now()));
		timelineRef.current?.setHWindow(...datesFromStartDate(Date.now()));
	};

	const onEndOfTimeClickHandler: MouseEventHandler = () => {
		scrollerRef.current?.setHWindow(
			...datesFromStartDate(
				new Date(TIME_MAX).setDate(new Date(TIME_MAX).getDate() - daysInWeek),
			),
		);
		timelineRef.current?.setHWindow(
			...datesFromStartDate(
				new Date(TIME_MAX).setDate(new Date(TIME_MAX).getDate() - daysInWeek),
			),
		);
	};

	const [items, setItems] = useState<BaseItem[]>([]);
	const [groups, setGroups] = useState<BaseGroup[]>([]);

	const onAddClickHandler =
		(addCount: number): MouseEventHandler =>
		() => {
			setItems((prevItems) => {
				const now = Date.now();
				const groupItemCount = addCount / GROUP_COUNT;
				const indexOffsetFactor = 5_000_000_000 / groupItemCount;
				const newItems = prevItems.slice(0);
				let prevCount = newItems.length;

				for (let i = 0; i < GROUP_COUNT; i++) {
					for (let j = 0; j < groupItemCount; j++) {
						const startTime =
							now + Math.random() * indexOffsetFactor + j * indexOffsetFactor;

						newItems.push({
							endTime: startTime + 10_000_000 + Math.random() * 50_000_000,
							groupId: i,
							id: prevCount,
							startTime,
						});

						prevCount++;
					}
				}

				timelineRef.current?.setItems(newItems);

				return newItems;
			});
		};

	useEffect(() => {
		const scroller = scrollerRef.current;
		const timeline = timelineRef.current;
		if (scroller && timeline) {
			const windowChangeHandler: EventListener = (e) => {
				if (
					e instanceof CustomEvent &&
					e.detail instanceof WindowChangeEventDetail
				) {
					setWindow([e.detail.hWindowMin, e.detail.hWindowMax]);
				}
			};

			scroller.addEventListener("windowChange", windowChangeHandler);
			timeline.addEventListener("windowChange", windowChangeHandler);

			return () => {
				scroller.removeEventListener("windowChange", windowChangeHandler);
				timeline.removeEventListener("windowChange", windowChangeHandler);
			};
		}

		return undefined;
	}, []);

	useEffect(() => {
		const newGroups: { id: number; lineSize: number }[] = [];

		for (let i = 0; i < GROUP_COUNT; i++) {
			newGroups.push({
				id: i,
				lineSize: i % 2 ? 10 : 20,
			});
		}

		timelineRef.current?.setGroups(newGroups);
		setGroups(newGroups);
	}, []);

	const onItemMoveHandler = useCallback<
		Exclude<ComponentProps<typeof RCTimeline>["onItemMove"], undefined>
	>((itemId, dragTime, newGroupOrder) => {
		setItems((prev) => {
			return prev.map((item) => {
				if (item.id === itemId) {
					const newItem = { ...item };
					newItem.startTime = dragTime;
					newItem.endTime = dragTime + (item.endTime - item.startTime);
					newItem.groupId = newGroupOrder;

					return newItem;
				}

				return item;
			});
		});
	}, []);

	const rctId = useId();
	const timelineId = useId();
	const scrollerId = useId();

	return (
		<>
			<div className={buttonsClass}>
				<button onClick={onStartOfTimeClickHandler} type="button">
					Start of time
				</button>
				<button onClick={onNowClickHandler} type="button">
					Now
				</button>
				<button onClick={onEndOfTimeClickHandler} type="button">
					End of time
				</button>
				<button onClick={onAddClickHandler(50_000)} type="button">
					Add 50k items
				</button>
				<button onClick={onAddClickHandler(250_000)} type="button">
					Add 250k items
				</button>
				<span>{Intl.NumberFormat("en").format(items.length)} items</span>
			</div>

			<div>Extrema: {extremaString}</div>
			<div>Window: {windowString}</div>
			<RCTimeline
				id={rctId}
				className={timelineClass}
				groupRenderer={({ group }) => <div>{`group-${group.id}`}</div>}
				groups={groups}
				itemRenderer={({ getItemProps, item, key }) => (
					<div {...getItemProps({ style: { whiteSpace: "nowrap" } })} key={key}>
						{item.groupId}-{item.id}
					</div>
				)}
				items={items}
				onItemMove={onItemMoveHandler}
				rowData={null}
				rowRenderer={({ getLayerRootProps, group, key }) => {
					const props = getLayerRootProps();

					return (
						<div
							{...props}
							key={key}
							style={{
								...props.style,
								backgroundColor: group.id % 2 === 0 ? "#12345678" : undefined,
							}}
						>
							{key}
						</div>
					);
				}}
				visibleTimeEnd={windowEnd}
				visibleTimeStart={windowStart}
			/>
			<cg-timeline
				class={timelineClass}
				h-extrema={[extremaStart, extremaEnd]}
				h-window={[windowStart, windowEnd]}
				id={timelineId}
				ref={timelineRef}
			/>
			<cg-scroller
				class={scrollerClass}
				default-resize-handles={true}
				h-end-extrema={[50, 150]}
				h-end-size={100}
				h-window={[windowStart, windowEnd]}
				h-extrema={[extremaStart, extremaEnd]}
				h-start-extrema={[50, 150]}
				h-start-size={100}
				id={scrollerId}
				ref={scrollerRef}
				v-end-extrema={[50, 150]}
				v-end-size={100}
				v-extrema={[0, 1000]}
				v-start-extrema={[50, 150]}
				v-start-size={100}
				v-window={[0, 100]}
			/>
		</>
	);
}
