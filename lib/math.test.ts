import { describe, expect, test } from "vitest";
import {
	IntervalExtremaError,
	NotANumberError,
	NotAPositionError,
	NotASizeError,
	NotAnIntervalError,
	PositionRangeError,
	SizeRangeError,
	clampInterval,
	clampMaxWins,
	clampMinWins,
	mean,
	parseFloatAttribute,
	parseIntervalAttribute,
	validateNumberInterval,
	validatePosition,
	validateSize,
	validateSizeInterval,
} from "./math.ts";
import { getError } from "./testUtils.ts";

describe("clampMinWins", () => {
	const testList: readonly (readonly [
		string,
		{
			min: number;
			max: number;
			value: number;
			expected: number;
		},
	])[] = [
		[
			"An infinite number before the range returns the minimum number of the range",
			{
				min: 1000,
				max: 2000,
				value: Number.NEGATIVE_INFINITY,
				expected: 1000,
			},
		],
		[
			"A number before the range returns the minimum number of the range",
			{
				min: 1000,
				max: 2000,
				value: 500,
				expected: 1000,
			},
		],
		[
			"A number at the start of the range returns the same number",
			{
				min: 1000,
				max: 2000,
				value: 1000,
				expected: 1000,
			},
		],
		[
			"A number in the range returns the same number",
			{
				min: 1000,
				max: 2000,
				value: 1500,
				expected: 1500,
			},
		],
		[
			"A number at the end of the range returns the same number",
			{
				min: 1000,
				max: 2000,
				value: 2000,
				expected: 2000,
			},
		],
		[
			"A number after the range returns the maximum number of the range",
			{
				min: 1000,
				max: 2000,
				value: 2500,
				expected: 2000,
			},
		],
		[
			"An infinite number after the range returns the maximum number of the range",
			{
				min: 1000,
				max: 2000,
				value: Number.POSITIVE_INFINITY,
				expected: 2000,
			},
		],
		[
			"A number outside an invalid range returns the minimum number of the range",
			{
				min: 2000,
				max: 1000,
				value: 0,
				expected: 2000,
			},
		],
	];

	test.each(testList)("%s", (_testTitle, testParams) => {
		const min = testParams.min;
		const max = testParams.max;
		const value = testParams.value;
		const expected = testParams.expected;

		expect(clampMinWins(value, min, max)).toEqual(expected);
	});
});

describe("clampMaxWins", () => {
	const testList: readonly (readonly [
		string,
		{
			min: number;
			max: number;
			value: number;
			expected: number;
		},
	])[] = [
		[
			"An infinite number before the range returns the minimum number of the range",
			{
				min: 1000,
				max: 2000,
				value: Number.NEGATIVE_INFINITY,
				expected: 1000,
			},
		],
		[
			"A number before the range returns the minimum number of the range",
			{
				min: 1000,
				max: 2000,
				value: 500,
				expected: 1000,
			},
		],
		[
			"A number at the start of the range returns the same number",
			{
				min: 1000,
				max: 2000,
				value: 1000,
				expected: 1000,
			},
		],
		[
			"A number in the range returns the same number",
			{
				min: 1000,
				max: 2000,
				value: 1500,
				expected: 1500,
			},
		],
		[
			"A number at the end of the range returns the same number",
			{
				min: 1000,
				max: 2000,
				value: 2000,
				expected: 2000,
			},
		],
		[
			"A number after the range returns the maximum number of the range",
			{
				min: 1000,
				max: 2000,
				value: 2500,
				expected: 2000,
			},
		],
		[
			"An infinite number after the range returns the maximum number of the range",
			{
				min: 1000,
				max: 2000,
				value: Number.POSITIVE_INFINITY,
				expected: 2000,
			},
		],
		[
			"A number outside an invalid range returns the minimum number of the range",
			{
				min: 2000,
				max: 1000,
				value: 3000,
				expected: 1000,
			},
		],
	];

	test.each(testList)("%s", (_testTitle, testParams) => {
		const min = testParams.min;
		const max = testParams.max;
		const value = testParams.value;
		const expected = testParams.expected;

		expect(clampMaxWins(value, min, max)).toEqual(expected);
	});
});

