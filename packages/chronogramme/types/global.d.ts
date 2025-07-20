import type {
	BarResizeStrategyOptions,
	BarSideResizeStrategyOptions,
} from "../src/barStateUtils";
import type { Interval, IntervalString } from "../src/math";
import type { Scroller } from "../src/scroller";
import type { ScrollResizeStrategyOptions } from "../src/scrollState";
import type { BaseGroup, BaseItem, Timeline } from "../src/timeline";

declare global {
	// biome-ignore lint/style/noNamespace: Required for web components.
	namespace React.JSX {
		interface DetailedCustomElementProps<T>
			extends Omit<React.HTMLAttributes<T>, "className"> {
			class?: string | undefined;
		}

		interface ScrollerAttributes {
			// Dashed attributes may cause issues with type checking, but they make
			// the attributes more readable.
			// https://github.com/microsoft/TypeScript/issues/55182
			"default-resize-handles"?: boolean | undefined;
			"h-bar-resize-strategy"?: BarResizeStrategyOptions | undefined;
			"h-bar-side-resize-strategy"?: BarSideResizeStrategyOptions | undefined;
			"h-end-extrema"?: Interval | IntervalString | undefined;
			"h-end-size"?: number | undefined;
			"h-extrema"?: Interval | IntervalString | undefined;
			"h-max-element-size"?: number | undefined;
			"h-middle-min"?: number | undefined;
			"h-resync-threshold-size"?: number | undefined;
			"h-scroll-resize-strategy"?: ScrollResizeStrategyOptions | undefined;
			"h-start-extrema"?: Interval | IntervalString | undefined;
			"h-start-size"?: number | undefined;
			"h-window"?: Interval | undefined;
			"v-bar-resize-strategy"?: BarResizeStrategyOptions | undefined;
			"v-bar-side-resize-strategy"?: BarSideResizeStrategyOptions | undefined;
			"v-end-extrema"?: Interval | IntervalString | undefined;
			"v-end-size"?: number | undefined;
			"v-extrema"?: Interval | undefined;
			"v-max-element-size"?: number | undefined;
			"v-middle-min"?: number | undefined;
			"v-resync-threshold-size"?: number | undefined;
			"v-scroll-resize-strategy"?: ScrollResizeStrategyOptions | undefined;
			"v-start-extrema"?: Interval | IntervalString | undefined;
			"v-start-size"?: number | undefined;
			"v-window"?: Interval | undefined;
		}

		interface TimelineAttributes extends ScrollerAttributes {
			"line-size"?: number | undefined;
		}

		interface IntrinsicElements {
			"cg-scroller": React.DetailedHTMLProps<
				DetailedCustomElementProps<Scroller>,
				Scroller
			> &
				ScrollerAttributes;

			"cg-timeline": React.DetailedHTMLProps<
				DetailedCustomElementProps<
					InstanceType<
						Timeline<
							number,
							BaseGroup<number>,
							number,
							BaseItem<number, number>
						>
					>
				>,
				InstanceType<
					Timeline<number, BaseGroup<number>, number, BaseItem<number, number>>
				>
			> &
				TimelineAttributes;
		}
	}
}
