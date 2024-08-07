import type { Scroller } from "./Scroller.ts";
import type { Timeline } from "./Timeline.ts";
import type {
	ResizeStrategyOptions,
	SideResizeStrategyOptions,
} from "./barStateUtils.ts";
import type { Interval, IntervalString } from "./math.ts";

declare global {
	// biome-ignore lint/style/noNamespace: Required for web components.
	namespace React.JSX {
		interface IntrinsicElements {
			"cg-scroller": Omit<
				React.DetailedHTMLProps<React.HTMLAttributes<Scroller>, Scroller>,
				"className"
			> & {
				class?: string | undefined;
				// Dashed attributes may cause issues with type checking, but they make
				// the attributes more readable.
				// https://github.com/microsoft/TypeScript/issues/55182
				"default-resize-handles"?: boolean | undefined;
				"h-end-extrema"?: Interval | IntervalString | undefined;
				"h-end-size"?: number | undefined;
				"h-extrema"?: Interval | IntervalString | undefined;
				"h-max-element-size"?: number | undefined;
				"h-middle-min"?: number | undefined;
				"h-resize-strategy"?: ResizeStrategyOptions | undefined;
				"h-resync-threshold-size"?: number | undefined;
				"h-side-resize-strategy"?: SideResizeStrategyOptions | undefined;
				"h-start-extrema"?: Interval | IntervalString | undefined;
				"h-start-size"?: number | undefined;
				"h-window"?: [number, number] | undefined;
				"v-end-extrema"?: Interval | IntervalString | undefined;
				"v-end-size"?: number | undefined;
				"v-extrema"?: [number, number] | undefined;
				"v-max-element-size"?: number | undefined;
				"v-middle-min"?: number | undefined;
				"v-resize-strategy"?: ResizeStrategyOptions | undefined;
				"v-resync-threshold-size"?: number | undefined;
				"v-side-resize-strategy"?: SideResizeStrategyOptions | undefined;
				"v-start-extrema"?: Interval | IntervalString | undefined;
				"v-start-size"?: number | undefined;
				"v-window"?: [number, number] | undefined;
			};

			"cg-timeline": Omit<
				React.DetailedHTMLProps<React.HTMLAttributes<Timeline>, Timeline>,
				"className"
			> & {
				class?: string | undefined;
			};
		}
	}
}