describe("clampInterval", () => {
	const testList: readonly (readonly [
		string,
		{
			min: number;
			max: number;
			intervalMin: number;
			intervalMax: number;
			expectedMin: number;
			expectedMax: number;
		},
	])[] = [
		[
			"An interval greater than the range returns the range",
			{
				min: 1000,
				max: 2000,
				intervalMin: 0,
				intervalMax: 4000,
				expectedMin: 1000,
				expectedMax: 2000,
			},
		],
		[
			"An interval before the range returns the interval at the minimum",
			{
				min: 1000,
				max: 2000,
				intervalMin: 0,
				intervalMax: 500,
				expectedMin: 1000,
				expectedMax: 1500,
			},
		],
		[
			"An interval containing the minimum returns the interval at the minimum",
			{
				min: 1000,
				max: 2000,
				intervalMin: 750,
				intervalMax: 1250,
				expectedMin: 1000,
				expectedMax: 1500,
			},
		],
		[
			"An interval at the minimum of the range returns the same interval",
			{
				min: 1000,
				max: 2000,
				intervalMin: 1000,
				intervalMax: 1500,
				expectedMin: 1000,
				expectedMax: 1500,
			},
		],
		[
			"An interval in the range returns the same interval",
			{
				min: 1000,
				max: 2000,
				intervalMin: 1250,
				intervalMax: 1750,
				expectedMin: 1250,
				expectedMax: 1750,
			},
		],
		[
			"An interval at the maximum of the range returns the same interval",
			{
				min: 1000,
				max: 2000,
				intervalMin: 1500,
				intervalMax: 2000,
				expectedMin: 1500,
				expectedMax: 2000,
			},
		],
		[
			"An interval containing the maximum returns the interval at the maximum",
			{
				min: 1000,
				max: 2000,
				intervalMin: 1750,
				intervalMax: 2250,
				expectedMin: 1500,
				expectedMax: 2000,
			},
		],
		[
			"An interval after the range returns the interval at the maximum",
			{
				min: 1000,
				max: 2000,
				intervalMin: 2500,
				intervalMax: 3000,
				expectedMin: 1500,
				expectedMax: 2000,
			},
		],
		[
			"An interval outside an invalid range returns the invalid range",
			{
				min: 2000,
				max: 1000,
				intervalMin: 1250,
				intervalMax: 1750,
				expectedMin: 2000,
				expectedMax: 1000,
			},
		],
	];

	test.each(testList)("%s", (_testTitle, testParams) => {
		const min = testParams.min;
		const max = testParams.max;
		const intervalMin = testParams.intervalMin;
		const intervalMax = testParams.intervalMax;
		const expectedMin = testParams.expectedMin;
		const expectedMax = testParams.expectedMax;

		expect(clampInterval(intervalMin, intervalMax, min, max)).toEqual([
			expectedMin,
			expectedMax,
		]);
	});
});

describe("mean", () => {
	test("Mean of zero numbers is 0", () => {
		expect(mean()).toEqual(0);
	});

	test("Mean of one number is itself", () => {
		expect(mean(5)).toEqual(5);
	});

	test("Mean of two or more numbers", () => {
		expect(mean(1, 11)).toEqual(6);
		expect(mean(3, 10, 11)).toEqual(8);
	});
});

