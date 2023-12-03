import { clamp } from "./math";

export const TIME_MIN = -8.64e15;

export const TIME_MAX = 8.64e15;

export const clampTime = clamp;

/**
 * Clamps a range between two values.
 *
 * - If the start of the range is less than `min`, the start of the range is `min`
 *   and the range is preserved.
 * - If the end of the range is more than `max`, the end of the range is `max` and
 *   the range is preserved.
 *
 * @param start The start of the range. Must be a finite number.
 * @param end The end of the range. Must be a finite number greater than
 *   `start`.
 * @param min The minimum value. Must be a finite or infinite number.
 * @param max The maximum value. Must be a finite or infinite number.
 * @returns The range, bound between `min` and `max`.
 */
export const clampTimeRange = (
  start: number,
  end: number,
  min: number,
  max: number,
): [number, number] => {
  let clamped: [number, number];

  if (start < min) {
    const range = end - start;

    clamped = [min, min + range];
  } else if (end > max) {
    const range = end - start;

    clamped = [max - range, max];
  } else {
    clamped = [start, end];
  }

  return clamped;
};

export const clampTimeRangeProperties = (
  start: number,
  end: number,
  min: number,
  max: number,
): [number, number] => {
  if (!Number.isFinite(start)) {
    throw new Error("timeStart must be a finite number.");
  }

  if (!Number.isFinite(end)) {
    throw new Error("timeEnd must be a finite number.");
  }

  return clampTimeRange(start, end, min, max);
};
