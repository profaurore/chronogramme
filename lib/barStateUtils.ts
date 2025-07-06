import {
	preserveMiddleBarResizeStrategy,
	preserveSidesBarResizeStrategy,
	proportionalBarResizeStrategy,
} from "./barResizeStrategies.ts";
import {
	constrainBarSideResizeStrategy,
	consumeSideBarResizeStrategy,
} from "./barSideResizeStrategies.ts";
import type { BarResizeStrategy, BarSideResizeStrategy } from "./barState.ts";
import { validateStringOptions } from "./string.ts";

export type BarResizeStrategyOptions =
	(typeof BAR_RESIZE_STRATEGY_OPTIONS)[number];
export type BarSideResizeStrategyOptions =
	(typeof BAR_SIDE_RESIZE_STRATEGY_OPTIONS)[number];

export const BAR_RESIZE_STRATEGY_DEFAULT: BarResizeStrategy =
	preserveSidesBarResizeStrategy;
export const BAR_SIDE_RESIZE_STRATEGY_DEFAULT: BarSideResizeStrategy =
	consumeSideBarResizeStrategy;

export const BAR_RESIZE_STRATEGY_OPTIONS = [
	"preserveMiddle",
	"preserveSides",
	"proportional",
] as const;

export const BAR_SIDE_RESIZE_STRATEGY_OPTIONS = [
	"constrain",
	"consume",
] as const;

export function getBarResizeStrategy(strategy: unknown): BarResizeStrategy {
	if (strategy !== undefined && strategy !== null) {
		validateStringOptions(
			"resizeStrategy",
			strategy,
			BAR_RESIZE_STRATEGY_OPTIONS,
		);
	}

	let strategyFn: BarResizeStrategy;
	switch (strategy) {
		case "preserveMiddle": {
			strategyFn = preserveMiddleBarResizeStrategy;
			break;
		}

		case "preserveSides": {
			strategyFn = preserveSidesBarResizeStrategy;
			break;
		}

		case "proportional": {
			strategyFn = proportionalBarResizeStrategy;
			break;
		}

		default: {
			strategyFn = BAR_RESIZE_STRATEGY_DEFAULT;
			break;
		}
	}

	return strategyFn;
}

export function getBarSideResizeStrategy(
	strategy: unknown,
): BarSideResizeStrategy {
	if (strategy !== undefined && strategy !== null) {
		validateStringOptions(
			"sideResizeStrategy",
			strategy,
			BAR_SIDE_RESIZE_STRATEGY_OPTIONS,
		);
	}

	let strategyFn: BarSideResizeStrategy;
	switch (strategy) {
		case "constrain": {
			strategyFn = constrainBarSideResizeStrategy;
			break;
		}

		case "consume": {
			strategyFn = consumeSideBarResizeStrategy;
			break;
		}

		default: {
			strategyFn = BAR_SIDE_RESIZE_STRATEGY_DEFAULT;
			break;
		}
	}

	return strategyFn;
}
