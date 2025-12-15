import {
	type BarResizeStrategy,
	type BarSideResizeStrategy,
	BarState,
} from "./barState";
import {
	BAR_RESIZE_STRATEGY_OPTIONS,
	BAR_SIDE_RESIZE_STRATEGY_OPTIONS,
	type BarResizeStrategyOptions,
	type BarSideResizeStrategyOptions,
	getBarResizeStrategy,
	getBarSideResizeStrategy,
} from "./barStateUtils";
import { parseBooleanAttribute } from "./boolean";
import { DragState } from "./dragState";
import {
	ConnectedEventDetail,
	DisconnectedEventDetail,
	DragMoveEventDetail,
	DragStartEventDetail,
	ScrollBoundsChangeEventDetail,
	ScrollPosChangeEventDetail,
	ScrollSizeChangeEventDetail,
	WindowChangeEventDetail,
	WindowSizeChangeEventDetail,
} from "./events";
import {
	HALF,
	parseFloatAttribute,
	parseIntervalAttribute,
	ZERO,
} from "./math";
import {
	SCROLL_RESIZE_STRATEGY_OPTIONS,
	type ScrollResizeStrategyOptions,
	ScrollState,
} from "./scrollState";
import { Singleton } from "./singleton";
import { parseStringOptions, validateStringOptions } from "./string";
import { scrollerStylesheet } from "./styles";

interface BarResizeState {
	xOffsetFromCenter: number;
	yOffsetFromCenter: number;
}

const SCROLLER_INIT_WIDTH = 100;
const SCROLLER_INIT_HEIGHT = 100;

export const SCROLLER_OBSERVED_ATTRIBUTES = [
	"default-resize-handles",
	"h-bar-resize-strategy",
	"h-bar-side-resize-strategy",
	"h-end-extrema",
	"h-end-size",
	"h-extrema",
	"h-max-element-size",
	"h-middle-min",
	"h-resync-threshold-size",
	"h-scroll-resize-strategy",
	"h-start-extrema",
	"h-start-size",
	"h-window",
	"v-bar-resize-strategy",
	"v-bar-side-resize-strategy",
	"v-end-extrema",
	"v-end-size",
	"v-extrema",
	"v-max-element-size",
	"v-middle-min",
	"v-resync-threshold-size",
	"v-scroll-resize-strategy",
	"v-start-extrema",
	"v-start-size",
	"v-window",
] as const;

export class Scroller extends HTMLElement {
	protected static observedAttributes: readonly string[] =
		SCROLLER_OBSERVED_ATTRIBUTES;

	private static readonly resizeHandler = new Singleton(
		() =>
			new ResizeObserver(([entry]: readonly ResizeObserverEntry[]) => {
				if (entry !== undefined) {
					const target = entry.target;

					if (target instanceof Scroller) {
						const bbox = entry.contentRect;
						target.onResizeHandler(bbox.width, bbox.height);
					}
				}
			}),

		(resizeObserver) => {
			resizeObserver.disconnect();
		},
	);

	readonly #barResizeState: DragState<BarResizeState>;

	readonly #centerElement: HTMLDivElement;

	readonly #containerElement: HTMLDivElement;

	readonly #contentElement: HTMLDivElement;

	readonly #hBarState: BarState;

	readonly #hScrollState: ScrollState;

	readonly #scrollDragState: DragState;

	#scrollSkip: boolean;

	readonly #shadow: ShadowRoot;

	readonly #vBarState: BarState;

	readonly #vScrollState: ScrollState;

