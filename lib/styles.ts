import { css } from "./css.ts";
import { Singleton } from "./singleton.ts";

const buildStylesheet = (): CSSStyleSheet => {
	const stylesheet = new CSSStyleSheet();

	stylesheet.replaceSync(css`
		:host {
			display: flex;
			position: relative;
		}

		.cg-content {
			display: grid;
			flex: 1;
			grid-template:
				"top-left top top-right" var(--top-bar-height, 0)
				"left center right" minmax(var(--timeline-height, 500px), 1fr)
				"bottom-left bottom bottom-right" var(--bottom-bar-height, 0)
				/ var(--left-bar-width, 0) var(--timeline-width) var(--right-bar-width, 0);
			height: 100%;
			overflow: auto;
			position: relative;

			/* Hide the scrollbars */
			scrollbar-width: none;
		}

		.content::-webkit-scrollbar {
			/* Required for Webkit browsers until standards support */
			display: none;
		}

		.cg-timeline {
			background-image: repeating-linear-gradient(-45deg, #00f, #f0f 100px);
			grid-area: center;
			position: relative;
		}

		.cg-bar-top {
			background-color: #f00;
			grid-area: top;
			position: sticky;
			top: 0;
		}

		.cg-bar-left {
			background-color: #0f0;
			left: 0;
			grid-area: left;
			position: sticky;
		}

		.cg-bar-right {
			background-color: #0f0;
			grid-area: right;
			position: sticky;
			right: 0;
		}

		.cg-bar-bottom {
			background-color: #f00;
			bottom: 0;
			grid-area: bottom;
			position: sticky;
		}

		.cg-bar-top-left {
			background-color: #0ff;
			left: 0;
			grid-area: top-left;
			position: sticky;
			top: 0;
		}

		.cg-bar-top-right {
			background-color: #0ff;
			grid-area: top-right;
			position: sticky;
			right: 0;
			top: 0;
		}

		.cg-bar-bottom-left {
			background-color: #0ff;
			bottom: 0;
			left: 0;
			grid-area: bottom-left;
			position: sticky;
		}

		.cg-bar-bottom-right {
			background-color: #0ff;
			bottom: 0;
			grid-area: bottom-right;
			position: sticky;
			right: 0;
		}

		.cg-divider-top,
		.cg-divider-left,
		.cg-divider-right,
		.cg-divider-bottom {
			--bar-size: 3px;
			--interact-margin: 5px;
			--hover-size: 60px;

			/* Interaction area */
			background-clip: content-box;
			background-color: #ccc;
			box-sizing: content-box;
			opacity: 0;
			position: absolute;
			transition: opacity 0.25s ease-in 0.5s;
		}

		.cg-divider-top,
		.cg-divider-bottom {
			/* Interaction area */
			clip-path: polygon(
				var(--hover-size) calc(50% - var(--hover-size)),
				calc(100% - var(--hover-size)) calc(50% - var(--hover-size)),
				100% 50%,
				calc(100% - var(--hover-size)) calc(50% + var(--hover-size)),
				var(--hover-size) calc(50% + var(--hover-size)),
				0 50%
			);
			height: var(--bar-size);
			left: var(--left-bar-width, 0);
			padding: var(--interact-margin) 0;
			right: var(--right-bar-width, 0);
			transform: translateY(-50%);
		}

		.cg-divider-top {
			/* Interaction area */
			top: var(--top-bar-height, 0);
		}

		.cg-divider-left {
			/* Interaction area */
			left: var(--left-bar-width, 0);
		}

		.cg-divider-right {
			/* Interaction area */
			left: calc(100% - var(--right-bar-width, 0));
		}

		.cg-divider-bottom {
			/* Interaction area */
			top: calc(100% - var(--bottom-bar-height, 0));
		}

		.cg-divider-top:hover,
		.cg-divider-left:hover,
		.cg-divider-right:hover,
		.cg-divider-bottom:hover {
			/* Interaction area */
			opacity: 1;
			transition-delay: 0s;
			transition-duration: 0s;
		}

		.cg-divider-top::before,
		.cg-divider-left::before,
		.cg-divider-right::before,
		.cg-divider-bottom::before {
			/* Cursor area */
			content: "";
			height: 100%;
			left: 0;
			top: 0;
			position: absolute;
			width: 100%;
		}

		.cg-divider-top::before,
		.cg-divider-bottom::before {
			/* Cursor area */
			cursor: ns-resize;
		}

		.cg-divider-top::after,
		.cg-divider-left::after,
		.cg-divider-right::after,
		.cg-divider-bottom::after {
			/* Hover area */
			content: "";
			position: absolute;
			z-index: -1;
		}

		.cg-divider-top::after,
		.cg-divider-bottom::after {
			/* Hover area */
			height: var(--hover-size);
			top: 50%;
			transform: translateY(-50%);
			width: 100%;
		}
	`);

	return stylesheet;
};

/** Lazily instanciated stylesheet singleton. */
export const stylesheet = new Singleton(buildStylesheet);
