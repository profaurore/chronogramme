import { describe, expect, test } from "vitest";
import { NotAFunctionError, validateFunction } from "./function";
import { getError } from "./testUtils";

describe("validateFunction", () => {
	describe("Invalid values", () => {
		const testList: readonly (readonly [string, Readonly<unknown>])[] = [
			["Errors if undefined", undefined as unknown as Readonly<unknown>],
			["Errors if null", null as unknown as Readonly<unknown>],
			["Errors if an object", {}],
			["Errors if a number", 42],
			["Errors if a boolean", true],
			["Errors if a big integer", BigInt(42)],
			["Errors if a string", "invalid"],
			["Errors if a symbol", Symbol("Symbol")],
		];

		test.each(testList)("%s", (_testTitle, testParams) => {
			const value = testParams;

			const receivedError = getError(() => validateFunction("test", value));

			expect(receivedError).toEqual(new NotAFunctionError("test", value));
		});
	});

	test("Valid values", () => {
		expect(validateFunction("test", () => undefined));
		expect(validateFunction("test", Math.min));
	});
});
