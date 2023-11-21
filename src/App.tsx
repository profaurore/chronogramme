import "./App.css";

import { css } from "@linaria/core";
import type { ReactNode } from "react";

import { Timeline } from "../lib/Timeline";

const timelineClass = css`
  height: 400px;
  max-height: 80vh;
  max-width: 100%;
  outline: 1px solid #f00;
  width: 800px;
`;

const daysInWeek = 7;

export const App = (): ReactNode => {
  const now = new Date();
  const nowPlusSevenDays = new Date();

  const timeStart = now.valueOf();
  const timeEnd = nowPlusSevenDays.setDate(now.getDate() + daysInWeek);

  return (
    <Timeline
      className={timelineClass}
      timeEnd={timeEnd}
      timeStart={timeStart}
    />
  );
};
