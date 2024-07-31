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
import { validateStringOptions } from "./string.ts";

export type ResizeStrategyOptions = (typeof RESIZE_STRATEGY_OPTIONS)[number];
export type SideResizeStrategyOptions =
	(typeof SIDE_RESIZE_STRATEGY_OPTIONS)[number];

export const RESIZE_STRATEGY_DEFAULT = preserveSidesResizeStrategy;
export const SIDE_RESIZE_STRATEGY_DEFAULT = consumeSideResizeStrategy;

export const RESIZE_STRATEGY_OPTIONS = [
	"preserveMiddle",
	"preserveSides",
	"proportional",
] as const;

export const SIDE_RESIZE_STRATEGY_OPTIONS = ["constrain", "consume"] as const;

export function getResizeStrategy(strategy: unknown): ResizeStrategy {
	if (strategy !== undefined && strategy !== null) {
		validateStringOptions("resizeStrategy", strategy, RESIZE_STRATEGY_OPTIONS);
	}

	let strategyFn: ResizeStrategy;
	switch (strategy) {
		case "preserveMiddle": {
			strategyFn = preserveMiddleResizeStrategy;
			break;
		}

		case "preserveSides": {
			strategyFn = preserveSidesResizeStrategy;
			break;
		}

		case "proportional": {
			strategyFn = proportionalResizeStrategy;
			break;
		}

		default: {
			strategyFn = RESIZE_STRATEGY_DEFAULT;
			break;
		}
	}

	return strategyFn;
}

export function getSideResizeStrategy(strategy: unknown): SideResizeStrategy {
	if (strategy !== undefined && strategy !== null) {
		validateStringOptions(
			"sideResizeStrategy",
			strategy,
			SIDE_RESIZE_STRATEGY_OPTIONS,
		);
	}

	let strategyFn: SideResizeStrategy;
	switch (strategy) {
		case "constrain": {
			strategyFn = constrainSideResizeStrategy;
			break;
		}

		case "consume": {
			strategyFn = consumeSideResizeStrategy;
			break;
		}

		default: {
			strategyFn = SIDE_RESIZE_STRATEGY_DEFAULT;
			break;
		}
	}

	return strategyFn;
}
