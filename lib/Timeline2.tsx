import { ScrollState } from "./scrollState.ts";
import { Singleton } from "./singleton.ts";
import { stylesheet } from "./styles.ts";
import {
	TIME_MAX,
	TIME_MIN,
	getTimeInterval,
	parseTimeInterval,
} from "./time.ts";

const verticalBarMinHeight = 50;
const horizontalBarMinWidth = 100;
const timelineMinWidth = 100;

export class TimeChangeEventDetail {
	public prevTimeWindowMax: number;

	public prevTimeWindowMin: number;

	public timeWindowMax: number;

	public timeWindowMin: number;

	public constructor(
		prevTimeWindowMax: number,
		prevTimeWindowMin: number,
		timeWindowMax: number,
		timeWindowMin: number,
	) {
		this.prevTimeWindowMax = prevTimeWindowMax;
		this.prevTimeWindowMin = prevTimeWindowMin;
		this.timeWindowMax = timeWindowMax;
		this.timeWindowMin = timeWindowMin;
	}
}

export class Timeline2 extends HTMLElement {
	public static observedAttributes = ["windowTime"];

	public static webComponentName = "cg-timeline" as const;

	readonly #bottomBarHeight: number = verticalBarMinHeight;

	readonly #contentElement: HTMLDivElement;

	readonly #leftBarWidth: number = horizontalBarMinWidth;

	readonly #rightBarWidth: number = horizontalBarMinWidth;

	readonly #shadow: ShadowRoot;

	readonly #topBarHeight: number = verticalBarMinHeight;

	readonly #viewState: ScrollState;

	private static readonly resizeHandler = new Singleton(
		() =>
			new ResizeObserver(([entry]: readonly ResizeObserverEntry[]) => {
				const target = entry?.target;

				if (target instanceof Timeline2) {
					target.onResizeHandler();
				}
			}),
		(resizeObserver) => {
			resizeObserver.disconnect();
		},
	);

