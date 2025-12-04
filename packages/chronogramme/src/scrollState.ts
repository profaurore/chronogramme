import {
	clampInterval,
	DOUBLE,
	HALF,
	validateNumberInterval,
	validatePosition,
	validateSize,
	ZERO,
} from "./math";
import { validateObject } from "./object";
import { validateStringOptions } from "./string";

interface ScrollStateParameters {
	max?: number | undefined;
	maxElementSize?: number | undefined;
	min?: number | undefined;
	resizeStrategy?: ScrollResizeStrategyOptions | undefined;
	resyncThresholdSize?: number | undefined;
	windowMax?: number | undefined;
	windowMin?: number | undefined;
	windowSize: number;
}

const DEFAULT_RESYNC_THRESHOLD_SIZE = 500;

const requiredParameters = ["windowSize"] as const;

const optionalParameters = [
	"max",
	"maxElementSize",
	"min",
	"resyncThresholdSize",
	"windowMax",
	"windowMin",
] as const;

export type ScrollResizeStrategyOptions =
	(typeof SCROLL_RESIZE_STRATEGY_OPTIONS)[number];

export const SCROLL_RESIZE_STRATEGY_OPTIONS = [
	"preserveUnitPerPixel",
	"preserveWindow",
] as const;

export const DEFAULT_MAX_ELEMENT_SIZE = 100_000;

export class ScrollState {
	#isMaxTerminal!: boolean;

	#isMinTerminal!: boolean;

	#max: number;

	#maxElementSize: number;

	#min: number;

	#pixelPerUnit!: number;

	#range: number;

	#resizeStrategy: ScrollResizeStrategyOptions;

	#resyncThresholdSize: number;

	#scrollPos!: number;

	#scrollSize!: number;

	#size!: number;

	#unitPerPixel!: number;

	#windowMax: number;

	#windowMaxIdeal: number;

	#windowMin: number;

	#windowMinIdeal: number;

	#windowRange: number;

	#windowSize: number;

	public constructor(parameters: Readonly<ScrollStateParameters>) {
		validateObject(
			"parameters",
			parameters,
			requiredParameters,
			optionalParameters,
		);

		const max = parameters.max ?? Number.MAX_SAFE_INTEGER;
		const maxElementSize =
			parameters.maxElementSize ?? DEFAULT_MAX_ELEMENT_SIZE;
		const min = parameters.min ?? Number.MIN_SAFE_INTEGER;
		const resizeStrategy = parameters.resizeStrategy ?? "preserveWindow";
		const resyncThresholdSize =
			parameters.resyncThresholdSize ?? DEFAULT_RESYNC_THRESHOLD_SIZE;
		const windowMax = parameters.windowMax ?? Number.MAX_SAFE_INTEGER;
		const windowMin = parameters.windowMin ?? Number.MIN_SAFE_INTEGER;
		const windowSize = parameters.windowSize;

		this.#resizeStrategy = resizeStrategy;

		validateSize(
			"maxElementSize",
			maxElementSize,
			ZERO,
			false,
			Number.MAX_VALUE,
			true,
		);
		this.#maxElementSize = maxElementSize;

		validateSize(
			"resyncThresholdSize",
			resyncThresholdSize,
			ZERO,
			false,
			HALF * Number.MAX_VALUE,
			true,
		);
		this.#resyncThresholdSize = resyncThresholdSize;

		validateSize("windowSize", windowSize, ZERO, true, maxElementSize, true);
		this.#windowSize = windowSize;

		validateNumberInterval("min", "max", "extrema", [min, max]);
		this.#min = min;
		this.#max = max;
		this.#range = max - min;

		validateNumberInterval("windowMin", "windowMax", "windowExtrema", [
			windowMin,
			windowMax,
		]);
		this.#windowMin = windowMin;
		this.#windowMinIdeal = windowMin;
		this.#windowMax = windowMax;
		this.#windowMaxIdeal = windowMax;
		this.#windowRange = windowMax - windowMin;
		this.clampWindowToRange();

		this.resetScrollState();
	}

