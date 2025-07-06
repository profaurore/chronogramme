import { describe, expect, test } from "vitest";
import {
	MissingPropertyError,
	NotAnObjectError,
	UnknownPropertyError,
	validateObject,
} from "./object.ts";
import { getError } from "./testUtils.ts";

describe("validateObject", () => {
	describe("Invalid types", () => {
		const testList: readonly (readonly [string, Readonly<unknown>])[] = [
			["Errors if undefined", undefined as unknown as () => void],
			["Errors if null", null as unknown as () => void],
			["Errors if a number", 42],
			["Errors if a boolean", true],
			["Errors if a big integer", BigInt(42)],
			["Errors if a string", "invalid"],
			["Errors if a symbol", Symbol("Symbol")],
			["Errors if a function", () => undefined],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams;

			const receivedError = getError(() =>
				validateObject("test", value, [], []),
			);

			expect(receivedError).toEqual(new NotAnObjectError("test", value));
		});
	});

	describe("Invalid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				value: Record<string, unknown>;
				requiredProperties: string[];
				optionalProperties: string[];
				error: Error;
			}>,
		])[] = [
			[
				"Errors if a required property is missing",
				{
					value: { first: 42 },
					requiredProperties: ["first", "theProperty"],
					optionalProperties: ["second"],
					error: new MissingPropertyError("test", { first: 42 }, "theProperty"),
				},
			],
			[
				"Errors if an unknown property is present",
				{
					value: { first: 42, theProperty: "abc" },
					requiredProperties: ["first"],
					optionalProperties: ["second"],
					error: new UnknownPropertyError(
						"test",
						{ first: 42, theProperty: "abc" },
						"theProperty",
					),
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const requiredProperties = testParams.requiredProperties;
			const optionalProperties = testParams.optionalProperties;
			const error = testParams.error;

			const receivedError = getError(() =>
				validateObject("test", value, requiredProperties, optionalProperties),
			);

			expect(receivedError).toEqual(error);
		});
	});

	describe("Valid values", () => {
		const testList: readonly (readonly [
			string,
			Readonly<{
				value: Record<string, unknown>;
				requiredProperties: string[];
				optionalProperties: string[];
			}>,
		])[] = [
			[
				"Accepts if all required properties are defined",
				{
					value: { first: 42, second: 3.14 },
					requiredProperties: ["first", "second"],
					optionalProperties: [],
				},
			],
			[
				"Accepts if none of the optional properties are defined",
				{
					value: {},
					requiredProperties: [],
					optionalProperties: ["first", "second"],
				},
			],
			[
				"Accepts if some optional properties are defined",
				{
					value: { first: 42 },
					requiredProperties: [],
					optionalProperties: ["first", "second"],
				},
			],
			[
				"Accepts if all optional properties are defined",
				{
					value: { first: 42, second: 3.14 },
					requiredProperties: [],
					optionalProperties: ["first", "second"],
				},
			],
			[
				"Accepts if all required and optional properties are defined",
				{
					value: { first: 42, second: 3.14, third: 0, fourth: "last" },
					requiredProperties: ["first", "second"],
					optionalProperties: ["third", "fourth"],
				},
			],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams.value;
			const requiredProperties = testParams.requiredProperties;
			const optionalProperties = testParams.optionalProperties;

			validateObject("test", value, requiredProperties, optionalProperties);
		});
	});
});
