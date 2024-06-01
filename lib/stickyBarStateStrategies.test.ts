import { describe, expect, test } from "vitest";

import {
	type ResizeStrategy,
	type SideResizeStrategy,
	StickyBarState,
	type StickyBarStateParameters,
} from "./stickyBarState";
import {
	constraintSideResizeStrategy,
	consumeSideResizeStrategy,
	preserveMiddleResizeStrategy,
	preserveSidesResizeStrategy,
	proportionalResizeStrategy,
} from "./stickyBarStateStrategies";

describe("ResizeStrategy", () => {
	describe("Strategies", () => {
		const testGroups: readonly (readonly [
			string,
			{
				resizeStrategy: ResizeStrategy;
				testList: readonly (readonly [
					string,
					Readonly<{
						expected: Readonly<{
							endSize: number | undefined;
							middleSize: number;
							startSize: number | undefined;
						}>;
						parameters: StickyBarStateParameters;
						update?: Readonly<{
							size: number;
						}>;
					}>,
				])[];
			},
		])[] = [
			[
				"proportionalResizeStrategy",
				{
					resizeStrategy: proportionalResizeStrategy,
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
									endSize: 66.66666666666667,
									middleSize: 133.33333333333331,
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
									endSize: 83.33333333333334,
									middleSize: 166.66666666666666,
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
									endSize: 116.66666666666666,
									middleSize: 233.33333333333334,
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
									endSize: 133.33333333333334,
									middleSize: 266.66666666666663,
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
				"preserveSidesResizeStrategy",
				{
					resizeStrategy: preserveSidesResizeStrategy,
					testList: [
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
				"preserveMiddleResizeStrategy",
				{
					resizeStrategy: preserveMiddleResizeStrategy,
					testList: [
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

				const state = new StickyBarState({ ...parameters, resizeStrategy });

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
});

describe("SideResizeStrategy", () => {
	const testGroups: readonly (readonly [
		string,
		{
			sideResizeStrategy: SideResizeStrategy;
			testList: readonly (readonly [
				string,
				Readonly<{
					expected: Readonly<{
						endSize: number | undefined;
						middleSize: number;
						startSize: number | undefined;
					}>;
					parameters: StickyBarStateParameters;
					update: Readonly<{
						isStartSide: boolean;
						sideSize: number | undefined;
					}>;
				}>,
			])[];
		},
	])[] = [
		[
			"consumeSideResizeStrategy",
			{
				sideResizeStrategy: consumeSideResizeStrategy,
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
			"constrainSideResizeStrategy",
			{
				sideResizeStrategy: constraintSideResizeStrategy,
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

			const state = new StickyBarState({ ...parameters, sideResizeStrategy });

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
