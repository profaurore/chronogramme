import { css } from "./css.ts";
import { Singleton } from "./singleton.ts";

function buildScrollerStylesheet(): CSSStyleSheet {
	const stylesheet = new CSSStyleSheet();

	stylesheet.replaceSync(css`
	  :host {
			display: block;
		}

		#container {
			display: flex;
			height: 100%;
			overscroll-behavior: none;
			position: relative;
			user-select: none; 
			width: 100%;
		}

		#content {
			display: grid;
			flex: 1;
			grid-template:
				"h-start-v-start v-start h-end-v-start" var(--v-start-bar-size, 0)
				"h-start center h-end" minmax(var(--v-size, 500px), 1fr)
				"h-start-v-end v-end h-end-v-end" var(--v-end-bar-size, 0)
				/ var(--h-start-bar-size, 0) var(--h-size) var(--h-end-bar-size, 0);
			height: 100%;
			overflow: auto;
			overflow-anchor: none;
			position: relative;

			/* Hide the scrollbars */
			scrollbar-width: none;
		}

		#content::-webkit-scrollbar {
			/*
			 * Required for Webkit browsers until they receive support for the
			 * standard scrollbar-width.
			 */
			display: none;
		}

		#center {
			background-image: repeating-linear-gradient(135deg, #00f, #f0f 100px);
			grid-area: center;
			position: relative;
		}

		/* Bar Areas */

		#bar-h-start {
			background-color: #0f0;
			display: var(--h-start-bar-display, unset);
			left: 0;
			grid-area: h-start;
			position: sticky;
		}

		#bar-h-end {
			background-color: #0f0;
			display: var(--h-end-bar-display, unset);
			grid-area: h-end;
			position: sticky;
			right: 0;
		}

		#bar-v-start {
			background-color: #f00;
			display: var(--v-start-bar-display, unset);
			grid-area: v-start;
			position: sticky;
			top: 0;
		}

		#bar-v-end {
			background-color: #f00;
			display: var(--v-end-bar-display, unset);
			bottom: 0;
			grid-area: v-end;
			position: sticky;
		}

		/* Corner Areas */

		#corner-h-start-v-start {
			background-color: #0ff;
			display: var(--h-start-bar-display, var(--v-start-bar-display, unset));
			left: 0;
			grid-area: h-start-v-start;
			position: sticky;
			top: 0;
		}

		#corner-h-start-v-end {
			background-color: #0ff;
			display: var(--h-start-bar-display, var(--v-end-bar-display, unset));
			bottom: 0;
			left: 0;
			grid-area: h-start-v-end;
			position: sticky;
		}

		#corner-h-end-v-start {
			background-color: #0ff;
			display: var(--h-end-bar-display, var(--v-start-bar-display, unset));
			grid-area: h-end-v-start;
			position: sticky;
			right: 0;
			top: 0;
		}

		#corner-h-end-v-end {
			background-color: #0ff;
			display: var(--h-end-bar-display, var(--v-end-bar-display, unset));
			bottom: 0;
			grid-area: h-end-v-end;
			position: sticky;
			right: 0;
		}

		/* Custom Dividers */

		#divider-v-start {
			display: var(--v-start-bar-display, contents);
		}

		#divider-v-end {
			display: var(--v-end-bar-display, contents);
		}

		#divider-h-start {
			display: var(--h-start-bar-display, contents);
		}

		#divider-h-end {
			display: var(--h-end-bar-display, contents);
		}

		/* Default Dividers' Interaction Area */

		#divider-v-start.default,
		#divider-v-end.default,
		#divider-h-start.default,
		#divider-h-end.default {
			--bar-size: 3px;
			--interact-margin: 5px;
			--hover-size: 60px;

			background-clip: content-box;
			background-color: #ccc;
			box-sizing: content-box;
			opacity: 0;
			position: absolute;
			transition: opacity 0.25s ease-in 0.5s;
		}

		#divider-v-start.default,
		#divider-v-end.default {
			clip-path: polygon(
				var(--hover-size) calc(50% - var(--hover-size)),
				calc(100% - var(--hover-size)) calc(50% - var(--hover-size)),
				100% 50%,
				calc(100% - var(--hover-size)) calc(50% + var(--hover-size)),
				var(--hover-size) calc(50% + var(--hover-size)),
				0 50%
			);
			height: var(--bar-size);
			left: var(--h-start-bar-size, 0);
			padding: var(--interact-margin) 0;
			right: var(--h-end-bar-size, 0);
			transform: translateY(-50%);
		}

		#divider-h-start.default,
		#divider-h-end.default {
			bottom: var(--v-end-bar-size, 0);
			clip-path: polygon(
				calc(50% - var(--hover-size)) var(--hover-size),
				calc(50% - var(--hover-size)) calc(100% - var(--hover-size)),
				50% 100%,
				calc(50% + var(--hover-size)) calc(100% - var(--hover-size)),
				calc(50% + var(--hover-size)) var(--hover-size),
				50% 0
			);
			padding: 0 var(--interact-margin);
			top: var(--v-start-bar-size, 0);
			transform: translateX(-50%);
			width: var(--bar-size);
		}

		#divider-v-start.default {
			display: var(--v-start-bar-display, block);
			top: var(--v-start-bar-size, 0);
		}

		#divider-h-start.default {
			display: var(--h-start-bar-display, block);
			left: var(--h-start-bar-size, 0);
		}

		#divider-h-end.default {
			display: var(--h-end-bar-display, block);
			left: calc(100% - var(--h-end-bar-size, 0));
		}

		#divider-v-end.default {
			display: var(--v-end-bar-display, block);
			top: calc(100% - var(--v-end-bar-size, 0));
		}

		#divider-v-start.default:hover,
		#divider-v-end.default:hover,
		#divider-h-start.default:hover,
		#divider-h-end.default:hover {
			opacity: 1;
			transition-delay: 0s;
			transition-duration: 0s;
		}

		/* Default Dividers' Cursor Area */

		#divider-v-start.default::before,
		#divider-v-end.default::before,
		#divider-h-start.default::before,
		#divider-h-end.default::before {
			content: "";
			height: 100%;
			left: 0;
			top: 0;
			position: absolute;
			width: 100%;
		}

		#divider-v-start.default::before,
		#divider-v-end.default::before {
			cursor: ns-resize;
		}

		#divider-h-start.default::before,
		#divider-h-end.default::before {
			cursor: ew-resize;
		}

		/* Default Dividers' Hover Area */

		#divider-v-start.default::after,
		#divider-v-end.default::after, 
		#divider-h-start.default::after,
		#divider-h-end.default::after {
			content: "";
			position: absolute;
			z-index: -1;
		}

		#divider-v-start.default::after,
		#divider-v-end.default::after {
			height: var(--hover-size);
			top: 50%;
			transform: translateY(-50%);
			width: 100%;
		}
	`);

	return stylesheet;
}

/** Lazily instanciated stylesheet singleton. */
export const scrollerStylesheet = new Singleton(buildScrollerStylesheet);

function buildTimelineStylesheet(): CSSStyleSheet {
	const stylesheet = new CSSStyleSheet();

	stylesheet.replaceSync(css`
	  :host {
			display: block;
		}
	`);

	return stylesheet;
}

/** Lazily instanciated stylesheet singleton. */
export const timelineStylesheet = new Singleton(buildTimelineStylesheet);
