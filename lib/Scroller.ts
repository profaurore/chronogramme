import {
	BarState,
	type ResizeStrategy,
	type SideResizeStrategy,
} from "./barState.ts";
import { getResizeStrategy, getSideResizeStrategy } from "./barStateUtils.ts";
import { parseBooleanAttribute } from "./boolean.ts";
import {
	type ConnectedEventDetail,
	type DisconnectedEventDetail,
	ScrollPosChangeEventDetail,
	ScrollSizeChangeEventDetail,
	WindowChangeEventDetail,
	WindowSizeChangeEventDetail,
	calcMouseEventCenterOffsetX,
	calcMouseEventCenterOffsetY,
} from "./events.ts";
import { ZERO, parseFloatAttribute, parseIntervalAttribute } from "./math.ts";
import { ScrollState } from "./scrollState.ts";
import { Singleton } from "./singleton.ts";
import { scrollerStylesheet } from "./styles.ts";

const SCROLLER_INIT_WIDTH = 100;
const SCROLLER_INIT_HEIGHT = 100;

type DragState = {
	onMove: (event: MouseEvent) => void;
	onStop: () => void;
	onVisibilityChange: () => void;
};

export class Scroller extends HTMLElement {
	public static observedAttributes = [
		"default-resize-handles",
		"h-end-extrema",
		"h-end-size",
		"h-extrema",
		"h-max-element-size",
		"h-middle-min",
		"h-resize-strategy",
		"h-resync-threshold-size",
		"h-side-resize-strategy",
		"h-start-extrema",
		"h-start-size",
		"h-window",
		"v-end-extrema",
		"v-end-size",
		"v-extrema",
		"v-max-element-size",
		"v-middle-min",
		"v-resize-strategy",
		"v-resync-threshold-size",
		"v-side-resize-strategy",
		"v-start-extrema",
		"v-start-size",
		"v-window",
	] as const;

	#barResizeState: DragState | undefined;

	#scrollDragState: DragState | undefined;

	readonly #containerElement: HTMLDivElement;

	readonly #contentElement: HTMLDivElement;

	readonly #hBarState: BarState;

	readonly #hScrollState: ScrollState;

	#scrollSkip: boolean;

	readonly #shadow: ShadowRoot;

	readonly #vBarState: BarState;

	readonly #vScrollState: ScrollState;

	private static readonly resizeHandler = new Singleton(
		() => {
			return new ResizeObserver(([entry]: readonly ResizeObserverEntry[]) => {
				if (entry) {
					const target = entry.target;

					if (target instanceof Scroller) {
						const bbox = entry.contentRect;
						target.onResizeHandler(bbox.width, bbox.height);
					}
				}
			});
		},

		(resizeObserver) => {
			resizeObserver.disconnect();
		},
	);

	public constructor() {
		super();

		// Center
		const center = document.createElement("div");
		center.id = "center";
		center.addEventListener("pointerdown", this.onScrollDragHandler.bind(this));
		center.appendChild(document.createTextNode("container"));

		// Sides
		const bars: HTMLDivElement[] = [];

		// Order matters
		for (const location of ["v-start", "h-start", "h-end", "v-end"]) {
			const bar = document.createElement("div");
			bar.id = `bar-${location}`;
			bar.appendChild(document.createTextNode(`bar-${location}`));

			bars.push(bar);
		}

		// Corners
		const corners: HTMLDivElement[] = [];

		for (const hLocation of ["start", "end"]) {
			for (const vLocation of ["start", "end"]) {
				const corner = document.createElement("div");
				corner.id = `corner-h-${hLocation}-v-${vLocation}`;
				corner.appendChild(
					document.createTextNode(`corner-h-${hLocation}-v-${vLocation}`),
				);

				corners.push(corner);
			}
		}

		// Content
		const content = document.createElement("div");
		this.#contentElement = content;
		content.id = "content";
		content.addEventListener("scroll", this.onScrollHandler.bind(this));
		content.appendChild(center);
		content.append(...bars);
		content.append(...corners);

		// Dividers
		const dividerHStart = document.createElement("slot");
		dividerHStart.id = "divider-h-start";
		dividerHStart.addEventListener(
			"pointerdown",
			this.onHStartBarResizeHandler.bind(this),
		);

		const dividerHEnd = document.createElement("slot");
		dividerHEnd.id = "divider-h-end";
		dividerHEnd.addEventListener(
			"pointerdown",
			this.onHEndBarResizeHandler.bind(this),
		);

		const dividerVStart = document.createElement("slot");
		dividerVStart.id = "divider-v-start";
		dividerVStart.addEventListener(
			"pointerdown",
			this.onVStartBarResizeHandler.bind(this),
		);

		const dividerVEnd = document.createElement("slot");
		dividerVEnd.id = "divider-v-end";
		dividerVEnd.addEventListener(
			"pointerdown",
			this.onVEndBarResizeHandler.bind(this),
		);

		// Slots
		const centerSlot = document.createElement("slot");
		centerSlot.name = "center";
		center.appendChild(centerSlot);

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
	}

