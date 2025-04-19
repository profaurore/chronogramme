import { SIDE_RESIZE_STRATEGY_DEFAULT } from "./barStateUtils.ts";
import { RESIZE_STRATEGY_DEFAULT } from "./barStateUtils.ts";
import { validateFunction } from "./function.ts";
import {
	SizeRangeError,
	ZERO,
	validateSize,
	validateSizeInterval,
} from "./math.ts";
import { validateObject } from "./object.ts";

export interface BarStateParameters {
	endMax?: number;
	endMin?: number;
	endSize?: number;
	middleMin?: number;
	resizeStrategy?: ResizeStrategy;
	sideResizeStrategy?: SideResizeStrategy;
	size: number;
	startMax?: number;
	startMin?: number;
	startSize?: number;
}

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

/** The strategy used when the container is resized. */
export type ResizeStrategy = (state: Readonly<BarState>) => {
	endSize?: number | undefined;
	startSize?: number | undefined;
};

/** The strategy used when a side is expanded beyond it's available space. */
export type SideResizeStrategy = (
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

	#resizeStrategy: ResizeStrategy;

	#sideResizeStrategy: SideResizeStrategy;

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
		const resizeStrategy = parameters.resizeStrategy ?? RESIZE_STRATEGY_DEFAULT;
		const sideResizeStrategy =
			parameters.sideResizeStrategy ?? SIDE_RESIZE_STRATEGY_DEFAULT;
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

		validateFunction<ResizeStrategy>("resizeStrategy", resizeStrategy);
		this.#resizeStrategy = resizeStrategy;

		validateFunction<SideResizeStrategy>(
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

	public get resizeStrategy(): ResizeStrategy {
		return this.#resizeStrategy;
	}

	public get sideResizeStrategy(): SideResizeStrategy {
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
			validateSize("endSize", endSize, ZERO, true, Number.MAX_VALUE, true);
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
		resizeStrategy: ResizeStrategy | undefined = RESIZE_STRATEGY_DEFAULT,
	): void {
		validateFunction<ResizeStrategy>("resizeStrategy", resizeStrategy);
		this.#resizeStrategy = resizeStrategy;

		this.recalcSides();
	}

	/**
	 * This method has no side effects.
	 */
	public setSideResizeStrategy(
		sideResizeStrategy:
			| SideResizeStrategy
			| undefined = SIDE_RESIZE_STRATEGY_DEFAULT,
	): void {
		validateFunction<SideResizeStrategy>(
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
			validateSize("startSize", startSize, ZERO, true, Number.MAX_VALUE, true);
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
	): asserts value is ReturnType<ResizeStrategy> {
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
	): asserts value is ReturnType<SideResizeStrategy> {
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