	public constructor() {
		super();

		// Center
		const center = document.createElement("div");
		this.#centerElement = center;
		center.id = "center";
		center.part = center.id;

		const centerSlot = document.createElement("slot");
		centerSlot.name = center.id;
		center.appendChild(centerSlot);

		// Sides
		const bars: HTMLDivElement[] = [];

		// Order matters
		for (const location of ["v-start", "h-start", "h-end", "v-end"]) {
			const bar = document.createElement("div");
			bar.id = `bar-${location}`;
			bar.part = bar.id;

			const barSlot = document.createElement("slot");
			barSlot.name = bar.id;
			bar.appendChild(barSlot);

			bars.push(bar);
		}

		// Corners
		const corners: HTMLDivElement[] = [];

		for (const hLocation of ["start", "end"]) {
			for (const vLocation of ["start", "end"]) {
				const corner = document.createElement("div");
				corner.id = `corner-h-${hLocation}-v-${vLocation}`;
				corner.part = corner.id;

				const cornerSlot = document.createElement("slot");
				cornerSlot.name = corner.id;
				corner.appendChild(cornerSlot);

				corners.push(corner);
			}
		}

		// Content
		const content = document.createElement("div");
		this.#contentElement = content;
		content.id = "content";
		content.addEventListener("scroll", this.onScrollHandler.bind(this), {
			passive: true,
		});
		content.appendChild(center);
		content.append(...bars);
		content.append(...corners);

		// Dividers
		const dividerHStart = document.createElement("slot");
		dividerHStart.id = "divider-h-start";
		dividerHStart.part = dividerHStart.id;

		const dividerHEnd = document.createElement("slot");
		dividerHEnd.id = "divider-h-end";
		dividerHEnd.part = dividerHEnd.id;

		const dividerVStart = document.createElement("slot");
		dividerVStart.id = "divider-v-start";
		dividerVStart.part = dividerVStart.id;

		const dividerVEnd = document.createElement("slot");
		dividerVEnd.id = "divider-v-end";
		dividerVEnd.part = dividerVEnd.id;

		// Container
		const container = document.createElement("div");
		this.#containerElement = container;
		container.id = "container";
		container.append(
			content,
			dividerHStart,
			dividerHEnd,
			dividerVStart,
			dividerVEnd,
		);

		// Root
		const shadow = this.attachShadow({ mode: "closed" });
		shadow.appendChild(container);
		this.#shadow = shadow;

		this.#scrollSkip = false;

		this.#hScrollState = new ScrollState({ windowSize: SCROLLER_INIT_WIDTH });
		this.#vScrollState = new ScrollState({ windowSize: SCROLLER_INIT_HEIGHT });

		this.#hBarState = new BarState({ size: SCROLLER_INIT_WIDTH });
		this.#vBarState = new BarState({ size: SCROLLER_INIT_HEIGHT });

		const scrollDragState = new DragState();
		scrollDragState.setupDragListener(center);
		scrollDragState.addEventListener(
			"move",
			this.onScrollDragHandler.bind(this),
			{ passive: true },
		);
		this.#scrollDragState = scrollDragState;

		const barResizeState = new DragState<BarResizeState>();
		barResizeState.setupDragListener(dividerHStart);
		barResizeState.setupDragListener(dividerHEnd);
		barResizeState.setupDragListener(dividerVStart);
		barResizeState.setupDragListener(dividerVEnd);
		barResizeState.addEventListener(
			"start",
			this.onBarResizeStartHandler.bind(this),
			{ passive: true },
		);
		barResizeState.addEventListener(
			"move",
			this.onBarResizeMoveHandler.bind(this),
			{ passive: true },
		);
		this.#barResizeState = barResizeState;
	}

	public get hBarResizeStrategy(): BarResizeStrategy {
		return this.#hBarState.resizeStrategy;
	}

	public get hBarSideResizeStrategy(): BarSideResizeStrategy {
		return this.#hBarState.sideResizeStrategy;
	}

	public get hEndIdeal(): number | undefined {
		return this.#hBarState.endIdeal;
	}

	public get hEndMax(): number {
		return this.#hBarState.endMax;
	}

	public get hEndMin(): number {
		return this.#hBarState.endMin;
	}

	public get hEndSize(): number | undefined {
		return this.#hBarState.endSize;
	}

	public get hMax(): number {
		return this.#hScrollState.max;
	}

	public get hMaxElementSize(): number {
		return this.#hScrollState.maxElementSize;
	}

	public get hMiddleIdeal(): number {
		return this.#hBarState.middleIdeal;
	}

	public get hMiddleMin(): number {
		return this.#hBarState.middleMin;
	}

	public get hMiddleSize(): number {
		return this.#hBarState.middleSize;
	}

	public get hMin(): number {
		return this.#hScrollState.min;
	}

	public get hRange(): number {
		return this.#hScrollState.range;
	}

	public get hResyncThresholdSize(): number {
		return this.#hScrollState.resyncThresholdSize;
	}

	public get hScrollPos(): number {
		return this.#hScrollState.scrollPos;
	}

	public get hScrollResizeStrategy(): ScrollResizeStrategyOptions {
		return this.#hScrollState.resizeStrategy;
	}

	public get hScrollSize(): number {
		return this.#hScrollState.scrollSize;
	}

	public get hSize(): number {
		return this.#hBarState.size;
	}

	public get hStartIdeal(): number | undefined {
		return this.#hBarState.startIdeal;
	}

	public get hStartMax(): number {
		return this.#hBarState.startMax;
	}

	public get hStartMin(): number {
		return this.#hBarState.startMin;
	}

	public get hStartSize(): number | undefined {
		return this.#hBarState.startSize;
	}

	public get hWindowMax(): number {
		return this.#hScrollState.windowMax;
	}

