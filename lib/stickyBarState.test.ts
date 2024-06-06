import { describe, expect, test, vi } from "vitest";

import { NotAFunctionError } from "./function";
import {
	IntervalExtremaError,
	NotASizeError,
	SizeRangeError,
	ZERO,
} from "./math";
import {
	MissingPropertyError,
	NotAnObjectError,
	UnknownPropertyError,
} from "./object";
import {
	type SideResizeStrategy,
	StickyBarState,
	type StickyBarStateParameters,
} from "./stickyBarState";
import { getError } from "./testUtils";

describe("StickyBarState", () => {
	describe("Constructor", () => {
		describe("Input Validation", () => {
			const testGroups: readonly (readonly [
				string,
				readonly (readonly [
					string,
					Readonly<{
						error: Readonly<Error> | null;
						parameters: StickyBarStateParameters;
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
								parameters: undefined as unknown as StickyBarStateParameters,
							},
						],

						[
							"Errors if not an object",
							{
								error: new NotAnObjectError("parameters", 123),
								parameters: 123 as unknown as StickyBarStateParameters,
							},
						],

						[
							"Contains an unknown key",
							{
								error: new UnknownPropertyError("parameters", "incorrectKey"),
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
										StickyBarStateParameters["endMax"],
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
										StickyBarStateParameters["endMin"],
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
								error: new IntervalExtremaError("endExtrema", 0, 0),
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
										StickyBarStateParameters["endSize"],
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
										StickyBarStateParameters["middleMin"],
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
							"Accepts the number before the maximum number",
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
										StickyBarStateParameters["resizeStrategy"],
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
										StickyBarStateParameters["resizeStrategy"],
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
										StickyBarStateParameters["resizeStrategy"],
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
										StickyBarStateParameters["resizeStrategy"],
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
										StickyBarStateParameters["resizeStrategy"],
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
										StickyBarStateParameters["resizeStrategy"],
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
										StickyBarStateParameters["sideResizeStrategy"],
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
					],
				],

				[
					"size",
					[
						[
							"Errors if undefined",
							{
								error: new MissingPropertyError("parameters", "size"),
								parameters: {
									endMax: 150,
									endMin: 5,
									endSize: 100,
									middleMin: 130,
									startMax: 350,
									startMin: 250,
									startSize: 300,
									...({} as Pick<StickyBarStateParameters, "size">),
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
										StickyBarStateParameters["size"],
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
										StickyBarStateParameters["startMax"],
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
										StickyBarStateParameters["startMin"],
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
								error: new IntervalExtremaError("startExtrema", 0, 0),
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
										StickyBarStateParameters["startSize"],
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

					const receivedError = getError(() => new StickyBarState(parameters));

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
						resizeStrategyCalled: boolean;
						size: number;
						sizeIdeal: number;
						startIdeal: number;
						startMax: number;
						startMin: number;
						startSize: number | undefined;
					}>;
					parameters: StickyBarStateParameters;
				}>,
			])[] = [
				[
					"Greater than minimums",
					{
						expected: {
							endIdeal: 100,
							endMax: 150,
							endMin: 5,
							endSize: 120,
							middleIdeal: 200,
							middleMin: 130,
							middleSize: 205,
							resizeStrategyCalled: true,
							size: 600,
							sizeIdeal: 600,
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
					"Equal to minimums",
					{
						expected: {
							endIdeal: 100,
							endMax: 150,
							endMin: 5,
							endSize: 5,
							middleIdeal: 130,
							middleMin: 130,
							middleSize: 130,
							resizeStrategyCalled: false,
							size: 385,
							sizeIdeal: 385,
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
					"Less than minimums",
					{
						expected: {
							endIdeal: 100,
							endMax: 150,
							endMin: 5,
							endSize: undefined,
							middleIdeal: 130,
							middleMin: 130,
							middleSize: 200,
							resizeStrategyCalled: false,
							size: 200,
							sizeIdeal: 200,
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
								endSize: 120,
								startSize: 275,
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
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const expected = testParams.expected;
				const parameters = testParams.parameters;

				const state = new StickyBarState(parameters);

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

				if (expected.resizeStrategyCalled) {
					expect(state.resizeStrategy).toHaveBeenCalledTimes(1);
					expect(state.resizeStrategy).toHaveBeenCalledWith(
						state,
						parameters.size,
					);
				} else {
					expect(state.resizeStrategy).toHaveBeenCalledTimes(0);
				}

				expect(state.sideResizeStrategy).toBe(parameters.sideResizeStrategy);
				expect(state.sideResizeStrategy).toHaveBeenCalledTimes(0);
				expect(state.size).toBeCloseTo(expected.size);
				expect(state.sizeIdeal).toBeCloseTo(expected.sizeIdeal);
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

	describe("setEndSize", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					parameters?: Readonly<Partial<StickyBarStateParameters>>;
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

				const state = new StickyBarState({
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
					parameters: StickyBarStateParameters;
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

				const state = new StickyBarState(parameters);
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

				const state = new StickyBarState({
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
					parameters: StickyBarStateParameters;
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

				const state = new StickyBarState(parameters);
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
			});
		});
	});

	describe("setStartSize", () => {
		describe("Input Validation", () => {
			const testList: readonly (readonly [
				string,
				Readonly<{
					error: Readonly<Error> | null;
					parameters?: Readonly<Partial<StickyBarStateParameters>>;
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

				const state = new StickyBarState({
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
					parameters: StickyBarStateParameters;
					update: Readonly<{
						startSize: number | undefined;
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
							endSize: 5,
							middleSize: 295,
							startSize: 300,
						},
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
						update: {
							startSize: 0,
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
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 5,
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
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 50,
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
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 100,
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
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 125,
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
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 150,
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
							size: 600,
							startMax: 350,
							startMin: 250,
							startSize: 300,
						},
						update: {
							startSize: 200,
						},
					},
				],
			];

			test.each(testList)("%s", (_testTitle, testParams) => {
				const expected = testParams.expected;
				const parameters = testParams.parameters;
				const update = testParams.update;

				const state = new StickyBarState(parameters);
				state.setEndSize(update.startSize);

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
