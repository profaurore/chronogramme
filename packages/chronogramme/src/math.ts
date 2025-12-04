type OptionalInterval = [
	minimum: number | undefined,
	maximum: number | undefined,
];

const PARSE_INTERVAL_NUM_PARTS = 2;

function isNumber(value: unknown): value is number {
	return typeof value === "number";
}

function validateNumber(
	valueName: string,
	value: unknown,
): asserts value is number {
	if (!(isNumber(value) && Number.isFinite(value))) {
		throw new NotANumberError(valueName, value);
	}
}

export type Interval = [minimum: number, maximum: number];

export type IntervalString = `${number},${number}`;

/** Math */
export const ZERO = 0;

/** Unit value. */
export const UNIT = 1;

/** Half value. */
export const HALF = 0.5;

/** Double value. */
export const DOUBLE = 2;

export const MOST_SIGNIFICANT_BIT = 31;

/**
 * Clamps a value between two values.
 *
 * - If the value is less than the minimum, the minimum is returned.
 * - If the value is more than the maximum, the maximum is returned.
 * - Otherwise, the value is returned.
 *
 * If the maximum value is less than the minimum value, the minimum value is
 * returned.
 *
 * @param value The value to be clamped. Must be a finite or infinite number.
 * @param minimum The minimum value. Must be a finite or infinite number.
 * @param maximum The maximum value. Must be a finite or infinite number.
 * @returns The clamped value.
 */
export function clampMinWins(
	value: number,
	minimum: number,
	maximum: number,
): number {
	let clamped: number;

	if (value <= minimum) {
		clamped = minimum;
	} else if (value >= maximum) {
		clamped = maximum;
	} else {
		clamped = value;
	}

	return clamped;
}

/**
 * Clamps a value between two values.
 *
 * - If the value is less than the minimum, the minimum is returned.
 * - If the value is more than the maximum, the maximum is returned.
 * - Otherwise, the value is returned.
 *
 * If the maximum value is less than the minimum value, the maximum value is
 * returned.
 *
 * @param value The value to be clamped. Must be a finite or infinite number.
 * @param minimum The minimum value. Must be a finite or infinite number.
 * @param maximum The maximum value. Must be a finite or infinite number.
 * @returns The clamped value.
 */
export function clampMaxWins(
	value: number,
	minimum: number,
	maximum: number,
): number {
	let clamped: number;

	if (value >= maximum) {
		clamped = maximum;
	} else if (value <= minimum) {
		clamped = minimum;
	} else {
		clamped = value;
	}

	return clamped;
}

/**
 * Clamps an interval between two values.
 *
 * - If the range of the interval is greater than the range of the extrema for
 *   clamping, the interval is `[minimum, maximum]`.
 * - If the minimum of the interval is less than `minimum`, the minimum of the
 *   interval is `minimum` and the interval range is preserved.
 * - If the maximum of the interval is greater than `maximum`, the maximum of
 *   the interval is `maximum` and the interval range is preserved.
 *
 * @param intervalMin The minimum of the interval. Must be a finite number.
 * @param intervalMax The maximum of the interval. Must be a finite number
 *   greater than `intervalMin`.
 * @param minimum The minimum value. Must be a finite or infinite number.
 * @param maximum The maximum value. Must be a finite or infinite number.
 * @returns The interval, bound between `minimum` and `maximum`.
 */
export function clampInterval(
	intervalMin: number,
	intervalMax: number,
	minimum: number,
	maximum: number,
): [number, number] {
	const intervalRange = intervalMax - intervalMin;
	const clampRange = maximum - minimum;

	let clamped: [number, number];

	if (intervalRange >= clampRange) {
		clamped = [minimum, maximum];
	} else if (intervalMin < minimum) {
		clamped = [minimum, minimum + intervalRange];
	} else if (intervalMax > maximum) {
		clamped = [maximum - intervalRange, maximum];
	} else {
		clamped = [intervalMin, intervalMax];
	}

	return clamped;
}

/**
 * Compute the mean of an array of numbers.
 *
 * @param values Array of numbers. Must be a finite number.
 * @returns Mean of the values.
 */
export function mean(...values: readonly number[]): number {
	const ratio = UNIT / values.length;

	let result = ZERO;
	for (const value of values) {
		result += ratio * value;
	}

	return result;
}

export class NotASizeError extends Error {
	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(valueName: string, value: unknown) {
		super(`Size is not a finite number. Given: ${String(value)}.`);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
	}
}

export class SizeRangeError extends Error {
	public readonly inclusiveMaximum: boolean;

	public readonly inclusiveMinimum: boolean;

	public readonly maximum: number;

	public readonly minimum: number;

	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(
		valueName: string,
		value: number,
		minimum: number,
		inclusiveMinimum: boolean,
		maximum: number,
		inclusiveMaximum: boolean,
	) {
		super(
			`Size is outside the valid range. Expected: ${minimum} ${inclusiveMinimum ? "≤" : "<"} x ${inclusiveMaximum ? "≤" : "<"} ${maximum}; Given: ${value}.`,
		);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
		this.minimum = minimum;
		this.inclusiveMinimum = inclusiveMinimum;
		this.maximum = maximum;
		this.inclusiveMaximum = inclusiveMaximum;
	}
}

