import {
	DOUBLE,
	HALF,
	ZERO,
	clampInterval,
	validateNumberInterval,
	validatePosition,
	validateSize,
} from "./math.ts";
import { validateObject } from "./object.ts";

interface ScrollStateOptions {
	max: number;
	maxElementSize?: number | undefined;
	min: number;
	resyncThresholdSize?: number | undefined;
	windowMax: number;
	windowMin: number;
	windowSize: number;
}

const defaultResyncThresholdSize = 500;

export const defaultMaxElementSize = 1000000;

const requiredParameters = [
	"min",
	"max",
	"windowMin",
	"windowMax",
	"windowSize",
] as const;

const optionalParameters = ["maxElementSize", "resyncThresholdSize"] as const;

export class ScrollState {
	#isMaxTerminal!: boolean;

	#isMinTerminal!: boolean;

	#max: number;

	readonly #maxElementSize: number;

	#min: number;

	#pixelPerUnit!: number;

	#range: number;

	readonly #resyncThresholdSize: number;

	#scrollPos!: number;

	#scrollSize!: number;

	#size!: number;

	#unitPerPixel!: number;

	#windowMax: number;

	#windowMin: number;

	#windowRange: number;

	#windowSize: number;

	public constructor(parameters: Readonly<ScrollStateOptions>) {
		validateObject(
			"parameters",
			parameters,
			requiredParameters,
			optionalParameters,
		);

		const max = parameters.max;
		const maxElementSize = parameters.maxElementSize ?? defaultMaxElementSize;
		const min = parameters.min;
		const resyncThresholdSize =
			parameters.resyncThresholdSize ?? defaultResyncThresholdSize;
		const windowMax = parameters.windowMax;
		const windowMin = parameters.windowMin;
		const windowSize = parameters.windowSize;

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

		validateSize("windowSize", windowSize, ZERO, false, maxElementSize, true);
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
		this.#windowMax = windowMax;
		this.#windowRange = windowMax - windowMin;
		this.clampWindowToRange();

		this.resetScrollState();
	}

	private clampWindowToRange(): void {
		const range = this.#range;
		const windowRange = this.#windowRange;
		const min = this.#min;
		const max = this.#max;
		const windowMin = this.#windowMin;
		const windowMax = this.#windowMax;

		let newWindowMin: number;
		let newWindowMax: number;

		if (windowRange > range) {
			newWindowMin = min;
			newWindowMax = max;
		} else if (windowMin < min) {
			newWindowMin = min;
			newWindowMax = min + windowRange;
		} else if (windowMax > max) {
			newWindowMin = max - windowRange;
			newWindowMax = max;
		} else {
			newWindowMin = windowMin;
			newWindowMax = windowMax;
		}

		this.#windowMin = newWindowMin;
		this.#windowMax = newWindowMax;
		this.#windowRange = newWindowMax - newWindowMin;

		this.setComputedSizes();
	}

	private resetScrollState(): void {
		const windowMin = this.#windowMin;
		const windowMax = this.#windowMax;
		const min = this.#min;
		const max = this.#max;
		const windowSize = this.#windowSize;
		const pixelPerUnit = this.#pixelPerUnit;
		const resyncThresholdSize = this.#resyncThresholdSize;
		const maxElementSize = this.#maxElementSize;

		const minToStartSize = pixelPerUnit * (windowMin - min);
		const endToMaxSize = pixelPerUnit * (max - windowMax);
		const startToMaxSize = pixelPerUnit * (max - windowMin);

		const minToStarSizeWhole = Math.ceil(minToStartSize);
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
		const size = minToStarSizeWhole + startToMaxSizeWhole;

		const scrollSize = Math.min(size, maxScrollSize);

		const maxScrollPosition = scrollSize - windowSize;
		const halfScrollPosition = Math.floor(HALF * maxScrollPosition);

		const scrollPos = Math.round(
			Math.min(
				Math.max(scrollSize - startToMaxSizeWhole, halfScrollPosition),
				minToStarSizeWhole,
			),
		);

		const isFullRange = size <= scrollSize;

		this.#scrollSize = scrollSize;
		this.#scrollPos = scrollPos;
		this.#isMinTerminal = isFullRange || minToStartSize <= halfScrollPosition;
		this.#isMaxTerminal = isFullRange || endToMaxSize <= halfScrollPosition;
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

	public setExtrema(min: number, max: number): this {
		validateNumberInterval("min", "max", "extrema", [min, max]);

		if (min !== this.#min || max !== this.#max) {
			this.#min = min;
			this.#max = max;
			this.#range = max - min;
			this.clampWindowToRange();

			this.resetScrollState();
		}

		return this;
	}

	public setScrollPos(scrollPos: number): this {
		const scrollSize = this.#scrollSize;
		const windowSize = this.#windowSize;

		const maxScrollPosition = scrollSize - windowSize;

		validatePosition("scrollPos", scrollPos, ZERO, maxScrollPosition);

		const deltaX = scrollPos - this.#scrollPos;

		if (deltaX) {
			const prevWindowMin = this.#windowMin;
			const min = this.#min;
			const max = this.#max;
			const resyncThresholdSize = this.#resyncThresholdSize;
			const windowRange = this.#windowRange;
			const isMinTerminal = this.#isMinTerminal;
			const isMaxTerminal = this.#isMaxTerminal;
			const unitPerPixel = this.#unitPerPixel;

			const unitDelta = unitPerPixel * deltaX;
			const targetWindowMin = prevWindowMin + unitDelta;
			const [windowMin, windowMax] = clampInterval(
				targetWindowMin,
				targetWindowMin + windowRange,
				min,
				max,
			);

			this.#windowMin = windowMin;
			this.#windowMax = windowMax;

			// Force a recalculation if one of the extrema is reached or if within a
			// resync threshold.
			if (
				scrollPos === ZERO ||
				scrollPos === maxScrollPosition ||
				windowMin <= min ||
				windowMax >= max ||
				(!isMinTerminal && scrollPos <= resyncThresholdSize) ||
				(!isMaxTerminal && scrollPos >= maxScrollPosition - resyncThresholdSize)
			) {
				this.resetScrollState();
			} else {
				this.#scrollPos = scrollPos;
			}
		}

		return this;
	}

	public setWindowExtrema(windowMin: number, windowMax: number): this {
		validateNumberInterval("windowMin", "windowMax", "windowExtrema", [
			windowMin,
			windowMax,
		]);

		if (windowMin !== this.#windowMin || windowMax !== this.#windowMax) {
			this.#windowMin = windowMin;
			this.#windowMax = windowMax;
			this.#windowRange = windowMax - windowMin;
			this.clampWindowToRange();

			this.resetScrollState();
		}

		return this;
	}

	public setWindowSize(windowSize: number): this {
		validateSize(
			"windowSize",
			windowSize,
			ZERO,
			false,
			this.#maxElementSize,
			true,
		);

		if (windowSize !== this.#windowSize) {
			this.#windowSize = windowSize;

			this.setComputedSizes();

			this.resetScrollState();
		}

		return this;
	}

	public get max(): number {
		return this.#max;
	}

	public get min(): number {
		return this.#min;
	}

	public get range(): number {
		return this.#range;
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
}