describe("validateSize", () => {
	describe("Invalid types", () => {
		const testList: readonly (readonly [string, Readonly<unknown>])[] = [
			["Errors if undefined", undefined as unknown as () => void],
			["Errors if null", null as unknown as () => void],
			["Errors if an object", {}],
			["Errors if a boolean", true],
			["Errors if a big integer", BigInt(42)],
			["Errors if a string", "invalid"],
			["Errors if a symbol", Symbol()],
			["Errors if a function", () => undefined],
			["Errors if infinite", Number.NEGATIVE_INFINITY],
			["Errors if not a number", Number.NaN],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams;

			const receivedError = getError(() =>
				validateSize("test", value, 0, true, 10, false),
			);

			expect(receivedError).toEqual(new NotASizeError("test", value));
		});
	});

	describe("Invalid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				value: number;
				minimum: number;
				inclusiveMinimum: boolean;
				maximum: number;
				inclusiveMaximum: boolean;
			}>,
		])[] = [
			[
				"Errors if value is before the inclusive minimum",
				{
					value: 0,
					minimum: 100,
					inclusiveMinimum: true,
					maximum: 200,
					inclusiveMaximum: true,
				},
			],
			[
				"Errors if value is at the exclusive minimum",
				{
					value: 100,
					minimum: 100,
					inclusiveMinimum: false,
					maximum: 200,
					inclusiveMaximum: true,
				},
			],
			[
				"Errors if value is at the exclusive maximum",
				{
					value: 200,
					minimum: 100,
					inclusiveMinimum: true,
					maximum: 200,
					inclusiveMaximum: false,
				},
			],
			[
				"Errors if value is after the inclusive maximum",
				{
					value: 300,
					minimum: 100,
					inclusiveMinimum: true,
					maximum: 200,
					inclusiveMaximum: true,
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const minimum = testParams.minimum;
			const maximum = testParams.maximum;
			const inclusiveMinimum = testParams.inclusiveMinimum;
			const inclusiveMaximum = testParams.inclusiveMaximum;

			const receivedError = getError(() =>
				validateSize(
					"test",
					value,
					minimum,
					inclusiveMinimum,
					maximum,
					inclusiveMaximum,
				),
			);

			expect(receivedError).toEqual(
				new SizeRangeError(
					"test",
					value,
					minimum,
					inclusiveMinimum,
					maximum,
					inclusiveMaximum,
				),
			);
		});
	});

	describe("Valid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				value: number;
				minimum: number;
				inclusiveMinimum: boolean;
				maximum: number;
				inclusiveMaximum: boolean;
			}>,
		])[] = [
			[
				"Accepts if value is at the inclusive minimum",
				{
					value: 100,
					minimum: 100,
					inclusiveMinimum: true,
					maximum: 200,
					inclusiveMaximum: true,
				},
			],
			[
				"Accepts if value is after the exclusive minimum",
				{
					value: 100.0000000001,
					minimum: 100,
					inclusiveMinimum: false,
					maximum: 200,
					inclusiveMaximum: true,
				},
			],
			[
				"Accepts if value is before the exclusive maximum",
				{
					value: 199.9999999999,
					minimum: 100,
					inclusiveMinimum: true,
					maximum: 200,
					inclusiveMaximum: false,
				},
			],
			[
				"Accepts if value is at the inclusive maximum",
				{
					value: 200,
					minimum: 100,
					inclusiveMinimum: true,
					maximum: 200,
					inclusiveMaximum: true,
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const minimum = testParams.minimum;
			const maximum = testParams.maximum;
			const inclusiveMinimum = testParams.inclusiveMinimum;
			const inclusiveMaximum = testParams.inclusiveMaximum;

			validateSize(
				"test",
				value,
				minimum,
				inclusiveMinimum,
				maximum,
				inclusiveMaximum,
			);
		});
	});
});

