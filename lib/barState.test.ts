import { describe, expect, test, vi } from "vitest";
import {
	BarState,
	type BarStateParameters,
	type ResizeStrategy,
	type SideResizeStrategy,
} from "./barState.ts";
import type * as barStateUtilsImport from "./barStateUtils.ts";
import { NotAFunctionError } from "./function.ts";
import {
	IntervalExtremaError,
	NotASizeError,
	SizeRangeError,
	ZERO,
} from "./math.ts";
import {
	MissingPropertyError,
	NotAnObjectError,
	UnknownPropertyError,
} from "./object.ts";
import { getError } from "./testUtils.ts";

const mockedResizeStrategyDefault = vi.fn();
const mockedSideResizeStrategyDefault = vi.fn();

vi.mock("./barStateUtils.ts", async (importOriginal) => {
	const original = await importOriginal<typeof barStateUtilsImport>();

	return {
		...original,

		// biome-ignore lint/style/useNamingConvention: Mocked constant.
		get RESIZE_STRATEGY_DEFAULT() {
			return mockedResizeStrategyDefault.mockImplementation(
				original.RESIZE_STRATEGY_DEFAULT,
			);
		},

		// biome-ignore lint/style/useNamingConvention: Mocked constant.
		get SIDE_RESIZE_STRATEGY_DEFAULT() {
			return mockedSideResizeStrategyDefault.mockImplementation(
				original.SIDE_RESIZE_STRATEGY_DEFAULT,
			);
		},
	};
});

