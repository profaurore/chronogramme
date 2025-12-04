import {
	BAR_RESIZE_STRATEGY_DEFAULT,
	BAR_SIDE_RESIZE_STRATEGY_DEFAULT,
} from "./barStateUtils";
import { validateFunction } from "./function";
import {
	SizeRangeError,
	validateSize,
	validateSizeInterval,
	ZERO,
} from "./math";
import { validateObject } from "./object";

const requiredParameters = ["size"] as const;

const optionalParameters = [
	"endMax",
	"endMin",
	"endSize",
	"middleMin",
	"resizeStrategy",
	"sideResizeStrategy",
	"startMax",
	"startMin",
	"startSize",
	"tinyStrategy",
] as const;

export interface BarStateParameters {
	endMax?: number | undefined;
	endMin?: number | undefined;
	endSize?: number | undefined;
	middleMin?: number | undefined;
	resizeStrategy?: BarResizeStrategy | undefined;
	sideResizeStrategy?: BarSideResizeStrategy | undefined;
	size: number;
	startMax?: number | undefined;
	startMin?: number | undefined;
	startSize?: number | undefined;
}

/** The strategy used when the container is resized. */
export type BarResizeStrategy = (state: Readonly<BarState>) => {
	endSize?: number | undefined;
	startSize?: number | undefined;
};

/** The strategy used when a side is expanded beyond it's available space. */
export type BarSideResizeStrategy = (
	state: Readonly<BarState>,
	isStart: boolean,
	targetSize: number | undefined,
) => { barSize?: number | undefined; otherBarSize?: number | undefined };

export class BarState {
	#endIdeal: number | undefined;

	#endMax: number;

	#endMin: number;

	#endSize: number | undefined;

	#middleIdeal: number;

	#middleMin: number;

	#resizeStrategy: BarResizeStrategy;

	#sideResizeStrategy: BarSideResizeStrategy;

	#size: number;

	#startIdeal: number | undefined;

	#startMax: number;

	#startMin: number;

	#startSize: number | undefined;

	public constructor(parameters: Readonly<BarStateParameters>) {
		validateObject(
			"parameters",
			parameters,
			requiredParameters,
			optionalParameters,
		);

		const endMax = parameters.endMax ?? Number.MAX_VALUE;
		const endMin = parameters.endMin ?? ZERO;
		const endSize = parameters.endSize;
		const middleMin = parameters.middleMin ?? ZERO;
		const resizeStrategy =
			parameters.resizeStrategy ?? BAR_RESIZE_STRATEGY_DEFAULT;
		const sideResizeStrategy =
			parameters.sideResizeStrategy ?? BAR_SIDE_RESIZE_STRATEGY_DEFAULT;
		const size = parameters.size;
		const startMax = parameters.startMax ?? Number.MAX_VALUE;
		const startMin = parameters.startMin ?? ZERO;
		const startSize = parameters.startSize;

		validateSize("size", size, ZERO, true, Number.MAX_VALUE, true);
		this.#size = size;

		validateSizeInterval("startMin", "startMax", "startExtrema", [
			startMin,
			startMax,
		]);
		this.#startMin = startMin;
		this.#startMax = startMax;

		if (startSize !== undefined) {
			validateSize("startSize", startSize, startMin, true, startMax, true);
		}

		this.#startSize = startSize;
		this.#startIdeal = startSize;

		validateSizeInterval("endMin", "endMax", "endExtrema", [endMin, endMax]);
		this.#endMin = endMin;
		this.#endMax = endMax;

		if (endSize !== undefined) {
			validateSize("endSize", endSize, endMin, true, endMax, true);
		}

		this.#endSize = endSize;
		this.#endIdeal = endSize;

		validateSize("middleMin", middleMin, ZERO, true, Number.MAX_VALUE, true);
		this.#middleIdeal = Math.max(
			size - (startSize ?? ZERO) - (endSize ?? ZERO),
			middleMin,
		);
		this.#middleMin = middleMin;

		validateFunction<BarResizeStrategy>("resizeStrategy", resizeStrategy);
		this.#resizeStrategy = resizeStrategy;

		validateFunction<BarSideResizeStrategy>(
			"sideResizeStrategy",
			sideResizeStrategy,
		);
		this.#sideResizeStrategy = sideResizeStrategy;

