import { describe, expect, test } from "vitest";
import { parseBooleanAttribute } from "./boolean.ts";

describe("parseBooleanAttribute", () => {
	test("Set value", () => {
		expect(parseBooleanAttribute("value")).toEqual(true);
		expect(parseBooleanAttribute("")).toEqual(true);
	});

	test("Unset value", () => {
		expect(parseBooleanAttribute(null)).toEqual(false);
	});
});
