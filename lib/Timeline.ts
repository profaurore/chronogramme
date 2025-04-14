import { GroupPositionsState } from "./groupPositionsState.ts";
import { ZERO, parseFloatAttribute } from "./math.ts";
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
	lineSize?: number;
}

// interface ScrollReference<TGroupId = number> {
// 	groupId: TGroupId;
// 	groupIdx: number;
// 	offset: number;
// }

export class Timeline<
	TGroupId = number,
	TGroup extends BaseGroup<TGroupId> = BaseGroup<TGroupId>,
	TItemId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
> extends HTMLElement {
	public static observedAttributes = ["h-window", "row-height"];

	readonly #scroller: Scroller;

	readonly #groupPositionsState: GroupPositionsState<
		TGroupId,
		TGroup,
		TItemId,
		TItem
	>;

	// The reference is the distance from the bottom of the first group in the
	// view.
	// #vScrollReference: ScrollReference | undefined;

	readonly #shadow: ShadowRoot;

	public constructor() {
		super();

		const scroller = document.createElement("cg-scroller") as Scroller;
		customElements.upgrade(scroller);
		scroller.addEventListener("windowChange", this.render.bind(this));
		scroller.id = "scroller";
		this.#scroller = scroller;

		const groupPositionsState = new GroupPositionsState<
			TGroupId,
			TGroup,
			TItemId,
			TItem
		>();
		groupPositionsState.addEventListener(
			"renderRequest",
			this.render.bind(this),
		);
		this.#groupPositionsState = groupPositionsState;

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
				this.#groupPositionsState.setDefaultLineSize(
					parseFloatAttribute(newValue),
				);
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

		this.#groupPositionsState.setDefaultLineSize(
			parseFloatAttribute(this.getAttribute("row-height")),
		);

		this.#shadow.adoptedStyleSheets.push(timelineStylesheet.subscribe());

		this.render();

		const bbox = this.getBoundingClientRect();
		const vSize = bbox.height;
		scroller.setVWindow(ZERO, vSize);
	}

	// @ts-expect-error Protected method used by HTMLElement
	private disconnectedCallback(): void {
		// biome-ignore lint/suspicious/noConsole: Testing
		console.log("disconnected");

		timelineStylesheet.unsubscribe();
	}

	private updateFullHeight() {
		const scroller = this.#scroller;
		const groupPositionsState = this.#groupPositionsState;

		const fullHeight = groupPositionsState.getHeight();

		const bbox = this.getBoundingClientRect();
		const vSize = bbox.height;

		scroller.setVExtrema(ZERO, Math.max(fullHeight, vSize));
	}

	// private updateVScrollPos() {
	// 	const vScrollPos = this.#scroller.vScrollPos;

	// 	let vScrollReference = this.#vScrollReference;

	// 	if (!vScrollReference) {
	// 		vScrollReference = { groupId: 0, groupIdx: 0, offset: 0 };
	// 		this.#vScrollReference = vScrollReference;
	// 	}

	// 	// while ()
	// }

	private render(): void {
		performance.mark("render-start");

		if (!this.isConnected) {
			return;
		}

		const groupPositionsState = this.#groupPositionsState;
		const scroller = this.#scroller;

		const hWindowMax = scroller.hWindowMax;
		const hWindowMin = scroller.hWindowMin;
		const vWindowMax = scroller.vWindowMax;
		const vWindowMin = scroller.vWindowMin;

		groupPositionsState.setGroupWindow(vWindowMin, vWindowMax);
		groupPositionsState.setItemWindow(hWindowMin, hWindowMax);
		const groups = groupPositionsState.getVisibleGroupsIter();

		while (scroller.firstChild) {
			scroller.removeChild(scroller.firstChild);
		}

		for (const groupIndex of groups) {
			const lineSize = groupPositionsState.getGroupLineSize(groupIndex);
			const lines = groupPositionsState.getVisibleGroupLinesIter(groupIndex);
			const groupPosition = groupPositionsState.getGroupPosition(groupIndex);

			for (const lineIndex of lines) {
				const linePosition = groupPositionsState.getLinePosition(
					groupIndex,
					lineIndex,
				);
				const items = groupPositionsState.getVisibleLineItemsIter(
					groupIndex,
					lineIndex,
				);

				const rowElement = document.createElement("div");
				rowElement.slot = "center";
				rowElement.style.position = "absolute";
				rowElement.style.insetInline = "0";
				rowElement.style.top = `${groupPosition + linePosition}px`;
				rowElement.style.height = `${lineSize}px`;
				rowElement.style.border = "2px solid blue";
				rowElement.style.background = "#9999ffaa";
				rowElement.style.boxSizing = "border-box";
				rowElement.style.fontSize = `${lineSize / 2}px`;

				for (const itemIndex of items) {
					const item = groupPositionsState.getItem(
						groupIndex,
						lineIndex,
						itemIndex,
					);

					if (!item) {
						continue;
					}

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
			}
		}

		this.updateFullHeight();

		const perf = performance.measure("render", "render-start");
		// if (perf.duration > 500) {
		// biome-ignore lint/suspicious/noConsole: Testing
		console.log(perf);
		// }

		// this.updateVScrollPos();
	}

	public setGroups(groups: readonly Readonly<TGroup>[]): void {
		this.#groupPositionsState.setGroups(groups);
	}

	public setItems(items: readonly Readonly<TItem>[]): void {
		this.#groupPositionsState.setItems(items);
	}

	public setHWindow(min: number | undefined, max: number | undefined): void {
		this.#scroller.setHWindow(min, max);
	}
}

if (!customElements.get("cg-timeline")) {
	customElements.define("cg-timeline", Timeline);
}