describe("validatePosition", () => {
	describe("Invalid types", () => {
		const testList: readonly (readonly [string, Readonly<unknown>])[] = [
			["Errors if undefined", undefined as unknown as () => void],
			["Errors if null", null as unknown as () => void],
			["Errors if an object", {}],
			["Errors if a boolean", true],
			["Errors if a big integer", BigInt(42)],
			["Errors if a string", "invalid"],
			["Errors if a symbol", Symbol()],
			["Errors if a function", () => undefined],
			["Errors if infinite", Number.NEGATIVE_INFINITY],
			["Errors if not a number", Number.NaN],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams;

			const receivedError = getError(() =>
				validatePosition("test", value, 0, 10),
			);

			expect(receivedError).toEqual(new NotAPositionError("test", value));
		});
	});

	describe("Invalid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				value: number;
				minimum: number;
				maximum: number;
			}>,
		])[] = [
			[
				"Errors if value is before the inclusive minimum",
				{
					value: 0,
					minimum: 100,
					maximum: 200,
				},
			],
			[
				"Errors if value is after the inclusive maximum",
				{
					value: 300,
					minimum: 100,
					maximum: 200,
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const minimum = testParams.minimum;
			const maximum = testParams.maximum;

			const receivedError = getError(() =>
				validatePosition("test", value, minimum, maximum),
			);

			expect(receivedError).toEqual(
				new PositionRangeError("test", value, minimum, maximum),
			);
		});
	});

	describe("Valid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				value: number;
				minimum: number;
				maximum: number;
			}>,
		])[] = [
			[
				"Accepts if value is at the inclusive minimum",
				{
					value: 100,
					minimum: 100,
					maximum: 200,
				},
			],
			[
				"Accepts if value is between the inclusive minimum and maximum",
				{
					value: 100.0000000001,
					minimum: 100,
					maximum: 200,
				},
			],
			[
				"Accepts if value is at the inclusive maximum",
				{
					value: 200,
					minimum: 100,
					maximum: 200,
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const minimum = testParams.minimum;
			const maximum = testParams.maximum;

			validatePosition("test", value, minimum, maximum);
		});
	});
});

describe("validateNumberInterval", () => {
	describe("Invalid values", () => {
		const symbol = Symbol();
		const fn = () => undefined;

		const testList: readonly (readonly [
			string,
			{
				error: Error;
				interval: Readonly<[unknown, unknown]>;
			},
		])[] = [
			[
				"Errors if min is undefined",
				{
					interval: [undefined as unknown as () => void, 10],
					error: new NotANumberError("min", undefined),
				},
			],
			[
				"Errors if min is null",
				{
					interval: [null as unknown as () => void, 10],
					error: new NotANumberError("min", null),
				},
			],
			[
				"Errors if min is an object",
				{ interval: [{}, 10], error: new NotANumberError("min", {}) },
			],
			[
				"Errors if min is a boolean",
				{ interval: [true, 10], error: new NotANumberError("min", true) },
			],
			[
				"Errors if min is a big integer",
				{
					interval: [BigInt(42), 10],
					error: new NotANumberError("min", BigInt(42)),
				},
			],
			[
				"Errors if min is a string",
				{
					interval: ["invalid", 10],
					error: new NotANumberError("min", "invalid"),
				},
			],
			[
				"Errors if min is a symbol",
				(() => {
					const symbol = Symbol();

					return {
						interval: [symbol, 10],
						error: new NotANumberError("min", symbol),
					};
				})(),
			],
			[
				"Errors if min is a function",
				(() => {
					const fn = () => undefined;

					return {
						interval: [fn, 10],
						error: new NotANumberError("min", fn),
					};
				})(),
			],
			[
				"Errors if min is infinite",
				{
					interval: [Number.NEGATIVE_INFINITY, 10],
					error: new NotANumberError("min", Number.NEGATIVE_INFINITY),
				},
			],
			[
				"Errors if min is not a number",
				{
					interval: [Number.NaN, 10],
					error: new NotANumberError("min", Number.NaN),
				},
			],
			[
				"Errors if max is undefined",
				{
					interval: [0, undefined as unknown as () => void],
					error: new NotANumberError("max", undefined),
				},
			],
			[
				"Errors if max is null",
				{
					interval: [0, null as unknown as () => void],
					error: new NotANumberError("max", null),
				},
			],
			[
				"Errors if max is an object",
				{ interval: [0, {}], error: new NotANumberError("max", {}) },
			],
			[
				"Errors if max is a boolean",
				{ interval: [0, true], error: new NotANumberError("max", true) },
			],
			[
				"Errors if max is a big integer",
				{
					interval: [0, BigInt(42)],
					error: new NotANumberError("max", BigInt(42)),
				},
			],
			[
				"Errors if max is a string",
				{
					interval: [0, "invalid"],
					error: new NotANumberError("max", "invalid"),
				},
			],
			[
				"Errors if max is a symbol",
				{
					interval: [0, symbol],
					error: new NotANumberError("max", symbol),
				},
			],
			[
				"Errors if max is a function",
				{ interval: [0, fn], error: new NotANumberError("max", fn) },
			],
			[
				"Errors if max is infinite",
				{
					interval: [0, Number.NEGATIVE_INFINITY],
					error: new NotANumberError("max", Number.NEGATIVE_INFINITY),
				},
			],
			[
				"Errors if max is not a number",
				{
					interval: [0, Number.NaN],
					error: new NotANumberError("max", Number.NaN),
				},
			],
			[
				"Errors if min is equal to max",
				{
					interval: [0, 0],
					error: new IntervalExtremaError("extrema", 0, 0),
				},
			],
			[
				"Errors if min is greater than to max",
				{
					interval: [10, 0],
					error: new IntervalExtremaError("extrema", 10, 0),
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const error = testParams.error;
			const interval = testParams.interval;

			const receivedError = getError(() =>
				validateNumberInterval("min", "max", "extrema", interval),
			);

			expect(receivedError).toEqual(error);
		});
	});

	describe("Valid values", () => {
		const testList: readonly (readonly [string, readonly [number, number]])[] =
			[
				["Accepts an interval", [0, 100]],
				["Accepts a tiny interval", [0, Number.MIN_VALUE]],
				["Accepts a negative", [-10, 10]],
			];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const interval = testParams;

			validateNumberInterval("min", "max", "extrema", interval);
		});
	});
});

