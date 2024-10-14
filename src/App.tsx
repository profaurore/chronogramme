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
import type { Scroller } from "../lib/Scroller.ts";
import type { BaseGroup, BaseItem, Timeline } from "../lib/Timeline.ts";
import { WindowChangeEventDetail } from "../lib/events.ts";
import { TIME_MAX, TIME_MIN } from "../lib/time.ts";

const timelineClass = css`
	height: 400px;
	margin-bottom: 1em;
`;

const scrollerClass = css`
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

	// useEffect(() => {
	// 	const x = setTimeout(() => {
	// 		setWindow([3000, 7000]);
	// 		setExtrema([0, 10000]);
	// 	}, 1000000);

	// 	return () => {
	// 		clearTimeout(x);
	// 	};
	// });

	const onStartOfTimeClickHandler: MouseEventHandler = () => {
		scrollerRef.current?.setHWindow(...datesFromStartDate(TIME_MIN));
	};

	const onNowClickHandler: MouseEventHandler = () => {
		scrollerRef.current?.setHWindow(...datesFromStartDate(Date.now()));
	};

	const onEndOfTimeClickHandler: MouseEventHandler = () => {
		scrollerRef.current?.setHWindow(
			...datesFromStartDate(
				new Date(TIME_MAX).setDate(new Date(TIME_MAX).getDate() - daysInWeek),
			),
		);
	};

	useEffect(() => {
		const timeline = scrollerRef.current;
		if (timeline) {
			const windowChangeHandler: EventListener = (e) => {
				if (
					e instanceof CustomEvent &&
					e.detail instanceof WindowChangeEventDetail
				) {
					setWindow([e.detail.hWindowMin, e.detail.hWindowMax]);
				}
			};

			timeline.addEventListener("windowChange", windowChangeHandler);

			return () => {
				timeline.removeEventListener("windowChange", windowChangeHandler);
			};
		}

		return undefined;
	}, []);

	useEffect(() => {
		const now = Date.now();
		const staticTest = false;

		let items: BaseItem[];

		if (staticTest) {
			items = [
				{ endTime: now + 10_000_000, groupId: 0, id: 1, startTime: now + 0 },
				{
					endTime: now + 20_000_000,
					groupId: 0,
					id: 2,
					startTime: now + 10_000_000,
				},
				{
					endTime: now + 30_000_000,
					groupId: 0,
					id: 3,
					startTime: now + 20_000_000,
				},
				{
					endTime: now + 40_000_000,
					groupId: 0,
					id: 4,
					startTime: now + 30_000_000,
				},
				{
					endTime: now + 15_000_000,
					groupId: 0,
					id: 5,
					startTime: now + 5_000_000,
				},
				{
					endTime: now + 7_000_000,
					groupId: 0,
					id: 6,
					startTime: now + 6_000_000,
				},
				{
					endTime: now + 8_000_000,
					groupId: 0,
					id: 7,
					startTime: now + 7_000_000,
				},
				{
					endTime: now + 9_000_000,
					groupId: 0,
					id: 8,
					startTime: now + 8_000_000,
				},
				{
					endTime: now + 20_000_000,
					groupId: 0,
					id: 9,
					startTime: now + 15_000_000,
				},
			];
		} else {
			const groupCount = 1_000;
			const groupItemCount = 10_000;

			items = [];

			for (let i = 0; i < groupCount; i++) {
				for (let j = 0; j < groupItemCount; j++) {
					const startTime = now + Math.random() * 10_000_000 + j * 1_000_000;
					items.push({
						endTime: startTime + 1_000_000 + Math.random() * 39_000_000,
						groupId: i,
						id: i * groupItemCount + j,
						startTime,
					});
				}
			}

			// Randomize if the algorithm is sensitive to randomized values.
			// for (let i = items.length - 1; i >= 0; i--) {
			// 	const otherIdx = Math.floor(Math.random() * (i + 1));
			// 	// biome-ignore lint/style/noNonNullAssertion: Guaranteed by the algorithm
			// 	const temp = items[i]!;
			// 	// biome-ignore lint/style/noNonNullAssertion: Guaranteed by the algorithm
			// 	items[i] = items[otherIdx]!;
			// 	items[otherIdx] = temp;
			// }
		}

		const evenGroupRowHeight = 10;
		const oddGroupRowHeight = 20;

		const groups = [
			...items
				.reduce((acc, { groupId }) => {
					if (!acc.has(groupId)) {
						acc.set(groupId, {
							id: groupId,
							rowHeight: groupId % 2 ? evenGroupRowHeight : oddGroupRowHeight,
						});
					}

					return acc;
				}, new Map<number, BaseGroup>())
				.values(),
		];
		groups.sort((a, b) => a.id - b.id);

		timelineRef.current?.setItems(items);
		timelineRef.current?.setGroups(groups);
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
			</div>

			<div>Extrema: {extremaString}</div>
			<div>Window: {windowString}</div>
			<div>
				<cg-timeline
					class={timelineClass}
					ref={timelineRef}
					h-window={[windowStart, windowEnd]}
				/>
			</div>
			<div>
				<cg-scroller
					class={scrollerClass}
					default-resize-handles
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
			</div>
		</>
	);
}
