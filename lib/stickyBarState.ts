import { validateFunction } from "./function";
import {
	SizeRangeError,
	ZERO,
	validateSize,
	validateSizeInterval,
} from "./math";
import { validateObject } from "./object";
import {
	consumeSideResizeStrategy,
	proportionalResizeStrategy,
} from "./stickyBarStateStrategies";

export interface StickyBarStateParameters {
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
export type ResizeStrategy = (
	state: Readonly<StickyBarState>,
	targetSize: number,
) => { endSize?: number | undefined; startSize?: number | undefined };

/** The strategy used when a side is expanded beyond it's available space. */
export type SideResizeStrategy = (
	state: Readonly<StickyBarState>,
	isStart: boolean,
	targetSize: number | undefined,
) => { barSize?: number | undefined; otherBarSize?: number | undefined };

export class StickyBarState {
	#endIdeal: number | undefined;

	#endMax: number;

	#endMin: number;

	#endSize: number | undefined;

	#middleIdeal: number;

	#middleMin: number;

	#resizeStrategy: ResizeStrategy;

	#sideResizeStrategy: SideResizeStrategy;

	#size: number;

	#sizeIdeal: number;

	#startIdeal: number | undefined;

	#startMax: number;

	#startMin: number;

	#startSize: number | undefined;

	public constructor(parameters: Readonly<StickyBarStateParameters>) {
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
			parameters.resizeStrategy ?? proportionalResizeStrategy;
		const sideResizeStrategy =
			parameters.sideResizeStrategy ?? consumeSideResizeStrategy;
		const size = parameters.size;
		const startMax = parameters.startMax ?? Number.MAX_VALUE;
		const startMin = parameters.startMin ?? ZERO;
		const startSize = parameters.startSize;

		validateSize("size", size, ZERO, true, Number.MAX_VALUE, true);
		this.#sizeIdeal = size;
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

	private recalcSides(): void {
		const size = this.#size;
		const middleMin = this.#middleMin;
		const startMin = this.#startMin;
		const endMin = this.#endMin;

		const minSizeWithBars = middleMin + startMin + endMin;

		if (size < minSizeWithBars) {
			this.#startSize = undefined;
			this.#endSize = undefined;
		} else if (size > minSizeWithBars) {
			const newSizes = this.#resizeStrategy(this, size);
			this.validateResizeStrategyReturn(newSizes);

			this.#startSize = newSizes.startSize;
			this.#endSize = newSizes.endSize;
		} else {
			this.#startSize = startMin;
			this.#endSize = endMin;
		}
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

		this.#sizeIdeal = size;
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

		const sumBarMax = containerSize - middleMin;
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

	public setEndExtrema(
		endMin: number | undefined = ZERO,
		endMax: number | undefined = Number.MAX_VALUE,
	): void {
		validateSizeInterval("endMin", "endMax", "endExtrema", [endMin, endMax]);

		this.#endMin = endMin;
		this.#endMax = endMax;

		this.recalcSides();
	}

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

	public setMiddleMin(middleMin: number | undefined): void {
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

	public setResizeStrategy(resizeStrategy: ResizeStrategy | undefined): void {
		validateFunction<ResizeStrategy>("resizeStrategy", resizeStrategy);
		this.#resizeStrategy = resizeStrategy;

		this.recalcSides();
	}

	public setSideResizeStrategy(
		sideResizeStrategy: SideResizeStrategy | undefined,
	): void {
		validateFunction<SideResizeStrategy>(
			"sideResizeStrategy",
			sideResizeStrategy,
		);
		this.#sideResizeStrategy = sideResizeStrategy;
	}

	public setSize(size: number): void {
		validateSize("size", size, ZERO, true, Number.MAX_VALUE, true);

		this.#size = size;

		this.recalcSides();
	}

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

	public get sizeIdeal(): number {
		return this.#sizeIdeal;
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
}
