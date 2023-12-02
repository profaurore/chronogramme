import { describe, expect, test } from "vitest";

import {
  clampTime,
  clampTimeEndProperty,
  clampTimeRange,
  clampTimeStartProperty,
  TIME_MAX,
  TIME_MIN,
} from "./time";

test("Time constants are valid", () => {
  expect(TIME_MIN).toEqual(-8.64e15);
  expect(TIME_MAX).toEqual(8.64e15);
});

describe.each([
  [clampTime.name, clampTime, null],
  [clampTimeStartProperty.name, clampTimeStartProperty, "timeStart"],
  [clampTimeEndProperty.name, clampTimeEndProperty, "timeEnd"],
])("%s", (_clampTimeName, fn, checkName) => {
  // Test the functions that check the input value.
  if (checkName !== null) {
    test("NaN time throws an error", () => {
      const test = (): void => {
        fn(NaN, TIME_MIN, TIME_MAX);
      };

      expect(test).toThrowError(new Error(`${checkName} must not be NaN.`));
    });
  }

  const timeMin = 1000;
  const timeMax = 2000;
  const timeBeforeRange = 500;
  const timeInRange = 1500;
  const timeAfterRange = 2500;
  test.each([
    [
      "An infinite time before",
      "the minimum time of the range",
      Number.NEGATIVE_INFINITY,
      timeMin,
    ],
    [
      "A time before",
      "the minimum time of the range",
      timeBeforeRange,
      timeMin,
    ],
    ["A time at the start of", "the same time", timeMin, timeMin],
    ["A time in", "the same time", timeInRange, timeInRange],
    ["A time at the end of", "the same time", timeMax, timeMax],
    ["A time after", "the maximum time of the range", timeAfterRange, timeMax],
    [
      "An infinite time after",
      "the maximum time of the range",
      Number.POSITIVE_INFINITY,
      timeMax,
    ],
  ])(
    "%s the range returns %s",
    (_positionDescription, _resultDescription, time, result) => {
      expect(fn(time, timeMin, timeMax)).toEqual(result);
    },
  );
});

describe(clampTimeRange.name, () => {
  const timeMin = 1000;
  const timeMax = 2000;
  const timeBeforeRange = 500;
  const timeInRange = 1500;
  const timeAfterRange = 2500;
  const timeRange = 250;
  test.each([
    [
      "A time before",
      "the minimum time of the range",
      timeBeforeRange,
      timeBeforeRange + timeRange,
      timeMin,
      timeMin + timeRange,
    ],
    [
      "A time at the start of",
      "the same time",
      timeMin,
      timeMin + timeRange,
      timeMin,
      timeMin + timeRange,
    ],
    [
      "A time in",
      "the same time",
      timeInRange,
      timeInRange + timeRange,
      timeInRange,
      timeInRange + timeRange,
    ],
    [
      "A time at the end of",
      "the same time",
      timeMax - timeRange,
      timeMax,
      timeMax - timeRange,
      timeMax,
    ],
    [
      "A time after",
      "the maximum time of the range",
      timeAfterRange - timeRange,
      timeAfterRange,
      timeMax - timeRange,
      timeMax,
    ],
  ])(
    "%s the range returns %s",
    (
      _positionDescription,
      _resultDescription,
      start,
      end,
      resultStart,
      resultEnd,
    ) => {
      expect(clampTimeRange(start, end, timeMin, timeMax)).toEqual([
        resultStart,
        resultEnd,
      ]);
    },
  );
});