	public get hWindowMin(): number {
		return this.#hScrollState.windowMin;
	}

	public get hWindowRange(): number {
		return this.#hScrollState.windowRange;
	}

	public get hWindowSize(): number {
		return this.#hScrollState.windowSize;
	}

	public get vBarResizeStrategy(): BarResizeStrategy {
		return this.#vBarState.resizeStrategy;
	}

	public get vBarSideResizeStrategy(): BarSideResizeStrategy {
		return this.#vBarState.sideResizeStrategy;
	}

	public get vEndIdeal(): number | undefined {
		return this.#vBarState.endIdeal;
	}

	public get vEndMax(): number {
		return this.#vBarState.endMax;
	}

	public get vEndMin(): number {
		return this.#vBarState.endMin;
	}

	public get vEndSize(): number | undefined {
		return this.#vBarState.endSize;
	}

	public get vMax(): number {
		return this.#vScrollState.max;
	}

	public get vMaxElementSize(): number {
		return this.#vScrollState.maxElementSize;
	}

	public get vMiddleIdeal(): number {
		return this.#vBarState.middleIdeal;
	}

	public get vMiddleMin(): number {
		return this.#vBarState.middleMin;
	}

	public get vMiddleSize(): number {
		return this.#vBarState.middleSize;
	}

	public get vMin(): number {
		return this.#vScrollState.min;
	}

	public get vRange(): number {
		return this.#vScrollState.range;
	}

	public get vResyncThresholdSize(): number {
		return this.#vScrollState.resyncThresholdSize;
	}

	public get vScrollPos(): number {
		return this.#vScrollState.scrollPos;
	}

	public get vScrollResizeStrategy(): ScrollResizeStrategyOptions {
		return this.#vScrollState.resizeStrategy;
	}

	public get vScrollSize(): number {
		return this.#vScrollState.scrollSize;
	}

	public get vSize(): number {
		return this.#vBarState.size;
	}

	public get vStartIdeal(): number | undefined {
		return this.#vBarState.startIdeal;
	}

	public get vStartMax(): number {
		return this.#vBarState.startMax;
	}

	public get vStartMin(): number {
		return this.#vBarState.startMin;
	}

	public get vStartSize(): number | undefined {
		return this.#vBarState.startSize;
	}

	public get vWindowMax(): number {
		return this.#vScrollState.windowMax;
	}

	public get vWindowMin(): number {
		return this.#vScrollState.windowMin;
	}

	public get vWindowRange(): number {
		return this.#vScrollState.windowRange;
	}

	public get vWindowSize(): number {
		return this.#vScrollState.windowSize;
	}

	public getHCanvasValueMax(): number {
		return this.#hScrollState.getCanvasValueMax();
	}

	public getHCanvasValueMin(): number {
		return this.#hScrollState.getCanvasValueMin();
	}

	public getHPos(value: number): number {
		return this.#hScrollState.getPos(value);
	}

	public getHValue(pos: number): number {
		return this.#hScrollState.getValue(pos);
	}

	public getHValueFromClient(clientPos: number): number {
		const rect = this.#centerElement.getBoundingClientRect();
		const hPos = clientPos - rect.left;

		return this.#hScrollState.getValue(hPos);
	}

	public getVCanvasValueMax(): number {
		return this.#vScrollState.getCanvasValueMax();
	}

	public getVCanvasValueMin(): number {
		return this.#vScrollState.getCanvasValueMin();
	}

	public getVPos(value: number): number {
		return this.#vScrollState.getPos(value);
	}

	public getVValue(pos: number): number {
		return this.#vScrollState.getValue(pos);
	}

	public getVValueFromClient(clientPos: number): number {
		const rect = this.#centerElement.getBoundingClientRect();
		const pos = clientPos - rect.top;

		return this.#vScrollState.getValue(pos);
	}

	public setDefaultResizeHandles(defaultResizeHandles: boolean): void {
		const dividers = this.#shadow.querySelectorAll('[id^="divider-"]');

		if (defaultResizeHandles) {
			for (const divider of dividers) {
				divider.classList.add("default");
			}
		} else {
			for (const divider of dividers) {
				divider.classList.remove("default");
			}
		}
	}

