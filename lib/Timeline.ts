import { groupOrderedItems, layoutGroupRows } from "./groupLayout.ts";
import { ZERO } from "./math.ts";
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
}

export class Timeline<
	TGroupId = number,
	TGroup extends BaseGroup<TGroupId> = BaseGroup<TGroupId>,
	TItemId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
> extends HTMLElement {
	public static observedAttributes = ["h-window"];

	readonly #scroller: Scroller;

	#groupedItems: Map<TGroupId, readonly Readonly<TItem>[]>;

	#groupsRows: Map<TGroupId, readonly Readonly<TItem>[][]>;

	#groups: TGroup[];

	readonly #shadow: ShadowRoot;

	public constructor() {
		super();

		const scroller = document.createElement("cg-scroller") as Scroller;
		customElements.upgrade(scroller);
		scroller.addEventListener("scrollPosChange", this.render.bind(this));
		this.#scroller = scroller;

		this.#groupedItems = new Map();
		this.#groupsRows = new Map();
		this.#groups = [];

		// Root
		const shadow = this.attachShadow({ mode: "closed" });
		shadow.appendChild(scroller);
		this.#shadow = shadow;
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
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("timeline connected");

		const scroller = this.#scroller;
		const hWindow = this.getAttribute("h-window");
		if (hWindow) {
			scroller.setAttribute("h-window", hWindow);
		} else {
			scroller.removeAttribute("h-window");
		}

		this.#shadow.adoptedStyleSheets.push(timelineStylesheet.subscribe());

		this.render();
	}

	// @ts-expect-error Protected method used by HTMLElement
	private disconnectedCallback(): void {
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("disconnected");

		timelineStylesheet.unsubscribe();
	}

	private prepareGroupsRows(): void {
		performance.mark("prepareGroupRows-start");

		const groupedItems = this.#groupedItems;
		const scroller = this.#scroller;
		const hWindowMin = scroller.hWindowMin;
		const hWindowMax = scroller.hWindowMax;

		const groupedRows: Map<TGroupId, TItem[][]> = new Map();
		for (const [groupId, items] of groupedItems) {
			const rows = layoutGroupRows<TGroupId, TItemId, TItem>(
				items,
				hWindowMin,
				hWindowMax,
			);

			groupedRows.set(groupId, rows);
		}

		// biome-ignore lint/nursery/noConsole: Testing
		console.log(
			"prepareGroupRows",
			performance.measure("prepareGroupRows", "prepareGroupRows-start"),
		);

		this.#groupsRows = groupedRows;
	}

	private render(): void {
		if (!this.isConnected) {
			return;
		}

		this.prepareGroupsRows();

		const scroller = this.#scroller;
		const groups = this.#groups;
		const groupsRows = this.#groupsRows;

		while (scroller.firstChild) {
			scroller.removeChild(scroller.firstChild);
		}

		let topPos = 0;
		for (const group of groups) {
			const groupRows = groupsRows.get(group.id) || [];

			for (const groupRow of groupRows) {
				const rowHeight = 30;

				const rowElement = document.createElement("div");
				rowElement.slot = "center";
				rowElement.style.position = "absolute";
				rowElement.style.insetInline = "0";
				rowElement.style.top = `${topPos}px`;
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

				topPos += rowHeight;
			}
		}

		const bbox = this.getBoundingClientRect();
		const vSize = bbox.height;

		scroller.setVWindow(ZERO, vSize);
		scroller.setVExtrema(ZERO, Math.max(topPos, vSize));
	}

	// TODO: Make async
	public setGroups(groups: TGroup[]): void {
		this.#groups = groups;

		this.render();
	}

	// TODO: Make async
	public setItems(items: readonly Readonly<TItem>[]): void {
		performance.mark("grouping-start");

		const groupedItems = groupOrderedItems<TGroupId, TItemId, TItem>(items);

		// biome-ignore lint/nursery/noConsole: Testing
		console.log("grouping", performance.measure("grouping", "grouping-start"));

		this.#groupedItems = groupedItems;

		this.render();
	}
}

if (!customElements.get("cg-timeline")) {
	customElements.define("cg-timeline", Timeline);
}
