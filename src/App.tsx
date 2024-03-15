import { css } from "@linaria/core";
import {
	type MouseEventHandler,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import {
	type TimeChangeHandler,
	Timeline,
	type TimelineRef,
} from "../lib/Timeline.tsx";
import { TimeChangeEventDetail, type Timeline2 } from "../lib/Timeline2.tsx";
import { TIME_MAX, TIME_MIN } from "../lib/time.ts";
import "./App.css";

const timelineClass = css`
	height: 400px;
	margin-bottom: 1em;
	max-height: 80vh;
	max-width: 100%;
	outline: 1px solid #f00;
	width: 800px;

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

const formatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "short",
	timeStyle: "medium",
});
const formatDate = (time: number): string => formatter.format(new Date(time));

const formatDateRange = (start: number, end: number): string =>
	`${formatDate(start)} - ${formatDate(end)}`;

const datesFromStartDate = (start: number): [number, number] => [
	start,
	new Date(start).setDate(new Date(start).getDate() + daysInWeek),
];

export const App = (): ReactNode => {
	const timelineRef = useRef<TimelineRef>(null);
	const timeline2Ref = useRef<Timeline2>(null);

	const [initTimeStart, initTimeEnd] = useMemo<[number, number]>(
		() => datesFromStartDate(Date.now()),
		[],
	);
	const [initTimeStart2, initTimeEnd2] = useMemo<[number, number]>(
		() => datesFromStartDate(Date.now()),
		[],
	);

	const [datesString, setDatesString] = useState<string>(() =>
		formatDateRange(initTimeStart, initTimeEnd),
	);
	const [datesString2, setDatesString2] = useState<string>(() =>
		formatDateRange(initTimeStart2, initTimeEnd2),
	);

	const onTimeChangeHandler: TimeChangeHandler = (times) => {
		const timeEnd = times.timeEnd;
		const timeStart = times.timeStart;

		setDatesString(formatDateRange(timeStart, timeEnd));
	};

	const onStartOfTimeClickHandler: MouseEventHandler = () => {
		timelineRef.current?.setTime(...datesFromStartDate(TIME_MIN));

		timeline2Ref.current?.setTimeWindowExtrema(...datesFromStartDate(TIME_MIN));
	};

	const onNowClickHandler: MouseEventHandler = () => {
		timelineRef.current?.setTime(...datesFromStartDate(Date.now()));

		timeline2Ref.current?.setTimeWindowExtrema(
			...datesFromStartDate(Date.now()),
		);
	};

	const onEndOfTimeClickHandler: MouseEventHandler = () => {
		timelineRef.current?.setTime(
			...datesFromStartDate(
				new Date(TIME_MAX).setDate(new Date(TIME_MAX).getDate() - daysInWeek),
			),
		);

		timeline2Ref.current?.setTimeWindowExtrema(
			...datesFromStartDate(
				new Date(TIME_MAX).setDate(new Date(TIME_MAX).getDate() - daysInWeek),
			),
		);
	};

	useEffect(() => {
		timeline2Ref.current?.addEventListener("timeChange", (e) => {
			if (
				e instanceof CustomEvent &&
				e.detail instanceof TimeChangeEventDetail
			) {
				setDatesString2(
					formatDateRange(e.detail.timeWindowMin, e.detail.timeWindowMax),
				);
			}
		});
	}, []);

	return (
		<>
			<div className={buttonsClass}>
				<button onClick={onStartOfTimeClickHandler}>Start of time</button>
				<button onClick={onNowClickHandler}>Now</button>
				<button onClick={onEndOfTimeClickHandler}>End of time</button>
			</div>

			<div>{datesString2}</div>
			<div>
				<cg-timeline
					class={timelineClass}
					defaultResizeHandles
					ref={timeline2Ref}
					timeExtrema={[TIME_MIN, TIME_MAX]}
					windowTime={[initTimeStart2, initTimeEnd2]}
				></cg-timeline>
			</div>

			<div>{datesString}</div>
			<Timeline
				className={timelineClass}
				initTimeEnd={initTimeEnd}
				initTimeStart={initTimeStart}
				onTimeChange={onTimeChangeHandler}
				ref={timelineRef}
			/>
		</>
	);
};
