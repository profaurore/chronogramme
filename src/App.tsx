import "./App.css";

import { css } from "@linaria/core";
import { type MouseEventHandler, type ReactNode, useState } from "react";

import { TIME_MAX, TIME_MIN } from "../lib/time";
import { type TimeChangeHandler, Timeline } from "../lib/Timeline";

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

const datesFromStartDate = (start: number): { end: number; start: number } => ({
  end: new Date(start).setDate(new Date(start).getDate() + daysInWeek),
  start,
});

export const App = (): ReactNode => {
  const [dates, setDates] = useState<{ end: number; start: number }>(() =>
    datesFromStartDate(Date.now()),
  );

  const [datesString, setDatesString] = useState<string>(() =>
    formatDateRange(dates.start, dates.end),
  );

  const onTimeChangeHandler: TimeChangeHandler = ({ timeEnd, timeStart }) => {
    setDatesString(formatDateRange(timeStart, timeEnd));
  };

  const onStartOfTimeClickHandler: MouseEventHandler = () => {
    setDates(datesFromStartDate(TIME_MIN));
  };

  const onNowClickHandler: MouseEventHandler = () => {
    setDates(datesFromStartDate(Date.now()));
  };

  const onEndOfTimeClickHandler: MouseEventHandler = () => {
    setDates(
      datesFromStartDate(
        new Date(TIME_MAX).setDate(new Date(TIME_MAX).getDate() - daysInWeek),
      ),
    );
  };

  return (
    <>
      <Timeline
        className={timelineClass}
        onTimeChange={onTimeChangeHandler}
        timeEnd={dates.end}
        timeStart={dates.start}
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