describe("validateSizeInterval", () => {
	describe("Invalid values", () => {
		const symbol = Symbol();
		const fn = () => undefined;

		const testList: readonly (readonly [
			string,
			{
				error: Error;
				interval: Readonly<[unknown, unknown]>;
			},
		])[] = [
			[
				"Errors if min is undefined",
				{
					interval: [undefined as unknown as () => void, 10],
					error: new NotASizeError("min", undefined),
				},
			],
			[
				"Errors if min is null",
				{
					interval: [null as unknown as () => void, 10],
					error: new NotASizeError("min", null),
				},
			],
			[
				"Errors if min is an object",
				{ interval: [{}, 10], error: new NotASizeError("min", {}) },
			],
			[
				"Errors if min is a boolean",
				{ interval: [true, 10], error: new NotASizeError("min", true) },
			],
			[
				"Errors if min is a big integer",
				{
					interval: [BigInt(42), 10],
					error: new NotASizeError("min", BigInt(42)),
				},
			],
			[
				"Errors if min is a string",
				{
					interval: ["invalid", 10],
					error: new NotASizeError("min", "invalid"),
				},
			],
			[
				"Errors if min is a symbol",
				(() => {
					const symbol = Symbol();

					return {
						interval: [symbol, 10],
						error: new NotASizeError("min", symbol),
					};
				})(),
			],
			[
				"Errors if min is a function",
				(() => {
					const fn = () => undefined;

					return {
						interval: [fn, 10],
						error: new NotASizeError("min", fn),
					};
				})(),
			],
			[
				"Errors if min is infinite",
				{
					interval: [Number.NEGATIVE_INFINITY, 10],
					error: new NotASizeError("min", Number.NEGATIVE_INFINITY),
				},
			],
			[
				"Errors if min is not a number",
				{
					interval: [Number.NaN, 10],
					error: new NotASizeError("min", Number.NaN),
				},
			],
			[
				"Errors if min is negative",
				{
					interval: [-Number.MIN_VALUE, 10],
					error: new SizeRangeError(
						"min",
						-Number.MIN_VALUE,
						0,
						true,
						Number.MAX_VALUE,
						true,
					),
				},
			],
			[
				"Errors if max is undefined",
				{
					interval: [0, undefined as unknown as () => void],
					error: new NotASizeError("max", undefined),
				},
			],
			[
				"Errors if max is null",
				{
					interval: [0, null as unknown as () => void],
					error: new NotASizeError("max", null),
				},
			],
			[
				"Errors if max is an object",
				{ interval: [0, {}], error: new NotASizeError("max", {}) },
			],
			[
				"Errors if max is a boolean",
				{ interval: [0, true], error: new NotASizeError("max", true) },
			],
			[
				"Errors if max is a big integer",
				{
					interval: [0, BigInt(42)],
					error: new NotASizeError("max", BigInt(42)),
				},
			],
			[
				"Errors if max is a string",
				{
					interval: [0, "invalid"],
					error: new NotASizeError("max", "invalid"),
				},
			],
			[
				"Errors if max is a symbol",
				{
					interval: [0, symbol],
					error: new NotASizeError("max", symbol),
				},
			],
			[
				"Errors if max is a function",
				{ interval: [0, fn], error: new NotASizeError("max", fn) },
			],
			[
				"Errors if max is infinite",
				{
					interval: [0, Number.NEGATIVE_INFINITY],
					error: new NotASizeError("max", Number.NEGATIVE_INFINITY),
				},
			],
			[
				"Errors if max is not a number",
				{
					interval: [0, Number.NaN],
					error: new NotASizeError("max", Number.NaN),
				},
			],
			[
				"Errors if max is negative",
				{
					interval: [0, -Number.MIN_VALUE],
					error: new SizeRangeError(
						"max",
						-Number.MIN_VALUE,
						0,
						true,
						Number.MAX_VALUE,
						true,
					),
				},
			],
			[
				"Errors if min is greater than to max",
				{
					interval: [10, 0],
					error: new IntervalExtremaError("extrema", 10, 0),
				},
			],
		];

		// NEGATIVE TEST

		test.each(testList)("%s", (_testTitle, testParams) => {
			const error = testParams.error;
			const interval = testParams.interval;

			const receivedError = getError(() =>
				validateSizeInterval("min", "max", "extrema", interval),
			);

			expect(receivedError).toEqual(error);
		});
	});

	describe("Valid values", () => {
		const testList: readonly (readonly [string, readonly [number, number]])[] =
			[
				["Accepts an interval", [0, 100]],
				["Accepts a unit interval", [0, 0]],
				["Accepts a tiny interval", [0, Number.MIN_VALUE]],
			];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const interval = testParams;

			validateSizeInterval("min", "max", "extrema", interval);
		});
	});
});

