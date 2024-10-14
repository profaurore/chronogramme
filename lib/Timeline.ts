import { layoutGroupRows } from "./groupLayout.ts";
import { UNIT, ZERO, parseFloatAttribute } from "./math.ts";
import "./Scroller.ts";
import type { Scroller } from "./Scroller.ts";
import { timelineStylesheet } from "./styles.ts";

export interface BaseItem<TItemId = number, TGroupId = number> {
	endTime: EpochTimeStamp;
	groupId: TGroupId;
	id: TItemId;
	startTime: EpochTimeStamp;
}

export interface BaseGroup<TGroupId = number> {
	id: TGroupId;
	rowHeight?: number;
}

const TIMELINE_ROW_HEIGHT_DEFAULT = 30;

export class Timeline<
	TGroupId = number,
	TGroup extends BaseGroup<TGroupId> = BaseGroup<TGroupId>,
	TItemId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
> extends HTMLElement {
	public static observedAttributes = ["h-window", "row-height"];

	readonly #scroller: Scroller;

	#defaultRowHeight: number;

	#groups: readonly Readonly<TGroup>[];

	#itemGroups: Map<TGroupId, Readonly<TItem>[]>;

	#items: readonly Readonly<TItem>[];

	readonly #shadow: ShadowRoot;

	public constructor() {
		super();

		const scroller = document.createElement("cg-scroller") as Scroller;
		customElements.upgrade(scroller);
		scroller.addEventListener("scrollPosChange", this.render.bind(this));
		scroller.id = "scroller";
		this.#scroller = scroller;

		this.#defaultRowHeight = TIMELINE_ROW_HEIGHT_DEFAULT;
		this.#groups = [];
		this.#itemGroups = new Map();
		this.#items = [];

		// Root
		const shadow = this.attachShadow({ mode: "closed" });
		shadow.appendChild(scroller);
		this.#shadow = shadow;
	}

	// @ts-expect-error Protected method used by HTMLElement
	private attributeChangedCallback(
		name: (typeof Timeline.observedAttributes)[number],
		oldValue: string | null,
		newValue: string | null,
	): void {
		if (!this.isConnected || newValue === oldValue) {
			return;
		}

		switch (name) {
			case "row-height": {
				this.#defaultRowHeight =
					parseFloatAttribute(newValue) ?? TIMELINE_ROW_HEIGHT_DEFAULT;
				break;
			}

			// Passthrough to the scroller element.
			case "h-window": {
				const scroller = this.#scroller;
				if (newValue) {
					scroller.setAttribute(name, newValue);
				} else {
					scroller.removeAttribute(name);
				}
				break;
			}

			default: {
				break;
			}
		}
	}

	// @ts-expect-error Protected method used by HTMLElement
	private connectedCallback(): void {
		const scroller = this.#scroller;
		const hWindow = this.getAttribute("h-window");
		if (hWindow) {
			scroller.setAttribute("h-window", hWindow);
		} else {
			scroller.removeAttribute("h-window");
		}

		this.#defaultRowHeight =
			parseFloatAttribute(this.getAttribute("row-height")) ??
			TIMELINE_ROW_HEIGHT_DEFAULT;

		this.#shadow.adoptedStyleSheets.push(timelineStylesheet.subscribe());

		this.render();

		const bbox = this.getBoundingClientRect();
		const vSize = bbox.height;
		scroller.setVWindow(ZERO, vSize);
	}

	// @ts-expect-error Protected method used by HTMLElement
	private disconnectedCallback(): void {
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("disconnected");

		timelineStylesheet.unsubscribe();
	}

	private updateFullHeight() {
		const defaultRowHeight = this.#defaultRowHeight;
		const groups = this.#groups;
		const itemGroups = this.#itemGroups;
		const scroller = this.#scroller;

		let fullHeight = ZERO;

		for (const group of groups) {
			const rowHeight = group.rowHeight ?? defaultRowHeight;
			const rowCount = itemGroups.get(group.id)?.length ?? UNIT;
			const groupHeight = rowHeight * rowCount;

			fullHeight += groupHeight;
		}

		const bbox = this.getBoundingClientRect();
		const vSize = bbox.height;

		scroller.setVExtrema(ZERO, Math.max(fullHeight, vSize));
	}

	private getGroupRows(groupId: TGroupId): Readonly<TItem>[][] {
		performance.mark(`prepareGroupRows-${groupId}-start`);

		const itemGroups = this.#itemGroups;
		const items = this.#items;
		const scroller = this.#scroller;

		const hWindowMin = scroller.hWindowMin;
		const hWindowMax = scroller.hWindowMax;

		let itemGroup = itemGroups.get(groupId);

		if (itemGroup === undefined) {
			itemGroup = items.filter((item) => item.groupId === groupId);
			itemGroups.set(groupId, itemGroup);
		}

		const groupRows = layoutGroupRows<TGroupId, TItemId, TItem>(
			itemGroup,
			hWindowMin,
			hWindowMax,
		);

		// biome-ignore lint/nursery/noConsole: Testing
		console.log(
			`prepareGroupRows-${groupId}`,
			performance.measure(
				`prepareGroupRows-${groupId}`,
				`prepareGroupRows-${groupId}-start`,
			),
		);

		return groupRows;
	}

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: initial development
	private render(): void {
		if (!this.isConnected) {
			return;
		}

		const itemGroups = this.#itemGroups;
		const groups = this.#groups;
		const scroller = this.#scroller;

		const vWindowMin = scroller.vWindowMin;
		const vWindowMax = scroller.vWindowMax;

		while (scroller.firstChild) {
			scroller.removeChild(scroller.firstChild);
		}

		const defaultRowHeight = this.#defaultRowHeight;

		let topPos = 0;
		for (const group of groups) {
			let currentPos = topPos;

			const rowHeight = group.rowHeight ?? defaultRowHeight;
			const rowCount = itemGroups.get(group.id)?.length ?? UNIT;
			const groupHeight = rowHeight * rowCount;
			topPos += groupHeight;

			if (topPos <= vWindowMin) {
				continue;
			}

			if (currentPos >= vWindowMax) {
				break;
			}

			const groupRows = this.getGroupRows(group.id);

			for (const groupRow of groupRows) {
				if (currentPos + rowHeight <= vWindowMin) {
					currentPos += rowHeight;
					continue;
				}

				if (currentPos >= vWindowMax) {
					break;
				}

				const rowElement = document.createElement("div");
				rowElement.slot = "center";
				rowElement.style.position = "absolute";
				rowElement.style.insetInline = "0";
				rowElement.style.top = `${currentPos}px`;
				rowElement.style.height = `${rowHeight}px`;
				rowElement.style.border = "2px solid blue";
				rowElement.style.background = "#9999ffaa";
				rowElement.style.boxSizing = "border-box";

				for (const item of groupRow) {
					const startTime = item.startTime;
					const endTime = item.endTime;
					const id = item.id;

					const startPos = Math.max(scroller.getHPos(startTime), ZERO);
					const endPos = Math.min(
						scroller.getHPos(endTime),
						scroller.hScrollSize,
					);
					const width = (endPos - startPos).toFixed(4);

					const itemElement = document.createElement("div");
					itemElement.style.position = "absolute";
					itemElement.style.top = "10%";
					itemElement.style.height = "80%";
					itemElement.style.left = `${startPos}px`;
					itemElement.style.width = `${width}px`;
					itemElement.style.background = "#ff9999aa";
					itemElement.style.border = "2px solid red";
					itemElement.style.borderLeftColor = "white";
					itemElement.style.boxSizing = "border-box";
					itemElement.style.overflow = "hidden";

					itemElement.appendChild(document.createTextNode(String(id)));

					rowElement.appendChild(itemElement);
				}

				scroller.appendChild(rowElement);

				currentPos += rowHeight;
			}
		}

		this.updateFullHeight();
	}

	public setGroups(groups: readonly Readonly<TGroup>[]): void {
		this.#groups = groups;

		this.render();
	}

	public setItems(items: readonly Readonly<TItem>[]): void {
		this.#items = items;
		this.#itemGroups.clear();

		this.render();
	}
}

if (!customElements.get("cg-timeline")) {
	customElements.define("cg-timeline", Timeline);
}