export class NotAPositionError extends Error {
	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(valueName: string, value: unknown) {
		super(`Position is not a finite number. Given: ${String(value)}.`);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
	}
}

export class PositionRangeError extends Error {
	public readonly maximum: number;

	public readonly minimum: number;

	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(
		valueName: string,
		value: number,
		minimum: number,
		maximum: number,
	) {
		super(
			`Position is outside the valid range. Expected: ${minimum} < x < ${maximum}; Given: ${value}.`,
		);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
		this.minimum = minimum;
		this.maximum = maximum;
	}
}

export class NotANumberError extends Error {
	public readonly value: unknown;

	public readonly valueName: string;

	public constructor(valueName: string, value: unknown) {
		super(`Value is not a finite number. Given: ${String(value)}.`);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
	}
}

export const validateSize: (
	valueName: string,
	value: unknown,
	minimum: number,
	inclusiveMinimum: boolean,
	maximum: number,
	inclusiveMaximum: boolean,
) => asserts value is number = (
	valueName: string,
	value: unknown,
	minimum: number,
	inclusiveMinimum: boolean,
	maximum: number,
	inclusiveMaximum: boolean,
): asserts value is number => {
	if (!(isNumber(value) && Number.isFinite(value))) {
		throw new NotASizeError(valueName, value);
	}

	if (
		(inclusiveMinimum && value < minimum) ||
		(!inclusiveMinimum && value <= minimum) ||
		(inclusiveMaximum && value > maximum) ||
		(!inclusiveMaximum && value >= maximum)
	) {
		throw new SizeRangeError(
			valueName,
			value,
			minimum,
			inclusiveMinimum,
			maximum,
			inclusiveMaximum,
		);
	}
};

export function validatePosition(
	valueName: string,
	value: unknown,
	minimum: number,
	maximum: number,
): asserts value is number {
	if (!(isNumber(value) && Number.isFinite(value))) {
		throw new NotAPositionError(valueName, value);
	}

	if (value < minimum || value > maximum) {
		throw new PositionRangeError(valueName, value, minimum, maximum);
	}
}

export class IntervalExtremaError extends Error {
	public readonly maximum: unknown;

	public readonly minimum: unknown;

	public readonly valueName: string;

	public constructor(valueName: string, minimum: number, maximum: number) {
		super(
			`Interval minimum must be less than maximum. Given: ${minimum}–${maximum}.`,
		);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.minimum = minimum;
		this.maximum = maximum;
	}
}

export const validateNumberInterval: (
	minName: string,
	maxName: string,
	extremaName: string,
	interval: readonly [unknown, unknown],
) => asserts interval is Interval = (
	minName: string,
	maxName: string,
	extremaName: string,
	interval: readonly [unknown, unknown],
): asserts interval is Interval => {
	const [intervalMin, intervalMax] = interval;

	validateNumber(minName, intervalMin);
	validateNumber(maxName, intervalMax);

	if (intervalMin >= intervalMax) {
		throw new IntervalExtremaError(extremaName, intervalMin, intervalMax);
	}
};

export const validateSizeInterval: (
	minName: string,
	maxName: string,
	extremaName: string,
	interval: readonly [unknown, unknown],
) => asserts interval is Interval = (
	minName: string,
	maxName: string,
	extremaName: string,
	interval: readonly [unknown, unknown],
): asserts interval is Interval => {
	const [intervalMin, intervalMax] = interval;

	validateSize(minName, intervalMin, ZERO, true, Number.MAX_VALUE, true);
	validateSize(maxName, intervalMax, ZERO, true, Number.MAX_VALUE, true);

	if (intervalMin > intervalMax) {
		throw new IntervalExtremaError(extremaName, intervalMin, intervalMax);
	}
};

// parses, but does not validate
export function parseFloatAttribute(value: string | null): number | undefined {
	return value === null ? undefined : Number.parseFloat(value);
}

export class NotAnIntervalError extends Error {
	public readonly value: string | null;

	public readonly valueName: string;

	public constructor(valueName: string, value: string | null) {
		super(
			`Value is not an interval formatted as "[minimum],[maximum]". Given: ${String(value)}.`,
		);
		this.name = this.constructor.name;
		this.valueName = valueName;
		this.value = value;
	}
}

export function parseIntervalAttribute(
	name: string,
	value: string | null,
): OptionalInterval {
	if (value === null) {
		return [undefined, undefined];
	}

	const [parsedStart, parsedEnd] = value
		.split(",", PARSE_INTERVAL_NUM_PARTS)
		.map((part) => Number.parseFloat(part));

	if (parsedStart === undefined || parsedEnd === undefined) {
		throw new NotAnIntervalError(name, value);
	}

	return [parsedStart, parsedEnd];
}
