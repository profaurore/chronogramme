import { describe, expect, test } from "vitest";
import {
	preserveMiddleBarResizeStrategy,
	preserveSidesBarResizeStrategy,
	proportionalBarResizeStrategy,
} from "./barResizeStrategies.ts";
import {
	type BarResizeStrategy,
	BarState,
	type BarStateParameters,
} from "./barState.ts";

describe("BarResizeStrategy", () => {
	const testGroups: readonly (readonly [
		string,
		{
			resizeStrategy: BarResizeStrategy;
			testList: readonly (readonly [
				string,
				Readonly<{
					expected: Readonly<{
						endSize: number | undefined;
						middleSize: number;
						startSize: number | undefined;
					}>;
					parameters: BarStateParameters;
					update?: Readonly<{
						size: number;
					}>;
				}>,
			])[];
		},
	])[] = [
		[
			"proportionalBarResizeStrategy",
			{
				resizeStrategy: proportionalBarResizeStrategy,
				testList: [
					[
						"Adjust defined sides on create",
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
								size: 385,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
						},
					],
					[
						"Undefined initial sides",
						{
							expected: {
								endSize: undefined,
								middleSize: 200,
								startSize: undefined,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
							},
							update: {
								size: 200,
							},
						},
					],
					[
						"Shrink below threshold for sides",
						{
							expected: {
								endSize: undefined,
								middleSize: 200,
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
								size: 200,
							},
						},
					],
					[
						"Shrink 3 segments to min",
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
						"Shrink 2 segments to min and 1 proportionally",
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
						"Shrink 1 segment to min and 2 proportionally",
						{
							expected: {
								endSize: 66.666_666_666_666_67,
								middleSize: 133.333_333_333_333_31,
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
								size: 450,
							},
						},
					],
					[
						"Shrink 3 segments proportionally",
						{
							expected: {
								endSize: 83.333_333_333_333_34,
								middleSize: 166.666_666_666_666_66,
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
								size: 500,
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
						"Expand 3 segments proportionally",
						{
							expected: {
								endSize: 116.666_666_666_666_66,
								middleSize: 233.333_333_333_333_34,
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
								size: 700,
							},
						},
					],
					[
						"Expand 1 segment to max and 2 proportionally",
						{
							expected: {
								endSize: 133.333_333_333_333_34,
								middleSize: 266.666_666_666_666_63,
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
								size: 750,
							},
						},
					],
					[
						"Expand 2 to max and 1 proportionally",
						{
							expected: {
								endSize: 150,
								middleSize: 350,
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
								size: 850,
							},
						},
					],
				],
			},
		],
		[
			"preserveSidesBarResizeStrategy",
			{
				resizeStrategy: preserveSidesBarResizeStrategy,
				testList: [
					[
						"Undefined initial sides",
						{
							expected: {
								endSize: undefined,
								middleSize: 200,
								startSize: undefined,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
							},
							update: {
								size: 200,
							},
						},
					],
					[
						"Shrink below threshold for sides",
						{
							expected: {
								endSize: undefined,
								middleSize: 200,
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
								size: 200,
							},
						},
					],
					[
						"Shrink 3 segments to min",
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
						"Shrink 2 segments to min and 1 proportionally",
						{
							expected: {
								endSize: 40,
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
								size: 420,
							},
						},
					],
					[
						"Shrink 1 segment to min and 2 proportionally",
						{
							expected: {
								endSize: 95,
								middleSize: 130,
								startSize: 285,
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
								size: 510,
							},
						},
					],
					[
						"Shrink 1 segment to min",
						{
							expected: {
								endSize: 100,
								middleSize: 130,
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
								size: 530,
							},
						},
					],
					[
						"Shrink 1 segment",
						{
							expected: {
								endSize: 100,
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
								size: 550,
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
						"Expand 1 segment",
						{
							expected: {
								endSize: 100,
								middleSize: 400,
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
								size: 800,
							},
						},
					],
				],
			},
		],
		[
			"preserveMiddleBarResizeStrategy",
			{
				resizeStrategy: preserveMiddleBarResizeStrategy,
				testList: [
					[
						"Undefined initial sides",
						{
							expected: {
								endSize: undefined,
								middleSize: 200,
								startSize: undefined,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
							},
							update: {
								size: 200,
							},
						},
					],
					[
						"Shrink below threshold for sides",
						{
							expected: {
								endSize: undefined,
								middleSize: 200,
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
								size: 200,
							},
						},
					],
					[
						"Shrink 3 segments to min",
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
						"Shrink 2 segments to min and 1 proportionally",
						{
							expected: {
								endSize: 5,
								middleSize: 145,
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
						"Shrink 2 segments to min",
						{
							expected: {
								endSize: 5,
								middleSize: 200,
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
								size: 455,
							},
						},
					],
					[
						"Shrink 1 segment to min and 1 proportionally",
						{
							expected: {
								endSize: 50,
								middleSize: 200,
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
								size: 500,
							},
						},
					],
					[
						"Shrink 2 segments proportionally",
						{
							expected: {
								endSize: 90,
								middleSize: 200,
								startSize: 270,
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
								size: 560,
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
						"Expand 2 segments proportionally",
						{
							expected: {
								endSize: 115,
								middleSize: 200,
								startSize: 345,
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
								size: 660,
							},
						},
					],
					[
						"Expand 1 segment to max and 1 proportionally",
						{
							expected: {
								endSize: 120,
								middleSize: 200,
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
								size: 670,
							},
						},
					],
					[
						"Expand 2 segments to max",
						{
							expected: {
								endSize: 150,
								middleSize: 200,
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
								size: 700,
							},
						},
					],
				],
			},
		],
	];

	describe.each(testGroups)("%s", (_groupTitle, groupParams) => {
		const resizeStrategy = groupParams.resizeStrategy;
		const testList = groupParams.testList;

		test.each(testList)("%s", (_testTitle, testParams) => {
			const expected = testParams.expected;
			const parameters = testParams.parameters;
			const update = testParams.update;

			const state = new BarState({ ...parameters, resizeStrategy });

			if (update) {
				state.setSize(update.size);
			}

			expect(state.size).toEqual(update ? update.size : parameters.size);
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
