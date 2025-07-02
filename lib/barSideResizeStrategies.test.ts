import { describe, expect, test } from "vitest";
import {
	constrainBarSideResizeStrategy,
	consumeSideBarResizeStrategy,
} from "./barSideResizeStrategies.ts";
import {
	type BarSideResizeStrategy,
	BarState,
	type BarStateParameters,
} from "./barState.ts";

describe("BarSideResizeStrategy", () => {
	const testGroups: readonly (readonly [
		string,
		{
			sideResizeStrategy: BarSideResizeStrategy;
			testList: readonly (readonly [
				string,
				Readonly<{
					expected: Readonly<{
						endSize: number | undefined;
						middleSize: number;
						startSize: number | undefined;
					}>;
					parameters: BarStateParameters;
					update: Readonly<{
						isStartSide: boolean;
						sideSize: number | undefined;
					}>;
				}>,
			])[];
		},
	])[] = [
		[
			"consumeBarSideResizeStrategy",
			{
				sideResizeStrategy: consumeSideBarResizeStrategy,
				testList: [
					[
						"Collapse start side",
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
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: undefined,
							},
						},
					],
					[
						"Shrink start side to zero",
						{
							expected: {
								endSize: 100,
								middleSize: 500,
								startSize: 0,
							},
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
							update: {
								isStartSide: true,
								sideSize: 0,
							},
						},
					],
					[
						"Shrink start side to minimum",
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
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 200,
							},
						},
					],
					[
						"Shrink start side",
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
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 275,
							},
						},
					],
					[
						"No change undefined start side",
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
								size: 600,
								startMax: 350,
								startMin: 250,
							},
							update: {
								isStartSide: true,
								sideSize: undefined,
							},
						},
					],
					[
						"No change start side",
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
								isStartSide: true,
								sideSize: 300,
							},
						},
					],
					[
						"Expand undefined start side",
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
								size: 600,
								startMax: 350,
								startMin: 250,
							},
							update: {
								isStartSide: true,
								sideSize: 325,
							},
						},
					],
					[
						"Expand start side",
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
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 325,
							},
						},
					],
					[
						"Expand undefined start side to maximum",
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
								size: 600,
								startMax: 350,
								startMin: 250,
							},
							update: {
								isStartSide: true,
								sideSize: 400,
							},
						},
					],
					[
						"Expand start side to maximum",
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
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 400,
							},
						},
					],
					[
						"Expand undefined start side to consume end side",
						{
							expected: {
								endSize: 70,
								middleSize: 130,
								startSize: 400,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								endSize: 100,
								middleMin: 130,
								size: 600,
								startMax: 600,
								startMin: 250,
							},
							update: {
								isStartSide: true,
								sideSize: 400,
							},
						},
					],
					[
						"Expand start side to consume end side",
						{
							expected: {
								endSize: 70,
								middleSize: 130,
								startSize: 400,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								endSize: 100,
								middleMin: 130,
								size: 600,
								startMax: 600,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 400,
							},
						},
					],
					[
						"Expand undefined start side to maximum available",
						{
							expected: {
								endSize: 5,
								middleSize: 130,
								startSize: 465,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								endSize: 100,
								middleMin: 130,
								size: 600,
								startMax: 600,
								startMin: 250,
							},
							update: {
								isStartSide: true,
								sideSize: 600,
							},
						},
					],
					[
						"Expand start side to maximum available",
						{
							expected: {
								endSize: 5,
								middleSize: 130,
								startSize: 465,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								endSize: 100,
								middleMin: 130,
								size: 600,
								startMax: 600,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 600,
							},
						},
					],
					[
						"Collapse end side",
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
								isStartSide: false,
								sideSize: undefined,
							},
						},
					],
					[
						"Shrink end side to zero",
						{
							expected: {
								endSize: 0,
								middleSize: 300,
								startSize: 300,
							},
							parameters: {
								endMax: 150,
								endMin: 0,
								endSize: 100,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: false,
								sideSize: 0,
							},
						},
					],
					[
						"Shrink end side to minimum",
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
								isStartSide: false,
								sideSize: 0,
							},
						},
					],
					[
						"Shrink end side",
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
								isStartSide: false,
								sideSize: 50,
							},
						},
					],
					[
						"No change undefined end side",
						{
							expected: {
								endSize: undefined,
								middleSize: 300,
								startSize: 300,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: false,
								sideSize: undefined,
							},
						},
					],
					[
						"No change end side",
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
								isStartSide: false,
								sideSize: 100,
							},
						},
					],
					[
						"Expand undefined end side",
						{
							expected: {
								endSize: 125,
								middleSize: 175,
								startSize: 300,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: false,
								sideSize: 125,
							},
						},
					],
					[
						"Expand end side",
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
								isStartSide: false,
								sideSize: 125,
							},
						},
					],
					[
						"Expand undefined end side to maximum",
						{
							expected: {
								endSize: 150,
								middleSize: 150,
								startSize: 300,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: false,
								sideSize: 400,
							},
						},
					],
					[
						"Expand end side to maximum",
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
								isStartSide: false,
								sideSize: 400,
							},
						},
					],
					[
						"Expand undefined end side to consume start side",
						{
							expected: {
								endSize: 200,
								middleSize: 130,
								startSize: 270,
							},
							parameters: {
								endMax: 600,
								endMin: 5,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: false,
								sideSize: 200,
							},
						},
					],
					[
						"Expand end side to consume start side",
						{
							expected: {
								endSize: 200,
								middleSize: 130,
								startSize: 270,
							},
							parameters: {
								endMax: 600,
								endMin: 5,
								endSize: 100,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: false,
								sideSize: 200,
							},
						},
					],
					[
						"Expand undefined end side to maximum available",
						{
							expected: {
								endSize: 220,
								middleSize: 130,
								startSize: 250,
							},
							parameters: {
								endMax: 600,
								endMin: 5,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: false,
								sideSize: 600,
							},
						},
					],
					[
						"Expand end side to maximum available",
						{
							expected: {
								endSize: 220,
								middleSize: 130,
								startSize: 250,
							},
							parameters: {
								endMax: 600,
								endMin: 5,
								endSize: 100,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: false,
								sideSize: 600,
							},
						},
					],
				],
			},
		],
		[
			"constrainBarSideResizeStrategy",
			{
				sideResizeStrategy: constrainBarSideResizeStrategy,
				testList: [
					[
						"Initial undefined other side",
						{
							expected: {
								endSize: undefined,
								middleSize: 350,
								startSize: 250,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 250,
							},
						},
					],
					[
						"Collapse start side",
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
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: undefined,
							},
						},
					],
					[
						"Shrink start side to zero",
						{
							expected: {
								endSize: 100,
								middleSize: 500,
								startSize: 0,
							},
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
							update: {
								isStartSide: true,
								sideSize: 0,
							},
						},
					],
					[
						"Shrink start side to minimum",
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
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 200,
							},
						},
					],
					[
						"Shrink start side",
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
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 275,
							},
						},
					],
					[
						"No change start side",
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
								isStartSide: true,
								sideSize: 300,
							},
						},
					],
					[
						"Expand start side",
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
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 325,
							},
						},
					],
					[
						"Expand start side to maximum",
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
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 400,
							},
						},
					],
					[
						"Expand start side to maximum available",
						{
							expected: {
								endSize: 100,
								middleSize: 130,
								startSize: 370,
							},
							parameters: {
								endMax: 150,
								endMin: 5,
								endSize: 100,
								middleMin: 130,
								size: 600,
								startMax: 600,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: true,
								sideSize: 400,
							},
						},
					],
					[
						"Collapse end side",
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
								isStartSide: false,
								sideSize: undefined,
							},
						},
					],
					[
						"Shrink end side to zero",
						{
							expected: {
								endSize: 0,
								middleSize: 300,
								startSize: 300,
							},
							parameters: {
								endMax: 150,
								endMin: 0,
								endSize: 100,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: false,
								sideSize: 0,
							},
						},
					],
					[
						"Shrink end side to minimum",
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
								isStartSide: false,
								sideSize: 0,
							},
						},
					],
					[
						"Shrink end side",
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
								isStartSide: false,
								sideSize: 50,
							},
						},
					],
					[
						"No change end side",
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
								isStartSide: false,
								sideSize: 100,
							},
						},
					],
					[
						"Expand end side",
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
								isStartSide: false,
								sideSize: 125,
							},
						},
					],
					[
						"Expand end side to maximum",
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
								isStartSide: false,
								sideSize: 400,
							},
						},
					],
					[
						"Expand end side to maximum available",
						{
							expected: {
								endSize: 170,
								middleSize: 130,
								startSize: 300,
							},
							parameters: {
								endMax: 600,
								endMin: 5,
								endSize: 100,
								middleMin: 130,
								size: 600,
								startMax: 350,
								startMin: 250,
								startSize: 300,
							},
							update: {
								isStartSide: false,
								sideSize: 600,
							},
						},
					],
				],
			},
		],
	];

	describe.each(testGroups)("%s", (_groupTitle, groupParams) => {
		const sideResizeStrategy = groupParams.sideResizeStrategy;
		const testList = groupParams.testList;

		test.each(testList)("%s", (_testTitle, testParams) => {
			const expected = testParams.expected;
			const parameters = testParams.parameters;
			const update = testParams.update;

			const state = new BarState({ ...parameters, sideResizeStrategy });

			if (update.isStartSide) {
				state.setStartSize(update.sideSize);
			} else {
				state.setEndSize(update.sideSize);
			}

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