	// @ts-expect-error Protected method used by HTMLElement
	private attributeChangedCallback(
		name: (typeof Scroller.observedAttributes)[number],
		oldValue: string | null,
		newValue: string | null,
	): void {
		if (!this.isConnected || newValue === oldValue) {
			return;
		}

		switch (name) {
			case "default-resize-handles": {
				this.setDefaultResizeHandles(parseBooleanAttribute(newValue));
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

			case "h-resize-strategy": {
				this.setHResizeStrategy(newValue ?? undefined);
				break;
			}

			case "h-resync-threshold-size": {
				this.setHResyncThresholdSize(parseFloatAttribute(newValue));
				break;
			}

			case "h-side-resize-strategy": {
				this.setHSideResizeStrategy(newValue ?? undefined);
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

			case "v-resize-strategy": {
				this.setVResizeStrategy(newValue ?? undefined);
				break;
			}

			case "v-resync-threshold-size": {
				this.setVResyncThresholdSize(parseFloatAttribute(newValue));
				break;
			}

			case "v-side-resize-strategy": {
				this.setVSideResizeStrategy(newValue ?? undefined);
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

	// @ts-expect-error Protected method used by HTMLElement
	private connectedCallback(): void {
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
			getResizeStrategy(this.getAttribute("h-resize-strategy")),
		);
		hBarState.setSideResizeStrategy(
			getSideResizeStrategy(this.getAttribute("h-side-resize-strategy")),
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
			getResizeStrategy(this.getAttribute("v-resize-strategy")),
		);
		vBarState.setSideResizeStrategy(
			getSideResizeStrategy(this.getAttribute("v-side-resize-strategy")),
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

		// Bar display
		this.updateHBarDimensions();
		this.updateVBarDimensions();

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

		// Styles
		this.#shadow.adoptedStyleSheets.push(scrollerStylesheet.subscribe());

		this.#scrollSkip = true;

		this.dispatchEvent(new CustomEvent<ConnectedEventDetail>("connected"));
	}

	private clearResizeState(): void {
		const barResizeState = this.#barResizeState;

		if (barResizeState) {
			document.removeEventListener(
				"visibilityChange",
				barResizeState.onVisibilityChange,
			);
			document.removeEventListener("pointermove", barResizeState.onMove);
			document.removeEventListener("pointerup", barResizeState.onStop);

			this.#barResizeState = undefined;
		}
	}

	private clearScrollDragState(): void {
		const scrollDragState = this.#scrollDragState;

		if (scrollDragState) {
			document.removeEventListener(
				"visibilityChange",
				scrollDragState.onVisibilityChange,
			);
			document.removeEventListener("pointermove", scrollDragState.onMove);
			document.removeEventListener("pointerup", scrollDragState.onStop);

			this.#scrollDragState = undefined;
		}
	}

	// @ts-expect-error Protected method used by HTMLElement
	private disconnectedCallback(): void {
		this.clearResizeState();

		Scroller.resizeHandler.unsubscribe((resizeObserver) => {
			resizeObserver.unobserve(this);
		});

		scrollerStylesheet.unsubscribe();

		this.dispatchEvent(
			new CustomEvent<DisconnectedEventDetail>("disconnected"),
		);
	}

	private onHEndBarResizeHandler(event: MouseEvent): void {
		// Only the primary mouse button triggers resize.
		if (event.button === ZERO) {
			// The offset is required to maintain the position of the divider relative
			// to the cursor.
			const offsetX = calcMouseEventCenterOffsetX(event);

			const onMove = (event: MouseEvent): void => {
				// The right side is calculated here in case the container resizes
				// during bar resizing.
				const target = Math.max(
					ZERO,
					this.getBoundingClientRect().right - event.clientX - offsetX,
				);
				this.setHEndSize(target);
			};

			this.setBarResizeState(onMove);
		}
	}

	private onHStartBarResizeHandler(event: MouseEvent): void {
		// Only the primary mouse button triggers resize.
		if (event.button === ZERO) {
			// The offset is required to maintain the position of the divider relative
			// to the cursor.
			const offsetX = calcMouseEventCenterOffsetX(event);

			const onMove = (event: MouseEvent): void => {
				// The left side is calculated here in case the container resizes
				// during bar resizing.
				const target = Math.max(
					ZERO,
					event.clientX + offsetX - this.getBoundingClientRect().left,
				);
				this.setHStartSize(target);
			};

			this.setBarResizeState(onMove);
		}
	}

	private onResizeHandler(hSize: number, vSize: number): void {
		const hBarState = this.#hBarState;
		const vBarState = this.#vBarState;

		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		if (hSize !== hBarState.size) {
			this.#hBarState.setSize(hSize);
			this.updateHBarDimensions();
		}

		if (vSize !== vBarState.size) {
			this.#vBarState.setSize(vSize);
			this.updateVBarDimensions();
		}

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	private onScrollDragHandler(event: MouseEvent): void {
		// Only the primary mouse button triggers scroll drag.
		if (event.button === ZERO) {
			this.clearScrollDragState();

			let hLastPos = event.clientX;
			let vLastPos = event.clientY;

			const onMove = (event: MouseEvent): void => {
				if (event.buttons & 0x01) {
					const hPos = event.clientX;
					const vPos = event.clientY;

					this.setScrollPos(
						this.#hScrollState.scrollPos - (hPos - hLastPos),
						this.#vScrollState.scrollPos - (vPos - vLastPos),
					);

					hLastPos = hPos;
					vLastPos = vPos;
				} else {
					this.clearScrollDragState();
				}
			};

			const onStop = this.clearScrollDragState.bind(this);

			const onVisibilityChange = () => {
				if (document.visibilityState === "hidden") {
					this.clearScrollDragState();
				}
			};

			this.#scrollDragState = {
				onMove,
				onStop,
				onVisibilityChange,
			};

			document.addEventListener("pointermove", onMove);
			document.addEventListener("pointerup", onStop, { once: true });
			document.addEventListener("visibilitychange", onVisibilityChange);
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

	private onVEndBarResizeHandler(event: MouseEvent): void {
		// Only the primary mouse button triggers resize.
		if (event.button === ZERO) {
			// The offset is required to maintain the position of the divider relative
			// to the cursor.
			const offsetY = calcMouseEventCenterOffsetY(event);

			const onMove = (event: MouseEvent): void => {
				// The bottom side is calculated here in case the container resizes
				// during bar resizing.
				const target = Math.max(
					ZERO,
					this.getBoundingClientRect().bottom - event.clientY - offsetY,
				);
				this.setVEndSize(target);
			};

			this.setBarResizeState(onMove);
		}
	}

	private onVStartBarResizeHandler(event: MouseEvent): void {
		// Only the primary mouse button triggers resize.
		if (event.button === ZERO) {
			// The offset is required to maintain the position of the divider relative
			// to the cursor.
			const offsetY = calcMouseEventCenterOffsetY(event);

			const onMove = (event: MouseEvent): void => {
				// The top side is calculated here in case the container resizes
				// during bar resizing.
				const target = Math.max(
					ZERO,
					event.clientY + offsetY - this.getBoundingClientRect().top,
				);
				this.setVStartSize(target);
			};

			this.setBarResizeState(onMove);
		}
	}

	private setBarResizeState(onMove: (event: MouseEvent) => void): void {
		this.clearResizeState();

		const onMoveWithCheck = (event: MouseEvent) => {
			if (event.buttons & 0x01) {
				onMove(event);
			} else {
				this.clearResizeState();
			}
		};

		// const onStop = this.clearResizeState.bind(this);
		const onStop = this.clearResizeState.bind(this);

		const onVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				this.clearResizeState();
			}
		};

		this.#barResizeState = {
			onMove: onMoveWithCheck,
			onStop,
			onVisibilityChange,
		};

		document.addEventListener("pointermove", onMoveWithCheck);
		document.addEventListener("pointerup", onStop, { once: true });
		document.addEventListener("visibilitychange", onVisibilityChange);
	}

	private setupUpdateScrollPos(): () => void {
		const hScrollState = this.#hScrollState;
		const hScrollPosPrev = hScrollState.scrollPos;

		const vScrollState = this.#vScrollState;
		const vScrollPosPrev = vScrollState.scrollPos;

		return () => {
			const hScrollPos = hScrollState.scrollPos;
			const vScrollPos = vScrollState.scrollPos;

			if (hScrollPos !== hScrollPosPrev || vScrollPos !== vScrollPosPrev) {
				this.#contentElement.scrollTo({ left: hScrollPos, top: vScrollPos });

				this.dispatchEvent(
					new CustomEvent<ScrollPosChangeEventDetail>("scrollPosChange", {
						detail: new ScrollPosChangeEventDetail(
							hScrollPosPrev,
							vScrollPosPrev,
							hScrollPos,
							vScrollPos,
						),
					}),
				);
			}
		};
	}

	private setupUpdateScrollSize(): () => void {
		const hScrollState = this.#hScrollState;
		const hScrollSizePrev = hScrollState.scrollSize;

		const vScrollState = this.#vScrollState;
		const vScrollSizePrev = vScrollState.scrollSize;

		return () => {
			const hScrollSize = hScrollState.scrollSize;
			const vScrollSize = vScrollState.scrollSize;

			if (hScrollSize !== hScrollSizePrev || vScrollSize !== vScrollSizePrev) {
				const styles = this.#containerElement.style;
				styles.setProperty("--h-size", `${hScrollSize}px`);
				styles.setProperty("--v-size", `${vScrollSize}px`);

				this.dispatchEvent(
					new CustomEvent<ScrollSizeChangeEventDetail>("scrollSizeChange", {
						detail: new ScrollSizeChangeEventDetail(
							hScrollSizePrev,
							vScrollSizePrev,
							hScrollSize,
							vScrollSize,
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

		return () => {
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
					new CustomEvent<WindowChangeEventDetail>("windowChange", {
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

		return () => {
			const hWindowSize = hScrollState.windowSize;
			const vWindowSize = vScrollState.windowSize;

			if (hWindowSize !== hWindowSizePrev || vWindowSize !== vWindowSizePrev) {
				this.dispatchEvent(
					new CustomEvent<WindowSizeChangeEventDetail>("windowSizeChange", {
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

		this.#contentElement.scrollTo({ left: hScrollState.scrollPos });
	}

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

		this.#contentElement.scrollTo({ top: vScrollState.scrollPos });
	}

	public getHPos(value: number): number {
		const hScrollState = this.#hScrollState;

		return hScrollState.getPos(value);
	}

	public getVPos(value: number): number {
		const vScrollState = this.#vScrollState;

		return vScrollState.getPos(value);
	}

	// private upgradeProperty(property: string): void {
	// 	if (this.hasOwnProperty(property)) {
	// 		let value = this[property];
	// 		delete this[property];
	// 		this[property] = value;
	// 	}
	// }

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

	public setHEndExtrema(
		min: number | undefined,
		max: number | undefined,
	): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setEndExtrema(min, max);
		this.updateHBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setHEndSize(size: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setEndSize(size);
		this.updateHBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setHExtrema(min: number | undefined, max: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindow = this.setupUpdateWindow();

		this.#hScrollState.setExtrema(min, max);

		updateScrollPos();
		updateScrollSize();
		updateWindow();
	}

	public setHMaxElementSize(size: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();

		this.#hScrollState.setMaxElementSize(size);

		updateScrollPos();
		updateScrollSize();
	}

	public setHMiddleMin(min: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setMiddleMin(min);
		this.updateHBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setHResizeStrategy(strategy: string | undefined): void {
		const strategyFn = getResizeStrategy(strategy);

		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setResizeStrategy(strategyFn);
		this.updateHBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setHResyncThresholdSize(size: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();

		this.#hScrollState.setResyncThresholdSize(size);

		updateScrollPos();
		updateScrollSize();
	}

	private setScrollPos(hScrollPos: number, vScrollPos: number): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindow = this.setupUpdateWindow();

		this.#hScrollState.setScrollPos(hScrollPos);
		this.#vScrollState.setScrollPos(vScrollPos);

		updateWindow();
		updateScrollPos();
		updateScrollSize();
	}

	public setHSideResizeStrategy(strategy: string | undefined): void {
		const strategyFn = getSideResizeStrategy(strategy);
		this.#hBarState.setSideResizeStrategy(strategyFn);
	}

	public setHStartExtrema(
		min: number | undefined,
		max: number | undefined,
	): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setEndExtrema(min, max);
		this.updateHBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setHStartSize(size: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#hBarState.setStartSize(size);
		this.updateHBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setHWindow(min: number | undefined, max: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindow = this.setupUpdateWindow();

		this.#hScrollState.setWindowExtrema(min, max);

		updateScrollPos();
		updateScrollSize();
		updateWindow();
	}

	public setVEndExtrema(
		min: number | undefined,
		max: number | undefined,
	): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setEndExtrema(min, max);
		this.updateVBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setVEndSize(size: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setEndSize(size);
		this.updateVBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setVExtrema(min: number | undefined, max: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindow = this.setupUpdateWindow();

		this.#vScrollState.setExtrema(min, max);

		updateScrollPos();
		updateScrollSize();
		updateWindow();
	}

	public setVMaxElementSize(size: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();

		this.#vScrollState.setMaxElementSize(size);

		updateScrollPos();
		updateScrollSize();
	}

	public setVMiddleMin(min: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setMiddleMin(min);
		this.updateVBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setVResizeStrategy(strategy: string | undefined): void {
		const strategyFn = getResizeStrategy(strategy);

		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setResizeStrategy(strategyFn);
		this.updateVBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setVResyncThresholdSize(size: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();

		this.#vScrollState.setResyncThresholdSize(size);

		updateScrollPos();
		updateScrollSize();
	}

	public setVSideResizeStrategy(strategy: string | undefined): void {
		const strategyFn = getSideResizeStrategy(strategy);
		this.#vBarState.setSideResizeStrategy(strategyFn);
	}

	public setVStartExtrema(
		min: number | undefined,
		max: number | undefined,
	): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setEndExtrema(min, max);
		this.updateVBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setVStartSize(size: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindowSize = this.setupUpdateWindowSize();

		this.#vBarState.setStartSize(size);
		this.updateVBarDimensions();

		updateScrollPos();
		updateScrollSize();
		updateWindowSize();
	}

	public setVWindow(min: number | undefined, max: number | undefined): void {
		const updateScrollPos = this.setupUpdateScrollPos();
		const updateScrollSize = this.setupUpdateScrollSize();
		const updateWindow = this.setupUpdateWindow();

		this.#vScrollState.setWindowExtrema(min, max);

		updateScrollPos();
		updateScrollSize();
		updateWindow();
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

	public get hResizeStrategy(): ResizeStrategy {
		return this.#hBarState.resizeStrategy;
	}

	public get hResyncThresholdSize(): number {
		return this.#hScrollState.resyncThresholdSize;
	}

	public get hScrollPos(): number {
		return this.#hScrollState.scrollPos;
	}

	public get hScrollSize(): number {
		return this.#hScrollState.scrollSize;
	}

	public get hSideResizeStrategy(): SideResizeStrategy {
		return this.#hBarState.sideResizeStrategy;
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

	public get vResizeStrategy(): ResizeStrategy {
		return this.#vBarState.resizeStrategy;
	}

	public get vResyncThresholdSize(): number {
		return this.#vScrollState.resyncThresholdSize;
	}

	public get vScrollPos(): number {
		return this.#vScrollState.scrollPos;
	}

	public get vScrollSize(): number {
		return this.#vScrollState.scrollSize;
	}

	public get vSideResizeStrategy(): SideResizeStrategy {
		return this.#vBarState.sideResizeStrategy;
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
}

if (!customElements.get("cg-scroller")) {
	customElements.define("cg-scroller", Scroller);
}
