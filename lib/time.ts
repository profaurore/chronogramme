import { clampMinWins } from "./math.ts";

export const TIME_MIN = -8.64e15;

export const TIME_MAX = 8.64e15;

export const clampTime = clampMinWins;

/**
 * Clamps a time interval between two values.
 *
 * - If the start of the interval is less than `minimum`, the start of the
 *   interval is `minimum` and the interval is preserved.
 * - If the end of the interval is more than `maximum`, the end of the interval
 *   is `maximum` and the interval is preserved.
 *
 * @param start The start of the interval. Must be a finite number.
 * @param end The end of the interval. Must be a finite number greater than
 *   `start`.
 * @param minimum The minimum value. Must be a finite or infinite number.
 * @param maximum The maximum value. Must be a finite or infinite number.
 * @returns The interval, bound between `minimum` and `maximum`.
 */
export const clampTimeInterval = (
	start: number,
	end: number,
	minimum: number,
	maximum: number,
): [number, number] => {
	let clamped: [number, number];

	if (start < minimum) {
		const range = end - start;

		clamped = [minimum, minimum + range];
	} else if (end > maximum) {
		const range = end - start;

		clamped = [maximum - range, maximum];
	} else {
		clamped = [start, end];
	}

	return clamped;
};

export const clampTimeIntervalProperties = (
	start: number,
	end: number,
	minimum: number,
	maximum: number,
): [number, number] => {
	if (!Number.isFinite(start)) {
		throw new Error("timeStart must be a finite number.");
	}

	if (!Number.isFinite(end)) {
		throw new Error("timeEnd must be a finite number.");
	}

	return clampTimeInterval(start, end, minimum, maximum);
};
