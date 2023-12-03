import "./App.css";

import { css } from "@linaria/core";
import {
  type MouseEventHandler,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";

import { TIME_MAX, TIME_MIN } from "../lib/time";
import {
  type TimeChangeHandler,
  Timeline,
  type TimelineRef,
} from "../lib/Timeline";

const timelineClass = css`
  height: 400px;
  max-height: 80vh;
  max-width: 100%;
  outline: 1px solid #f00;
  width: 800px;
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

  const [initTimeStart, initTimeEnd] = useMemo<[number, number]>(
    () => datesFromStartDate(Date.now()),
    [],
  );

  const [datesString, setDatesString] = useState<string>(() =>
    formatDateRange(initTimeStart, initTimeEnd),
  );

  const onTimeChangeHandler: TimeChangeHandler = ({ timeEnd, timeStart }) => {
    setDatesString(formatDateRange(timeStart, timeEnd));
  };

  const onStartOfTimeClickHandler: MouseEventHandler = () => {
    timelineRef.current?.setTime(...datesFromStartDate(TIME_MIN));
  };

  const onNowClickHandler: MouseEventHandler = () => {
    timelineRef.current?.setTime(...datesFromStartDate(Date.now()));
  };

  const onEndOfTimeClickHandler: MouseEventHandler = () => {
    timelineRef.current?.setTime(
      ...datesFromStartDate(
        new Date(TIME_MAX).setDate(new Date(TIME_MAX).getDate() - daysInWeek),
      ),
    );
  };

  return (
    <>
      <Timeline
        className={timelineClass}
        initTimeEnd={initTimeEnd}
        initTimeStart={initTimeStart}
        onTimeChange={onTimeChangeHandler}
        ref={timelineRef}
      />
      <div>{datesString}</div>
      <div className={buttonsClass}>
        <button onClick={onStartOfTimeClickHandler}>Start of time</button>
        <button onClick={onNowClickHandler}>Now</button>
        <button onClick={onEndOfTimeClickHandler}>End of time</button>
      </div>
    </>
  );
};