	public get max(): number {
		return this.#max;
	}

	public get maxElementSize(): number {
		return this.#maxElementSize;
	}

	public get min(): number {
		return this.#min;
	}

	public get range(): number {
		return this.#range;
	}

	public get resizeStrategy(): ScrollResizeStrategyOptions {
		return this.#resizeStrategy;
	}

	public get resyncThresholdSize(): number {
		return this.#resyncThresholdSize;
	}

	public get scrollPos(): number {
		return this.#scrollPos;
	}

	public get scrollSize(): number {
		return this.#scrollSize;
	}

	public get size(): number {
		return this.#size;
	}

	public get windowMax(): number {
		return this.#windowMax;
	}

	public get windowMin(): number {
		return this.#windowMin;
	}

	public get windowRange(): number {
		return this.#windowRange;
	}

	public get windowSize(): number {
		return this.#windowSize;
	}

	public getPos(value: number): number {
		const pixelPerUnit = this.#pixelPerUnit;
		const scrollPos = this.#scrollPos;
		const windowMin = this.#windowMin;

		return scrollPos + pixelPerUnit * (value - windowMin);
	}

	public getValue(pos: number): number {
		const unitPerPixel = this.#unitPerPixel;
		const scrollPos = this.#scrollPos;
		const windowMin = this.#windowMin;

		return unitPerPixel * (pos - scrollPos) + windowMin;
	}

	public getCanvasValueMin(): number {
		return this.getValue(ZERO);
	}

