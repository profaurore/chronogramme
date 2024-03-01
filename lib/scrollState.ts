import {
	DOUBLE,
	HALF,
	ZERO,
	clampInterval,
	validateInterval,
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

		const {
			max,
			maxElementSize = defaultMaxElementSize,
			min,
			resyncThresholdSize = defaultResyncThresholdSize,
			windowMax,
			windowMin,
			windowSize,
		} = parameters;

		validateSize("maxElementSize", maxElementSize);
		this.#maxElementSize = maxElementSize;

		validateSize(
			"resyncThresholdSize",
			resyncThresholdSize,
			HALF * Number.MAX_VALUE,
		);
		this.#resyncThresholdSize = resyncThresholdSize;

		validateSize("windowSize", windowSize, maxElementSize);
		this.#windowSize = windowSize;

		validateInterval("min", "max", "extrema", [min, max]);
		this.#min = min;
		this.#max = max;
		this.#range = max - min;

		validateInterval("windowMin", "windowMax", "windowExtrema", [
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

		this.setComputedDimensions();
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

	private setComputedDimensions(): void {
		const range = this.#range;
		const windowRange = this.#windowRange;
		const windowSize = this.#windowSize;

		const unitPerPixel = windowRange / windowSize;
		const pixelPerUnit = windowSize / windowRange;

		this.#unitPerPixel = unitPerPixel;
		this.#pixelPerUnit = pixelPerUnit;
		this.#size = pixelPerUnit * range;
	}

	public setExtrema(minimum: number, maximum: number): this {
		validateInterval("min", "max", "extrema", [minimum, maximum]);

		const min = this.#min;
		const max = this.#max;

		if (minimum !== min && maximum !== max) {
			this.#min = minimum;
			this.#max = maximum;
			this.#range = maximum - minimum;
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

	public setWindowExtrema(minimum: number, maximum: number): this {
		validateInterval("windowMin", "windowMax", "windowExtrema", [
			minimum,
			maximum,
		]);

		if (minimum !== this.#windowMin || maximum !== this.#windowMax) {
			this.#windowMin = minimum;
			this.#windowMax = maximum;
			this.#windowRange = maximum - minimum;
			this.clampWindowToRange();

			this.resetScrollState();
		}

		return this;
	}

	public setWindowSize(windowSize: number): this {
		validateSize("windowSize", windowSize, this.#maxElementSize);

		if (windowSize !== this.#windowSize) {
			this.#windowSize = windowSize;

			this.setComputedDimensions();

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
