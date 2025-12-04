import { describe, expect, test } from "vitest";
import {
	NotAStringError,
	UnknownStringOptionError,
	validateStringOptions,
} from "./string";
import { getError } from "./testUtils";

describe("validateStringOptions", () => {
	describe("Invalid types", () => {
		const testList: readonly (readonly [string, Readonly<unknown>])[] = [
			["Errors if undefined", undefined as unknown as () => void],
			["Errors if null", null as unknown as () => void],
			["Errors if a number", 42],
			["Errors if a boolean", true],
			["Errors if a big integer", BigInt(42)],
			["Errors if an object", {}],
			["Errors if a symbol", Symbol("Symbol")],
			["Errors if a function", (): void => undefined],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams;

			const receivedError = getError(() =>
				validateStringOptions("test", value, []),
			);

			expect(receivedError).toEqual(new NotAStringError("test", value));
		});
	});

	describe("Invalid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				value: string;
				options: string[];
				error: Error;
			}>,
		])[] = [
			[
				"Errors if not an option",
				{
					value: "third",
					options: ["first", "second"],
					error: new UnknownStringOptionError("test", "third", [
						"first",
						"second",
					]),
				},
			],
			[
				"Errors if case does not match",
				{
					value: "FIRST",
					options: ["first", "second"],
					error: new UnknownStringOptionError("test", "FIRST", [
						"first",
						"second",
					]),
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const options = testParams.options;
			const error = testParams.error;

			const receivedError = getError(() =>
				validateStringOptions("test", value, options),
			);

			expect(receivedError).toEqual(error);
		});
	});

	describe("Valid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				value: string;
				options: string[];
			}>,
		])[] = [
			[
				"Accepts if sole option",
				{
					value: "first",
					options: ["first"],
				},
			],
			[
				"Accepts if first option",
				{
					value: "first",
					options: ["first", "second", "third", "fourth"],
				},
			],
			[
				"Accepts if middle option",
				{
					value: "second",
					options: ["first", "second", "third", "fourth"],
				},
			],
			[
				"Accepts if last option",
				{
					value: "fourth",
					options: ["first", "second", "third", "fourth"],
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const options = testParams.options;

			validateStringOptions("test", value, options);
		});
	});
});
