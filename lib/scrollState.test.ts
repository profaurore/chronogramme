import { describe, expect, test } from "vitest";
import {
	HALF,
	IntervalExtremaError,
	NotANumberError,
	NotAPositionError,
	NotASizeError,
	PositionRangeError,
	SizeRangeError,
	ZERO,
} from "./math.ts";
import {
	MissingPropertyError,
	NotAnObjectError,
	UnknownPropertyError,
} from "./object.ts";
import { DEFAULT_MAX_ELEMENT_SIZE, ScrollState } from "./scrollState.ts";
import { getError } from "./testUtils.ts";
import { TIME_MAX, TIME_MIN } from "./time.ts";

type ScrollStateParameters = ConstructorParameters<typeof ScrollState>[0];

describe("TimelineScroll", () => {
	describe("Constructor", () => {
		describe("Input Validation", () => {
			const testGroups: readonly (readonly [
				string,
				readonly (readonly [
					string,
					Readonly<{
						error: Readonly<Error> | null;
						parameters: ScrollStateParameters;
					}>,
				])[],
			])[] = [
				[
					"Parameters",
					[
						[
							"Errors if undefined",
							{
								error: new NotAnObjectError("parameters", undefined),
								parameters: undefined as unknown as ScrollStateParameters,
							},
						],

						[
							"Errors if not an object",
							{
								error: new NotAnObjectError("parameters", 123),
								parameters: 123 as unknown as ScrollStateParameters,
							},
						],

						[
							"Contains an unknown key",
							{
								error: new UnknownPropertyError(
									"parameters",
									{
										max: 1,
										min: 0,
										windowMax: 0,
										windowMin: 0,
										windowSize: 100,
										incorrectKey: true,
									},
									"incorrectKey",
								),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 0,
									windowMin: 0,
									windowSize: 100,
									...({ incorrectKey: true } as unknown as Record<
										string,
										never
									>),
								},
							},
						],
					],
				],

				[
					"windowSize",
					[
						[
							"Errors if undefined",
							{
								error: new MissingPropertyError(
									"parameters",
									{ max: 1, min: 0, windowMax: 1, windowMin: 0 },
									"windowSize",
								),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									...({} as Pick<ScrollStateParameters, "windowSize">),
								},
							},
						],

						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("windowSize", "test"),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize:
										"test" as unknown as ScrollStateParameters["windowSize"],
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("windowSize", Number.NaN),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: Number.NaN,
								},
							},
						],

						[
							"Errors if negative",
							{
								error: new SizeRangeError(
									"windowSize",
									-1,
									ZERO,
									true,
									DEFAULT_MAX_ELEMENT_SIZE,
									true,
								),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: -1,
								},
							},
						],

						[
							"Errors if less zero",
							{
								error: new SizeRangeError(
									"windowSize",
									-Number.MIN_VALUE,
									0,
									true,
									DEFAULT_MAX_ELEMENT_SIZE,
									true,
								),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: -Number.MIN_VALUE,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError(
									"windowSize",
									Number.POSITIVE_INFINITY,
								),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: Number.POSITIVE_INFINITY,
								},
							},
						],

						[
							"Errors if greater than maximum element size",
							{
								error: new SizeRangeError(
									"windowSize",
									200,
									ZERO,
									true,
									100,
									true,
								),
								parameters: {
									max: 1,
									maxElementSize: 100,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 200,
								},
							},
						],

						[
							"Accepts zero",
							{
								error: null,
								parameters: {
									max: 1,
									maxElementSize: 100,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 0,
								},
							},
						],

						[
							"Accepts maximum element size",
							{
								error: null,
								parameters: {
									max: 1,
									maxElementSize: 100,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],
					],
				],

				[
					"min",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotANumberError("min", "test"),
								parameters: {
									max: 1,
									min: "test" as unknown as ScrollStateParameters["min"],
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotANumberError("min", Number.NaN),
								parameters: {
									max: 1,
									min: Number.NaN,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if negative infinity",
							{
								error: new NotANumberError("min", Number.NEGATIVE_INFINITY),
								parameters: {
									max: 1,
									min: Number.NEGATIVE_INFINITY,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if positive infinity",
							{
								error: new NotANumberError("min", Number.POSITIVE_INFINITY),
								parameters: {
									max: 1,
									min: Number.POSITIVE_INFINITY,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									max: 1,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts the minimum time",
							{
								error: null,
								parameters: {
									max: 1,
									maxElementSize: 100,
									min: TIME_MIN,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts the maximum number before maximum time",
							{
								error: null,
								parameters: {
									max: 1,
									maxElementSize: 100,
									min: 1 - Number.EPSILON,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],
					],
				],

				[
					"max",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotANumberError("max", "test"),
								parameters: {
									max: "test" as unknown as ScrollStateParameters["max"],
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotANumberError("max", Number.NaN),
								parameters: {
									max: Number.NaN,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if negative infinity",
							{
								error: new NotANumberError("max", Number.NEGATIVE_INFINITY),
								parameters: {
									max: Number.NEGATIVE_INFINITY,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if positive infinity",
							{
								error: new NotANumberError("max", Number.POSITIVE_INFINITY),
								parameters: {
									max: Number.POSITIVE_INFINITY,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts the minimum number after minimum time",
							{
								error: null,
								parameters: {
									max: Number.MIN_VALUE,
									maxElementSize: 100,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts the maximum time",
							{
								error: null,
								parameters: {
									max: TIME_MAX,
									maxElementSize: 100,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],
					],
				],

				[
					"range",
					[
						[
							"Time min is equal to time max",
							{
								error: new IntervalExtremaError("extrema", 0, 0),
								parameters: {
									max: 0,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Time min is greater than time max",
							{
								error: new IntervalExtremaError("extrema", 1, 0),
								parameters: {
									max: 0,
									min: 1,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],
					],
				],

				[
					"windowMin",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotANumberError("windowMin", "test"),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin:
										"test" as unknown as ScrollStateParameters["windowMin"],
									windowSize: 100,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotANumberError("windowMin", Number.NaN),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: Number.NaN,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if negative infinity",
							{
								error: new NotANumberError(
									"windowMin",
									Number.NEGATIVE_INFINITY,
								),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: Number.NEGATIVE_INFINITY,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if positive infinity",
							{
								error: new NotANumberError(
									"windowMin",
									Number.POSITIVE_INFINITY,
								),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: Number.POSITIVE_INFINITY,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts the minimum time",
							{
								error: null,
								parameters: {
									max: 1,
									maxElementSize: 100,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts the maximum time before the end time",
							{
								error: null,
								parameters: {
									max: 1,
									maxElementSize: 100,
									min: 0,
									windowMax: 1,
									windowMin: 1 - Number.EPSILON,
									windowSize: 100,
								},
							},
						],
					],
				],

				[
					"windowMax",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotANumberError("windowMax", "test"),
								parameters: {
									max: 1,
									min: 0,
									windowMax:
										"test" as unknown as ScrollStateParameters["windowMax"],
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotANumberError("windowMax", Number.NaN),
								parameters: {
									max: 1,
									min: 0,
									windowMax: Number.NaN,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if negative infinity",
							{
								error: new NotANumberError(
									"windowMax",
									Number.NEGATIVE_INFINITY,
								),
								parameters: {
									max: 1,
									min: 0,
									windowMax: Number.NEGATIVE_INFINITY,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if positive infinity",
							{
								error: new NotANumberError(
									"windowMax",
									Number.POSITIVE_INFINITY,
								),
								parameters: {
									max: 1,
									min: 0,
									windowMax: Number.POSITIVE_INFINITY,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									max: 1,
									min: 0,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts the minimum time after the start time",
							{
								error: null,
								parameters: {
									max: 1,
									maxElementSize: 100,
									min: 0,
									windowMax: Number.MIN_VALUE,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts the maximum time",
							{
								error: null,
								parameters: {
									max: 1,
									maxElementSize: 100,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],
					],
				],

				[
					"windowRange",
					[
						[
							"Time start is equal to time end",
							{
								error: new IntervalExtremaError("windowExtrema", 0, 0),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 0,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Time start is greater than time end",
							{
								error: new IntervalExtremaError("windowExtrema", 1, 0),
								parameters: {
									max: 1,
									min: 0,
									windowMax: 0,
									windowMin: 1,
									windowSize: 100,
								},
							},
						],
					],
				],

				[
					"maxElementSize",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("maxElementSize", "test"),
								parameters: {
									max: 1,
									maxElementSize:
										"test" as unknown as ScrollStateParameters["maxElementSize"],
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("maxElementSize", Number.NaN),
								parameters: {
									max: 1,
									maxElementSize: Number.NaN,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if negative",
							{
								error: new SizeRangeError(
									"maxElementSize",
									-1,
									ZERO,
									false,
									Number.MAX_VALUE,
									true,
								),
								parameters: {
									max: 1,
									maxElementSize: -1,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if zero",
							{
								error: new SizeRangeError(
									"maxElementSize",
									0,
									ZERO,
									false,
									Number.MAX_VALUE,
									true,
								),
								parameters: {
									max: 1,
									maxElementSize: 0,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError(
									"maxElementSize",
									Number.POSITIVE_INFINITY,
								),
								parameters: {
									max: 1,
									maxElementSize: Number.POSITIVE_INFINITY,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: Number.MIN_VALUE,
								},
							},
						],

						[
							"Accepts the minimum non-zero size",
							{
								error: null,
								parameters: {
									max: 1,
									maxElementSize: Number.MIN_VALUE,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: Number.MIN_VALUE,
								},
							},
						],

						[
							"Accepts the maximum number",
							{
								error: null,
								parameters: {
									max: 1,
									maxElementSize: Number.MAX_VALUE,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],
					],
				],

				[
					"resyncThresholdSize",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("resyncThresholdSize", "test"),
								parameters: {
									max: 1,
									min: 0,
									resyncThresholdSize:
										"test" as unknown as ScrollStateParameters["resyncThresholdSize"],
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("resyncThresholdSize", Number.NaN),
								parameters: {
									max: 1,
									min: 0,
									resyncThresholdSize: Number.NaN,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if negative",
							{
								error: new SizeRangeError(
									"resyncThresholdSize",
									-1,
									ZERO,
									false,
									HALF * Number.MAX_VALUE,
									true,
								),
								parameters: {
									max: 1,
									min: 0,
									resyncThresholdSize: -1,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if zero",
							{
								error: new SizeRangeError(
									"resyncThresholdSize",
									0,
									ZERO,
									false,
									HALF * Number.MAX_VALUE,
									true,
								),
								parameters: {
									max: 1,
									min: 0,
									resyncThresholdSize: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError(
									"resyncThresholdSize",
									Number.POSITIVE_INFINITY,
								),
								parameters: {
									max: 1,
									min: 0,
									resyncThresholdSize: Number.POSITIVE_INFINITY,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									max: 1,
									min: 0,
									windowMax: 1,
									windowMin: 0,
									windowSize: Number.MIN_VALUE,
								},
							},
						],

						[
							"Accepts the minimum non-zero size",
							{
								error: null,
								parameters: {
									max: 1,
									min: 0,
									resyncThresholdSize: Number.MIN_VALUE,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],

						[
							"Accepts the maximum number",
							{
								error: null,
								parameters: {
									max: 1,
									min: 0,
									resyncThresholdSize: HALF * Number.MAX_VALUE,
									windowMax: 1,
									windowMin: 0,
									windowSize: 100,
								},
							},
						],
					],
				],
			];

			describe.each(testGroups)("%s", (_groupTitle, testList) => {
				test.each(testList)("%s", (_testTitle, testParams) => {
					const error = testParams.error;
					const parameters = testParams.parameters;

					const receivedError = getError(() => new ScrollState(parameters));

					if (error) {
						expect(receivedError).toBeInstanceOf(Error);
						expect({ ...(receivedError as Record<string, unknown>) }).toEqual({
							...error,
						});
					} else {
						expect(receivedError).toBeUndefined();
					}
				});
			});
		});

		describe("Result", () => {
			const testGroups: readonly (readonly [
				string,
				readonly (readonly [
					string,
					Readonly<{
						expected: Readonly<{
							scrollPos: number;
							scrollSize: number;
							size: number;
							windowMax?: number;
							windowMin?: number;
						}>;
						parameters: ScrollStateParameters;
					}>,
				])[],
			])[] = [
				[
					"No Scroll",
					[
						[
							"Window before minimum time",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 10,
									size: 10,
									windowMax: 25,
									windowMin: 5,
								},
								parameters: {
									max: 25,
									min: 5,
									windowMax: -5,
									windowMin: -25,
									windowSize: 10,
								},
							},
						],

						[
							"Window around minimum time",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 10,
									size: 10,
									windowMax: 25,
									windowMin: 5,
								},
								parameters: {
									max: 25,
									min: 5,
									windowMax: 15,
									windowMin: -5,
									windowSize: 10,
								},
							},
						],

						[
							"Maximum times",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 1000,
									size: 1000,
								},
								parameters: {
									max: TIME_MAX,
									min: TIME_MIN,
									windowMax: TIME_MAX,
									windowMin: TIME_MIN,
									windowSize: 1000,
								},
							},
						],

						[
							"Integer times",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 10,
									size: 10,
								},
								parameters: {
									max: 25,
									min: 5,
									windowMax: 25,
									windowMin: 5,
									windowSize: 10,
								},
							},
						],

						[
							"Window around maximum time",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 10,
									size: 10,
									windowMax: 25,
									windowMin: 5,
								},
								parameters: {
									max: 25,
									min: 5,
									windowMax: 35,
									windowMin: 15,
									windowSize: 10,
								},
							},
						],

						[
							"Window before maximum time",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 10,
									size: 10,
									windowMax: 25,
									windowMin: 5,
								},
								parameters: {
									max: 25,
									min: 5,
									windowMax: 55,
									windowMin: 35,
									windowSize: 10,
								},
							},
						],
					],
				],
				[
					"Static Scroll",
					[
						[
							"Window before minimum time",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 12,
									size: 12,
									windowMax: 15,
									windowMin: 5,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: -5,
									windowMin: -15,
									windowSize: 5,
								},
							},
						],

						[
							"Window around minimum time",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 12,
									size: 12,
									windowMax: 15,
									windowMin: 5,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 10,
									windowMin: 0,
									windowSize: 5,
								},
							},
						],

						[
							"Window at minimum with whole pixels to maximum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 12,
									size: 12,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 15,
									windowMin: 5,
									windowSize: 5,
								},
							},
						],

						[
							"Window at minimum with partial pixels to maximum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 13,
									size: 12.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 15,
									windowMin: 5,
									windowSize: 5,
								},
							},
						],

						[
							"Window in middle with whole pixels to minimum and maximum",
							{
								expected: {
									scrollPos: 2,
									scrollSize: 12,
									size: 12,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 19,
									windowMin: 9,
									windowSize: 5,
								},
							},
						],

						[
							"Window in middle with whole pixels to minimum and partial pixels to maximum",
							{
								expected: {
									scrollPos: 2,
									scrollSize: 13,
									size: 12.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 19,
									windowMin: 9,
									windowSize: 5,
								},
							},
						],

						[
							"Window in middle with partial pixels to minimum and whole pixels to maximum",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 13,
									size: 12.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
							},
						],

						[
							"Window in middle with partial pixels to minimum and maximum",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 14,
									size: 12.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 19.5,
									windowMin: 9.5,
									windowSize: 5,
								},
							},
						],

						[
							"Window at maximum with partial pixels to start",
							{
								expected: {
									scrollPos: 8,
									scrollSize: 13,
									size: 12.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 30,
									windowMin: 20,
									windowSize: 5,
								},
							},
						],

						[
							"Window at maximum with whole pixels to start",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 12,
									size: 12,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 29,
									windowMin: 19,
									windowSize: 5,
								},
							},
						],

						[
							"Window around maximum time",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 12,
									size: 12,
									windowMax: 29,
									windowMin: 19,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 34,
									windowMin: 24,
									windowSize: 5,
								},
							},
						],

						[
							"Window before maximum time",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 12,
									size: 12,
									windowMax: 29,
									windowMin: 19,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 49,
									windowMin: 39,
									windowSize: 5,
								},
							},
						],
					],
				],
				[
					"Virtual Scroll",
					[
						[
							"Window before minimum time",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 20,
									size: 50,
									windowMax: 15,
									windowMin: 5,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: -5,
									windowMin: -15,
									windowSize: 5,
								},
							},
						],

						[
							"Window around minimum time",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 20,
									size: 50,
									windowMax: 15,
									windowMin: 5,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 10,
									windowMin: 0,
									windowSize: 5,
								},
							},
						],

						[
							"Window at minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 20,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 15,
									windowMin: 5,
									windowSize: 5,
								},
							},
						],

						[
							"Window in first half of the first scroll span with whole pixels to minimum",
							{
								expected: {
									scrollPos: 1,
									scrollSize: 20,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 17,
									windowMin: 7,
									windowSize: 5,
								},
							},
						],

						[
							"Window in first half of the first scroll span with partial pixels to minimum",
							{
								expected: {
									scrollPos: 2,
									scrollSize: 20,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 18,
									windowMin: 8,
									windowSize: 5,
								},
							},
						],

						[
							"Window at half of the first scroll span with whole pixels to minimum",
							{
								expected: {
									scrollPos: 5,
									scrollSize: 20,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
							},
						],

						[
							"Window at half of the first scroll span with partial pixels to minimum",
							{
								expected: {
									scrollPos: 5,
									scrollSize: 18,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 18,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 24,
									windowMin: 14,
									windowSize: 5,
								},
							},
						],

						[
							"Window in last half of the first scroll span",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 19,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 19,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 30,
									windowMin: 20,
									windowSize: 5,
								},
							},
						],

						[
							"Window between first scroll span end and last scroll span start",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 19,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 19,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 60,
									windowMin: 50,
									windowSize: 5,
								},
							},
						],

						[
							"Window in first half of the last scroll span",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 19,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 19,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 90,
									windowMin: 80,
									windowSize: 5,
								},
							},
						],

						[
							"Window at half of the last scroll span with partial pixels to maximum",
							{
								expected: {
									scrollPos: 8,
									scrollSize: 18,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 18,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 96,
									windowMin: 86,
									windowSize: 5,
								},
							},
						],

						[
							"Window at half of the last scroll span with whole pixels to maximum",
							{
								expected: {
									scrollPos: 10,
									scrollSize: 20,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 95,
									windowMin: 85,
									windowSize: 5,
								},
							},
						],

						[
							"Window in last half of the last scroll span with partial pixels to maximum",
							{
								expected: {
									scrollPos: 13,
									scrollSize: 20,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 102,
									windowMin: 92,
									windowSize: 5,
								},
							},
						],

						[
							"Window in last half of the last scroll span with whole pixels to maximum",
							{
								expected: {
									scrollPos: 14,
									scrollSize: 20,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 103,
									windowMin: 93,
									windowSize: 5,
								},
							},
						],

						[
							"Window at maximum",
							{
								expected: {
									scrollPos: 15,
									scrollSize: 20,
									size: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 105,
									windowMin: 95,
									windowSize: 5,
								},
							},
						],

						[
							"Window around maximum time",
							{
								expected: {
									scrollPos: 15,
									scrollSize: 20,
									size: 50,
									windowMax: 105,
									windowMin: 95,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 110,
									windowMin: 100,
									windowSize: 5,
								},
							},
						],

						[
							"Window before maximum time",
							{
								expected: {
									scrollPos: 15,
									scrollSize: 20,
									size: 50,
									windowMax: 105,
									windowMin: 95,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 125,
									windowMin: 115,
									windowSize: 5,
								},
							},
						],
					],
				],
			];

			describe.each(testGroups)("%s", (_groupTitle, testList) => {
				test.each(testList)("%s", (_testTitle, testParams) => {
					const expected = testParams.expected;
					const parameters = testParams.parameters;

					const state = new ScrollState(parameters);

					const expectedRange =
						(parameters.max ?? Number.MAX_SAFE_INTEGER) -
						(parameters.min ?? Number.MIN_SAFE_INTEGER);

					const expectedWindowMin =
						expected.windowMin ??
						parameters.windowMin ??
						Number.MIN_SAFE_INTEGER;
					const expectedWindowMax =
						expected.windowMax ??
						parameters.windowMax ??
						Number.MAX_SAFE_INTEGER;
					const expectedWindowRange = expectedWindowMax - expectedWindowMin;

					expect(state.min).toBeCloseTo(
						parameters.min ?? Number.MIN_SAFE_INTEGER,
					);
					expect(state.max).toBeCloseTo(
						parameters.max ?? Number.MAX_SAFE_INTEGER,
					);
					expect(state.windowMin).toBeCloseTo(expectedWindowMin);
					expect(state.windowMax).toBeCloseTo(expectedWindowMax);
					expect(state.range).toBeCloseTo(expectedRange);
					expect(state.size).toBeCloseTo(expected.size);
					expect(state.windowRange).toBeCloseTo(expectedWindowRange);
					expect(state.windowSize).toEqual(parameters.windowSize);
					expect(state.scrollPos).toEqual(expected.scrollPos);
					expect(state.scrollSize).toEqual(expected.scrollSize);
				});
			});
		});
	});

	describe("setExtrema", () => {
		describe("Input Validation", () => {
			const testGroups: readonly (readonly [
				string,
				readonly (readonly [
					string,
					Readonly<{
						error: Readonly<Error> | null;
						update: Readonly<{
							max: number | undefined;
							min: number | undefined;
						}>;
					}>,
				])[],
			])[] = [
				[
					"min",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotANumberError("min", "test"),
								update: {
									max: 1,
									min: "test" as unknown as number,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotANumberError("min", Number.NaN),
								update: {
									max: 1,
									min: Number.NaN as unknown as number,
								},
							},
						],

						[
							"Errors if negative infinity",
							{
								error: new NotANumberError("min", Number.NEGATIVE_INFINITY),
								update: {
									max: 1,
									min: Number.NEGATIVE_INFINITY,
								},
							},
						],

						[
							"Errors if positive infinity",
							{
								error: new NotANumberError("min", Number.POSITIVE_INFINITY),
								update: {
									max: 1,
									min: Number.POSITIVE_INFINITY as unknown as number,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								update: {
									max: 1,
									min: undefined,
								},
							},
						],

						[
							"Accepts the minimum number",
							{
								error: null,
								update: {
									max: 1,
									min: -Number.MAX_VALUE,
								},
							},
						],

						[
							"Accepts the number before the maximum number",
							{
								error: null,
								update: {
									max: Number.MAX_VALUE,
									min: Number.MAX_VALUE - 2 ** 970,
								},
							},
						],
					],
				],

				[
					"max",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotANumberError("max", "test"),
								update: {
									max: "test" as unknown as number,
									min: 0,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotANumberError("max", Number.NaN),
								update: {
									max: Number.NaN as unknown as number,
									min: 0,
								},
							},
						],

						[
							"Errors if negative infinity",
							{
								error: new NotANumberError("max", Number.NEGATIVE_INFINITY),
								update: {
									max: Number.NEGATIVE_INFINITY,
									min: 0,
								},
							},
						],

						[
							"Errors if positive infinity",
							{
								error: new NotANumberError("max", Number.POSITIVE_INFINITY),
								update: {
									max: Number.POSITIVE_INFINITY,
									min: 0,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								update: {
									max: undefined,
									min: 0,
								},
							},
						],

						[
							"Accepts the number after the minimum number",
							{
								error: null,
								update: {
									max: -Number.MAX_VALUE + 2 ** 970,
									min: -Number.MAX_VALUE,
								},
							},
						],

						[
							"Accepts the maximum number",
							{
								error: null,
								update: {
									max: Number.MAX_VALUE,
									min: 0,
								},
							},
						],
					],
				],

				[
					"range",
					[
						[
							"Minimum is equal to maximum",
							{
								error: new IntervalExtremaError("extrema", 0, 0),
								update: {
									max: 0,
									min: 0,
								},
							},
						],

						[
							"Minimum is greater than maximum",
							{
								error: new IntervalExtremaError("extrema", 1, 0),
								update: {
									max: 0,
									min: 1,
								},
							},
						],
					],
				],
			];

			describe.each(testGroups)("%s", (_groupTitle, testList) => {
				test.each(testList)("%s", (_testTitle, testParams) => {
					const error = testParams.error;
					const update = testParams.update;

					const state = new ScrollState({
						max: 1,
						min: 0,
						windowMax: 1,
						windowMin: 0,
						windowSize: 100,
					});

					const receivedError = getError(() =>
						state.setExtrema(update.min, update.max),
					);

					if (error) {
						expect(receivedError).toBeInstanceOf(Error);
						expect({ ...(receivedError as Record<string, unknown>) }).toEqual({
							...error,
						});
					} else {
						expect(receivedError).toBeUndefined();
					}
				});
			});
		});

		describe("Result", () => {
			const testGroups: readonly (readonly [
				string,
				readonly (readonly [
					string,
					Readonly<{
						expected: Readonly<{
							scrollPos: number;
							scrollSize: number;
							size: number;
							windowMax?: number;
							windowMin?: number;
						}>;
						parameters: ScrollStateParameters;
						update: Readonly<{
							max: number;
							min: number;
						}>;
					}>,
				])[],
			])[] = [
				[
					"Shrink",
					[
						[
							"With window smaller than new range at original minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 8,
									size: 7.5,
									windowMax: 20,
									windowMin: 10,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 15,
									windowMin: 5,
									windowSize: 5,
								},
								update: {
									max: 25,
									min: 10,
								},
							},
						],

						[
							"With window smaller than new range at new minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 8,
									size: 7.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									max: 25,
									min: 10,
								},
							},
						],

						[
							"With window smaller than new range between new minimum and maximum",
							{
								expected: {
									scrollPos: 2,
									scrollSize: 11,
									size: 10.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									max: 28,
									min: 7,
								},
							},
						],

						[
							"With window smaller than new range at new maximum",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 8,
									size: 7.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
								update: {
									max: 25,
									min: 10,
								},
							},
						],

						[
							"With window smaller than new range at original maximum",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 8,
									size: 7.5,
									windowMax: 25,
									windowMin: 15,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 30,
									windowMin: 20,
									windowSize: 5,
								},
								update: {
									max: 25,
									min: 10,
								},
							},
						],

						[
							"With window same size as new range",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 5,
									size: 5,
									windowMax: 25,
									windowMin: 10,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 22,
									windowMin: 7,
									windowSize: 5,
								},
								update: {
									max: 25,
									min: 10,
								},
							},
						],

						[
							"With window larger than new range",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 5,
									size: 5,
									windowMax: 25,
									windowMin: 10,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 28,
									windowMin: 7,
									windowSize: 5,
								},
								update: {
									max: 25,
									min: 10,
								},
							},
						],
					],
				],
				[
					"Preserve",
					[
						[
							"With window at start",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 13,
									size: 12.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 15,
									windowMin: 5,
									windowSize: 5,
								},
								update: {
									max: 30,
									min: 5,
								},
							},
						],

						[
							"With window in middle",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 13,
									size: 12.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									max: 30,
									min: 5,
								},
							},
						],

						[
							"With window at end",
							{
								expected: {
									scrollPos: 8,
									scrollSize: 13,
									size: 12.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 30,
									windowMin: 20,
									windowSize: 5,
								},
								update: {
									max: 30,
									min: 5,
								},
							},
						],

						[
							"With window same size as original range",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 5,
									size: 5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 30,
									windowMin: 5,
									windowSize: 5,
								},
								update: {
									max: 30,
									min: 5,
								},
							},
						],
					],
				],
				[
					"Expand",
					[
						[
							"With window at original minimum",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 18,
									size: 17.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 15,
									windowMin: 5,
									windowSize: 5,
								},
								update: {
									max: 35,
									min: 0,
								},
							},
						],

						[
							"With window between original minimum and maximum",
							{
								expected: {
									scrollPos: 5,
									scrollSize: 18,
									size: 17.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									max: 35,
									min: 0,
								},
							},
						],

						[
							"With window at original maximum",
							{
								expected: {
									scrollPos: 10,
									scrollSize: 18,
									size: 17.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 30,
									windowMin: 20,
									windowSize: 5,
								},
								update: {
									max: 35,
									min: 0,
								},
							},
						],

						[
							"With window same size as original range",
							{
								expected: {
									scrollPos: 1,
									scrollSize: 7,
									size: 7,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 30,
									windowMin: 5,
									windowSize: 5,
								},
								update: {
									max: 35,
									min: 0,
								},
							},
						],
					],
				],
			];

			describe.each(testGroups)("%s", (_groupTitle, testList) => {
				test.each(testList)("%s", (_testTitle, testParams) => {
					const expected = testParams.expected;
					const parameters = testParams.parameters;
					const update = testParams.update;

					const state = new ScrollState(parameters);
					const resultState = state.setExtrema(update.min, update.max);

					const expectedRange = update.max - update.min;

					const expectedWindowMin =
						expected.windowMin ??
						parameters.windowMin ??
						Number.MIN_SAFE_INTEGER;
					const expectedWindowMax =
						expected.windowMax ??
						parameters.windowMax ??
						Number.MAX_SAFE_INTEGER;
					const expectedWindowRange = expectedWindowMax - expectedWindowMin;

					expect(state).toBe(resultState);
					expect(state.min).toBeCloseTo(update.min);
					expect(state.max).toBeCloseTo(update.max);
					expect(state.windowMin).toBeCloseTo(expectedWindowMin);
					expect(state.windowMax).toBeCloseTo(expectedWindowMax);
					expect(state.range).toBeCloseTo(expectedRange);
					expect(state.size).toBeCloseTo(expected.size);
					expect(state.windowRange).toBeCloseTo(expectedWindowRange);
					expect(state.windowSize).toEqual(parameters.windowSize);
					expect(state.scrollPos).toEqual(expected.scrollPos);
					expect(state.scrollSize).toEqual(expected.scrollSize);
				});
			});
		});
	});

	describe("setMaxElementSize", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					update: Readonly<{
						maxElementSize: number | undefined;
					}>;
				}>,
			])[] = [
				[
					"Errors if non-numeric",
					{
						error: new NotASizeError("maxElementSize", "test"),
						update: {
							maxElementSize: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if NaN",
					{
						error: new NotASizeError("maxElementSize", Number.NaN),
						update: {
							maxElementSize: Number.NaN,
						},
					},
				],

				[
					"Errors if less than the window size",
					{
						error: new SizeRangeError(
							"maxElementSize",
							49,
							50,
							true,
							Number.MAX_VALUE,
							true,
						),
						update: {
							maxElementSize: 49,
						},
					},
				],

				[
					"Errors if infinite",
					{
						error: new NotASizeError(
							"maxElementSize",
							Number.POSITIVE_INFINITY,
						),
						update: {
							maxElementSize: Number.POSITIVE_INFINITY,
						},
					},
				],

				[
					"Accepts if undefined",
					{
						error: null,
						update: {
							maxElementSize: undefined,
						},
					},
				],

				[
					"Accepts the window size",
					{
						error: null,
						update: {
							maxElementSize: 100,
						},
					},
				],

				[
					"Accepts maximum number",
					{
						error: null,
						update: {
							maxElementSize: Number.MAX_VALUE,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const update = testParams.update;

				const state = new ScrollState({
					max: 1,
					maxElementSize: 100,
					min: 0,
					windowMax: 1,
					windowMin: 0,
					windowSize: 50,
				});

				const receivedError = getError(() =>
					state.setMaxElementSize(update.maxElementSize),
				);

				if (error) {
					expect(receivedError).toBeInstanceOf(Error);
					expect({ ...(receivedError as Record<string, unknown>) }).toEqual({
						...error,
					});
				} else {
					expect(receivedError).toBeUndefined();
				}
			});
		});

		describe("Result", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					expected: Readonly<{
						scrollPos: number;
						scrollSize: number;
						size: number;
					}>;
					update: Readonly<{
						maxElementSize: number;
					}>;
				}>,
			])[] = [
				[
					"Shrink",
					{
						expected: {
							scrollPos: 0,
							scrollSize: 75,
							size: 150,
						},
						update: {
							maxElementSize: 75,
						},
					},
				],

				[
					"Preserve",
					{
						expected: {
							scrollPos: 0,
							scrollSize: 100,
							size: 150,
						},
						update: {
							maxElementSize: 100,
						},
					},
				],

				[
					"Expand",
					{
						expected: {
							scrollPos: 0,
							scrollSize: 150,
							size: 150,
						},
						update: {
							maxElementSize: 200,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const expected = testParams.expected;
				const parameters = {
					max: 3,
					maxElementSize: 100,
					min: 0,
					resyncThresholdSize: 5,
					windowMax: 1,
					windowMin: 0,
					windowSize: 50,
				};
				const update = testParams.update;

				const expectedRange = parameters.max - parameters.min;
				const expectedWindowRange = parameters.windowMax - parameters.windowMin;

				const state = new ScrollState(parameters);
				state.setMaxElementSize(update.maxElementSize);

				expect(state.min).toBeCloseTo(parameters.min);
				expect(state.max).toBeCloseTo(parameters.max);
				expect(state.windowMin).toBeCloseTo(parameters.windowMin);
				expect(state.windowMax).toBeCloseTo(parameters.windowMax);
				expect(state.range).toBeCloseTo(expectedRange);
				expect(state.size).toBeCloseTo(expected.size);
				expect(state.windowRange).toBeCloseTo(expectedWindowRange);
				expect(state.windowSize).toEqual(parameters.windowSize);
				expect(state.scrollPos).toEqual(expected.scrollPos);
				expect(state.scrollSize).toEqual(expected.scrollSize);
				expect(state.maxElementSize).toEqual(update.maxElementSize);
			});
		});
	});

	describe("setResyncThresholdSize", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					update: Readonly<{
						resyncThresholdSize: number | undefined;
					}>;
				}>,
			])[] = [
				[
					"Errors if non-numeric",
					{
						error: new NotASizeError("resyncThresholdSize", "test"),
						update: {
							resyncThresholdSize: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if NaN",
					{
						error: new NotASizeError("resyncThresholdSize", Number.NaN),
						update: {
							resyncThresholdSize: Number.NaN,
						},
					},
				],

				[
					"Errors if zero",
					{
						error: new SizeRangeError(
							"resyncThresholdSize",
							0,
							ZERO,
							false,
							HALF * Number.MAX_VALUE,
							true,
						),
						update: {
							resyncThresholdSize: 0,
						},
					},
				],

				[
					"Errors if greater than half of the maximum size",
					{
						error: new SizeRangeError(
							"resyncThresholdSize",
							HALF * Number.MAX_VALUE + 1e292,
							ZERO,
							false,
							HALF * Number.MAX_VALUE,
							true,
						),
						update: {
							resyncThresholdSize: HALF * Number.MAX_VALUE + 1e292,
						},
					},
				],

				[
					"Errors if infinite",
					{
						error: new NotASizeError(
							"resyncThresholdSize",
							Number.POSITIVE_INFINITY,
						),
						update: {
							resyncThresholdSize: Number.POSITIVE_INFINITY,
						},
					},
				],

				[
					"Accepts if undefined",
					{
						error: null,
						update: {
							resyncThresholdSize: undefined,
						},
					},
				],

				[
					"Accepts the value immediately greater than zero",
					{
						error: null,
						update: {
							resyncThresholdSize: Number.MIN_VALUE,
						},
					},
				],

				[
					"Accepts half of the maximum size",
					{
						error: null,
						update: {
							resyncThresholdSize: HALF * Number.MAX_VALUE,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const update = testParams.update;

				const state = new ScrollState({
					max: 1,
					maxElementSize: 100,
					min: 0,
					windowMax: 1,
					windowMin: 0,
					windowSize: 50,
				});

				const receivedError = getError(() =>
					state.setResyncThresholdSize(update.resyncThresholdSize),
				);

				if (error) {
					expect(receivedError).toBeInstanceOf(Error);
					expect({ ...(receivedError as Record<string, unknown>) }).toEqual({
						...error,
					});
				} else {
					expect(receivedError).toBeUndefined();
				}
			});
		});

		describe("Result", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					expected: Readonly<{
						scrollPos: number;
						scrollSize: number;
						size: number;
						windowMax?: number;
						windowMin?: number;
					}>;
					parameters?: Readonly<
						Partial<{
							[P in keyof ConstructorParameters<
								typeof ScrollState
							>[0]]: Exclude<
								ConstructorParameters<typeof ScrollState>[0][P],
								undefined
							>;
						}>
					>;
					update: Readonly<{
						scrollPos?: number;
						resyncThresholdSize: number;
					}>;
				}>,
			])[] = [
				[
					"Shrink",
					{
						expected: {
							scrollPos: 0,
							scrollSize: 150,
							size: 150,
						},
						update: {
							resyncThresholdSize: 75,
						},
					},
				],

				[
					"Shrink to minimum threshold",
					{
						expected: {
							scrollPos: 250,
							scrollSize: 550,
							size: 550,
							windowMax: 6,
							windowMin: 5,
						},
						parameters: {
							max: 11,
							min: 0,
							windowMax: 7,
							windowMin: 6,
						},
						update: {
							scrollPos: 150,
							resyncThresholdSize: 150,
						},
					},
				],

				[
					"Shrink to maximum threshold",
					{
						expected: {
							scrollPos: 250,
							scrollSize: 550,
							size: 550,
							windowMax: 6,
							windowMin: 5,
						},
						parameters: {
							max: 11,
							min: 0,
							windowMax: 5,
							windowMin: 4,
						},
						update: {
							scrollPos: 250,
							resyncThresholdSize: 150,
						},
					},
				],

				[
					"Preserve",
					{
						expected: {
							scrollPos: 0,
							scrollSize: 150,
							size: 150,
						},
						update: {
							resyncThresholdSize: 100,
						},
					},
				],

				[
					"Expand",
					{
						expected: {
							scrollPos: 0,
							scrollSize: 150,
							size: 150,
						},
						update: {
							resyncThresholdSize: 200,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const expected = testParams.expected;
				const parameters = {
					max: 3,
					maxElementSize: 400,
					min: 0,
					resyncThresholdSize: 100,
					windowMax: 1,
					windowMin: 0,
					windowSize: 50,
					...testParams.parameters,
				};
				const update = testParams.update;

				const expectedRange = parameters.max - parameters.min;
				const expectedWindowRange = parameters.windowMax - parameters.windowMin;

				const state = new ScrollState(parameters);
				if (update.scrollPos) {
					state.setScrollPos(update.scrollPos);
				}
				state.setResyncThresholdSize(update.resyncThresholdSize);

				expect(state.min).toBeCloseTo(parameters.min);
				expect(state.max).toBeCloseTo(parameters.max);
				expect(state.windowMin).toBeCloseTo(
					expected.windowMin ?? parameters.windowMin,
				);
				expect(state.windowMax).toBeCloseTo(
					expected.windowMax ?? parameters.windowMax,
				);
				expect(state.range).toBeCloseTo(expectedRange);
				expect(state.size).toBeCloseTo(expected.size);
				expect(state.windowRange).toBeCloseTo(expectedWindowRange);
				expect(state.windowSize).toEqual(parameters.windowSize);
				expect(state.scrollPos).toEqual(expected.scrollPos);
				expect(state.scrollSize).toEqual(expected.scrollSize);
				expect(state.resyncThresholdSize).toEqual(update.resyncThresholdSize);
			});
		});
	});

	describe("setScrollPos", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					update: Readonly<{
						scrollPos: number;
					}>;
				}>,
			])[] = [
				[
					"Errors if undefined",
					{
						error: new NotAPositionError("scrollPos", undefined),
						update: {
							scrollPos: undefined as unknown as number,
						},
					},
				],

				[
					"Errors if non-numeric",
					{
						error: new NotAPositionError("scrollPos", "test"),
						update: {
							scrollPos: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if NaN",
					{
						error: new NotAPositionError("scrollPos", Number.NaN),
						update: {
							scrollPos: Number.NaN as unknown as number,
						},
					},
				],

				[
					"Errors if less than zero",
					{
						error: new PositionRangeError(
							"scrollPos",
							-Number.MIN_VALUE,
							0,
							50,
						),
						update: {
							scrollPos: -Number.MIN_VALUE,
						},
					},
				],

				[
					"Errors if infinite",
					{
						error: new NotAPositionError("scrollPos", Number.POSITIVE_INFINITY),
						update: {
							scrollPos: Number.POSITIVE_INFINITY,
						},
					},
				],

				[
					"Errors if greater than maximum scroll position",
					{
						error: new PositionRangeError("scrollPos", 51, 0, 50),
						update: {
							scrollPos: 51,
						},
					},
				],

				[
					"Accepts zero",
					{
						error: null,
						update: {
							scrollPos: 0,
						},
					},
				],

				[
					"Accepts the maximum scroll position",
					{
						error: null,
						update: {
							scrollPos: 50,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const update = testParams.update;

				const state = new ScrollState({
					max: 2,
					maxElementSize: 100,
					min: 0,
					windowMax: 1,
					windowMin: 0,
					windowSize: 50,
				});

				const receivedError = getError(() => {
					state.setScrollPos(update.scrollPos);
				});

				if (error) {
					expect(receivedError).toBeInstanceOf(Error);
					expect({ ...(receivedError as Record<string, unknown>) }).toEqual({
						...error,
					});
				} else {
					expect(receivedError).toBeUndefined();
				}
			});
		});

		describe("Result", () => {
			const testGroups: readonly (readonly [
				string,
				readonly (readonly [
					string,
					Readonly<{
						expected: Readonly<{
							scrollPos: number;
							scrollSize: number;
							size: number;
							windowMax: number;
							windowMin: number;
						}>;
						parameters: ScrollStateParameters;
						update: Readonly<{
							scrollPos: readonly number[];
						}>;
					}>,
				])[],
			])[] = [
				[
					"No Scroll",
					[
						[
							"Scroll to the current position",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 5,
									size: 5,
									windowMax: 30,
									windowMin: 5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 30,
									windowMin: 5,
									windowSize: 5,
								},
								update: {
									scrollPos: [0],
								},
							},
						],
					],
				],
				[
					"Static Scroll",
					[
						[
							"Scroll incrementally to the minimum position with rounding error",
							{
								expected: {
									scrollPos: 1,
									scrollSize: 91,
									size: 90,
									windowMax: 10,
									windowMin: 1.1102230246251565e-16,
								},
								parameters: {
									max: 30,
									min: 0,
									windowMax: 11,
									windowMin: 1,
									windowSize: 30,
								},
								update: {
									scrollPos: [2, 1, 0],
								},
							},
						],

						// Script used to find this test case:
						// ```
						// ((limit) => {
						//   for (let den = 2; den < limit; den++) {
						//     for (let num = 1; num < Math.min(den, 3); num++) {
						//       if (den % num === 0) continue;
						//
						//       const offset = 10;
						//       const baseNum = num + offset;
						//
						//       let exponent = -20;
						//       while (num + Math.pow(10, exponent) === baseNum)
						//         exponent++;
						//
						//       let factor = Math.max(
						//         Math.pow(10, exponent - 2),
						//         Number.EPSILON
						//       );
						//       let epsilon = factor;
						//       while (baseNum + epsilon === baseNum) epsilon += factor;
						//       let init = baseNum + epsilon;
						//
						//       let result = new Array(den)
						//         .fill(0)
						//         .reduce((sum) => sum - num / den, init);
						//
						//       if (result < offset)
						//         console.log(
						//           `${num}/${den} => ${result} (init: ${init})`
						//         );
						//     }
						//   }
						// })(100);
						// ```
						[
							"Scroll incrementally to one with windowMin rounding to zero",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 70,
									size: 70,
									windowMax: 12,
									windowMin: 10,
								},
								parameters: {
									max: 30,
									min: 10,
									windowMax: 14.000000000000002,
									windowMin: 12.000000000000002,
									windowSize: 7,
								},
								update: {
									scrollPos: new Array(7).fill(0).map((_, i) => 7 - i),
								},
							},
						],

						[
							"Scroll to the minimum position",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 13,
									size: 12.5,
									windowMax: 15,
									windowMin: 5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									scrollPos: [0],
								},
							},
						],

						[
							"Scroll to between the minimum position and the current position",
							{
								expected: {
									scrollPos: 1,
									scrollSize: 13,
									size: 12.5,
									windowMax: 16,
									windowMin: 6,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									scrollPos: [1],
								},
							},
						],

						[
							"Scroll to the current position",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 13,
									size: 12.5,
									windowMax: 20,
									windowMin: 10,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									scrollPos: [3],
								},
							},
						],

						[
							"Scroll to between the current position and the maximum position",
							{
								expected: {
									scrollPos: 5,
									scrollSize: 13,
									size: 12.5,
									windowMax: 24,
									windowMin: 14,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									scrollPos: [5],
								},
							},
						],

						[
							"Scroll to the maximum position",
							{
								expected: {
									scrollPos: 8,
									scrollSize: 13,
									size: 12.5,
									windowMax: 30,
									windowMin: 20,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									scrollPos: [8],
								},
							},
						],

						[
							"Scroll incrementally to one before the maximum position with windowMin rounding to zero",
							{
								expected: {
									scrollPos: 14,
									scrollSize: 21,
									size: 21,
									windowMax: 16,
									windowMin: 14,
								},
								parameters: {
									max: 16,
									min: 10,
									windowMax: 13.999999999999998,
									windowMin: 11.999999999999998,
									windowSize: 7,
								},
								update: {
									scrollPos: [8, 9, 10, 11, 12, 13, 14],
								},
							},
						],

						[
							"Scroll incrementally to the maximum position with rounding error",
							{
								expected: {
									scrollPos: 15,
									scrollSize: 19,
									size: 18,
									windowMax: 11.999999999999998,
									windowMin: 9.999999999999998,
								},
								parameters: {
									max: 12,
									min: 0,
									windowMax: 10,
									windowMin: 8,
									windowSize: 3,
								},
								update: {
									scrollPos: [13, 14, 15],
								},
							},
						],
					],
				],
				[
					"Virtual Scroll",
					[
						[
							"Within the first scroll span, scroll to the minimum position",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 20,
									size: 50,
									windowMax: 15,
									windowMin: 5,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
								update: {
									scrollPos: [0],
								},
							},
						],

						[
							"Within the first scroll span, scroll to between the minimum position and the minimum resync threshold",
							{
								expected: {
									scrollPos: 1,
									scrollSize: 20,
									size: 50,
									windowMax: 17,
									windowMin: 7,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
								update: {
									scrollPos: [1],
								},
							},
						],

						[
							"Within the first scroll span, scroll to the minimum resync threshold",
							{
								expected: {
									scrollPos: 2,
									scrollSize: 20,
									size: 50,
									windowMax: 19,
									windowMin: 9,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
								update: {
									scrollPos: [2],
								},
							},
						],

						[
							"Within the first scroll span, scroll to between the minimum resync threshold and the current position",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 20,
									size: 50,
									windowMax: 21,
									windowMin: 11,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
								update: {
									scrollPos: [3],
								},
							},
						],

						[
							"Within the first scroll span, scroll to the current position",
							{
								expected: {
									scrollPos: 5,
									scrollSize: 20,
									size: 50,
									windowMax: 25,
									windowMin: 15,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
								update: {
									scrollPos: [5],
								},
							},
						],

						[
							"Within the first scroll span, scroll to between the current position and the maximum resync threshold",
							{
								expected: {
									scrollPos: 12,
									scrollSize: 20,
									size: 50,
									windowMax: 39,
									windowMin: 29,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
								update: {
									scrollPos: [12],
								},
							},
						],

						[
							"Within the first scroll span, scroll to the maximum resync threshold",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 41,
									windowMin: 31,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
								update: {
									scrollPos: [13],
								},
							},
						],

						[
							"Within the first scroll span, scroll to between the maximum resync threshold and the maximum position",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 43,
									windowMin: 33,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
								update: {
									scrollPos: [14],
								},
							},
						],

						[
							"Within the first scroll span, scroll to the maximum position",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 45,
									windowMin: 35,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 25,
									windowMin: 15,
									windowSize: 5,
								},
								update: {
									scrollPos: [15],
								},
							},
						],

						[
							"Within a middle scroll span, scroll to the minimum position",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 46,
									windowMin: 36,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 60,
									windowMin: 50,
									windowSize: 5,
								},
								update: {
									scrollPos: [0],
								},
							},
						],

						[
							"Within a middle scroll span, scroll to between the minimum position and the minimum resync threshold",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 48,
									windowMin: 38,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 60,
									windowMin: 50,
									windowSize: 5,
								},
								update: {
									scrollPos: [1],
								},
							},
						],

						[
							"Within a middle scroll span, scroll to the minimum resync threshold",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 50,
									windowMin: 40,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 60,
									windowMin: 50,
									windowSize: 5,
								},
								update: {
									scrollPos: [2],
								},
							},
						],

						[
							"Within a middle scroll span, scroll to between the minimum resync threshold and the current position",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 20,
									size: 50,
									windowMax: 52,
									windowMin: 42,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 60,
									windowMin: 50,
									windowSize: 5,
								},
								update: {
									scrollPos: [3],
								},
							},
						],

						[
							"Within a middle scroll span, scroll to the current position",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 60,
									windowMin: 50,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 60,
									windowMin: 50,
									windowSize: 5,
								},
								update: {
									scrollPos: [7],
								},
							},
						],

						[
							"Within a middle scroll span, scroll to between the current position and the maximum resync threshold",
							{
								expected: {
									scrollPos: 12,
									scrollSize: 20,
									size: 50,
									windowMax: 70,
									windowMin: 60,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 60,
									windowMin: 50,
									windowSize: 5,
								},
								update: {
									scrollPos: [12],
								},
							},
						],

						[
							"Within a middle scroll span, scroll to the maximum resync threshold",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 72,
									windowMin: 62,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 60,
									windowMin: 50,
									windowSize: 5,
								},
								update: {
									scrollPos: [13],
								},
							},
						],

						[
							"Within a middle scroll span, scroll to between the maximum resync threshold and the maximum position",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 74,
									windowMin: 64,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 60,
									windowMin: 50,
									windowSize: 5,
								},
								update: {
									scrollPos: [14],
								},
							},
						],

						[
							"Within a middle scroll span, scroll to the maximum position",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 76,
									windowMin: 66,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 60,
									windowMin: 50,
									windowSize: 5,
								},
								update: {
									scrollPos: [15],
								},
							},
						],

						[
							"Within the last scroll span, scroll to the minimum position",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 75,
									windowMin: 65,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 95,
									windowMin: 85,
									windowSize: 5,
								},
								update: {
									scrollPos: [0],
								},
							},
						],

						[
							"Within the last scroll span, scroll to between the minimum position and the minimum resync threshold",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 77,
									windowMin: 67,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 95,
									windowMin: 85,
									windowSize: 5,
								},
								update: {
									scrollPos: [1],
								},
							},
						],

						[
							"Within the last scroll span, scroll to the minimum resync threshold",
							{
								expected: {
									scrollPos: 7,
									scrollSize: 20,
									size: 50,
									windowMax: 79,
									windowMin: 69,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 95,
									windowMin: 85,
									windowSize: 5,
								},
								update: {
									scrollPos: [2],
								},
							},
						],

						[
							"Within the last scroll span, scroll to between the minimum resync threshold and the current position",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 20,
									size: 50,
									windowMax: 81,
									windowMin: 71,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 95,
									windowMin: 85,
									windowSize: 5,
								},
								update: {
									scrollPos: [3],
								},
							},
						],

						[
							"Within the last scroll span, scroll to the current position",
							{
								expected: {
									scrollPos: 10,
									scrollSize: 20,
									size: 50,
									windowMax: 95,
									windowMin: 85,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 95,
									windowMin: 85,
									windowSize: 5,
								},
								update: {
									scrollPos: [10],
								},
							},
						],

						[
							"Within the last scroll span, scroll to between the current position and the maximum resync threshold",
							{
								expected: {
									scrollPos: 12,
									scrollSize: 20,
									size: 50,
									windowMax: 99,
									windowMin: 89,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 95,
									windowMin: 85,
									windowSize: 5,
								},
								update: {
									scrollPos: [12],
								},
							},
						],

						[
							"Within the last scroll span, scroll to the maximum resync threshold",
							{
								expected: {
									scrollPos: 13,
									scrollSize: 20,
									size: 50,
									windowMax: 101,
									windowMin: 91,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 95,
									windowMin: 85,
									windowSize: 5,
								},
								update: {
									scrollPos: [13],
								},
							},
						],

						[
							"Within the last scroll span, scroll to between the maximum resync threshold and the maximum position",
							{
								expected: {
									scrollPos: 14,
									scrollSize: 20,
									size: 50,
									windowMax: 103,
									windowMin: 93,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 95,
									windowMin: 85,
									windowSize: 5,
								},
								update: {
									scrollPos: [14],
								},
							},
						],

						[
							"Within the last scroll span, scroll to the maximum position",
							{
								expected: {
									scrollPos: 15,
									scrollSize: 20,
									size: 50,
									windowMax: 105,
									windowMin: 95,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 95,
									windowMin: 85,
									windowSize: 5,
								},
								update: {
									scrollPos: [15],
								},
							},
						],
					],
				],
			];

			describe.each(testGroups)("%s", (_groupTitle, testList) => {
				test.each(testList)("%s", (_testTitle, testParams) => {
					const expected = testParams.expected;
					const parameters = testParams.parameters;
					const update = testParams.update;

					const expectedRange =
						(parameters.max ?? Number.MAX_SAFE_INTEGER) -
						(parameters.min ?? Number.MIN_SAFE_INTEGER);
					const expectedWindowRange =
						(parameters.windowMax ?? Number.MAX_SAFE_INTEGER) -
						(parameters.windowMin ?? Number.MIN_SAFE_INTEGER);

					const state = new ScrollState(parameters);
					const resultState = update.scrollPos.reduce<ScrollState>(
						(state, scrollPos) => state.setScrollPos(scrollPos),
						state,
					);

					expect(state).toBe(resultState);
					expect(state.min).toBeCloseTo(
						parameters.min ?? Number.MIN_SAFE_INTEGER,
					);
					expect(state.max).toBeCloseTo(
						parameters.max ?? Number.MAX_SAFE_INTEGER,
					);
					expect(state.windowMin).toEqual(expected.windowMin);
					expect(state.windowMax).toEqual(expected.windowMax);
					expect(state.range).toBeCloseTo(expectedRange);
					expect(state.size).toBeCloseTo(expected.size);
					expect(state.windowRange).toBeCloseTo(expectedWindowRange);
					expect(state.windowSize).toEqual(parameters.windowSize);
					expect(state.scrollPos).toEqual(expected.scrollPos);
					expect(state.scrollSize).toEqual(expected.scrollSize);
				});
			});
		});
	});

	describe("setWindowExtrema", () => {
		describe("Input Validation", () => {
			const testGroups: readonly (readonly [
				string,
				readonly (readonly [
					string,
					Readonly<{
						error: Readonly<Error> | null;
						update: Readonly<{
							windowMax: number | undefined;
							windowMin: number | undefined;
						}>;
					}>,
				])[],
			])[] = [
				[
					"windowMin",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotANumberError("windowMin", "test"),
								update: {
									windowMax: 1,
									windowMin: "test" as unknown as number,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotANumberError("windowMin", Number.NaN),
								update: {
									windowMax: 1,
									windowMin: Number.NaN as unknown as number,
								},
							},
						],

						[
							"Errors if negative infinity",
							{
								error: new NotANumberError(
									"windowMin",
									Number.NEGATIVE_INFINITY,
								),
								update: {
									windowMax: 1,
									windowMin: Number.NEGATIVE_INFINITY,
								},
							},
						],

						[
							"Errors if positive infinity",
							{
								error: new NotANumberError(
									"windowMin",
									Number.POSITIVE_INFINITY,
								),
								update: {
									windowMax: 1,
									windowMin: Number.POSITIVE_INFINITY as unknown as number,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								update: {
									windowMax: 1,
									windowMin: undefined,
								},
							},
						],

						[
							"Accepts the minimum number",
							{
								error: null,
								update: {
									windowMax: 1,
									windowMin: -Number.MAX_VALUE,
								},
							},
						],

						[
							"Accepts the number before the maximum number",
							{
								error: null,
								update: {
									windowMax: Number.MAX_VALUE,
									windowMin: Number.MAX_VALUE - 2 ** 970,
								},
							},
						],
					],
				],

				[
					"windowMax",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotANumberError("windowMax", "test"),
								update: {
									windowMax: "test" as unknown as number,
									windowMin: 0,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotANumberError("windowMax", Number.NaN),
								update: {
									windowMax: Number.NaN as unknown as number,
									windowMin: 0,
								},
							},
						],

						[
							"Errors if negative infinity",
							{
								error: new NotANumberError(
									"windowMax",
									Number.NEGATIVE_INFINITY,
								),
								update: {
									windowMax: Number.NEGATIVE_INFINITY,
									windowMin: 0,
								},
							},
						],

						[
							"Errors if positive infinity",
							{
								error: new NotANumberError(
									"windowMax",
									Number.POSITIVE_INFINITY,
								),
								update: {
									windowMax: Number.POSITIVE_INFINITY,
									windowMin: 0,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								update: {
									windowMax: undefined,
									windowMin: 0,
								},
							},
						],

						[
							"Accepts the number after the minimum number",
							{
								error: null,
								update: {
									windowMax: -Number.MAX_VALUE + 2 ** 970,
									windowMin: -Number.MAX_VALUE,
								},
							},
						],

						[
							"Accepts the maximum number",
							{
								error: null,
								update: {
									windowMax: Number.MAX_VALUE,
									windowMin: 0,
								},
							},
						],
					],
				],

				[
					"windowRange",
					[
						[
							"Minimum is equal to maximum",
							{
								error: new IntervalExtremaError("windowExtrema", 0, 0),
								update: {
									windowMax: 0,
									windowMin: 0,
								},
							},
						],

						[
							"Minimum is greater than maximum",
							{
								error: new IntervalExtremaError("windowExtrema", 1, 0),
								update: {
									windowMax: 0,
									windowMin: 1,
								},
							},
						],
					],
				],
			];

			describe.each(testGroups)("%s", (_groupTitle, testList) => {
				test.each(testList)("%s", (_testTitle, testParams) => {
					const error = testParams.error;
					const update = testParams.update;

					const state = new ScrollState({
						max: 1,
						min: 0,
						windowMax: 1,
						windowMin: 0,
						windowSize: 100,
					});

					const receivedError = getError(() =>
						state.setWindowExtrema(update.windowMin, update.windowMax),
					);

					if (error) {
						expect(receivedError).toBeInstanceOf(Error);
						expect({ ...(receivedError as Record<string, unknown>) }).toEqual({
							...error,
						});
					} else {
						expect(receivedError).toBeUndefined();
					}
				});
			});
		});

		describe("Result", () => {
			const testGroups: readonly (readonly [
				string,
				readonly (readonly [
					string,
					Readonly<{
						expected: Readonly<{
							scrollPos: number;
							scrollSize: number;
							size: number;
							windowMax: number;
							windowMin: number;
						}>;
						parameters: ScrollStateParameters;
						update: Readonly<{
							windowMax: number;
							windowMin: number;
						}>;
					}>,
				])[],
			])[] = [
				[
					"Shrink",
					[
						[
							"Window before minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 25,
									size: 25,
									windowMax: 10,
									windowMin: 5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: -10,
									windowMin: -15,
								},
							},
						],

						[
							"Window containing minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 25,
									size: 25,
									windowMax: 10,
									windowMin: 5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 7,
									windowMin: 2,
								},
							},
						],

						[
							"Window start at minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 25,
									size: 25,
									windowMax: 10,
									windowMin: 5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 10,
									windowMin: 5,
								},
							},
						],

						[
							"Window start from non-terminal view",
							{
								expected: {
									scrollPos: 10,
									scrollSize: 25,
									size: 800,
									windowMax: 20,
									windowMin: 15,
								},
								parameters: {
									max: 400,
									maxElementSize: 20,
									min: -400,
									resyncThresholdSize: 5,
									windowMax: 15,
									windowMin: 5,
									windowSize: 5,
								},
								update: {
									windowMax: 20,
									windowMin: 15,
								},
							},
						],

						[
							"Window start between minimum and maximum",
							{
								expected: {
									scrollPos: 10,
									scrollSize: 25,
									size: 25,
									windowMax: 20,
									windowMin: 15,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 20,
									windowMin: 15,
								},
							},
						],

						[
							"Window end at maximum",
							{
								expected: {
									scrollPos: 20,
									scrollSize: 25,
									size: 25,
									windowMax: 30,
									windowMin: 25,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 30,
									windowMin: 25,
								},
							},
						],

						[
							"Window containing maximum",
							{
								expected: {
									scrollPos: 20,
									scrollSize: 25,
									size: 25,
									windowMax: 30,
									windowMin: 25,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 33,
									windowMin: 28,
								},
							},
						],

						[
							"Window after maximum",
							{
								expected: {
									scrollPos: 20,
									scrollSize: 25,
									size: 25,
									windowMax: 30,
									windowMin: 25,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 40,
									windowMin: 35,
								},
							},
						],
					],
				],
				[
					"Preserve",
					[
						[
							"Window before minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 13,
									size: 12.5,
									windowMax: 15,
									windowMin: 5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: -5,
									windowMin: -15,
								},
							},
						],

						[
							"Window containing minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 13,
									size: 12.5,
									windowMax: 15,
									windowMin: 5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 10,
									windowMin: 0,
								},
							},
						],

						[
							"Window start at minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 13,
									size: 12.5,
									windowMax: 15,
									windowMin: 5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 15,
									windowMin: 5,
								},
							},
						],

						[
							"Window start between minimum and maximum",
							{
								expected: {
									scrollPos: 5,
									scrollSize: 13,
									size: 12.5,
									windowMax: 25,
									windowMin: 15,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 25,
									windowMin: 15,
								},
							},
						],

						[
							"Window end at maximum",
							{
								expected: {
									scrollPos: 8,
									scrollSize: 13,
									size: 12.5,
									windowMax: 30,
									windowMin: 20,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 30,
									windowMin: 20,
								},
							},
						],

						[
							"Window containing maximum",
							{
								expected: {
									scrollPos: 8,
									scrollSize: 13,
									size: 12.5,
									windowMax: 30,
									windowMin: 20,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 35,
									windowMin: 25,
								},
							},
						],

						[
							"Window after maximum",
							{
								expected: {
									scrollPos: 8,
									scrollSize: 13,
									size: 12.5,
									windowMax: 30,
									windowMin: 20,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 45,
									windowMin: 35,
								},
							},
						],
					],
				],
				[
					"Expand",
					[
						[
							"Window before minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 8,
									size: 8,
									windowMax: 20,
									windowMin: 5,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: -5,
									windowMin: -20,
								},
							},
						],

						[
							"Window containing minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 8,
									size: 8,
									windowMax: 20,
									windowMin: 5,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 15,
									windowMin: 0,
								},
							},
						],

						[
							"Window start at minimum",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 8,
									size: 8,
									windowMax: 20,
									windowMin: 5,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 20,
									windowMin: 5,
								},
							},
						],

						[
							"Window start between minimum and maximum",
							{
								expected: {
									scrollPos: 2,
									scrollSize: 9,
									size: 8,
									windowMax: 25,
									windowMin: 10,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 25,
									windowMin: 10,
								},
							},
						],

						[
							"Window end at maximum",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 8,
									size: 8,
									windowMax: 29,
									windowMin: 14,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 29,
									windowMin: 14,
								},
							},
						],

						[
							"Window containing maximum",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 8,
									size: 8,
									windowMax: 29,
									windowMin: 14,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 40,
									windowMin: 25,
								},
							},
						],

						[
							"Window after maximum",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 8,
									size: 8,
									windowMax: 29,
									windowMin: 14,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 50,
									windowMin: 35,
								},
							},
						],

						[
							"Window range equal to range",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 5,
									size: 5,
									windowMax: 29,
									windowMin: 5,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 59,
									windowMin: 35,
								},
							},
						],

						[
							"Window range greater than range",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 5,
									size: 5,
									windowMax: 29,
									windowMin: 5,
								},
								parameters: {
									max: 29,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowMax: 100,
									windowMin: 0,
								},
							},
						],
					],
				],
			];

			describe.each(testGroups)("%s", (_groupTitle, testList) => {
				test.each(testList)("%s", (_testTitle, testParams) => {
					const expected = testParams.expected;
					const parameters = testParams.parameters;
					const update = testParams.update;

					const expectedRange =
						(parameters.max ?? Number.MAX_SAFE_INTEGER) -
						(parameters.min ?? Number.MIN_SAFE_INTEGER);
					const expectedWindowRange = Math.min(
						update.windowMax - update.windowMin,
						expectedRange,
					);

					const state = new ScrollState(parameters);
					const resultState = state.setWindowExtrema(
						update.windowMin,
						update.windowMax,
					);

					expect(state).toBe(resultState);
					expect(state.min).toBeCloseTo(
						parameters.min ?? Number.MIN_SAFE_INTEGER,
					);
					expect(state.max).toBeCloseTo(
						parameters.max ?? Number.MAX_SAFE_INTEGER,
					);
					expect(state.windowMin).toBeCloseTo(expected.windowMin);
					expect(state.windowMax).toBeCloseTo(expected.windowMax);
					expect(state.range).toBeCloseTo(expectedRange);
					expect(state.size).toBeCloseTo(expected.size);
					expect(state.windowRange).toBeCloseTo(expectedWindowRange);
					expect(state.windowSize).toEqual(parameters.windowSize);
					expect(state.scrollPos).toEqual(expected.scrollPos);
					expect(state.scrollSize).toEqual(expected.scrollSize);
				});
			});
		});
	});

	describe("setWindowSize", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					update: Readonly<{
						windowSize: number;
					}>;
				}>,
			])[] = [
				[
					"Errors if undefined",
					{
						error: new NotASizeError("windowSize", undefined),
						update: {
							windowSize: undefined as unknown as number,
						},
					},
				],

				[
					"Errors if non-numeric",
					{
						error: new NotASizeError("windowSize", "test"),
						update: {
							windowSize: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if NaN",
					{
						error: new NotASizeError("windowSize", Number.NaN),
						update: {
							windowSize: Number.NaN as unknown as number,
						},
					},
				],

				[
					"Errors if negative",
					{
						error: new SizeRangeError("windowSize", -1, ZERO, true, 100, true),
						update: {
							windowSize: -1 as unknown as number,
						},
					},
				],

				[
					"Errors if less than zero",
					{
						error: new SizeRangeError(
							"windowSize",
							-Number.MIN_VALUE,
							ZERO,
							true,
							100,
							true,
						),
						update: {
							windowSize: -Number.MIN_VALUE,
						},
					},
				],

				[
					"Errors if infinite",
					{
						error: new NotASizeError("windowSize", Number.POSITIVE_INFINITY),
						update: {
							windowSize: Number.POSITIVE_INFINITY,
						},
					},
				],

				[
					"Errors if greater than maximum element size",
					{
						error: new SizeRangeError("windowSize", 200, ZERO, true, 100, true),
						update: {
							windowSize: 200,
						},
					},
				],

				[
					"Accepts the minimum non-zero number",
					{
						error: null,
						update: {
							windowSize: Number.MIN_VALUE,
						},
					},
				],

				[
					"Accepts maximum element size",
					{
						error: null,
						update: {
							windowSize: 100,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const update = testParams.update;

				const state = new ScrollState({
					max: 1,
					maxElementSize: 100,
					min: 0,
					windowMax: 1,
					windowMin: 0,
					windowSize: 50,
				});

				const receivedError = getError(() =>
					state.setWindowSize(update.windowSize),
				);

				if (error) {
					expect(receivedError).toBeInstanceOf(Error);
					expect({ ...(receivedError as Record<string, unknown>) }).toEqual({
						...error,
					});
				} else {
					expect(receivedError).toBeUndefined();
				}
			});
		});

		describe("Result", () => {
			const testGroups: readonly (readonly [
				string,
				readonly (readonly [
					string,
					Readonly<{
						expected: Readonly<{
							scrollPos: number;
							scrollSize: number;
							size: number;
						}>;
						parameters: ScrollStateParameters;
						update: Readonly<{
							windowSize: number;
						}>;
					}>,
				])[],
			])[] = [
				[
					"No Scroll",
					[
						[
							"Shrink",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 1,
									size: 1,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 30,
									windowMin: 5,
									windowSize: 5,
								},
								update: {
									windowSize: 1,
								},
							},
						],

						[
							"Preserve",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 5,
									size: 5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 30,
									windowMin: 5,
									windowSize: 5,
								},
								update: {
									windowSize: 5,
								},
							},
						],

						[
							"Expand",
							{
								expected: {
									scrollPos: 0,
									scrollSize: 20,
									size: 20,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 30,
									windowMin: 5,
									windowSize: 5,
								},
								update: {
									windowSize: 20,
								},
							},
						],
					],
				],
				[
					"Static Scroll",
					[
						[
							"Shrink",
							{
								expected: {
									scrollPos: 1,
									scrollSize: 3,
									size: 2.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowSize: 1,
								},
							},
						],

						[
							"Preserve",
							{
								expected: {
									scrollPos: 3,
									scrollSize: 13,
									size: 12.5,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowSize: 5,
								},
							},
						],

						[
							"Expand to static scroll",
							{
								expected: {
									scrollPos: 5,
									scrollSize: 25,
									size: 25,
								},
								parameters: {
									max: 30,
									min: 5,
									windowMax: 20,
									windowMin: 10,
									windowSize: 5,
								},
								update: {
									windowSize: 10,
								},
							},
						],

						[
							"Expand to virtual scroll",
							{
								expected: {
									scrollPos: 5,
									scrollSize: 20,
									size: 100,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 20,
									windowMin: 10,
									windowSize: 1,
								},
								update: {
									windowSize: 10,
								},
							},
						],
					],
				],
				[
					"Virtual Scroll",
					[
						[
							"Shrink",
							{
								expected: {
									scrollPos: 5,
									scrollSize: 20,
									size: 100,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 20,
									windowMin: 10,
									windowSize: 20,
								},
								update: {
									windowSize: 10,
								},
							},
						],

						[
							"Preserve",
							{
								expected: {
									scrollPos: 4,
									scrollSize: 28,
									size: 200,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 20,
									windowMin: 10,
									windowSize: 20,
								},
								update: {
									windowSize: 20,
								},
							},
						],

						[
							"Expand to virtual scroll",
							{
								expected: {
									scrollPos: 4,
									scrollSize: 28,
									size: 200,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 20,
									windowMin: 10,
									windowSize: 15,
								},
								update: {
									windowSize: 20,
								},
							},
						],

						[
							"Expand to static scroll",
							{
								expected: {
									scrollPos: 1,
									scrollSize: 11,
									size: 10,
								},
								parameters: {
									max: 105,
									maxElementSize: 20,
									min: 5,
									resyncThresholdSize: 2,
									windowMax: 20,
									windowMin: 10,
									windowSize: 20,
								},
								update: {
									windowSize: 1,
								},
							},
						],
					],
				],
			];

			describe.each(testGroups)("%s", (_groupTitle, testList) => {
				test.each(testList)("%s", (_testTitle, testParams) => {
					const expected = testParams.expected;
					const parameters = testParams.parameters;
					const update = testParams.update;

					const expectedRange =
						(parameters.max ?? Number.MAX_SAFE_INTEGER) -
						(parameters.min ?? Number.MIN_SAFE_INTEGER);
					const expectedWindowRange =
						(parameters.windowMax ?? Number.MAX_SAFE_INTEGER) -
						(parameters.windowMin ?? Number.MIN_SAFE_INTEGER);

					const state = new ScrollState(parameters);
					const resultState = state.setWindowSize(update.windowSize);

					expect(state).toBe(resultState);
					expect(state.min).toBeCloseTo(
						parameters.min ?? Number.MIN_SAFE_INTEGER,
					);
					expect(state.max).toBeCloseTo(
						parameters.max ?? Number.MAX_SAFE_INTEGER,
					);
					expect(state.windowMin).toBeCloseTo(
						parameters.windowMin ?? Number.MIN_SAFE_INTEGER,
					);
					expect(state.windowMax).toBeCloseTo(
						parameters.windowMax ?? Number.MAX_SAFE_INTEGER,
					);
					expect(state.range).toBeCloseTo(expectedRange);
					expect(state.size).toBeCloseTo(expected.size);
					expect(state.windowRange).toBeCloseTo(expectedWindowRange);
					expect(state.windowSize).toEqual(update.windowSize);
					expect(state.scrollPos).toEqual(expected.scrollPos);
					expect(state.scrollSize).toEqual(expected.scrollSize);
				});
			});
		});
	});
});
