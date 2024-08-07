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
import type { BaseItem, Timeline } from "../lib/Timeline.ts";
import { WindowChangeEventDetail } from "../lib/events.ts";
import { TIME_MAX, TIME_MIN } from "../lib/time.ts";

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
	const [[extremaStart, extremaEnd], setExtrema] = useState<[number, number]>([
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

	useEffect(() => {
		const x = setTimeout(() => {
			setWindow([3000, 7000]);
			setExtrema([0, 10000]);
		}, 1000000);

		return () => {
			clearTimeout(x);
		};
	});

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
		const smallTest = false;

		let items: BaseItem[];
		if (smallTest) {
			items = [
				{ endTime: 100, groupId: 0, id: 1, startTime: 0 },
				{ endTime: 200, groupId: 0, id: 2, startTime: 100 },
				{ endTime: 300, groupId: 0, id: 3, startTime: 200 },
				{ endTime: 400, groupId: 0, id: 4, startTime: 300 },
				{ endTime: 150, groupId: 0, id: 5, startTime: 50 },
				{ endTime: 200, groupId: 0, id: 6, startTime: 150 },
			];
		} else {
			const itemCount = 1_000_000;
			const groupSize = 10_000;
			items = [];
			for (let i = 0; i < itemCount; i++) {
				const startTime = Math.random() * 1000 + i;
				items.push({
					endTime: startTime + 100 + Math.random() * 3900,
					groupId: Math.floor(i / groupSize),
					id: i,
					startTime,
				});
			}
		}

		timelineRef.current?.setItems(items);
	}, []);

	useEffect(() => {
		// const tree = new BPlusTree<string>();
		// const nodes: [number, string][] = [
		// 	[1, "abc"],
		// 	[2, "def"],
		// 	[3, "ghi"],
		// 	[4, "jkl"],
		// 	[5, "mno"],
		// 	[6, "pqr"],
		// 	[7, "stu"],
		// 	[8, "vwx"],
		// 	[9, "yz."],
		// ] as const;
		// for (const [key, value] of nodes) {
		// 	// console.log("--------------- INSERT %s %s", key, value);
		// 	tree.insert(key, value);
		// 	// console.log(printBPlusTree(tree));
		// }
		// console.log(printBPlusTree(tree));
		// const deleteNodes: [number, string][] = [
		// 	[9, "yz."],
		// 	[8, "vwx"],
		// 	[7, "stu"],
		// 	[6, "pqr"],
		// 	[5, "mno"],
		// 	[4, "jkl"],
		// 	[3, "ghi"],
		// 	[2, "def"],
		// 	[1, "abc"],
		// ];
		// for (const [key, value] of deleteNodes) {
		// 	console.log("--------------- DELETE %s %s", key, value);
		// 	tree.delete(key, value);
		// 	console.log(printBPlusTree(tree));
		// }
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
				<cg-timeline ref={timelineRef} />
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