	public setHBarResizeStrategy(
		strategy: BarResizeStrategyOptions | undefined,
	): void {
		const strategyFn = getBarResizeStrategy(strategy);

		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setResizeStrategy(strategyFn);
		this.updateHBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setHBarSideResizeStrategy(
		strategy: BarSideResizeStrategyOptions | undefined,
	): void {
		const strategyFn = getBarSideResizeStrategy(strategy);
		this.#hBarState.setSideResizeStrategy(strategyFn);
	}

	public setHEndExtrema(
		min: number | undefined,
		max: number | undefined,
	): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setEndExtrema(min, max);
		this.updateHBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setHEndSize(size: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setEndSize(size);
		this.updateHBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setHExtrema(min: number | undefined, max: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindow = this.setupUpdateWindow();

		this.#hScrollState.setExtrema(min, max);

		updateScrollState();
		updateWindow();
	}

	public setHMaxElementSize(size: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();

		this.#hScrollState.setMaxElementSize(size);

		updateScrollState();
	}

	public setHMiddleMin(min: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setMiddleMin(min);
		this.updateHBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setHResyncThresholdSize(size: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();

		this.#hScrollState.setResyncThresholdSize(size);

		updateScrollState();
	}

	public setHScrollResizeStrategy(
		resizeStrategy: ScrollResizeStrategyOptions | undefined,
	): void {
		this.#hScrollState.setResizeStrategy(resizeStrategy);
	}

	public setHStartExtrema(
		min: number | undefined,
		max: number | undefined,
	): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setEndExtrema(min, max);
		this.updateHBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setHStartSize(size: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setStartSize(size);
		this.updateHBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setHWindow(min: number | undefined, max: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindow = this.setupUpdateWindow();

		this.#hScrollState.setWindowExtrema(min, max);

		updateScrollState();
		updateWindow();
	}

	public setVBarResizeStrategy(
		strategy: BarResizeStrategyOptions | undefined,
	): void {
		const strategyFn = getBarResizeStrategy(strategy);

		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setResizeStrategy(strategyFn);
		this.updateVBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setVBarSideResizeStrategy(
		strategy: BarSideResizeStrategyOptions | undefined,
	): void {
		const strategyFn = getBarSideResizeStrategy(strategy);
		this.#vBarState.setSideResizeStrategy(strategyFn);
	}

	public setVEndExtrema(
		min: number | undefined,
		max: number | undefined,
	): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setEndExtrema(min, max);
		this.updateVBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setVEndSize(size: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setEndSize(size);
		this.updateVBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setVExtrema(min: number | undefined, max: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindow = this.setupUpdateWindow();

		this.#vScrollState.setExtrema(min, max);

		updateScrollState();
		updateWindow();
	}

	public setVMaxElementSize(size: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();

		this.#vScrollState.setMaxElementSize(size);

		updateScrollState();
	}

	public setVMiddleMin(min: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setMiddleMin(min);
		this.updateVBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setVResyncThresholdSize(size: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();

		this.#vScrollState.setResyncThresholdSize(size);

		updateScrollState();
	}

	public setVScrollResizeStrategy(
		resizeStrategy: ScrollResizeStrategyOptions | undefined,
	): void {
		this.#vScrollState.setResizeStrategy(resizeStrategy);
	}

	public setVStartExtrema(
		min: number | undefined,
		max: number | undefined,
	): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setEndExtrema(min, max);
		this.updateVBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setVStartSize(size: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setStartSize(size);
		this.updateVBarDimensions();

		updateScrollState();
		updateWindowSize();
	}

	public setVWindow(min: number | undefined, max: number | undefined): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindow = this.setupUpdateWindow();

		this.#vScrollState.setWindowExtrema(min, max);

		updateScrollState();
		updateWindow();
	}

	protected attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void {
		validateStringOptions("attributeName", name, SCROLLER_OBSERVED_ATTRIBUTES);

		if (!this.isConnected || newValue === oldValue) {
			return;
		}

		switch (name) {
			case "default-resize-handles": {
				this.setDefaultResizeHandles(parseBooleanAttribute(newValue));
				break;
			}

			case "h-bar-resize-strategy": {
				this.setHBarResizeStrategy(
					parseStringOptions(
						"h-bar-resize-strategy",
						newValue,
						BAR_RESIZE_STRATEGY_OPTIONS,
					),
				);
				break;
			}

			case "h-bar-side-resize-strategy": {
				this.setHBarSideResizeStrategy(
					parseStringOptions(
						"h-bar-side-resize-strategy",
						newValue,
						BAR_SIDE_RESIZE_STRATEGY_OPTIONS,
					),
				);
				break;
			}

			case "h-end-extrema": {
				this.setHEndExtrema(
					...parseIntervalAttribute("h-end-extrema", newValue),
				);
				break;
			}

			case "h-end-size": {
				this.setHEndSize(parseFloatAttribute(newValue));
				break;
			}

			case "h-extrema": {
				this.setHExtrema(...parseIntervalAttribute("h-extrema", newValue));
				break;
			}

			case "h-max-element-size": {
				this.setHMaxElementSize(parseFloatAttribute(newValue));
				break;
			}

			case "h-middle-min": {
				this.setHMiddleMin(parseFloatAttribute(newValue));
				break;
			}

			case "h-resync-threshold-size": {
				this.setHResyncThresholdSize(parseFloatAttribute(newValue));
				break;
			}

			case "h-scroll-resize-strategy": {
				this.setHScrollResizeStrategy(
					parseStringOptions(
						"h-scroll-resize-strategy",
						newValue,
						SCROLL_RESIZE_STRATEGY_OPTIONS,
					),
				);
				break;
			}

			case "h-start-extrema": {
				this.setHStartExtrema(
					...parseIntervalAttribute("h-start-extrema", newValue),
				);
				break;
			}

			case "h-start-size": {
				this.setHStartSize(parseFloatAttribute(newValue));
				break;
			}

			case "h-window": {
				this.setHWindow(...parseIntervalAttribute("h-window", newValue));
				break;
			}

			case "v-bar-resize-strategy": {
				this.setVBarResizeStrategy(
					parseStringOptions(
						"v-bar-resize-strategy",
						newValue,
						BAR_RESIZE_STRATEGY_OPTIONS,
					),
				);
				break;
			}

			case "v-bar-side-resize-strategy": {
				this.setVBarSideResizeStrategy(
					parseStringOptions(
						"v-bar-side-resize-strategy",
						newValue,
						BAR_SIDE_RESIZE_STRATEGY_OPTIONS,
					),
				);
				break;
			}

			case "v-end-extrema": {
				this.setVEndExtrema(
					...parseIntervalAttribute("v-end-extrema", newValue),
				);
				break;
			}

			case "v-end-size": {
				this.setVEndSize(parseFloatAttribute(newValue));
				break;
			}

			case "v-extrema": {
				this.setVExtrema(...parseIntervalAttribute("v-extrema", newValue));
				break;
			}

			case "v-max-element-size": {
				this.setVMaxElementSize(parseFloatAttribute(newValue));
				break;
			}

			case "v-middle-min": {
				this.setVMiddleMin(parseFloatAttribute(newValue));
				break;
			}

			case "v-resync-threshold-size": {
				this.setVResyncThresholdSize(parseFloatAttribute(newValue));
				break;
			}

			case "v-scroll-resize-strategy": {
				this.setVScrollResizeStrategy(
					parseStringOptions(
						"v-scroll-resize-strategy",
						newValue,
						SCROLL_RESIZE_STRATEGY_OPTIONS,
					),
				);
				break;
			}

			case "v-start-extrema": {
				this.setVStartExtrema(
					...parseIntervalAttribute("v-start-extrema", newValue),
				);
				break;
			}

			case "v-start-size": {
				this.setVStartSize(parseFloatAttribute(newValue));
				break;
			}

			case "v-window": {
				this.setVWindow(...parseIntervalAttribute("v-window", newValue));
				break;
			}

			default: {
				break;
			}
		}
	}

	protected connectedCallback(): void {
		const resizeObserver = Scroller.resizeHandler.subscribe();
		resizeObserver.observe(this, { box: "content-box" });

		const bbox = this.getBoundingClientRect();
		const hSize = bbox.width;
		const vSize = bbox.height;

		// Global attributes
		this.setDefaultResizeHandles(
			parseBooleanAttribute(this.getAttribute("default-resize-handles")),
		);

		// Bar state attributes
		const hBarState = this.#hBarState;
		hBarState.setSize(hSize);
		hBarState.setResizeStrategy(
			getBarResizeStrategy(this.getAttribute("h-bar-resize-strategy")),
		);
		hBarState.setSideResizeStrategy(
			getBarSideResizeStrategy(this.getAttribute("h-bar-side-resize-strategy")),
		);
		hBarState.setStartExtrema(
			...parseIntervalAttribute(
				"h-start-extrema",
				this.getAttribute("h-start-extrema"),
			),
		);
		hBarState.setMiddleMin(
			parseFloatAttribute(this.getAttribute("h-middle-min")),
		);
		hBarState.setEndExtrema(
			...parseIntervalAttribute(
				"h-end-extrema",
				this.getAttribute("h-end-extrema"),
			),
		);
		hBarState.setStartSize(
			parseFloatAttribute(this.getAttribute("h-start-size")),
		);
		hBarState.setEndSize(parseFloatAttribute(this.getAttribute("h-end-size")));

		const vBarState = this.#vBarState;
		vBarState.setSize(vSize);
		vBarState.setResizeStrategy(
			getBarResizeStrategy(this.getAttribute("v-bar-resize-strategy")),
		);
		vBarState.setSideResizeStrategy(
			getBarSideResizeStrategy(this.getAttribute("v-bar-side-resize-strategy")),
		);
		vBarState.setStartExtrema(
			...parseIntervalAttribute(
				"v-start-extrema",
				this.getAttribute("v-start-extrema"),
			),
		);
		vBarState.setMiddleMin(
			parseFloatAttribute(this.getAttribute("v-middle-min")),
		);
		vBarState.setEndExtrema(
			...parseIntervalAttribute(
				"v-end-extrema",
				this.getAttribute("v-end-extrema"),
			),
		);
		vBarState.setStartSize(
			parseFloatAttribute(this.getAttribute("v-start-size")),
		);
		vBarState.setEndSize(parseFloatAttribute(this.getAttribute("v-end-size")));

		// Scroll state attributes
		const hScrollState = this.#hScrollState;
		hScrollState.setMaxElementSize(
			parseFloatAttribute(this.getAttribute("h-max-element-size")),
		);
		hScrollState.setResyncThresholdSize(
			parseFloatAttribute(this.getAttribute("h-resync-threshold-size")),
		);
		hScrollState.setExtrema(
			...parseIntervalAttribute("h-extrema", this.getAttribute("h-extrema")),
		);
		hScrollState.setWindowExtrema(
			...parseIntervalAttribute("h-window", this.getAttribute("h-window")),
		);

		const vScrollState = this.#vScrollState;
		vScrollState.setMaxElementSize(
			parseFloatAttribute(this.getAttribute("v-max-element-size")),
		);
		vScrollState.setResyncThresholdSize(
			parseFloatAttribute(this.getAttribute("v-resync-threshold-size")),
		);
		vScrollState.setExtrema(
			...parseIntervalAttribute("v-extrema", this.getAttribute("v-extrema")),
		);
		vScrollState.setWindowExtrema(
			...parseIntervalAttribute("v-window", this.getAttribute("v-window")),
		);

		// Bar display
		this.updateHBarDimensions();
		this.updateVBarDimensions();

		// Styles
		this.#shadow.adoptedStyleSheets.push(scrollerStylesheet.subscribe());

		this.#scrollSkip = true;

		this.dispatchEvent(
			new CustomEvent("connected", {
				bubbles: true,
				composed: true,
				detail: new ConnectedEventDetail(),
			}),
		);
	}

	protected disconnectedCallback(): void {
		this.#barResizeState.reset();
		this.#scrollDragState.reset();

		Scroller.resizeHandler.unsubscribe((resizeObserver) => {
			resizeObserver.unobserve(this);
		});

		scrollerStylesheet.unsubscribe();

		this.dispatchEvent(
			new CustomEvent("disconnected", {
				bubbles: true,
				composed: true,
				detail: new DisconnectedEventDetail(),
			}),
		);
	}

	private onBarResizeMoveHandler(event: Event): void {
		const data = this.#barResizeState.data;

		if (data !== undefined && event instanceof CustomEvent) {
			const detail = event.detail;

			if (detail instanceof DragMoveEventDetail) {
				const target = detail.target;

				switch (target.id) {
					case "divider-h-start": {
						const hStartSize = this.hStartSize;

						if (hStartSize !== undefined) {
							const newCenter = detail.x + data.xOffsetFromCenter;
							this.setHStartSize(newCenter - this.getBoundingClientRect().left);
						}

						break;
					}

					case "divider-h-end": {
						const hEndSize = this.hEndSize;

						if (hEndSize !== undefined) {
							const newCenter = detail.x + data.xOffsetFromCenter;
							this.setHEndSize(this.getBoundingClientRect().right - newCenter);
						}

						break;
					}

					case "divider-v-start": {
						const vStartSize = this.vStartSize;

						if (vStartSize !== undefined) {
							const newCenter = detail.y + data.yOffsetFromCenter;
							this.setVStartSize(newCenter - this.getBoundingClientRect().top);
						}

						break;
					}

					case "divider-v-end": {
						const vEndSize = this.vEndSize;

						if (vEndSize !== undefined) {
							const newCenter = detail.y + data.yOffsetFromCenter;
							this.setVEndSize(this.getBoundingClientRect().bottom - newCenter);
						}

						break;
					}

					default:
						break;
				}
			}
		}
	}

	private onBarResizeStartHandler(event: Event): void {
		if (event instanceof CustomEvent) {
			const detail = event.detail;

			if (detail instanceof DragStartEventDetail) {
				const barResizeState = this.#barResizeState;

				const bbox = detail.target.getBoundingClientRect();
				const xCenter = HALF * bbox.left + HALF * bbox.right;
				const yCenter = HALF * bbox.top + HALF * bbox.bottom;

				barResizeState.setStateData({
					xOffsetFromCenter: xCenter - detail.clientX,
					yOffsetFromCenter: yCenter - detail.clientY,
				});
			}
		}
	}

	private onResizeHandler(hSize: number, vSize: number): void {
		const hBarState = this.#hBarState;
		const vBarState = this.#vBarState;

		const updateScrollState = this.setupUpdateScrollState();
		const updateWindowSize = this.setupUpdateWindowSize();

		if (hSize !== hBarState.size) {
			hBarState.setSize(hSize);
			this.updateHBarDimensions();
		}

		if (vSize !== vBarState.size) {
			vBarState.setSize(vSize);
			this.updateVBarDimensions();
		}

		updateScrollState();
		updateWindowSize();
	}

	private onScrollDragHandler(event: Event): void {
		if (event instanceof CustomEvent) {
			const detail = event.detail;

			if (detail instanceof DragMoveEventDetail) {
				this.setScrollPos(
					this.#hScrollState.scrollPos - detail.xDelta,
					this.#vScrollState.scrollPos - detail.yDelta,
				);
			}
		}
	}

	private onScrollHandler(): void {
		if (this.#scrollSkip) {
			this.#scrollSkip = false;
			return;
		}

		const contentElement = this.#contentElement;

		this.setScrollPos(contentElement.scrollLeft, contentElement.scrollTop);
	}

	private setupUpdateScrollState(): () => void {
		const hScrollState = this.#hScrollState;
		const hScrollPosPrev = hScrollState.scrollPos;
		const hScrollSizePrev = hScrollState.scrollSize;
		const hValueStartPrev = this.getHValue(ZERO);
		const hValueEndPrev = this.getHValue(this.scrollWidth);

		const vScrollState = this.#vScrollState;
		const vScrollPosPrev = vScrollState.scrollPos;
		const vScrollSizePrev = vScrollState.scrollSize;
		const vValueStartPrev = this.getVValue(ZERO);
		const vValueEndPrev = this.getVValue(this.scrollHeight);

		return (): void => {
			const hScrollPos = hScrollState.scrollPos;
			const hScrollSize = hScrollState.scrollSize;
			const hValueStart = this.getHValue(ZERO);
			const hValueEnd = this.getHValue(this.scrollWidth);

			const vScrollPos = vScrollState.scrollPos;
			const vScrollSize = vScrollState.scrollSize;
			const vValueStart = this.getVValue(ZERO);
			const vValueEnd = this.getVValue(this.scrollHeight);

			if (hScrollPos !== hScrollPosPrev || vScrollPos !== vScrollPosPrev) {
				this.#contentElement.scrollTo({ left: hScrollPos, top: vScrollPos });

				this.dispatchEvent(
					new CustomEvent("scrollPosChange", {
						bubbles: true,
						composed: true,
						detail: new ScrollPosChangeEventDetail(
							hScrollPosPrev,
							vScrollPosPrev,
							hScrollPos,
							vScrollPos,
						),
					}),
				);
			}

			if (hScrollSize !== hScrollSizePrev || vScrollSize !== vScrollSizePrev) {
				const styles = this.#containerElement.style;
				styles.setProperty("--h-size", `${hScrollSize}px`);
				styles.setProperty("--v-size", `${vScrollSize}px`);

				this.dispatchEvent(
					new CustomEvent("scrollSizeChange", {
						bubbles: true,
						composed: true,
						detail: new ScrollSizeChangeEventDetail(
							hScrollSizePrev,
							vScrollSizePrev,
							hScrollSize,
							vScrollSize,
						),
					}),
				);
			}

			if (
				hValueStart !== hValueStartPrev ||
				hValueEnd !== hValueEndPrev ||
				vValueStart !== vValueStartPrev ||
				vValueEnd !== vValueEndPrev
			) {
				this.dispatchEvent(
					new CustomEvent("scrollBoundsChange", {
						bubbles: true,
						composed: true,
						detail: new ScrollBoundsChangeEventDetail(
							hValueStartPrev,
							hValueEndPrev,
							vValueStartPrev,
							vValueEndPrev,
							hValueStart,
							hValueEnd,
							vValueStart,
							vValueEnd,
						),
					}),
				);
			}
		};
	}

	private setupUpdateWindow(): () => void {
		const hScrollState = this.#hScrollState;
		const hWindowMinPrev = hScrollState.windowMin;
		const hWindowMaxPrev = hScrollState.windowMax;

		const vScrollState = this.#vScrollState;
		const vWindowMinPrev = vScrollState.windowMin;
		const vWindowMaxPrev = vScrollState.windowMax;

		return (): void => {
			const hWindowMin = hScrollState.windowMin;
			const hWindowMax = hScrollState.windowMax;

			const vWindowMin = vScrollState.windowMin;
			const vWindowMax = vScrollState.windowMax;

			if (
				hWindowMin !== hWindowMinPrev ||
				hWindowMax !== hWindowMaxPrev ||
				vWindowMin !== vWindowMinPrev ||
				vWindowMax !== vWindowMaxPrev
			) {
				this.dispatchEvent(
					new CustomEvent("windowChange", {
						bubbles: true,
						composed: true,
						detail: new WindowChangeEventDetail(
							hWindowMinPrev,
							hWindowMaxPrev,
							vWindowMaxPrev,
							vWindowMinPrev,
							hWindowMin,
							hWindowMax,
							vWindowMin,
							vWindowMax,
						),
					}),
				);
			}
		};
	}

	private setupUpdateWindowSize(): () => void {
		const hScrollState = this.#hScrollState;
		const hWindowSizePrev = hScrollState.windowSize;

		const vScrollState = this.#vScrollState;
		const vWindowSizePrev = vScrollState.windowSize;

		return (): void => {
			const hWindowSize = hScrollState.windowSize;
			const vWindowSize = vScrollState.windowSize;

			if (hWindowSize !== hWindowSizePrev || vWindowSize !== vWindowSizePrev) {
				this.dispatchEvent(
					new CustomEvent("windowSizeChange", {
						bubbles: true,
						composed: true,
						detail: new WindowSizeChangeEventDetail(
							hWindowSizePrev,
							vWindowSizePrev,
							hWindowSize,
							vWindowSize,
						),
					}),
				);
			}
		};
	}

	private setScrollPos(hScrollPos: number, vScrollPos: number): void {
		const updateScrollState = this.setupUpdateScrollState();
		const updateWindow = this.setupUpdateWindow();

		this.#hScrollState.setScrollPos(hScrollPos);
		this.#vScrollState.setScrollPos(vScrollPos);

		updateWindow();
		updateScrollState();
	}

	private updateHBarDimensions(): void {
		const container = this.#containerElement;
		const styles = container.style;

		const hBarState = this.#hBarState;
		const hStartBarSize = hBarState.startSize;
		const hEndBarSize = hBarState.endSize;
		const hWindowSize = hBarState.middleSize;

		const hScrollState = this.#hScrollState;
		hScrollState.setWindowSize(hWindowSize);

		styles.setProperty("--h-start-bar-size", `${hStartBarSize ?? ZERO}px`);
		styles.setProperty("--h-end-bar-size", `${hEndBarSize ?? ZERO}px`);

		if (hStartBarSize === undefined) {
			styles.setProperty("--h-start-bar-display", "none");
		} else {
			styles.removeProperty("--h-start-bar-display");
		}

		if (hEndBarSize === undefined) {
			styles.setProperty("--h-end-bar-display", "none");
		} else {
			styles.removeProperty("--h-end-bar-display");
		}

		styles.setProperty("--h-size", `${hScrollState.scrollSize}px`);

		// This works around scroll restoration.
		requestAnimationFrame(() => {
			this.#contentElement.scrollTo({ left: hScrollState.scrollPos });
		});
	}

	// TODO
	// private upgradeProperty(property: string): void {
	// 	if (this.hasOwnProperty(property)) {
	// 		let value = this[property];
	// 		delete this[property];
	// 		this[property] = value;
	// 	}
	// }

	private updateVBarDimensions(): void {
		const container = this.#containerElement;
		const styles = container.style;

		const vBarState = this.#vBarState;
		const vStartBarSize = vBarState.startSize;
		const vEndBarSize = vBarState.endSize;
		const vWindowSize = vBarState.middleSize;

		const vScrollState = this.#vScrollState;
		vScrollState.setWindowSize(vWindowSize);

		styles.setProperty("--v-start-bar-size", `${vStartBarSize ?? ZERO}px`);
		styles.setProperty("--v-end-bar-size", `${vEndBarSize ?? ZERO}px`);

		if (vStartBarSize === undefined) {
			styles.setProperty("--v-start-bar-display", "none");
		} else {
			styles.removeProperty("--v-start-bar-display");
		}

		if (vEndBarSize === undefined) {
			styles.setProperty("--v-end-bar-display", "none");
		} else {
			styles.removeProperty("--v-end-bar-display");
		}

		styles.setProperty("--v-size", `${vScrollState.scrollSize}px`);

		// This works around scroll restoration.
		requestAnimationFrame(() => {
			this.#contentElement.scrollTo({ top: vScrollState.scrollPos });
		});
	}
}

if (!customElements.get("cg-scroller")) {
	customElements.define("cg-scroller", Scroller);
}
