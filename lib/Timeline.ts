import { MOST_SIGNIFICANT_BIT, UNIT, ZERO } from "./math.ts";
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
	TItemId = number,
	TGroupId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
	TGroup extends BaseGroup<TGroupId> = BaseGroup<TGroupId>,
> extends HTMLElement {
	public static observedAttributes = ["h-window"];

	readonly #scroller: Scroller;

	#groupedItems: Map<TGroupId, TItem[]>;

	#groupsRows: Map<TGroupId, TItem[][]>;

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

	// Ordered row array
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Testing
	private prepareGroupRows(): void {
		performance.mark("prepareGroupRows-start");
		const groupedItems = this.#groupedItems;
		const scroller = this.#scroller;
		const hWindowMin = scroller.hWindowMin;
		const hWindowMax = scroller.hWindowMax;

		const groupedRows: Map<TGroupId, TItem[][]> = new Map();
		for (const [groupId, items] of groupedItems) {
			const rows: TItem[][] = [];
			const leftMinOfMaxs: number[] = [];
			const rightMinOfMaxs: number[] = [];
			const rowMaxs: number[] = [];

			for (const item of items) {
				const startTime = item.startTime;
				const endTime = item.endTime;

				if (startTime > hWindowMax || endTime < hWindowMin) {
					continue;
				}

				const powerOfTwo = Math.ceil(Math.log2(rows.length));
				let currentIdx = (UNIT << Math.ceil(Math.log2(rows.length))) - UNIT;
				let selectedIdx: number | undefined;

				for (let power = powerOfTwo; power >= ZERO; power--) {
					const branchMin = leftMinOfMaxs[currentIdx];

					if (branchMin === undefined) {
						break;
					}

					const substep = UNIT << (power - UNIT);

					if (branchMin <= startTime) {
						selectedIdx = currentIdx;
						currentIdx -= substep;
					} else {
						currentIdx += substep;
					}
				}

				let row = rows[selectedIdx ?? -UNIT];

				if (selectedIdx === undefined || row === undefined) {
					selectedIdx = rows.length;

					row = [];
					rows.push(row);
				}

				row.push(item);

				rowMaxs[selectedIdx] = endTime;
				leftMinOfMaxs[selectedIdx] = endTime;
				rightMinOfMaxs[selectedIdx] = endTime;

				// From https://stackoverflow.com/a/61442366
				const powerOfTwoAfterInsert = Math.ceil(Math.log2(rows.length));
				const selectedIdxAsInt = (selectedIdx + UNIT) | ZERO;
				const selectedIdxPower = selectedIdxAsInt
					? MOST_SIGNIFICANT_BIT -
						Math.clz32(selectedIdxAsInt & -selectedIdxAsInt)
					: ZERO;

				currentIdx = selectedIdx;

				for (
					let power = selectedIdxPower;
					power <= powerOfTwoAfterInsert;
					power++
				) {
					if (power !== ZERO) {
						const substep = UNIT << (power - UNIT);
						const leftSubstep = currentIdx - substep;
						const rightSubstep = currentIdx + substep;

						const leftOfLeftMin =
							leftMinOfMaxs[leftSubstep] ?? Number.POSITIVE_INFINITY;
						const rightOfLeftMin =
							rightMinOfMaxs[leftSubstep] ?? Number.POSITIVE_INFINITY;
						const rowMax = rowMaxs[currentIdx] ?? Number.POSITIVE_INFINITY;
						const rightMin =
							rightMinOfMaxs[rightSubstep] ?? Number.POSITIVE_INFINITY;

						const leftMin = Math.min(leftOfLeftMin, rightOfLeftMin, rowMax);
						leftMinOfMaxs[currentIdx] = leftMin;
						rightMinOfMaxs[currentIdx] = Math.min(leftMin, rowMax, rightMin);
					}

					const isRightBranch = paperFoldingSequence(currentIdx);
					currentIdx += (isRightBranch ? -UNIT : UNIT) * (UNIT << power);
				}
			}

			groupedRows.set(groupId, rows);
		}

		// biome-ignore lint/nursery/noConsole: Testing
		console.log(
			"prepareGroupRows",
			performance.measure("prepareGroupRows", "prepareGroupRows-start"),
		);
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("prepareGroupRows output", groupedRows);

		this.#groupsRows = groupedRows;
	}

	// No ordered rows
	private prepareGroupRowsBase(): Map<TGroupId, TItem[][]> {
		const groupedItems = this.#groupedItems;
		const scroller = this.#scroller;
		const hWindowMin = scroller.hWindowMin;
		const hWindowMax = scroller.hWindowMax;

		const groupedItemRows: Map<TGroupId, TItem[][]> = new Map();
		for (const [groupId, items] of groupedItems) {
			const rows: TItem[][] = [];

			for (const item of items) {
				const startTime = item.startTime;
				const endTime = item.endTime;

				if (startTime > hWindowMax || endTime <= hWindowMin) {
					continue;
				}

				let row = rows.find((row) => {
					const lastItem = row[row.length - 1];

					return lastItem && lastItem.endTime <= startTime;
				});

				if (row === undefined) {
					row = [];
					rows.push(row);
				}

				row.push(item);
			}

			groupedItemRows.set(groupId, rows);
		}

		return groupedItemRows;
	}

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Testing
	private render(): void {
		if (!this.isConnected) {
			return;
		}
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("render");

		this.prepareGroupRows();

		const scroller = this.#scroller;
		const groups = this.#groups;
		const groupsRows = this.#groupsRows;

		// biome-ignore lint/nursery/noConsole: Testing
		console.log("validation start");
		const base = this.prepareGroupRowsBase();
		for (const [groupId, rows] of groupsRows) {
			const baseRows = base.get(groupId);
			if (!baseRows) {
				// biome-ignore lint/nursery/noConsole: Testing
				console.log("missing group", groupId);
				continue;
			}

			for (const [rowIdx, row] of rows.entries()) {
				for (const [itemIdx, item] of row.entries()) {
					const baseItem = baseRows[rowIdx]?.[itemIdx];
					if (item !== baseItem) {
						// biome-ignore lint/nursery/noConsole: Testing
						console.log("bad item", baseItem?.id, item.id);
					}
				}
			}
		}
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("validation end");

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
	public setItems(items: readonly TItem[]): void {
		performance.mark("grouping-start");
		const groupedItemsByStartDate = Map.groupBy(items, (item) => item.groupId);

		for (const items of groupedItemsByStartDate.values()) {
			items.sort((a, b) => a.startTime - b.startTime);
		}
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("grouping", performance.measure("grouping", "grouping-start"));
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("grouping output", groupedItemsByStartDate);

		this.#groupedItems = groupedItemsByStartDate;

		this.render();
	}
}

if (!customElements.get("cg-timeline")) {
	customElements.define("cg-timeline", Timeline);
}

// https://oeis.org/A014707
function paperFoldingSequence(n: number): boolean {
	return n % 4 === 0
		? false
		: n % 4 === 2
			? true
			: paperFoldingSequence((n - 1) / 2);
}
