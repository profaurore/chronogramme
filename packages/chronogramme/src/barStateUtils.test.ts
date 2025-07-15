import { describe, expect, test } from "vitest";
import {
	preserveMiddleBarResizeStrategy,
	preserveSidesBarResizeStrategy,
	proportionalBarResizeStrategy,
} from "./barResizeStrategies";
import {
	constrainBarSideResizeStrategy,
	consumeSideBarResizeStrategy,
} from "./barSideResizeStrategies";
import type { BarResizeStrategy, BarSideResizeStrategy } from "./barState";
import {
	BAR_RESIZE_STRATEGY_DEFAULT,
	BAR_RESIZE_STRATEGY_OPTIONS,
	BAR_SIDE_RESIZE_STRATEGY_DEFAULT,
	BAR_SIDE_RESIZE_STRATEGY_OPTIONS,
	getBarResizeStrategy,
	getBarSideResizeStrategy,
} from "./barStateUtils";
import { NotAStringError, UnknownStringOptionError } from "./string";
import { getError } from "./testUtils";

describe("getBarResizeStrategy", () => {
	describe("Invalid types", () => {
		const testList: readonly (readonly [string, Readonly<unknown>])[] = [
			["Errors if a number", 42],
			["Errors if a boolean", true],
			["Errors if a big integer", BigInt(42)],
			["Errors if an object", {}],
			["Errors if a symbol", Symbol("Symbol")],
			["Errors if a function", () => undefined],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams;

			const receivedError = getError(() => getBarResizeStrategy(value));

			expect(receivedError).toEqual(
				new NotAStringError("resizeStrategy", value),
			);
		});
	});

	describe("Invalid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				value: string;
				error: Error;
			}>,
		])[] = [
			[
				"Errors if not an option",
				{
					value: "third",
					error: new UnknownStringOptionError(
						"resizeStrategy",
						"third",
						BAR_RESIZE_STRATEGY_OPTIONS,
					),
				},
			],
			[
				"Errors if case does not match",
				{
					value: BAR_RESIZE_STRATEGY_OPTIONS[0].toUpperCase(),
					error: new UnknownStringOptionError(
						"resizeStrategy",
						BAR_RESIZE_STRATEGY_OPTIONS[0].toUpperCase(),
						BAR_RESIZE_STRATEGY_OPTIONS,
					),
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const error = testParams.error;

			const receivedError = getError(() => getBarResizeStrategy(value));

			expect(receivedError).toEqual(error);
		});
	});

	describe("Valid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				expected: BarResizeStrategy;
				value: string | undefined | null;
			}>,
		])[] = [
			[
				"Accepts preserveMiddle",
				{
					expected: preserveMiddleBarResizeStrategy,
					value: "preserveMiddle",
				},
			],
			[
				"Accepts preserveSides",
				{
					expected: preserveSidesBarResizeStrategy,
					value: "preserveSides",
				},
			],
			[
				"Accepts proportional",
				{
					expected: proportionalBarResizeStrategy,
					value: "proportional",
				},
			],
			[
				"Accepts undefined and returns the default",
				{
					expected: BAR_RESIZE_STRATEGY_DEFAULT,
					value: undefined,
				},
			],
			[
				"Accepts null and returns the default",
				{
					expected: BAR_RESIZE_STRATEGY_DEFAULT,
					value: null,
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const expected = testParams.expected;
			const value = testParams.value;

			expect(getBarResizeStrategy(value)).toEqual(expected);
		});
	});
});

describe("getBarSideResizeStrategy", () => {
	describe("Invalid types", () => {
		const testList: readonly (readonly [string, Readonly<unknown>])[] = [
			["Errors if a number", 42],
			["Errors if a boolean", true],
			["Errors if a big integer", BigInt(42)],
			["Errors if an object", {}],
			["Errors if a symbol", Symbol("Symbol")],
			["Errors if a function", () => undefined],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams;

			const receivedError = getError(() => getBarSideResizeStrategy(value));

			expect(receivedError).toEqual(
				new NotAStringError("sideResizeStrategy", value),
			);
		});
	});

	describe("Invalid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				value: string;
				error: Error;
			}>,
		])[] = [
			[
				"Errors if not an option",
				{
					value: "third",
					error: new UnknownStringOptionError(
						"sideResizeStrategy",
						"third",
						BAR_SIDE_RESIZE_STRATEGY_OPTIONS,
					),
				},
			],
			[
				"Errors if case does not match",
				{
					value: BAR_SIDE_RESIZE_STRATEGY_OPTIONS[0].toUpperCase(),
					error: new UnknownStringOptionError(
						"sideResizeStrategy",
						BAR_SIDE_RESIZE_STRATEGY_OPTIONS[0].toUpperCase(),
						BAR_SIDE_RESIZE_STRATEGY_OPTIONS,
					),
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const error = testParams.error;

			const receivedError = getError(() => getBarSideResizeStrategy(value));

			expect(receivedError).toEqual(error);
		});
	});

	describe("Valid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				expected: BarSideResizeStrategy;
				value: string | undefined | null;
			}>,
		])[] = [
			[
				"Accepts constrain",
				{
					expected: constrainBarSideResizeStrategy,
					value: "constrain",
				},
			],
			[
				"Accepts consume",
				{
					expected: consumeSideBarResizeStrategy,
					value: "consume",
				},
			],
			[
				"Accepts undefined and returns the default",
				{
					expected: BAR_SIDE_RESIZE_STRATEGY_DEFAULT,
					value: undefined,
				},
			],
			[
				"Accepts null and returns the default",
				{
					expected: BAR_SIDE_RESIZE_STRATEGY_DEFAULT,
					value: null,
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const expected = testParams.expected;
			const value = testParams.value;

			expect(getBarSideResizeStrategy(value)).toEqual(expected);
		});
	});
});
