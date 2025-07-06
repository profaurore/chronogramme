import { css } from "@linaria/core";
import {
	type MouseEventHandler,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import "./App.css";
import { WindowChangeEventDetail } from "../lib/events.ts";
import type { Scroller } from "../lib/Scroller.ts";
import type { BaseGroup, BaseItem, Timeline } from "../lib/Timeline.ts";
import { TIME_MAX, TIME_MIN } from "../lib/time.ts";
import { Timeline as RCTimeline } from "./Timeline.tsx";

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

		return;
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
				<span>{Intl.NumberFormat("en").format(items.length)}</span>
			</div>

			<div>Extrema: {extremaString}</div>
			<div>Window: {windowString}</div>
			<RCTimeline
				className={timelineClass}
				groupRenderer={({ group }) => <div>{`group-${group.id}`}</div>}
				groups={groups}
				itemRenderer={({ getItemProps, key }) => (
					<div {...getItemProps({ style: { whiteSpace: "nowrap" } })} key={key}>
						{key}
					</div>
				)}
				items={items}
				rowData={null}
				rowRenderer={({ getLayerRootProps, key }) => (
					<div {...getLayerRootProps()} key={key}>
						{key}
					</div>
				)}
				visibleTimeEnd={windowEnd}
				visibleTimeStart={windowStart}
			/>
			<cg-timeline
				class={timelineClass}
				h-extrema={[extremaStart, extremaEnd]}
				h-window={[windowStart, windowEnd]}
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
