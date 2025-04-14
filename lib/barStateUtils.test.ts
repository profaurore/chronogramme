import { describe, expect, test } from "vitest";
import {
	preserveMiddleResizeStrategy,
	preserveSidesResizeStrategy,
	proportionalResizeStrategy,
} from "./barResizeStrategies.ts";
import {
	constrainSideResizeStrategy,
	consumeSideResizeStrategy,
} from "./barSideResizeStrategies.ts";
import type { ResizeStrategy, SideResizeStrategy } from "./barState.ts";
import {
	RESIZE_STRATEGY_DEFAULT,
	RESIZE_STRATEGY_OPTIONS,
	SIDE_RESIZE_STRATEGY_DEFAULT,
	SIDE_RESIZE_STRATEGY_OPTIONS,
	getResizeStrategy,
	getSideResizeStrategy,
} from "./barStateUtils.ts";
import { NotAStringError, UnknownStringOptionError } from "./string.ts";
import { getError } from "./testUtils.ts";

describe("getResizeStrategy", () => {
	describe("Invalid types", () => {
		const testList: readonly (readonly [string, Readonly<unknown>])[] = [
			["Errors if a number", 42],
			["Errors if a boolean", true],
			["Errors if a big integer", BigInt(42)],
			["Errors if an object", {}],
			["Errors if a symbol", Symbol()],
			["Errors if a function", () => undefined],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams;

			const receivedError = getError(() => getResizeStrategy(value));

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
						RESIZE_STRATEGY_OPTIONS,
					),
				},
			],
			[
				"Errors if case does not match",
				{
					value: RESIZE_STRATEGY_OPTIONS[0].toUpperCase(),
					error: new UnknownStringOptionError(
						"resizeStrategy",
						RESIZE_STRATEGY_OPTIONS[0].toUpperCase(),
						RESIZE_STRATEGY_OPTIONS,
					),
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const error = testParams.error;

			const receivedError = getError(() => getResizeStrategy(value));

			expect(receivedError).toEqual(error);
		});
	});

	describe("Valid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				expected: ResizeStrategy;
				value: string | undefined | null;
			}>,
		])[] = [
			[
				"Accepts preserveMiddle",
				{
					expected: preserveMiddleResizeStrategy,
					value: "preserveMiddle",
				},
			],
			[
				"Accepts preserveSides",
				{
					expected: preserveSidesResizeStrategy,
					value: "preserveSides",
				},
			],
			[
				"Accepts proportional",
				{
					expected: proportionalResizeStrategy,
					value: "proportional",
				},
			],
			[
				"Accepts undefined and returns the default",
				{
					expected: RESIZE_STRATEGY_DEFAULT,
					value: undefined,
				},
			],
			[
				"Accepts null and returns the default",
				{
					expected: RESIZE_STRATEGY_DEFAULT,
					value: null,
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const expected = testParams.expected;
			const value = testParams.value;

			expect(getResizeStrategy(value)).toEqual(expected);
		});
	});
});

describe("getSideResizeStrategy", () => {
	describe("Invalid types", () => {
		const testList: readonly (readonly [string, Readonly<unknown>])[] = [
			["Errors if a number", 42],
			["Errors if a boolean", true],
			["Errors if a big integer", BigInt(42)],
			["Errors if an object", {}],
			["Errors if a symbol", Symbol()],
			["Errors if a function", () => undefined],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams;

			const receivedError = getError(() => getSideResizeStrategy(value));

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
						SIDE_RESIZE_STRATEGY_OPTIONS,
					),
				},
			],
			[
				"Errors if case does not match",
				{
					value: SIDE_RESIZE_STRATEGY_OPTIONS[0].toUpperCase(),
					error: new UnknownStringOptionError(
						"sideResizeStrategy",
						SIDE_RESIZE_STRATEGY_OPTIONS[0].toUpperCase(),
						SIDE_RESIZE_STRATEGY_OPTIONS,
					),
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const error = testParams.error;

			const receivedError = getError(() => getSideResizeStrategy(value));

			expect(receivedError).toEqual(error);
		});
	});

	describe("Valid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				expected: SideResizeStrategy;
				value: string | undefined | null;
			}>,
		])[] = [
			[
				"Accepts constrain",
				{
					expected: constrainSideResizeStrategy,
					value: "constrain",
				},
			],
			[
				"Accepts consume",
				{
					expected: consumeSideResizeStrategy,
					value: "consume",
				},
			],
			[
				"Accepts undefined and returns the default",
				{
					expected: SIDE_RESIZE_STRATEGY_DEFAULT,
					value: undefined,
				},
			],
			[
				"Accepts null and returns the default",
				{
					expected: SIDE_RESIZE_STRATEGY_DEFAULT,
					value: null,
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const expected = testParams.expected;
			const value = testParams.value;

			expect(getSideResizeStrategy(value)).toEqual(expected);
		});
	});
});