	public getCanvasValueMax(): number {
		return this.getValue(this.#scrollSize);
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `range`
	 * - `scrollPos`
	 * - `scrollSize`
	 * - `size`
	 * - `windowMax`
	 * - `windowMin`
	 * - `windowRange`
	 */
	public setExtrema(
		min: number | undefined = Number.MIN_SAFE_INTEGER,
		max: number | undefined = Number.MAX_SAFE_INTEGER,
	): void {
		validateNumberInterval("min", "max", "extrema", [min, max]);

		if (min !== this.#min || max !== this.#max) {
			this.#min = min;
			this.#max = max;
			this.#range = max - min;
			this.clampWindowToRange();

			this.resetScrollState();
		}
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `maxElementSize`
	 * - `scrollPos`
	 * - `scrollSize`
	 */
	public setMaxElementSize(
		maxElementSize: number | undefined = DEFAULT_MAX_ELEMENT_SIZE,
	): void {
		validateSize(
			"maxElementSize",
			maxElementSize,
			Math.max(Number.MIN_VALUE, this.#windowSize),
			true,
			Number.MAX_VALUE,
			true,
		);

		this.#maxElementSize = maxElementSize;

		this.resetScrollState();
	}

	public setResizeStrategy(resizeStrategy: string | undefined): void {
		validateStringOptions(
			"resizeStrategy",
			resizeStrategy,
			SCROLL_RESIZE_STRATEGY_OPTIONS,
		);

		this.#resizeStrategy = resizeStrategy ?? "preserveWindow";
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `resyncThresholdSize`
	 * - `scrollPos`
	 * - `scrollSize`
	 */
	public setResyncThresholdSize(
		resyncThresholdSize: number | undefined = DEFAULT_RESYNC_THRESHOLD_SIZE,
	): void {
		validateSize(
			"resyncThresholdSize",
			resyncThresholdSize,
			ZERO,
			false,
			HALF * Number.MAX_VALUE,
			true,
		);

		this.#resyncThresholdSize = resyncThresholdSize;

		const isMinTerminal = this.#isMinTerminal;
		const isMaxTerminal = this.#isMaxTerminal;
		const scrollPos = this.#scrollPos;
		const scrollSize = this.#scrollSize;
		const windowSize = this.#windowSize;

		const maxScrollPosition = Math.ceil(scrollSize - windowSize);

		if (
			(!isMinTerminal && scrollPos <= resyncThresholdSize) ||
			(!isMaxTerminal && scrollPos >= maxScrollPosition - resyncThresholdSize)
		) {
			this.resetScrollState();
		}
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `scrollPos`
	 * - `scrollSize`
	 * - `windowMax`
	 * - `windowMin`
	 */
	public setScrollPos(scrollPos: number): void {
		const scrollSize = this.#scrollSize;
		const windowSize = this.#windowSize;

		validatePosition(
			"scrollPos",
			scrollPos,
			-Number.MAX_VALUE,
			Number.MAX_VALUE,
		);

		const delta = scrollPos - this.#scrollPos;

		if (delta !== ZERO) {
			const prevWindowMin = this.#windowMin;
			const min = this.#min;
			const max = this.#max;
			const windowRange = this.#windowRange;
			const unitPerPixel = this.#unitPerPixel;
			const isMinTerminal = this.#isMinTerminal;
			const isMaxTerminal = this.#isMaxTerminal;
			const resyncThresholdSize = this.#resyncThresholdSize;

			const unitDelta = unitPerPixel * delta;
			const targetWindowMin = prevWindowMin + unitDelta;
			const [windowMin, windowMax] = clampInterval(
				targetWindowMin,
				targetWindowMin + windowRange,
				min,
				max,
			);

			if (windowMin !== prevWindowMin) {
				this.#windowMin = windowMin;
				this.#windowMinIdeal = windowMin;
				this.#windowMax = windowMax;
				this.#windowMaxIdeal = windowMax;

				const minScrollPos = isMinTerminal ? ZERO : resyncThresholdSize;
				const maxScrollPos =
					Math.ceil(scrollSize - windowSize) -
					(isMaxTerminal ? ZERO : resyncThresholdSize);

				// Force a recalculation if one of the extrema is reached or if within a
				// resync threshold.
				if (
					windowMin <= min ||
					windowMax >= max ||
					scrollPos <= minScrollPos ||
					scrollPos >= maxScrollPos
				) {
					this.resetScrollState();
				} else {
					this.#scrollPos = scrollPos;
				}
			}
		}
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `scrollPos`
	 * - `scrollSize`
	 * - `size`
	 * - `windowMax`
	 * - `windowMin`
	 * - `windowRange`
	 */
	public setWindowExtrema(
		windowMin: number | undefined = Number.MIN_SAFE_INTEGER,
		windowMax: number | undefined = Number.MAX_SAFE_INTEGER,
	): void {
		validateNumberInterval("windowMin", "windowMax", "windowExtrema", [
			windowMin,
			windowMax,
		]);

		if (
			windowMin !== this.#windowMinIdeal ||
			windowMax !== this.#windowMaxIdeal
		) {
			const oldWindowRange = this.#windowRange;
			const targetScrollPos = this.getPos(windowMin);

			this.#windowMinIdeal = windowMin;
			this.#windowMaxIdeal = windowMax;
			this.clampWindowToRange();

			const scrollSize = this.#scrollSize;
			const windowSize = this.#windowSize;
			const isMinTerminal = this.#isMinTerminal;
			const isMaxTerminal = this.#isMaxTerminal;
			const resyncThresholdSize = this.#resyncThresholdSize;

			const minScrollPos = isMinTerminal ? ZERO : resyncThresholdSize;
			const maxScrollPos =
				Math.ceil(scrollSize - windowSize) -
				(isMaxTerminal ? ZERO : resyncThresholdSize);

			// If the new start position of the window is not located at an integer
			// position or the new window is outside of the thresholds, reset.
			if (
				oldWindowRange !== this.#windowRange ||
				~~targetScrollPos !== targetScrollPos ||
				targetScrollPos <= minScrollPos ||
				targetScrollPos >= maxScrollPos
			) {
				this.resetScrollState();
			}
		}
	}

	/**
	 * The value of these fields may change as a side effect of calling this
	 * method.
	 * - `size`
	 * - `scrollPos`
	 * - `scrollSize`
	 */
	public setWindowSize(windowSize: number): void {
		validateSize(
			"windowSize",
			windowSize,
			ZERO,
			true,
			this.#maxElementSize,
			true,
		);

		if (windowSize !== this.#windowSize) {
			this.#windowSize = windowSize;

			if (this.#resizeStrategy === "preserveUnitPerPixel") {
				const windowMin = this.#windowMin;

				this.setWindowExtrema(
					windowMin,
					this.getValue(this.getPos(windowMin) + windowSize),
				);
			}

			this.setComputedSizes();

			this.resetScrollState();
		}
	}

	private clampWindowToRange(): void {
		const range = this.#range;
		const min = this.#min;
		const max = this.#max;
		const windowMinIdeal = this.#windowMinIdeal;
		const windowMaxIdeal = this.#windowMaxIdeal;
		const windowRangeIdeal = windowMaxIdeal - windowMinIdeal;

		let windowMin: number;
		let windowMax: number;

		if (windowRangeIdeal > range) {
			windowMin = min;
			windowMax = max;
		} else if (windowMinIdeal < min) {
			windowMin = min;
			windowMax = min + windowRangeIdeal;
		} else if (windowMaxIdeal > max) {
			windowMin = max - windowRangeIdeal;
			windowMax = max;
		} else {
			windowMin = windowMinIdeal;
			windowMax = windowMaxIdeal;
		}

		this.#windowMin = windowMin;
		this.#windowMax = windowMax;
		this.#windowRange = windowMax - windowMin;

		this.setComputedSizes();
	}

	private resetScrollState(): void {
		const max = this.#max;
		const maxElementSize = this.#maxElementSize;
		const min = this.#min;
		const pixelPerUnit = this.#pixelPerUnit;
		const resyncThresholdSize = this.#resyncThresholdSize;
		const windowMax = this.#windowMax;
		const windowMin = this.#windowMin;
		const windowSize = this.#windowSize;

		const minToStartSize = pixelPerUnit * (windowMin - min);
		const endToMaxSize = pixelPerUnit * (max - windowMax);
		const startToMaxSize = pixelPerUnit * (max - windowMin);

		const minToStartSizeWhole = Math.ceil(minToStartSize);
		const startToMaxSizeWhole = Math.ceil(startToMaxSize);

		const minOverflowSize = DOUBLE * resyncThresholdSize;
		const maxScrollSize = Math.max(
			maxElementSize,

			// The scroll size needs to be at least the window size plus some buffer
			// on either side.
			windowSize + minOverflowSize + minOverflowSize,
		);

		// The size is split at the start position of the window to account for
		// partial pixels on either side.
		const size = minToStartSizeWhole + startToMaxSizeWhole;

		const scrollSize = Math.min(size, maxScrollSize);

		const maxScrollPos = scrollSize - windowSize;
		const halfScrollPos = Math.floor(HALF * maxScrollPos);

		const scrollPos = Math.round(
			Math.min(
				Math.max(scrollSize - startToMaxSizeWhole, halfScrollPos),
				minToStartSizeWhole,
			),
		);

		const isFullRange = size <= scrollSize;

		this.#scrollSize = scrollSize;
		this.#scrollPos = scrollPos;
		this.#isMinTerminal = isFullRange || minToStartSize <= halfScrollPos;
		this.#isMaxTerminal = isFullRange || endToMaxSize <= halfScrollPos;
	}

	private setComputedSizes(): void {
		const range = this.#range;
		const windowRange = this.#windowRange;
		const windowSize = this.#windowSize;

		const unitPerPixel = windowRange / windowSize;
		const pixelPerUnit = windowSize / windowRange;

		this.#unitPerPixel = unitPerPixel;
		this.#pixelPerUnit = pixelPerUnit;
		this.#size = pixelPerUnit * range;
	}
}
