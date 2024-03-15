import { describe, expect, test } from "vitest";

import { clampMinWins, mean } from "./math.ts";

describe("clamp", () => {
	const numberMin = 1000;
	const numberMax = 2000;
	const numberBeforeRange = 500;
	const numberInRange = 1500;
	const numberAfterRange = 2500;
	test.each([
		[
			"An infinite number before",
			"the minimum number of the range",
			Number.NEGATIVE_INFINITY,
			numberMin,
		],
		[
			"A number before",
			"the minimum number of the range",
			numberBeforeRange,
			numberMin,
		],
		["A number at the start of", "the same number", numberMin, numberMin],
		["A number in", "the same number", numberInRange, numberInRange],
		["A number at the end of", "the same number", numberMax, numberMax],
		[
			"A number after",
			"the maximum number of the range",
			numberAfterRange,
			numberMax,
		],
		[
			"An infinite number after",
			"the maximum number of the range",
			Number.POSITIVE_INFINITY,
			numberMax,
		],
	])(
		"%s the range returns %s",
		(_positionDescription, _resultDescription, value, result) => {
			expect(clampMinWins(value, numberMin, numberMax)).toEqual(result);
		},
	);
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