		this.recalcSides();
	}

	public get endIdeal(): number | undefined {
		return this.#endIdeal;
	}

	public get endMax(): number {
		return this.#endMax;
	}

	public get endMin(): number {
		return this.#endMin;
	}

	public get endSize(): number | undefined {
		return this.#endSize;
	}

	public get middleIdeal(): number {
		return this.#middleIdeal;
	}

	public get middleMin(): number {
		return this.#middleMin;
	}

	public get middleSize(): number {
		return this.#size - (this.#startSize ?? ZERO) - (this.#endSize ?? ZERO);
	}

	public get resizeStrategy(): BarResizeStrategy {
		return this.#resizeStrategy;
	}

	public get sideResizeStrategy(): BarSideResizeStrategy {
		return this.#sideResizeStrategy;
	}

	public get size(): number {
		return this.#size;
	}

	public get startIdeal(): number | undefined {
		return this.#startIdeal;
	}

	public get startMax(): number {
		return this.#startMax;
	}

	public get startMin(): number {
		return this.#startMin;
	}

	public get startSize(): number | undefined {
		return this.#startSize;
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `endSize`
	 * - `middleSize`
	 * - `startSize`
	 */
	public setEndExtrema(
		endMin: number | undefined = ZERO,
		endMax: number | undefined = Number.MAX_VALUE,
	): void {
		validateSizeInterval("endMin", "endMax", "endExtrema", [endMin, endMax]);

		this.#endMin = endMin;
		this.#endMax = endMax;

		this.recalcSides();
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `endIdeal`
	 * - `endSize`
	 * - `middleSize`
	 * - `sizeIdeal`
	 * - `startIdeal`
	 * - `startSize`
	 */
	public setEndSize(endSize: number | undefined): void {
		if (endSize !== undefined) {
			validateSize(
				"endSize",
				endSize,
				-Number.MAX_VALUE,
				true,
				Number.MAX_VALUE,
				true,
			);
		}

		const startMin = this.#startMin;
		const startMax = this.#startMax;
		const endMin = this.#endMin;
		const endMax = this.#endMax;

		const newSizes = this.#sideResizeStrategy(this, false, endSize);
		this.validateSideResizeStrategyReturn(
			newSizes,
			endMin,
			endMax,
			startMin,
			startMax,
		);

		this.setSidesSizeAndIdeal(newSizes.otherBarSize, newSizes.barSize);
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `endSize`
	 * - `middleSize`
	 * - `startSize`
	 */
	public setMiddleMin(middleMin: number | undefined = ZERO): void {
		validateSize("middleMin", middleMin, ZERO, true, Number.MAX_VALUE, true);

		const size = this.#size;
		const startIdeal = this.#startIdeal;
		const endIdeal = this.#endIdeal;

		this.#middleIdeal = Math.max(
			size - (startIdeal ?? ZERO) - (endIdeal ?? ZERO),
			middleMin,
		);
		this.#middleMin = middleMin;

		this.recalcSides();
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `endSize`
	 * - `middleSize`
	 * - `startSize`
	 */
	public setResizeStrategy(
		resizeStrategy: BarResizeStrategy | undefined = BAR_RESIZE_STRATEGY_DEFAULT,
	): void {
		validateFunction<BarResizeStrategy>("resizeStrategy", resizeStrategy);
		this.#resizeStrategy = resizeStrategy;

		this.recalcSides();
	}

	/**
	 * This method has no side effects.
	 */
	public setSideResizeStrategy(
		sideResizeStrategy:
			| BarSideResizeStrategy
			| undefined = BAR_SIDE_RESIZE_STRATEGY_DEFAULT,
	): void {
		validateFunction<BarSideResizeStrategy>(
			"sideResizeStrategy",
			sideResizeStrategy,
		);
		this.#sideResizeStrategy = sideResizeStrategy;
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `endSize`
	 * - `middleSize`
	 * - `startSize`
	 */
	public setSize(size: number): void {
		validateSize("size", size, ZERO, true, Number.MAX_VALUE, true);

		this.#size = size;

		this.recalcSides();
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `endSize`
	 * - `middleSize`
	 * - `startSize`
	 */
	public setStartExtrema(
		startMin: number | undefined = ZERO,
		startMax: number | undefined = Number.MAX_VALUE,
	): void {
		validateSizeInterval("startMin", "startMax", "startExtrema", [
			startMin,
			startMax,
		]);

		this.#startMin = startMin;
		this.#startMax = startMax;

		this.recalcSides();
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `endIdeal`
	 * - `endSize`
	 * - `middleSize`
	 * - `sizeIdeal`
	 * - `startIdeal`
	 * - `startSize`
	 */
	public setStartSize(startSize: number | undefined): void {
		if (startSize !== undefined) {
			validateSize(
				"startSize",
				startSize,
				-Number.MAX_VALUE,
				true,
				Number.MAX_VALUE,
				true,
			);
		}

		const startMin = this.#startMin;
		const startMax = this.#startMax;
		const endMin = this.#endMin;
		const endMax = this.#endMax;

		const newSizes = this.#sideResizeStrategy(this, true, startSize);
		this.validateSideResizeStrategyReturn(
			newSizes,
			startMin,
			startMax,
			endMin,
			endMax,
		);

		this.setSidesSizeAndIdeal(newSizes.barSize, newSizes.otherBarSize);
	}

	private recalcSides(): void {
		const newSizes = this.#resizeStrategy(this);
		this.validateResizeStrategyReturn(newSizes);

		this.#startSize = newSizes.startSize;
		this.#endSize = newSizes.endSize;
	}

	private setSidesSizeAndIdeal(
		startSize: number | undefined,
		endSize: number | undefined,
	): void {
		const size = this.#size;

		this.#startSize = startSize;
		this.#startIdeal = startSize;

		this.#endSize = endSize;
		this.#endIdeal = endSize;

		this.#middleIdeal = size - (startSize ?? ZERO) - (endSize ?? ZERO);
	}

	private validateResizeStrategyReturn(
		value: unknown,
	): asserts value is ReturnType<BarResizeStrategy> {
		validateObject("resizeStrategy()", value, [], ["endSize", "startSize"]);

		const endSize = value.endSize;
		const startSize = value.startSize;

		if (startSize !== undefined) {
			const startMin = this.#startMin;
			const startMax = this.#startMax;

			validateSize(
				"resizeStrategy().startSize",
				startSize,
				startMin,
				true,
				startMax,
				true,
			);
		}

		if (endSize !== undefined) {
			const endMin = this.#endMin;
			const endMax = this.#endMax;

			validateSize(
				"resizeStrategy().endSize",
				endSize,
				endMin,
				true,
				endMax,
				true,
			);
		}

		const containerSize = this.#size;
		const middleMin = this.#middleMin;

		const sumBarMax = Math.max(ZERO, containerSize - middleMin);
		const sumBarsSize = (startSize ?? ZERO) + (endSize ?? ZERO);

		if (sumBarsSize > sumBarMax) {
			throw new SizeRangeError(
				"resizeStrategy()",
				sumBarsSize,
				ZERO,
				true,
				sumBarMax,
				true,
			);
		}
	}

	private validateSideResizeStrategyReturn(
		value: unknown,
		barMin: number,
		barMax: number,
		otherBarMin: number,
		otherBarMax: number,
	): asserts value is ReturnType<BarSideResizeStrategy> {
		validateObject(
			"sideResizeStrategy()",
			value,
			[],
			["barSize", "otherBarSize"],
		);

		const barSize = value.barSize;
		const otherBarSize = value.otherBarSize;

		if (barSize !== undefined) {
			validateSize(
				"sideResizeStrategy().barSize",
				barSize,
				barMin,
				true,
				barMax,
				true,
			);
		}

		if (otherBarSize !== undefined) {
			validateSize(
				"sideResizeStrategy().otherBarSize",
				otherBarSize,
				otherBarMin,
				true,
				otherBarMax,
				true,
			);
		}

		const containerSize = this.#size;
		const middleMin = this.#middleMin;

		const sumBarMax = containerSize - middleMin;
		const sumBarsSize = (barSize ?? ZERO) + (otherBarSize ?? ZERO);

		if (sumBarsSize > sumBarMax) {
			throw new SizeRangeError(
				"sideResizeStrategy()",
				sumBarsSize,
				ZERO,
				true,
				sumBarMax,
				true,
			);
		}
	}
}
