import { MOST_SIGNIFICANT_BIT, UNIT, ZERO } from "./math.ts";
import "./Scroller.ts";
import type { Scroller } from "./Scroller.ts";

export interface BaseItem<TItemId = number, TGroupId = number> {
	endTime: EpochTimeStamp;
	groupId: TGroupId;
	id: TItemId;
	startTime: EpochTimeStamp;
}

interface BaseGroup<TGroupId = number> {
	id: TGroupId;
}

export class Timeline<
	TItemId = number,
	TGroupId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
	TGroup extends BaseGroup<TGroupId> = BaseGroup<TGroupId>,
> extends HTMLElement {
	readonly #scroller: Scroller;

	#groupedItems: Map<TGroupId, TItem[]>;

	#groups: Map<TGroupId, TGroup>;

	public constructor() {
		super();

		const scroller = document.createElement("cg-scroller") as Scroller;
		this.#scroller = scroller;

		this.#groupedItems = new Map();

		this.#groups = new Map();

		// Root
		const shadow = this.attachShadow({ mode: "closed" });
		shadow.appendChild(scroller);
	}

	// @ts-expect-error Protected method used by HTMLElement
	private attributeChangedCallback(
		name: (typeof Scroller.observedAttributes)[number],
		oldValue: string | null,
		newValue: string | null,
	): void {
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("attributeChange", name, oldValue, newValue);
	}

	// @ts-expect-error Protected method used by HTMLElement
	private connectedCallback(): void {
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("connected");
	}

	// @ts-expect-error Protected method used by HTMLElement
	private disconnectedCallback(): void {
		// biome-ignore lint/nursery/noConsole: Testing
		console.log("disconnected");
	}

	// Ordered row array
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Testing
	private prepareGroupRows(): void {
		performance.mark("prepareGroupRows-start");
		const groupedItems = this.#groupedItems;
		const scroller = this.#scroller;
		const hWindowMin = scroller.hWindowMin;
		const hWindowMax = scroller.hWindowMax;

		const groupedItemRows: Map<TGroupId, TItem[][]> = new Map();
		for (const [groupId, items] of groupedItems) {
			const rows: TItem[][] = [];
			const branchMinOfMaxs: number[] = [];
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
					const branchMin = branchMinOfMaxs[currentIdx];

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
				branchMinOfMaxs[selectedIdx] = endTime;

				// From https://stackoverflow.com/a/61442366
				const powerOfTwoAfterInsert = Math.ceil(Math.log2(rows.length));
				const selectedIdxAsInt = (selectedIdx + UNIT) | ZERO;
				const selectedIdxPower = selectedIdxAsInt
					? MOST_SIGNIFICANT_BIT -
						Math.clz32(selectedIdxAsInt & -selectedIdxAsInt)
					: ZERO;

				// Special base case.
				currentIdx = selectedIdx + (selectedIdxPower === ZERO ? UNIT : ZERO);

				for (
					let power = Math.max(selectedIdxPower, UNIT);
					power <= powerOfTwoAfterInsert;
					power++
				) {
					const substep = UNIT << (power - UNIT);
					const rowMax = rowMaxs[currentIdx] ?? Number.POSITIVE_INFINITY;
					const leftMin =
						branchMinOfMaxs[currentIdx - substep] ?? Number.POSITIVE_INFINITY;
					const rightMin =
						branchMinOfMaxs[currentIdx + substep] ?? Number.POSITIVE_INFINITY;

					branchMinOfMaxs[currentIdx] = Math.min(leftMin, rowMax, rightMin);

					currentIdx += UNIT << power;
				}
			}

			groupedItemRows.set(groupId, rows);
		}

		// biome-ignore lint/nursery/noConsole: Testing
		console.log(
			"prepareGroupRows",
			performance.measure("prepareGroupRows", "prepareGroupRows-start"),
		);
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(groupedItemRows);
	}

	// TODO: Make async
	public setGroups(groups: Map<TGroupId, TGroup> | TGroup[]): void {
		this.#groups =
			groups instanceof Map
				? groups
				: groups.reduce((map, item) => map.set(item.id, item), new Map());

		// biome-ignore lint/nursery/noConsole: Testing
		console.log(this.#groups);
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
		console.log(groupedItemsByStartDate);

		this.#groupedItems = groupedItemsByStartDate;

		this.prepareGroupRows();
	}
}

if (!customElements.get("cg-timeline")) {
	customElements.define("cg-timeline", Timeline);
}