test("parseIntegerAttribute", () => {
	expect(parseFloatAttribute(null)).toEqual(undefined);
	expect(parseFloatAttribute("")).toEqual(Number.NaN);
	expect(parseFloatAttribute("0.12")).toEqual(0.12);
	expect(parseFloatAttribute("123")).toEqual(123);
});

describe("parseIntervalAttribute", () => {
	test("Invalid values", () => {
		const receivedError = getError(() => parseIntervalAttribute("test", "abc"));

		expect(receivedError).toEqual(new NotAnIntervalError("test", "abc"));
	});

	test("Valid values", () => {
		expect(parseIntervalAttribute("test", null)).toEqual([
			undefined,
			undefined,
		]);
		expect(parseIntervalAttribute("test", "123,345")).toEqual([123, 345]);
		expect(parseIntervalAttribute("test", "123.45,345.67")).toEqual([
			123.45, 345.67,
		]);
		expect(parseIntervalAttribute("test", "invalid,345")).toEqual([
			Number.NaN,
			345,
		]);
		expect(parseIntervalAttribute("test", "123,invalid")).toEqual([
			123,
			Number.NaN,
		]);
		expect(parseIntervalAttribute("test", "invalid,invalid")).toEqual([
			Number.NaN,
			Number.NaN,
		]);
	});
});