describe("BarState", () => {
	describe("Constructor", () => {
		describe("Input Validation", () => {
			const testGroups: readonly (readonly [
				string,
				readonly (readonly [
					string,
					Readonly<{
						error: Readonly<Error> | null;
						parameters: BarStateParameters;
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
								parameters: undefined as unknown as BarStateParameters,
							},
						],

						[
							"Errors if not an object",
							{
								error: new NotAnObjectError("parameters", 123),
								parameters: 123 as unknown as BarStateParameters,
							},
						],

						[
							"Contains an unknown key",
							{
								error: new UnknownPropertyError(
									"parameters",
									{
										endMax: 150,
										endMin: 5,
										endSize: 100,
										middleMin: 130,
										size: 600,
										startMax: 350,
										startMin: 250,
										startSize: 300,
										incorrectKey: true,
									},
									"incorrectKey",
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
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
					"endMax",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("endMax", "test"),
								parameters: {
									endMax: "test" as unknown as Exclude<
										BarStateParameters["endMax"],
										undefined
									>,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("endMax", Number.NaN),
								parameters: {
									endMax: Number.NaN,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if negative",
							{
								error: new SizeRangeError(
									"endMax",
									-1,
									ZERO,
									true,
									Number.MAX_VALUE,
									true,
								),
								parameters: {
									endMax: -1,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError("endMax", Number.POSITIVE_INFINITY),
								parameters: {
									endMax: Number.POSITIVE_INFINITY,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts the minimum non-zero size",
							{
								error: null,
								parameters: {
									endMax: Number.MIN_VALUE,
									endMin: 0,
									endSize: 0,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts the maximum number",
							{
								error: null,
								parameters: {
									endMax: Number.MAX_VALUE,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],
					],
				],

				[
					"endMin",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("endMin", "test"),
								parameters: {
									endMax: 150,
									endMin: "test" as unknown as Exclude<
										BarStateParameters["endMin"],
										undefined
									>,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("endMin", Number.NaN),
								parameters: {
									endMax: 150,
									endMin: Number.NaN,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if negative",
							{
								error: new SizeRangeError(
									"endMin",
									-1,
									ZERO,
									true,
									Number.MAX_VALUE,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: -1,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError("endMin", Number.POSITIVE_INFINITY),
								parameters: {
									endMax: 150,
									endMin: Number.POSITIVE_INFINITY,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									endMax: 150,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts zero",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 0,
									endSize: 0,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts the number before the maximum number",
							{
								error: null,
								parameters: {
									endMax: Number.MAX_VALUE,
									endMin: Number.MAX_VALUE - 2 ** 970,
									endSize: Number.MAX_VALUE,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],
					],
				],

				[
					"endRange",
					[
						[
							"Minimum is equal to maximum",
							{
								error: new SizeRangeError("endSize", 100, 0, true, 0, true),
								parameters: {
									endMax: 0,
									endMin: 0,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Minimum is greater than maximum",
							{
								error: new IntervalExtremaError("endExtrema", 1, 0),
								parameters: {
									endMax: 0,
									endMin: 1,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],
					],
				],

				[
					"endSize",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("endSize", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: "test" as unknown as Exclude<
										BarStateParameters["endSize"],
										undefined
									>,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("endSize", Number.NaN),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: Number.NaN,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if less than the minimum value",
							{
								error: new SizeRangeError("endSize", 4, 5, true, 150, true),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 4,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if greater than the maximum value",
							{
								error: new SizeRangeError("endSize", 151, 5, true, 150, true),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 151,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError("endSize", Number.POSITIVE_INFINITY),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: Number.POSITIVE_INFINITY,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts the minimum value",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 5,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts the maximum value",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 150,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],
					],
				],

				[
					"middleMin",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("middleMin", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: "test" as unknown as Exclude<
										BarStateParameters["middleMin"],
										undefined
									>,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("middleMin", Number.NaN),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: Number.NaN,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if negative",
							{
								error: new SizeRangeError(
									"middleMin",
									-1,
									ZERO,
									true,
									Number.MAX_VALUE,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: -1,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError("middleMin", Number.POSITIVE_INFINITY),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: Number.POSITIVE_INFINITY,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts zero",
							{
								error: null,
								parameters: {
									endMax: 105,
									endMin: 5,
									endSize: 100,
									middleMin: 0,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts the maximum number",
							{
								error: null,
								parameters: {
									endMax: 105,
									endMin: 5,
									endSize: 100,
									middleMin: Number.MAX_VALUE,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],
					],
				],

				[
					"resizeStrategy",
					[
						[
							"Errors if not a function",
							{
								error: new NotAFunctionError("resizeStrategy", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: "test" as unknown as Exclude<
										BarStateParameters["resizeStrategy"],
										undefined
									>,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return value is not an object",
							{
								error: new NotAnObjectError("resizeStrategy()", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: (() => "test") as unknown as Exclude<
										BarStateParameters["resizeStrategy"],
										undefined
									>,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return value contains an unknown key",
							{
								error: new UnknownPropertyError(
									"resizeStrategy()",
									{ endSize: 100, startSize: 300, incorrectKey: true },
									"incorrectKey",
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 100,
										startSize: 300,
										...({ incorrectKey: true } as unknown as Record<
											string,
											never
										>),
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return's end size value is non-numeric",
							{
								error: new NotASizeError("resizeStrategy().endSize", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: (() => ({
										endSize: "test",
										startSize: 300,
									})) as unknown as Exclude<
										BarStateParameters["resizeStrategy"],
										undefined
									>,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return's end size value is NaN",
							{
								error: new NotASizeError(
									"resizeStrategy().endSize",
									Number.NaN,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: Number.NaN,
										startSize: 300,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return's end size value is less than the minimum end size",
							{
								error: new SizeRangeError(
									"resizeStrategy().endSize",
									4,
									5,
									true,
									150,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 4,
										startSize: 300,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return's end size value is infinite",
							{
								error: new NotASizeError(
									"resizeStrategy().endSize",
									Number.POSITIVE_INFINITY,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: (() => ({
										endSize: Number.POSITIVE_INFINITY,
										startSize: 300,
									})) as unknown as Exclude<
										BarStateParameters["resizeStrategy"],
										undefined
									>,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return's end size value is greater than the maximum end size",
							{
								error: new SizeRangeError(
									"resizeStrategy().endSize",
									200,
									5,
									true,
									150,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 200,
										startSize: 300,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return's start size value is non-numeric",
							{
								error: new NotASizeError("resizeStrategy().startSize", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: (() => ({
										endSize: 100,
										startSize: "test",
									})) as unknown as Exclude<
										BarStateParameters["resizeStrategy"],
										undefined
									>,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return's start size value is NaN",
							{
								error: new NotASizeError(
									"resizeStrategy().startSize",
									Number.NaN,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 100,
										startSize: Number.NaN,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return's start size value is less than the minimum start size",
							{
								error: new SizeRangeError(
									"resizeStrategy().startSize",
									249,
									250,
									true,
									350,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 100,
										startSize: 249,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return's start size value is infinite",
							{
								error: new NotASizeError(
									"resizeStrategy().startSize",
									Number.POSITIVE_INFINITY,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: (() => ({
										endSize: 100,
										startSize: Number.POSITIVE_INFINITY,
									})) as unknown as Exclude<
										BarStateParameters["resizeStrategy"],
										undefined
									>,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if return's start size value is greater than the maximum start size",
							{
								error: new SizeRangeError(
									"resizeStrategy().startSize",
									400,
									250,
									true,
									350,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 100,
										startSize: 400,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if sum of return's defined start and end sizes exceed available size",
							{
								error: new SizeRangeError(
									"resizeStrategy()",
									471,
									0,
									true,
									470,
									true,
								),
								parameters: {
									endMax: 600,
									endMin: 0,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 235,
										startSize: 236,
									}),
									size: 600,
									startMax: 600,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Errors if sum of return's defined start and undefined end sizes exceed available size",
							{
								error: new SizeRangeError(
									"resizeStrategy()",
									471,
									0,
									true,
									470,
									true,
								),
								parameters: {
									endMax: 600,
									endMin: 0,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: undefined,
										startSize: 471,
									}),
									size: 600,
									startMax: 600,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Errors if sum of return's undefined start and defined end sizes exceed available size",
							{
								error: new SizeRangeError(
									"resizeStrategy()",
									471,
									0,
									true,
									470,
									true,
								),
								parameters: {
									endMax: 600,
									endMin: 0,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 471,
										startSize: undefined,
									}),
									size: 600,
									startMax: 600,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if return's end size value is undefined",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: undefined,
										startSize: 300,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if return's end size value is the minimum end size",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 5,
										startSize: 300,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if return's end size value is the maximum end size",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 150,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 150,
										startSize: 300,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if return's start size value is undefined",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 100,
										startSize: undefined,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if return's start size value is the minimum start size",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 100,
										startSize: 250,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if return's start size value is the maximum start size",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 150,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 150,
										startSize: 300,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if sum of return's defined start and end sizes is the maximum available size",
							{
								error: null,
								parameters: {
									endMax: 600,
									endMin: 0,
									endSize: 150,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 235,
										startSize: 235,
									}),
									size: 600,
									startMax: 600,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if sum of return's defined start and undefined end sizes is the maximum available size",
							{
								error: null,
								parameters: {
									endMax: 600,
									endMin: 0,
									endSize: 150,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: undefined,
										startSize: 470,
									}),
									size: 600,
									startMax: 600,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if sum of return's undefined start and defined end sizes is the maximum available size",
							{
								error: null,
								parameters: {
									endMax: 600,
									endMin: 0,
									endSize: 150,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 470,
										startSize: undefined,
									}),
									size: 600,
									startMax: 600,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if sum of return's defined start and end sizes is zero",
							{
								error: null,
								parameters: {
									endMax: 600,
									endMin: 0,
									endSize: 150,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 0,
										startSize: 0,
									}),
									size: 600,
									startMax: 600,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if sum of return's defined start and undefined end sizes is zero",
							{
								error: null,
								parameters: {
									endMax: 600,
									endMin: 0,
									endSize: 150,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: undefined,
										startSize: 0,
									}),
									size: 600,
									startMax: 600,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if sum of return's undefined start and defined end sizes is zero",
							{
								error: null,
								parameters: {
									endMax: 600,
									endMin: 0,
									endSize: 150,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: 0,
										startSize: undefined,
									}),
									size: 600,
									startMax: 600,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if sum of return's undefined start and end sizes is zero",
							{
								error: null,
								parameters: {
									endMax: 600,
									endMin: 0,
									endSize: 150,
									middleMin: 130,
									resizeStrategy: () => ({
										endSize: undefined,
										startSize: undefined,
									}),
									size: 600,
									startMax: 600,
									startMin: 0,
									startSize: 300,
								},
							},
						],
					],
				],

				[
					"sideResizeStrategy",
					[
						[
							"Errors if not a function",
							{
								error: new NotAFunctionError("sideResizeStrategy", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									sideResizeStrategy: "test" as unknown as Exclude<
										BarStateParameters["sideResizeStrategy"],
										undefined
									>,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if a function",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									sideResizeStrategy: () => ({
										barSize: undefined,
										otherBarSize: undefined,
									}),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],
					],
				],

				[
					"size",
					[
						[
							"Errors if undefined",
							{
								error: new MissingPropertyError(
									"parameters",
									{
										endMax: 150,
										endMin: 5,
										endSize: 100,
										middleMin: 130,
										startMax: 350,
										startMin: 250,
										startSize: 300,
									},
									"size",
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									startMax: 350,
									startMin: 250,
									startSize: 300,
									...({} as Pick<BarStateParameters, "size">),
								},
							},
						],

						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("size", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: "test" as unknown as Exclude<
										BarStateParameters["size"],
										undefined
									>,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("size", Number.NaN),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: Number.NaN,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if negative",
							{
								error: new SizeRangeError(
									"size",
									-1,
									ZERO,
									true,
									Number.MAX_VALUE,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: -1,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError("size", Number.POSITIVE_INFINITY),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: Number.POSITIVE_INFINITY,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts zero",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 0,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts the maximum number",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: Number.MAX_VALUE,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
							},
						],
					],
				],

				[
					"startMax",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("startMax", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: "test" as unknown as Exclude<
										BarStateParameters["startMax"],
										undefined
									>,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("startMax", Number.NaN),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: Number.NaN,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if negative",
							{
								error: new SizeRangeError(
									"startMax",
									-1,
									ZERO,
									true,
									Number.MAX_VALUE,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: -1,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError("startMax", Number.POSITIVE_INFINITY),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: Number.POSITIVE_INFINITY,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMin: 250,
									startSize: 300,
								},
							},
						],

						[
							"Accepts the minimum non-zero size",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: Number.MIN_VALUE,
									startMin: 0,
									startSize: 0,
								},
							},
						],

						[
							"Accepts the maximum number",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: Number.MAX_VALUE,
									startMin: 250,
									startSize: 300,
								},
							},
						],
					],
				],

				[
					"startMin",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("startMin", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: "test" as unknown as Exclude<
										BarStateParameters["startMin"],
										undefined
									>,
									startSize: 300,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("startMin", Number.NaN),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: Number.NaN,
									startSize: 300,
								},
							},
						],

						[
							"Errors if negative",
							{
								error: new SizeRangeError(
									"startMin",
									-1,
									ZERO,
									true,
									Number.MAX_VALUE,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: -1,
									startSize: 300,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError("startMin", Number.POSITIVE_INFINITY),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: Number.POSITIVE_INFINITY,
									startSize: 300,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startSize: 300,
								},
							},
						],

						[
							"Accepts zero",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Accepts the number before the maximum number",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: Number.MAX_VALUE,
									startMin: Number.MAX_VALUE - 2 ** 970,
									startSize: Number.MAX_VALUE,
								},
							},
						],
					],
				],

				[
					"startRange",
					[
						[
							"Minimum is equal to maximum",
							{
								error: new SizeRangeError("startSize", 300, 0, true, 0, true),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 0,
									startMin: 0,
									startSize: 300,
								},
							},
						],

						[
							"Minimum is greater than maximum",
							{
								error: new IntervalExtremaError("startExtrema", 1, 0),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 0,
									startMin: 1,
									startSize: 300,
								},
							},
						],
					],
				],

				[
					"startSize",
					[
						[
							"Errors if non-numeric",
							{
								error: new NotASizeError("startSize", "test"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: "test" as unknown as Exclude<
										BarStateParameters["startSize"],
										undefined
									>,
								},
							},
						],

						[
							"Errors if NaN",
							{
								error: new NotASizeError("startSize", Number.NaN),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: Number.NaN,
								},
							},
						],

						[
							"Errors if less than the minimum value",
							{
								error: new SizeRangeError(
									"startSize",
									249,
									250,
									true,
									350,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 249,
								},
							},
						],

						[
							"Errors if greater than the maximum value",
							{
								error: new SizeRangeError(
									"startSize",
									351,
									250,
									true,
									350,
									true,
								),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 351,
								},
							},
						],

						[
							"Errors if infinite",
							{
								error: new NotASizeError("startSize", Number.POSITIVE_INFINITY),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: Number.POSITIVE_INFINITY,
								},
							},
						],

						[
							"Accepts if undefined",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
								},
							},
						],

						[
							"Accepts the minimum value",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 250,
								},
							},
						],

						[
							"Accepts the maximum value",
							{
								error: null,
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 350,
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

					const receivedError = getError(() => new BarState(parameters));

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
			const testList: readonly (readonly [
				string,
				Readonly<{
					expected: Readonly<{
						endIdeal: number;
						endMax: number;
						endMin: number;
						endSize: number | undefined;
						middleIdeal: number;
						middleMin: number;
						middleSize: number;
						size: number;
						startIdeal: number;
						startMax: number;
						startMin: number;
						startSize: number | undefined;
					}>;
					parameters: BarStateParameters;
				}>,
			])[] = [
				[
					"Sides greater than minimums",
					{
						expected: {
							endIdeal: 100,
							endMax: 150,
							endMin: 5,
							endSize: 120,
							middleIdeal: 200,
							middleMin: 130,
							middleSize: 205,
							size: 600,
							startIdeal: 300,
							startMax: 350,
							startMin: 250,
							startSize: 275,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: 120,
								startSize: 275,
							})),
							sideResizeStrategy: vi.fn(() => ({
								barSize: 110,
								otherBarSize: 115,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
					},
				],
				[
					"Sides equal to minimums",
					{
						expected: {
							endIdeal: 100,
							endMax: 150,
							endMin: 5,
							endSize: 5,
							middleIdeal: 130,
							middleMin: 130,
							middleSize: 130,
							size: 385,
							startIdeal: 300,
							startMax: 350,
							startMin: 250,
							startSize: 250,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: 5,
								startSize: 250,
							})),
							sideResizeStrategy: vi.fn(() => ({
								barSize: 110,
								otherBarSize: 115,
							})),
							size: 385,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
					},
				],
				[
					"Start collapsed and end not collapsed",
					{
						expected: {
							endIdeal: 100,
							endMax: 150,
							endMin: 5,
							endSize: 5,
							middleIdeal: 130,
							middleMin: 130,
							middleSize: 200,
							size: 205,
							startIdeal: 300,
							startMax: 350,
							startMin: 250,
							startSize: undefined,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: 5,
								startSize: undefined,
							})),
							sideResizeStrategy: vi.fn(() => ({
								barSize: 110,
								otherBarSize: 115,
							})),
							size: 205,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
					},
				],
				[
					"Start not collapsed and end collapsed",
					{
						expected: {
							endIdeal: 100,
							endMax: 150,
							endMin: 5,
							endSize: undefined,
							middleIdeal: 130,
							middleMin: 130,
							middleSize: 200,
							size: 450,
							startIdeal: 300,
							startMax: 350,
							startMin: 250,
							startSize: 250,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: undefined,
								startSize: 250,
							})),
							sideResizeStrategy: vi.fn(() => ({
								barSize: 110,
								otherBarSize: 115,
							})),
							size: 450,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
					},
				],
				[
					"Both sides collapsed, minimum size",
					{
						expected: {
							endIdeal: 100,
							endMax: 150,
							endMin: 5,
							endSize: undefined,
							middleIdeal: 130,
							middleMin: 130,
							middleSize: 200,
							size: 200,
							startIdeal: 300,
							startMax: 350,
							startMin: 250,
							startSize: undefined,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: undefined,
								startSize: undefined,
							})),
							sideResizeStrategy: vi.fn(() => ({
								barSize: 110,
								otherBarSize: 115,
							})),
							size: 200,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
					},
				],
				[
					"Both sides collapsed, less than minimum size",
					{
						expected: {
							endIdeal: 100,
							endMax: 150,
							endMin: 5,
							endSize: undefined,
							middleIdeal: 130,
							middleMin: 130,
							middleSize: 100,
							size: 100,
							startIdeal: 300,
							startMax: 350,
							startMin: 250,
							startSize: undefined,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: undefined,
								startSize: undefined,
							})),
							sideResizeStrategy: vi.fn(() => ({
								barSize: 110,
								otherBarSize: 115,
							})),
							size: 100,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const expected = testParams.expected;
				const parameters = testParams.parameters;

				const state = new BarState(parameters);

				expect(state.endIdeal).toBeCloseTo(expected.endIdeal);
				expect(state.endMax).toBeCloseTo(expected.endMax);
				expect(state.endMin).toBeCloseTo(expected.endMin);

				if (expected.endSize === undefined) {
					expect(state.endSize).toBeUndefined();
				} else {
					expect(state.endSize).toBeCloseTo(expected.endSize);
				}

				expect(state.middleIdeal).toBeCloseTo(expected.middleIdeal);
				expect(state.middleMin).toBeCloseTo(expected.middleMin);
				expect(state.middleSize).toBeCloseTo(expected.middleSize);
				expect(state.resizeStrategy).toBe(parameters.resizeStrategy);

				expect(state.resizeStrategy).toHaveBeenCalledTimes(1);
				expect(state.resizeStrategy).toHaveBeenCalledWith(state);

				expect(state.sideResizeStrategy).toBe(parameters.sideResizeStrategy);
				expect(state.sideResizeStrategy).toHaveBeenCalledTimes(0);
				expect(state.size).toBeCloseTo(expected.size);
				expect(state.startIdeal).toBeCloseTo(expected.startIdeal);
				expect(state.startMax).toBeCloseTo(expected.startMax);
				expect(state.startMin).toBeCloseTo(expected.startMin);

				if (expected.startSize === undefined) {
					expect(state.startSize).toBeUndefined();
				} else {
					expect(state.startSize).toBeCloseTo(expected.startSize);
				}
			});
		});
	});

	describe("setEndExtrema", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					parameters?: Readonly<Partial<BarStateParameters>>;
					update: Readonly<{
						endMax: number | undefined;
						endMin: number | undefined;
					}>;
				}>,
			])[] = [
				[
					"Errors if minimum is non-numeric",
					{
						error: new NotASizeError("endMin", "test"),
						update: {
							endMax: 123,
							endMin: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if minimum is NaN",
					{
						error: new NotASizeError("endMin", Number.NaN),
						update: {
							endMax: 123,
							endMin: Number.NaN as unknown as number,
						},
					},
				],

				[
					"Errors if minimum is negative infinity",
					{
						error: new NotASizeError("endMin", Number.NEGATIVE_INFINITY),
						update: {
							endMax: 123,
							endMin: Number.NEGATIVE_INFINITY,
						},
					},
				],

				[
					"Errors if minimum is positive infinity",
					{
						error: new NotASizeError("endMin", Number.POSITIVE_INFINITY),
						update: {
							endMax: 123,
							endMin: Number.POSITIVE_INFINITY as unknown as number,
						},
					},
				],

				[
					"Errors if maximum is non-numeric",
					{
						error: new NotASizeError("endMax", "test"),
						update: {
							endMin: 123,
							endMax: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if maximum is NaN",
					{
						error: new NotASizeError("endMax", Number.NaN),
						update: {
							endMin: 123,
							endMax: Number.NaN as unknown as number,
						},
					},
				],

				[
					"Errors if maximum is negative infinity",
					{
						error: new NotASizeError("endMax", Number.NEGATIVE_INFINITY),
						update: {
							endMin: 123,
							endMax: Number.NEGATIVE_INFINITY,
						},
					},
				],

				[
					"Errors if maximum is positive infinity",
					{
						error: new NotASizeError("endMax", Number.POSITIVE_INFINITY),
						update: {
							endMin: 123,
							endMax: Number.POSITIVE_INFINITY as unknown as number,
						},
					},
				],

				[
					"Errors if time min is greater than time max",
					{
						error: new IntervalExtremaError("endExtrema", 1, 0),
						update: {
							endMax: 0,
							endMin: 1,
						},
					},
				],

				[
					"Accepts if undefined",
					{
						error: null,
						update: {
							endMax: undefined,
							endMin: undefined,
						},
					},
				],

				[
					"Accepts if min is equal to max",
					{
						error: null,
						update: {
							endMax: 0,
							endMin: 0,
						},
					},
				],

				[
					"Accepts zero and the number after zero",
					{
						error: null,
						update: {
							endMax: Number.MIN_VALUE,
							endMin: ZERO,
						},
					},
				],

				[
					"Accepts the number before the maximum number and the maximum number",
					{
						error: null,
						update: {
							endMax: Number.MAX_VALUE,
							endMin: Number.MAX_VALUE - 2 ** 970,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with valid keys, both undefined",
					{
						error: null,
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: undefined,
							}),
						},
						update: {
							endMax: 100,
							endMin: 0,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with zeros",
					{
						error: null,
						parameters: {
							endMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: ZERO,
								otherBarSize: ZERO,
							}),
							startMin: ZERO,
						},
						update: {
							endMax: 100,
							endMin: 0,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with an other bar size of maximum value",
					{
						error: null,
						parameters: {
							endMax: Number.MAX_VALUE,
							middleMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: Number.MAX_VALUE,
								otherBarSize: ZERO,
							}),
							size: Number.MAX_VALUE,
							startMin: ZERO,
						},
						update: {
							endMax: 100,
							endMin: 0,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with a bar size of maximum value",
					{
						error: null,
						parameters: {
							endMin: ZERO,
							middleMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: ZERO,
								otherBarSize: Number.MAX_VALUE,
							}),
							size: Number.MAX_VALUE,
							startMax: Number.MAX_VALUE,
						},
						update: {
							endMax: 100,
							endMin: 0,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const parameters = testParams.parameters;
				const update = testParams.update;

				const state = new BarState({
					endMax: 150,
					endMin: 5,
					endSize: 100,
					middleMin: 130,
					size: 600,
					startMax: 350,
					startMin: 250,
					startSize: 300,
					...parameters,
				});

				const receivedError = getError(() => {
					state.setEndExtrema(update.endMin, update.endMax);
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
							endSize: number | undefined;
							middleSize: number;
							startSize: number | undefined;
						}>;
						parameters: BarStateParameters;
						update: Readonly<{
							endMax: number | undefined;
							endMin: number | undefined;
						}>;
					}>,
				])[],
			])[] = [
				[
					"Shrink",
					[
						[
							"Range less than ideal value",
							{
								expected: {
									endSize: 50,
									middleSize: 250,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 50,
										startSize: 300,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									endMax: 50,
									endMin: 0,
								},
							},
						],

						[
							"Range contains ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 200,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 100,
										startSize: 300,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									endMax: 125,
									endMin: 50,
								},
							},
						],

						[
							"Range greater than ideal value",
							{
								expected: {
									endSize: 150,
									middleSize: 150,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 150,
										startSize: 300,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									endMax: 200,
									endMin: 150,
								},
							},
						],
					],
				],

				[
					"Preserve",
					[
						[
							"Range less than ideal value",
							{
								expected: {
									endSize: 50,
									middleSize: 250,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 100,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi
										.fn()
										.mockReturnValueOnce({ endSize: 100, startSize: 300 })
										.mockReturnValue({ endSize: 50, startSize: 300 }),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									endMax: 50,
									endMin: 0,
								},
							},
						],

						[
							"Range contains ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 200,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 100,
										startSize: 300,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									endMax: 170,
									endMin: 25,
								},
							},
						],

						[
							"Range greater than ideal value",
							{
								expected: {
									endSize: 105,
									middleSize: 195,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 105,
										startSize: 300,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									endMax: 250,
									endMin: 105,
								},
							},
						],
					],
				],

				[
					"Expand",
					[
						[
							"Range less than ideal value",
							{
								expected: {
									endSize: 75,
									middleSize: 225,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 100,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi
										.fn()
										.mockReturnValueOnce({ endSize: 100, startSize: 300 })
										.mockReturnValue({ endSize: 75, startSize: 300 }),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									endMax: 75,
									endMin: 0,
								},
							},
						],

						[
							"Range contains ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 200,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 100,
										startSize: 300,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									endMax: 200,
									endMin: 0,
								},
							},
						],

						[
							"Range greater than ideal value",
							{
								expected: {
									endSize: 105,
									middleSize: 195,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 105,
										startSize: 300,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									endMax: 300,
									endMin: 105,
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

					const state = new BarState(parameters);
					state.setEndExtrema(update.endMin, update.endMax);

					expect(state.size).toEqual(parameters.size);
					expect(state.startMin).toEqual(parameters.startMin);
					expect(state.startMax).toEqual(parameters.startMax);
					expect(state.startSize).toEqual(parameters.startSize);
					expect(state.middleMin).toEqual(parameters.middleMin);
					expect(state.middleSize).toEqual(expected.middleSize);
					expect(state.endMin).toEqual(update.endMin);
					expect(state.endMax).toEqual(update.endMax);
					expect(state.endSize).toEqual(expected.endSize);
				});
			});
		});
	});

	describe("setEndSize", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					parameters?: Readonly<Partial<BarStateParameters>>;
					update: Readonly<{
						endSize: number | undefined;
					}>;
				}>,
			])[] = [
				[
					"Errors if non-numeric",
					{
						error: new NotASizeError("endSize", "test"),
						update: {
							endSize: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if NaN",
					{
						error: new NotASizeError("endSize", Number.NaN),
						update: {
							endSize: Number.NaN as unknown as number,
						},
					},
				],

				[
					"Errors if negative infinity",
					{
						error: new NotASizeError("endSize", Number.NEGATIVE_INFINITY),
						update: {
							endSize: Number.NEGATIVE_INFINITY,
						},
					},
				],

				[
					"Errors if positive infinity",
					{
						error: new NotASizeError("endSize", Number.POSITIVE_INFINITY),
						update: {
							endSize: Number.POSITIVE_INFINITY as unknown as number,
						},
					},
				],

				[
					"Errors if side resize strategy return is undefined",
					{
						error: new NotAnObjectError("sideResizeStrategy()", undefined),
						parameters: {
							sideResizeStrategy: () =>
								undefined as unknown as ReturnType<SideResizeStrategy>,
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return is not an object",
					{
						error: new NotAnObjectError("sideResizeStrategy()", "test"),
						parameters: {
							sideResizeStrategy: () =>
								"test" as unknown as ReturnType<SideResizeStrategy>,
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return contains an unknown key",
					{
						error: new UnknownPropertyError(
							"sideResizeStrategy()",
							{ incorrectKey: true },
							"incorrectKey",
						),
						parameters: {
							sideResizeStrategy: () =>
								({
									incorrectKey: true,
								}) as unknown as ReturnType<SideResizeStrategy>,
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return's bar size is non-numeric",
					{
						error: new NotASizeError("sideResizeStrategy().barSize", "test"),
						parameters: {
							sideResizeStrategy: () => ({
								barSize:
									"test" as unknown as ReturnType<SideResizeStrategy>["barSize"],
								otherBarSize: undefined,
							}),
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return's bar size is NaN",
					{
						error: new NotASizeError(
							"sideResizeStrategy().barSize",
							Number.NaN,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: Number.NaN,
								otherBarSize: undefined,
							}),
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return's bar size is negative infinity",
					{
						error: new NotASizeError(
							"sideResizeStrategy().barSize",
							Number.NEGATIVE_INFINITY,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: Number.NEGATIVE_INFINITY,
								otherBarSize: undefined,
							}),
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return's bar size is positive infinity",
					{
						error: new NotASizeError(
							"sideResizeStrategy().barSize",
							Number.POSITIVE_INFINITY,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: Number.POSITIVE_INFINITY,
								otherBarSize: undefined,
							}),
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return's other bar size is non-numeric",
					{
						error: new NotASizeError(
							"sideResizeStrategy().otherBarSize",
							"test",
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize:
									"test" as unknown as ReturnType<SideResizeStrategy>["otherBarSize"],
							}),
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return's other bar size is NaN",
					{
						error: new NotASizeError(
							"sideResizeStrategy().otherBarSize",
							Number.NaN,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: Number.NaN,
							}),
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return's other bar size is negative infinity",
					{
						error: new NotASizeError(
							"sideResizeStrategy().otherBarSize",
							Number.NEGATIVE_INFINITY,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: Number.NEGATIVE_INFINITY,
							}),
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return's other bar size is positive infinity",
					{
						error: new NotASizeError(
							"sideResizeStrategy().otherBarSize",
							Number.POSITIVE_INFINITY,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: Number.POSITIVE_INFINITY,
							}),
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Errors if side resize strategy return's bars are greater than available size",
					{
						error: new SizeRangeError(
							"sideResizeStrategy()",
							800,
							ZERO,
							true,
							470,
							true,
						),
						parameters: {
							endMax: 400,
							sideResizeStrategy: () => ({
								barSize: 400,
								otherBarSize: 400,
							}),
							startMax: 400,
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Accepts if undefined",
					{
						error: null,
						update: {
							endSize: undefined,
						},
					},
				],

				[
					"Accepts zero",
					{
						error: null,
						update: {
							endSize: ZERO,
						},
					},
				],

				[
					"Accepts the number before the maximum number",
					{
						error: null,
						update: {
							endSize: Number.MAX_VALUE - 2 ** 970,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with valid keys, both undefined",
					{
						error: null,
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: undefined,
							}),
						},
						update: {
							endSize: 300,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with zeros",
					{
						error: null,
						parameters: {
							endMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: ZERO,
								otherBarSize: ZERO,
							}),
							startMin: ZERO,
						},
						update: {
							endSize: 300,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with an other bar size of maximum value",
					{
						error: null,
						parameters: {
							endMax: Number.MAX_VALUE,
							middleMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: Number.MAX_VALUE,
								otherBarSize: ZERO,
							}),
							size: Number.MAX_VALUE,
							startMin: ZERO,
						},
						update: {
							endSize: 300,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with a bar size of maximum value",
					{
						error: null,
						parameters: {
							endMin: ZERO,
							middleMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: ZERO,
								otherBarSize: Number.MAX_VALUE,
							}),
							size: Number.MAX_VALUE,
							startMax: Number.MAX_VALUE,
						},
						update: {
							endSize: 300,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const parameters = testParams.parameters;
				const update = testParams.update;

				const state = new BarState({
					endMax: 150,
					endMin: 5,
					endSize: 100,
					middleMin: 130,
					size: 600,
					startMax: 350,
					startMin: 250,
					startSize: 300,
					...parameters,
				});

				const receivedError = getError(() => {
					state.setEndSize(update.endSize);
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
			const testList: readonly (readonly [
				string,
				Readonly<{
					expected: Readonly<{
						endSize: number | undefined;
						middleSize: number;
						startSize: number | undefined;
					}>;
					parameters: BarStateParameters;
					update: Readonly<{
						endSize: number | undefined;
					}>;
				}>,
			])[] = [
				[
					"Collapse",
					{
						expected: {
							endSize: undefined,
							middleSize: 300,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: undefined,
								otherBarSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							endSize: undefined,
						},
					},
				],

				[
					"Shrink to less than the minimum",
					{
						expected: {
							endSize: 5,
							middleSize: 295,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 5,
								otherBarSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							endSize: 0,
						},
					},
				],

				[
					"Shrink to equal to the minimum",
					{
						expected: {
							endSize: 5,
							middleSize: 295,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 5,
								otherBarSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							endSize: 5,
						},
					},
				],

				[
					"Shrink to greater than the minimum",
					{
						expected: {
							endSize: 50,
							middleSize: 250,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 50,
								otherBarSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							endSize: 50,
						},
					},
				],

				[
					"No change",
					{
						expected: {
							endSize: 100,
							middleSize: 200,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 100,
								otherBarSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							endSize: 100,
						},
					},
				],

				[
					"Expand to less than the maximum",
					{
						expected: {
							endSize: 125,
							middleSize: 175,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 125,
								otherBarSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							endSize: 125,
						},
					},
				],

				[
					"Expand to equal to the maximum",
					{
						expected: {
							endSize: 150,
							middleSize: 150,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 150,
								otherBarSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							endSize: 150,
						},
					},
				],

				[
					"Expand to greater than the maximum",
					{
						expected: {
							endSize: 150,
							middleSize: 150,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 150,
								otherBarSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							endSize: 200,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const expected = testParams.expected;
				const parameters = testParams.parameters;
				const update = testParams.update;

				const state = new BarState(parameters);
				state.setEndSize(update.endSize);

				expect(state.size).toEqual(parameters.size);
				expect(state.startMin).toEqual(parameters.startMin);
				expect(state.startMax).toEqual(parameters.startMax);
				expect(state.startSize).toEqual(expected.startSize);
				expect(state.middleMin).toEqual(parameters.middleMin);
				expect(state.middleSize).toEqual(expected.middleSize);
				expect(state.endMin).toEqual(parameters.endMin);
				expect(state.endMax).toEqual(parameters.endMax);
				expect(state.endSize).toEqual(expected.endSize);
			});
		});
	});

	describe("setMiddleMin", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					parameters?: Readonly<Partial<BarStateParameters>>;
					update: Readonly<{
						middleMin: number | undefined;
					}>;
				}>,
			])[] = [
				[
					"Errors if non-numeric",
					{
						error: new NotASizeError("middleMin", "test"),
						update: {
							middleMin: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if NaN",
					{
						error: new NotASizeError("middleMin", Number.NaN),
						update: {
							middleMin: Number.NaN as unknown as number,
						},
					},
				],

				[
					"Errors if negative infinity",
					{
						error: new NotASizeError("middleMin", Number.NEGATIVE_INFINITY),
						update: {
							middleMin: Number.NEGATIVE_INFINITY,
						},
					},
				],

				[
					"Errors if positive infinity",
					{
						error: new NotASizeError("middleMin", Number.POSITIVE_INFINITY),
						update: {
							middleMin: Number.POSITIVE_INFINITY as unknown as number,
						},
					},
				],

				[
					"Accepts if undefined",
					{
						error: null,
						update: {
							middleMin: undefined,
						},
					},
				],

				[
					"Accepts zero",
					{
						error: null,
						update: {
							middleMin: ZERO,
						},
					},
				],

				[
					"Accepts the number before the maximum number",
					{
						error: null,
						update: {
							middleMin: Number.MAX_VALUE - 2 ** 970,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with valid keys, both undefined",
					{
						error: null,
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: undefined,
							}),
						},
						update: {
							middleMin: 300,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with zeros",
					{
						error: null,
						parameters: {
							endMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: ZERO,
								otherBarSize: ZERO,
							}),
							startMin: ZERO,
						},
						update: {
							middleMin: 300,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with an other bar size of maximum value",
					{
						error: null,
						parameters: {
							endMax: Number.MAX_VALUE,
							middleMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: Number.MAX_VALUE,
								otherBarSize: ZERO,
							}),
							size: Number.MAX_VALUE,
							startMin: ZERO,
						},
						update: {
							middleMin: 300,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with a bar size of maximum value",
					{
						error: null,
						parameters: {
							endMin: ZERO,
							middleMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: ZERO,
								otherBarSize: Number.MAX_VALUE,
							}),
							size: Number.MAX_VALUE,
							startMax: Number.MAX_VALUE,
						},
						update: {
							middleMin: 300,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const parameters = testParams.parameters;
				const update = testParams.update;

				const state = new BarState({
					endMax: 150,
					endMin: 5,
					endSize: 100,
					middleMin: 130,
					size: 600,
					startMax: 350,
					startMin: 250,
					startSize: 300,
					...parameters,
				});

				const receivedError = getError(() => {
					state.setMiddleMin(update.middleMin);
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
			const testList: readonly (readonly [
				string,
				Readonly<{
					expected: Readonly<{
						endSize: number | undefined;
						middleSize: number;
						startSize: number | undefined;
					}>;
					parameters: BarStateParameters;
					update: Readonly<{
						middleMin: number | undefined;
					}>;
				}>,
			])[] = [
				[
					"Shrink to undefined",
					{
						expected: {
							endSize: 100,
							middleSize: 200,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: 100,
								startSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							middleMin: undefined,
						},
					},
				],

				[
					"Shrink to defined",
					{
						expected: {
							endSize: 100,
							middleSize: 200,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: 100,
								startSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							middleMin: 50,
						},
					},
				],

				[
					"No change from undefined",
					{
						expected: {
							endSize: 100,
							middleSize: 200,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							resizeStrategy: vi.fn(() => ({
								endSize: 100,
								startSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							middleMin: undefined,
						},
					},
				],

				[
					"No change from defined",
					{
						expected: {
							endSize: 100,
							middleSize: 200,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: 100,
								startSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							middleMin: 130,
						},
					},
				],

				[
					"No change from undefined with collapsed sides",
					{
						expected: {
							endSize: 100,
							middleSize: 200,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							resizeStrategy: vi.fn(() => ({
								endSize: 100,
								startSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
						},
						update: {
							middleMin: undefined,
						},
					},
				],

				[
					"Expand from undefined",
					{
						expected: {
							endSize: 100,
							middleSize: 200,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							resizeStrategy: vi.fn(() => ({
								endSize: 100,
								startSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							middleMin: 100,
						},
					},
				],

				[
					"Expand from defined",
					{
						expected: {
							endSize: 100,
							middleSize: 200,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: 100,
								startSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							middleMin: 200,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const expected = testParams.expected;
				const parameters = testParams.parameters;
				const update = testParams.update;

				const state = new BarState(parameters);
				state.setMiddleMin(update.middleMin);

				expect(state.size).toEqual(parameters.size);
				expect(state.startMin).toEqual(parameters.startMin);
				expect(state.startMax).toEqual(parameters.startMax);
				expect(state.startSize).toEqual(expected.startSize);
				expect(state.middleMin).toEqual(update.middleMin ?? ZERO);
				expect(state.middleSize).toEqual(expected.middleSize);
				expect(state.endMin).toEqual(parameters.endMin);
				expect(state.endMax).toEqual(parameters.endMax);
				expect(state.endSize).toEqual(expected.endSize);
			});
		});
	});

	describe("setResizeStrategy", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					update: Readonly<{
						resizeStrategy: ResizeStrategy | undefined;
					}>;
				}>,
			])[] = [
				[
					"Errors if not a function",
					{
						error: new NotAFunctionError("resizeStrategy", "test"),
						update: {
							resizeStrategy: "test" as unknown as Exclude<
								BarStateParameters["resizeStrategy"],
								undefined
							>,
						},
					},
				],

				[
					"Accepts if undefined",
					{
						error: null,
						update: {
							resizeStrategy: undefined,
						},
					},
				],

				[
					"Accepts if a function",
					{
						error: null,
						update: {
							resizeStrategy: () => ({
								endSize: undefined,
								startSize: undefined,
							}),
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const update = testParams.update;

				const state = new BarState({
					endMax: 150,
					endMin: 5,
					endSize: 100,
					middleMin: 130,
					size: 600,
					startMax: 350,
					startMin: 250,
					startSize: 300,
				});

				const receivedError = getError(() => {
					state.setResizeStrategy(update.resizeStrategy);
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
			const testList: readonly (readonly [
				string,
				Readonly<{
					update: Readonly<{
						resizeStrategy: ResizeStrategy | undefined;
					}>;
				}>,
			])[] = [
				[
					"Undefined falls back to the default strategy",
					{
						update: {
							resizeStrategy: undefined,
						},
					},
				],

				[
					"Defined function",
					{
						update: {
							resizeStrategy: vi.fn(() => ({
								endSize: 100,
								startSize: 300,
							})),
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const update = testParams.update;
				const parameters = {
					endMax: 150,
					endMin: 5,
					endSize: 100,
					middleMin: 130,
					size: 600,
					startMax: 350,
					startMin: 250,
					startSize: 300,
				};

				const state = new BarState(parameters);
				vi.clearAllMocks();
				state.setResizeStrategy(update.resizeStrategy);

				expect(state.size).toEqual(parameters.size);
				expect(state.startMax).toEqual(parameters.startMax);
				expect(state.startSize).toEqual(parameters.startSize);
				expect(state.middleMin).toEqual(parameters.middleMin);
				expect(state.middleSize).toEqual(200);
				expect(state.endMin).toEqual(parameters.endMin);
				expect(state.endMax).toEqual(parameters.endMax);
				expect(state.endSize).toEqual(parameters.endSize);

				expect(state.resizeStrategy).toEqual(
					update.resizeStrategy ?? mockedResizeStrategyDefault,
				);
				expect(state.resizeStrategy).toHaveBeenCalledTimes(1);
				expect(state.resizeStrategy).toHaveBeenCalledWith(state);
			});
		});
	});

	describe("setSideResizeStrategy", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					update: Readonly<{
						sideResizeStrategy: SideResizeStrategy | undefined;
					}>;
				}>,
			])[] = [
				[
					"Errors if not a function",
					{
						error: new NotAFunctionError("sideResizeStrategy", "test"),
						update: {
							sideResizeStrategy: "test" as unknown as Exclude<
								BarStateParameters["sideResizeStrategy"],
								undefined
							>,
						},
					},
				],

				[
					"Accepts if undefined",
					{
						error: null,
						update: {
							sideResizeStrategy: undefined,
						},
					},
				],

				[
					"Accepts if a function",
					{
						error: null,
						update: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: undefined,
							}),
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const update = testParams.update;

				const state = new BarState({
					endMax: 150,
					endMin: 5,
					endSize: 100,
					middleMin: 130,
					size: 600,
					startMax: 350,
					startMin: 250,
					startSize: 300,
				});

				const receivedError = getError(() => {
					state.setSideResizeStrategy(update.sideResizeStrategy);
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
			const testList: readonly (readonly [
				string,
				Readonly<{
					update: Readonly<{
						sideResizeStrategy: SideResizeStrategy | undefined;
					}>;
				}>,
			])[] = [
				[
					"Undefined falls back to the default strategy",
					{
						update: {
							sideResizeStrategy: undefined,
						},
					},
				],
				[
					"Defined function",
					{
						update: {
							sideResizeStrategy: vi.fn(() => ({
								barSize: undefined,
								otherBarSize: undefined,
							})),
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const update = testParams.update;
				const parameters = {
					endMax: 150,
					endMin: 5,
					endSize: 100,
					middleMin: 130,
					size: 600,
					startMax: 350,
					startMin: 250,
					startSize: 300,
				};
				const expected = {
					middleSize: 200,
				};

				const state = new BarState(parameters);
				vi.clearAllMocks();
				state.setSideResizeStrategy(update.sideResizeStrategy);

				expect(state.size).toEqual(parameters.size);
				expect(state.startMax).toEqual(parameters.startMax);
				expect(state.startSize).toEqual(parameters.startSize);
				expect(state.middleMin).toEqual(parameters.middleMin);
				expect(state.middleSize).toEqual(expected.middleSize);
				expect(state.endMin).toEqual(parameters.endMin);
				expect(state.endMax).toEqual(parameters.endMax);
				expect(state.endSize).toEqual(parameters.endSize);

				expect(state.sideResizeStrategy).toEqual(
					update.sideResizeStrategy ?? mockedSideResizeStrategyDefault,
				);
				expect(state.sideResizeStrategy).toHaveBeenCalledTimes(0);
			});
		});
	});

	describe("setSize", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					update: Readonly<{
						size: number;
					}>;
				}>,
			])[] = [
				[
					"Errors if undefined",
					{
						error: new NotASizeError("size", undefined),
						update: {
							size: undefined as unknown as number,
						},
					},
				],

				[
					"Errors if non-numeric",
					{
						error: new NotASizeError("size", "test"),
						update: {
							size: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if NaN",
					{
						error: new NotASizeError("size", Number.NaN),
						update: {
							size: Number.NaN as unknown as number,
						},
					},
				],

				[
					"Errors if negative infinity",
					{
						error: new NotASizeError("size", Number.NEGATIVE_INFINITY),
						update: {
							size: Number.NEGATIVE_INFINITY,
						},
					},
				],

				[
					"Errors if positive infinity",
					{
						error: new NotASizeError("size", Number.POSITIVE_INFINITY),
						update: {
							size: Number.POSITIVE_INFINITY as unknown as number,
						},
					},
				],

				[
					"Accepts zero",
					{
						error: null,
						update: {
							size: ZERO,
						},
					},
				],

				[
					"Accepts the number before the maximum number",
					{
						error: null,
						update: {
							size: Number.MAX_VALUE - 2 ** 970,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const update = testParams.update;

				const state = new BarState({
					endMax: 150,
					endMin: 5,
					endSize: 100,
					middleMin: 130,
					size: 600,
					startMax: 350,
					startMin: 250,
					startSize: 300,
				});

				const receivedError = getError(() => {
					state.setSize(update.size);
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
			const testList: readonly (readonly [
				string,
				Readonly<{
					expected: Readonly<{
						endSize: number | undefined;
						middleSize: number;
						startSize: number | undefined;
					}>;
					parameters: BarStateParameters;
					update: Readonly<{
						size: number;
					}>;
				}>,
			])[] = [
				[
					"Shrink to less than the minimum of the middle",
					{
						expected: {
							endSize: undefined,
							middleSize: 100,
							startSize: undefined,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: undefined,
								startSize: undefined,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							size: 100,
						},
					},
				],

				[
					"Shrink to equal to the minimum of the middle",
					{
						expected: {
							endSize: undefined,
							middleSize: 130,
							startSize: undefined,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: undefined,
								startSize: undefined,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							size: 130,
						},
					},
				],

				[
					"Shrink to greater than the minimum of the middle",
					{
						expected: {
							endSize: undefined,
							middleSize: 300,
							startSize: undefined,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: undefined,
								startSize: undefined,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							size: 300,
						},
					},
				],

				[
					"Shrink to equal to the minimum of the middle and the sides",
					{
						expected: {
							endSize: 5,
							middleSize: 130,
							startSize: 250,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: 5,
								startSize: 250,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							size: 385,
						},
					},
				],

				[
					"Shrink to greater than the minimum of the middle and the sides",
					{
						expected: {
							endSize: 20,
							middleSize: 130,
							startSize: 250,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: 20,
								startSize: 250,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							size: 400,
						},
					},
				],

				[
					"No change",
					{
						expected: {
							endSize: 100,
							middleSize: 200,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi.fn(() => ({
								endSize: 100,
								startSize: 300,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							size: 600,
						},
					},
				],

				[
					"Expand",
					{
						expected: {
							endSize: 150,
							middleSize: 500,
							startSize: 350,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							resizeStrategy: vi
								.fn()
								.mockReturnValueOnce({ endSize: 100, startSize: 300 })
								.mockReturnValue({ endSize: 150, startSize: 350 }),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							size: 1000,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const expected = testParams.expected;
				const parameters = testParams.parameters;
				const update = testParams.update;

				const state = new BarState(parameters);
				vi.clearAllMocks();
				state.setSize(update.size);

				expect(state.size).toEqual(update.size);
				expect(state.startMin).toEqual(parameters.startMin);
				expect(state.startMax).toEqual(parameters.startMax);
				expect(state.startSize).toEqual(expected.startSize);
				expect(state.middleMin).toEqual(parameters.middleMin);
				expect(state.middleSize).toEqual(expected.middleSize);
				expect(state.endMin).toEqual(parameters.endMin);
				expect(state.endMax).toEqual(parameters.endMax);
				expect(state.endSize).toEqual(expected.endSize);

				expect(state.resizeStrategy).toEqual(
					parameters.resizeStrategy ?? mockedResizeStrategyDefault,
				);
				expect(parameters.resizeStrategy).toHaveBeenCalledTimes(1);
				expect(parameters.resizeStrategy).toHaveBeenCalledWith(state);
			});
		});
	});

	describe("setStartExtrema", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					parameters?: Readonly<Partial<BarStateParameters>>;
					update: Readonly<{
						startMax: number | undefined;
						startMin: number | undefined;
					}>;
				}>,
			])[] = [
				[
					"Errors if minimum is non-numeric",
					{
						error: new NotASizeError("startMin", "test"),
						update: {
							startMax: 123,
							startMin: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if minimum is NaN",
					{
						error: new NotASizeError("startMin", Number.NaN),
						update: {
							startMax: 123,
							startMin: Number.NaN as unknown as number,
						},
					},
				],

				[
					"Errors if minimum is negative infinity",
					{
						error: new NotASizeError("startMin", Number.NEGATIVE_INFINITY),
						update: {
							startMax: 123,
							startMin: Number.NEGATIVE_INFINITY,
						},
					},
				],

				[
					"Errors if minimum is positive infinity",
					{
						error: new NotASizeError("startMin", Number.POSITIVE_INFINITY),
						update: {
							startMax: 123,
							startMin: Number.POSITIVE_INFINITY as unknown as number,
						},
					},
				],

				[
					"Errors if maximum is non-numeric",
					{
						error: new NotASizeError("startMax", "test"),
						update: {
							startMin: 123,
							startMax: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if maximum is NaN",
					{
						error: new NotASizeError("startMax", Number.NaN),
						update: {
							startMin: 123,
							startMax: Number.NaN as unknown as number,
						},
					},
				],

				[
					"Errors if maximum is negative infinity",
					{
						error: new NotASizeError("startMax", Number.NEGATIVE_INFINITY),
						update: {
							startMin: 123,
							startMax: Number.NEGATIVE_INFINITY,
						},
					},
				],

				[
					"Errors if maximum is positive infinity",
					{
						error: new NotASizeError("startMax", Number.POSITIVE_INFINITY),
						update: {
							startMin: 123,
							startMax: Number.POSITIVE_INFINITY as unknown as number,
						},
					},
				],

				[
					"Errors if time min is greater than time max",
					{
						error: new IntervalExtremaError("startExtrema", 1, 0),
						update: {
							startMax: 0,
							startMin: 1,
						},
					},
				],

				[
					"Accepts if undefined",
					{
						error: null,
						update: {
							startMax: undefined,
							startMin: undefined,
						},
					},
				],

				[
					"Accepts if min is equal to max",
					{
						error: null,
						update: {
							startMax: 0,
							startMin: 0,
						},
					},
				],

				[
					"Accepts zero and the number after zero",
					{
						error: null,
						update: {
							startMax: Number.MIN_VALUE,
							startMin: ZERO,
						},
					},
				],

				[
					"Accepts the number before the maximum number and the maximum number",
					{
						error: null,
						update: {
							startMax: Number.MAX_VALUE,
							startMin: Number.MAX_VALUE - 2 ** 970,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with valid keys, both undefined",
					{
						error: null,
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: undefined,
							}),
						},
						update: {
							startMax: 100,
							startMin: 0,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with zeros",
					{
						error: null,
						parameters: {
							endMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: ZERO,
								otherBarSize: ZERO,
							}),
							startMin: ZERO,
						},
						update: {
							startMax: 100,
							startMin: 0,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with an other bar size of maximum value",
					{
						error: null,
						parameters: {
							endMax: Number.MAX_VALUE,
							middleMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: Number.MAX_VALUE,
								otherBarSize: ZERO,
							}),
							size: Number.MAX_VALUE,
							startMin: ZERO,
						},
						update: {
							startMax: 100,
							startMin: 0,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with a bar size of maximum value",
					{
						error: null,
						parameters: {
							endMin: ZERO,
							middleMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: ZERO,
								otherBarSize: Number.MAX_VALUE,
							}),
							size: Number.MAX_VALUE,
							startMax: Number.MAX_VALUE,
						},
						update: {
							startMax: 100,
							startMin: 0,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const parameters = testParams.parameters;
				const update = testParams.update;

				const state = new BarState({
					endMax: 150,
					endMin: 5,
					endSize: 100,
					middleMin: 130,
					size: 600,
					startMax: 350,
					startMin: 250,
					startSize: 300,
					...parameters,
				});

				const receivedError = getError(() => {
					state.setStartExtrema(update.startMin, update.startMax);
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
							endSize: number | undefined;
							middleSize: number;
							startSize: number | undefined;
						}>;
						parameters: BarStateParameters;
						update: Readonly<{
							startMax: number | undefined;
							startMin: number | undefined;
						}>;
					}>,
				])[],
			])[] = [
				[
					"Shrink",
					[
						[
							"Range less than ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 450,
									startSize: 50,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi
										.fn()
										.mockReturnValueOnce({ endSize: 100, startSize: 300 })
										.mockReturnValue({ endSize: 100, startSize: 50 }),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									startMax: 50,
									startMin: 0,
								},
							},
						],

						[
							"Range contains ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 200,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 100,
										startSize: 300,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									startMax: 325,
									startMin: 275,
								},
							},
						],

						[
							"Range greater than ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 195,
									startSize: 305,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 100,
										startSize: 305,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									startMax: 350,
									startMin: 305,
								},
							},
						],
					],
				],

				[
					"Preserve",
					[
						[
							"Range less than ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 400,
									startSize: 100,
								},
								parameters: {
									endMax: 150,
									endMin: 100,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi
										.fn()
										.mockReturnValueOnce({ endSize: 100, startSize: 300 })
										.mockReturnValue({ endSize: 100, startSize: 100 }),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									startMax: 100,
									startMin: 0,
								},
							},
						],

						[
							"Range contains ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 200,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 100,
										startSize: 300,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									startMax: 300,
									startMin: 200,
								},
							},
						],

						[
							"Range greater than ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 195,
									startSize: 305,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 100,
										startSize: 305,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									startMax: 405,
									startMin: 305,
								},
							},
						],
					],
				],

				[
					"Expand",
					[
						[
							"Range less than ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 300,
									startSize: 200,
								},
								parameters: {
									endMax: 150,
									endMin: 100,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi
										.fn()
										.mockReturnValueOnce({ endSize: 100, startSize: 300 })
										.mockReturnValue({ endSize: 100, startSize: 200 }),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									startMax: 200,
									startMin: 0,
								},
							},
						],

						[
							"Range contains ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 200,
									startSize: 300,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 100,
										startSize: 300,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									startMax: 400,
									startMin: 200,
								},
							},
						],

						[
							"Range greater than ideal value",
							{
								expected: {
									endSize: 100,
									middleSize: 195,
									startSize: 305,
								},
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									resizeStrategy: vi.fn(() => ({
										endSize: 100,
										startSize: 305,
									})),
									size: 600,
									startMax: 350,
									startMin: 250,
									startSize: 300,
								},
								update: {
									startMax: 505,
									startMin: 305,
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

					const state = new BarState(parameters);
					state.setStartExtrema(update.startMin, update.startMax);

					expect(state.size).toEqual(parameters.size);
					expect(state.startMin).toEqual(update.startMin);
					expect(state.startMax).toEqual(update.startMax);
					expect(state.startSize).toEqual(expected.startSize);
					expect(state.middleMin).toEqual(parameters.middleMin);
					expect(state.middleSize).toEqual(expected.middleSize);
					expect(state.endMin).toEqual(parameters.endMin);
					expect(state.endMax).toEqual(parameters.endMax);
					expect(state.endSize).toEqual(expected.endSize);
				});
			});
		});
	});

	describe("setStartSize", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					parameters?: Readonly<Partial<BarStateParameters>>;
					update: Readonly<{
						startSize: number | undefined;
					}>;
				}>,
			])[] = [
				[
					"Errors if non-numeric",
					{
						error: new NotASizeError("startSize", "test"),
						update: {
							startSize: "test" as unknown as number,
						},
					},
				],

				[
					"Errors if NaN",
					{
						error: new NotASizeError("startSize", Number.NaN),
						update: {
							startSize: Number.NaN as unknown as number,
						},
					},
				],

				[
					"Errors if negative infinity",
					{
						error: new NotASizeError("startSize", Number.NEGATIVE_INFINITY),
						update: {
							startSize: Number.NEGATIVE_INFINITY,
						},
					},
				],

				[
					"Errors if positive infinity",
					{
						error: new NotASizeError("startSize", Number.POSITIVE_INFINITY),
						update: {
							startSize: Number.POSITIVE_INFINITY as unknown as number,
						},
					},
				],

				[
					"Errors if side resize strategy return is undefined",
					{
						error: new NotAnObjectError("sideResizeStrategy()", undefined),
						parameters: {
							sideResizeStrategy: () =>
								undefined as unknown as ReturnType<SideResizeStrategy>,
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return is not an object",
					{
						error: new NotAnObjectError("sideResizeStrategy()", "test"),
						parameters: {
							sideResizeStrategy: () =>
								"test" as unknown as ReturnType<SideResizeStrategy>,
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return contains an unknown key",
					{
						error: new UnknownPropertyError(
							"sideResizeStrategy()",
							{ incorrectKey: true },
							"incorrectKey",
						),
						parameters: {
							sideResizeStrategy: () =>
								({
									incorrectKey: true,
								}) as unknown as ReturnType<SideResizeStrategy>,
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return's bar size is non-numeric",
					{
						error: new NotASizeError("sideResizeStrategy().barSize", "test"),
						parameters: {
							sideResizeStrategy: () => ({
								barSize:
									"test" as unknown as ReturnType<SideResizeStrategy>["barSize"],
								otherBarSize: undefined,
							}),
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return's bar size is NaN",
					{
						error: new NotASizeError(
							"sideResizeStrategy().barSize",
							Number.NaN,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: Number.NaN,
								otherBarSize: undefined,
							}),
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return's bar size is negative infinity",
					{
						error: new NotASizeError(
							"sideResizeStrategy().barSize",
							Number.NEGATIVE_INFINITY,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: Number.NEGATIVE_INFINITY,
								otherBarSize: undefined,
							}),
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return's bar size is positive infinity",
					{
						error: new NotASizeError(
							"sideResizeStrategy().barSize",
							Number.POSITIVE_INFINITY,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: Number.POSITIVE_INFINITY,
								otherBarSize: undefined,
							}),
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return's other bar size is non-numeric",
					{
						error: new NotASizeError(
							"sideResizeStrategy().otherBarSize",
							"test",
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize:
									"test" as unknown as ReturnType<SideResizeStrategy>["otherBarSize"],
							}),
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return's other bar size is NaN",
					{
						error: new NotASizeError(
							"sideResizeStrategy().otherBarSize",
							Number.NaN,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: Number.NaN,
							}),
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return's other bar size is negative infinity",
					{
						error: new NotASizeError(
							"sideResizeStrategy().otherBarSize",
							Number.NEGATIVE_INFINITY,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: Number.NEGATIVE_INFINITY,
							}),
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return's other bar size is positive infinity",
					{
						error: new NotASizeError(
							"sideResizeStrategy().otherBarSize",
							Number.POSITIVE_INFINITY,
						),
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: Number.POSITIVE_INFINITY,
							}),
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Errors if side resize strategy return's bars are greater than available size",
					{
						error: new SizeRangeError(
							"sideResizeStrategy()",
							800,
							ZERO,
							true,
							470,
							true,
						),
						parameters: {
							endMax: 400,
							sideResizeStrategy: () => ({
								barSize: 400,
								otherBarSize: 400,
							}),
							startMax: 400,
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Accepts if undefined",
					{
						error: null,
						update: {
							startSize: undefined,
						},
					},
				],

				[
					"Accepts zero",
					{
						error: null,
						update: {
							startSize: ZERO,
						},
					},
				],

				[
					"Accepts the maximum number",
					{
						error: null,
						update: {
							startSize: Number.MAX_VALUE,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with valid keys, both undefined",
					{
						error: null,
						parameters: {
							sideResizeStrategy: () => ({
								barSize: undefined,
								otherBarSize: undefined,
							}),
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with zeros",
					{
						error: null,
						parameters: {
							endMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: ZERO,
								otherBarSize: ZERO,
							}),
							startMin: ZERO,
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with a bar size of maximum value",
					{
						error: null,
						parameters: {
							endMin: ZERO,
							middleMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: Number.MAX_VALUE,
								otherBarSize: ZERO,
							}),
							size: Number.MAX_VALUE,
							startMax: Number.MAX_VALUE,
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Accepts if side resize strategy return is an object with an other bar size of maximum value",
					{
						error: null,
						parameters: {
							endMax: Number.MAX_VALUE,
							middleMin: ZERO,
							sideResizeStrategy: () => ({
								barSize: ZERO,
								otherBarSize: Number.MAX_VALUE,
							}),
							size: Number.MAX_VALUE,
							startMin: ZERO,
						},
						update: {
							startSize: 300,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const error = testParams.error;
				const update = testParams.update;
				const parameters = testParams.parameters;

				const state = new BarState({
					endMax: 150,
					endMin: 5,
					endSize: 100,
					middleMin: 130,
					size: 600,
					startMax: 350,
					startMin: 250,
					startSize: 300,
					...parameters,
				});

				const receivedError = getError(() => {
					state.setStartSize(update.startSize);
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
			const testList: readonly (readonly [
				string,
				Readonly<{
					expected: Readonly<{
						endSize: number | undefined;
						middleSize: number;
						startSize: number | undefined;
					}>;
					parameters: BarStateParameters;
					update: Readonly<{
						startSize: number | undefined;
					}>;
				}>,
			])[] = [
				[
					"Collapse",
					{
						expected: {
							endSize: 100,
							middleSize: 500,
							startSize: undefined,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: undefined,
								otherBarSize: 100,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: undefined,
						},
					},
				],

				[
					"Shrink to less than the minimum",
					{
						expected: {
							endSize: 100,
							middleSize: 250,
							startSize: 250,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 250,
								otherBarSize: 100,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 0,
						},
					},
				],

				[
					"Shrink to equal to the minimum",
					{
						expected: {
							endSize: 100,
							middleSize: 250,
							startSize: 250,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 250,
								otherBarSize: 100,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 250,
						},
					},
				],

				[
					"Shrink to greater than the minimum",
					{
						expected: {
							endSize: 100,
							middleSize: 225,
							startSize: 275,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 275,
								otherBarSize: 100,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 275,
						},
					},
				],

				[
					"No change",
					{
						expected: {
							endSize: 100,
							middleSize: 200,
							startSize: 300,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 300,
								otherBarSize: 100,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 300,
						},
					},
				],

				[
					"Expand to less than the maximum",
					{
						expected: {
							endSize: 100,
							middleSize: 175,
							startSize: 325,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 325,
								otherBarSize: 100,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 325,
						},
					},
				],

				[
					"Expand to equal to the maximum",
					{
						expected: {
							endSize: 100,
							middleSize: 150,
							startSize: 350,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 350,
								otherBarSize: 100,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 350,
						},
					},
				],

				[
					"Expand to greater than the maximum",
					{
						expected: {
							endSize: 100,
							middleSize: 150,
							startSize: 350,
						},
						parameters: {
							endMax: 150,
							endMin: 5,
							endSize: 100,
							middleMin: 130,
							sideResizeStrategy: vi.fn(() => ({
								barSize: 350,
								otherBarSize: 100,
							})),
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 400,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const expected = testParams.expected;
				const parameters = testParams.parameters;
				const update = testParams.update;

				const state = new BarState(parameters);
				state.setStartSize(update.startSize);

				expect(state.size).toEqual(parameters.size);
				expect(state.startMin).toEqual(parameters.startMin);
				expect(state.startMax).toEqual(parameters.startMax);
				expect(state.startSize).toEqual(expected.startSize);
				expect(state.middleMin).toEqual(parameters.middleMin);
				expect(state.middleSize).toEqual(expected.middleSize);
				expect(state.endMin).toEqual(parameters.endMin);
				expect(state.endMax).toEqual(parameters.endMax);
				expect(state.endSize).toEqual(expected.endSize);
			});
		});
	});
});
