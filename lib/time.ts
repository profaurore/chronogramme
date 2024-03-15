import { type Interval, clampMinWins } from "./math.ts";

type TimeInterval = Interval;

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

const daysInWeek = 7;

// update to only the default case?
export const getTimeInterval = (start?: number, end?: number): TimeInterval => {
	if (start !== undefined && end !== undefined && end > start) {
		return [start, end];
	} else if (start !== undefined || end === undefined) {
		const startDate = new Date(start ?? Date.now());

		return [
			startDate.getTime(),
			Math.min(startDate.setDate(startDate.getDate() + daysInWeek), TIME_MAX),
		];
	}

	const endDate = new Date(end);

	return [
		Math.max(endDate.setDate(endDate.getDate() - daysInWeek), TIME_MIN),
		end,
	];
};

// parses, but does not validate
export const parseTimeInterval = (
	name: string,
	value: string,
): TimeInterval => {
	const numParts = 2;
	const decimal = 10;

	const [parsedStart, parsedEnd] = value
		.split(",", numParts)
		.map((value) => parseInt(value, decimal));

	if (parsedStart === undefined || parsedEnd === undefined) {
		throw new TypeError(`${name} must be formatted as "[minimum],[maximum]".`);
	}

	return [parsedStart, parsedEnd];
};
