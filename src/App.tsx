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
import type { Scroller } from "../lib/Scroller.tsx";
import { WindowChangeEventDetail } from "../lib/events.ts";
import { TIME_MAX, TIME_MIN } from "../lib/time.ts";

const timelineClass = css`
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
const formatDate = (time: number): string => formatter.format(time);

const formatDateRange = (start: number, end: number): string =>
	`${formatDate(start)} - ${formatDate(end)}`;

const datesFromStartDate = (start: number): [number, number] => [
	start,
	new Date(start).setDate(new Date(start).getDate() + daysInWeek),
];

export const App = (): ReactNode => {
	const timelineRef = useRef<Scroller>(null);

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
		timelineRef.current?.setHWindow(...datesFromStartDate(TIME_MIN));
	};

	const onNowClickHandler: MouseEventHandler = () => {
		timelineRef.current?.setHWindow(...datesFromStartDate(Date.now()));
	};

	const onEndOfTimeClickHandler: MouseEventHandler = () => {
		timelineRef.current?.setHWindow(
			...datesFromStartDate(
				new Date(TIME_MAX).setDate(new Date(TIME_MAX).getDate() - daysInWeek),
			),
		);
	};

	useEffect(() => {
		const timeline = timelineRef.current;
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
				<cg-scroller
					class={timelineClass}
					default-resize-handles
					h-end-extrema={[50, 150]}
					h-end-size={100}
					h-window={[windowStart, windowEnd]}
					h-extrema={[extremaStart, extremaEnd]}
					h-start-extrema={[50, 150]}
					h-start-size={100}
					ref={timelineRef}
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
};