	public constructor() {
		super();

		// Center
		const timeline = document.createElement("div");
		timeline.className = "cg-timeline";
		timeline.appendChild(document.createTextNode("timeline"));

		// Sides
		const topBar = document.createElement("div");
		topBar.className = "cg-bar-top";
		topBar.appendChild(document.createTextNode("top"));

		const leftBar = document.createElement("div");
		leftBar.className = "cg-bar-left";
		leftBar.appendChild(document.createTextNode("left"));

		const rightBar = document.createElement("div");
		rightBar.className = "cg-bar-right";
		rightBar.appendChild(document.createTextNode("right"));

		const bottomBar = document.createElement("div");
		bottomBar.className = "cg-bar-bottom";
		bottomBar.appendChild(document.createTextNode("bottom"));

		// Corners
		const topLeftBar = document.createElement("div");
		topLeftBar.className = "cg-bar-top-left";
		topLeftBar.appendChild(document.createTextNode("top-left"));

		const topRightBar = document.createElement("div");
		topRightBar.className = "cg-bar-top-right";
		topRightBar.appendChild(document.createTextNode("top-right"));

		const bottomLeftBar = document.createElement("div");
		bottomLeftBar.className = "cg-bar-bottom-left";
		bottomLeftBar.appendChild(document.createTextNode("bottom-left"));

		const bottomRightBar = document.createElement("div");
		bottomRightBar.className = "cg-bar-bottom-right";
		bottomRightBar.appendChild(document.createTextNode("bottom-right"));

		// Content
		const content = document.createElement("div");
		this.#contentElement = content;
		content.className = "cg-content";
		content.addEventListener("scroll", () => {
			this.scrollHandler();
		});
		content.appendChild(timeline);
		content.appendChild(topBar);
		content.appendChild(leftBar);
		content.appendChild(rightBar);
		content.appendChild(bottomBar);
		content.appendChild(topLeftBar);
		content.appendChild(topRightBar);
		content.appendChild(bottomLeftBar);
		content.appendChild(bottomRightBar);

		// Dividers
		const topDivider = document.createElement("div");
		topDivider.className = "cg-divider-top";

		const leftDivider = document.createElement("div");
		leftDivider.className = "cg-divider-left";

		const rightDivider = document.createElement("div");
		rightDivider.className = "cg-divider-right";

		const bottomDivider = document.createElement("div");
		bottomDivider.className = "cg-divider-bottom";

		// Root
		const shadow = this.attachShadow({ mode: "closed" });
		shadow.appendChild(content);
		shadow.appendChild(topDivider);
		shadow.appendChild(leftDivider);
		shadow.appendChild(rightDivider);
		shadow.appendChild(bottomDivider);

		this.#shadow = shadow;

		this.#viewState = new ScrollState({
			max: TIME_MAX,
			min: TIME_MIN,
			windowMax: TIME_MAX,
			windowMin: TIME_MIN,
			windowSize: timelineMinWidth,
		});
	}

	// @ts-expect-error Protected method used by HTMLElement
	private attributeChangedCallback(
		name: string,
		_oldValue: string,
		newValue: string,
	): void {
		switch (name) {
			case "windowTime":
				this.setTimeWindowExtrema(
					...parseTimeInterval("Window Time", newValue),
				);
				break;
		}
	}

	// @ts-expect-error Protected method used by HTMLElement
	private connectedCallback(): void {
		// Properties set before the Web Component was properly configured.
		// if (Object.hasOwn(this, "windowTime")) {
		//   const value = (this as Record<string, unknown>).windowTime;
		//   delete (this as Record<string, unknown>).windowTime;
		//   this.windowTime = value;
		// } else {
		//   this.windowTime = getTimeInterval();
		// }

		const timeExtrema = this.getAttribute("timeExtrema");

		if (timeExtrema === null) {
			this.setTimeExtrema(TIME_MIN, TIME_MAX);
		} else {
			this.setTimeExtrema(...parseTimeInterval("Time Extrema", timeExtrema));
		}

		const windowTime = this.getAttribute("windowTime");

		if (windowTime === null) {
			this.setTimeWindowExtrema(...getTimeInterval());
		} else {
			this.setTimeWindowExtrema(
				...parseTimeInterval("Window Time", windowTime),
			);
		}

		// Styles
		this.#shadow.adoptedStyleSheets.push(stylesheet.subscribe());
		this.setStyleVariable("--bottom-bar-height", `${this.#bottomBarHeight}px`);
		this.setStyleVariable("--left-bar-width", `${this.#leftBarWidth}px`);
		this.setStyleVariable("--right-bar-width", `${this.#rightBarWidth}px`);
		this.setStyleVariable("--timeline-height", "500px");
		this.setStyleVariable("--timeline-width", "1000000px");
		this.setStyleVariable("--top-bar-height", `${this.#topBarHeight}px`);

		const resizeObserver = Timeline2.resizeHandler.subscribe();
		resizeObserver.observe(this, { box: "content-box" });
		this.onResizeHandler();
	}

	// @ts-expect-error Protected method used by HTMLElement
	private disconnectedCallback(): void {
		Timeline2.resizeHandler.unsubscribe((resizeObserver) => {
			resizeObserver.unobserve(this);
		});

		stylesheet.unsubscribe();
	}

	private onResizeHandler(): void {
		const { clientWidth } = this;
		const leftBarWidth = this.#leftBarWidth;
		const rightBarWidth = this.#rightBarWidth;
		const viewState = this.#viewState;

		viewState.setWindowSize(clientWidth - leftBarWidth - rightBarWidth);

		const { scrollPos, scrollSize } = viewState;
		this.setStyleVariable("--timeline-width", `${scrollSize}px`);
		this.#contentElement.scrollTo({ left: scrollPos });
	}

	private scrollHandler(): void {
		const viewState = this.#viewState;
		const { scrollLeft } = this.#contentElement;

		this.stateChangeHandler(() => viewState.setScrollPos(scrollLeft));
	}

	private setStyleVariable(name: string, value: string): void {
		this.style.setProperty(name, value);
	}

	private stateChangeHandler(fn: () => void): void {
		const viewState = this.#viewState;
		const {
			scrollPos: prevScrollPos,
			windowMax: prevWindowMax,
			windowMin: prevWindowMin,
		} = viewState;

		fn();

		const { scrollPos, windowMax, windowMin } = viewState;

		if (windowMin !== prevWindowMin || windowMax !== prevWindowMax) {
			this.dispatchEvent(
				new CustomEvent<TimeChangeEventDetail>("timeChange", {
					detail: new TimeChangeEventDetail(
						prevWindowMax,
						prevWindowMin,
						windowMax,
						windowMin,
					),
				}),
			);
		}

		if (scrollPos !== prevScrollPos) {
			this.#contentElement.scrollTo({ left: scrollPos });
		}
	}

	public setTimeExtrema(minimum: number, maximum: number): void {
		const viewState = this.#viewState;

		this.stateChangeHandler(() => viewState.setExtrema(minimum, maximum));
	}

	public setTimeWindowExtrema(start: number, end: number): void {
		const viewState = this.#viewState;

		this.stateChangeHandler(() => viewState.setWindowExtrema(start, end));
	}

	public get timeMax(): number {
		return this.#viewState.max;
	}

	public get timeMin(): number {
		return this.#viewState.min;
	}

	public get timeRange(): number {
		return this.#viewState.range;
	}

	public get timeWindowMax(): number {
		return this.#viewState.windowMax;
	}

	public get timeWindowMin(): number {
		return this.#viewState.windowMin;
	}

	public get timeWindowRange(): number {
		return this.#viewState.windowRange;
	}
}
customElements.define(Timeline2.webComponentName, Timeline2);
