import {
	BINARY_SEARCH_EQUALS,
	BINARY_SEARCH_LESS_THAN,
	binarySearch,
} from "./array.ts";
import { MOST_SIGNIFICANT_BIT, UNIT, ZERO } from "./math.ts";
import "./Scroller.ts";
import type { Scroller } from "./Scroller.ts";
import { BPlusTree } from "./trees.ts";

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
	private prepareGroupRows4(): void {
		performance.mark("start4");
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
		console.log("#4", performance.measure("measure4", "start4"));
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(groupedItemRows);
	}

	// Ordered row array
	private prepareGroupRows3(): void {
		performance.mark("start3");
		const groupedItems = this.#groupedItems;
		const scroller = this.#scroller;
		const hWindowMin = scroller.hWindowMin;
		const hWindowMax = scroller.hWindowMax;

		const groupedItemRows: Map<TGroupId, TItem[][]> = new Map();
		for (const [groupId, items] of groupedItems) {
			const rows: TItem[][] = [];
			const orderedRows: TItem[][] = [];

			for (const item of items) {
				const startTime = item.startTime;
				const endTime = item.endTime;

				if (startTime > hWindowMax || endTime <= hWindowMin) {
					continue;
				}

				let row = orderedRows[ZERO];
				const lastItem = row?.[row.length - UNIT];

				if (row === undefined || (lastItem && lastItem.endTime > startTime)) {
					row = [];
					rows.push(row);
				} else {
					orderedRows.shift();
				}

				row.push(item);

				// Add row to ordered rows
				const insertRowIdx =
					binarySearch(
						orderedRows,
						endTime,
						BINARY_SEARCH_LESS_THAN,
						(row) => row.at(-UNIT)?.endTime,
					) + UNIT;

				orderedRows.splice(insertRowIdx, ZERO, row);
			}

			groupedItemRows.set(groupId, rows);
		}

		// biome-ignore lint/nursery/noConsole: Testing
		console.log("#3", performance.measure("measure3", "start3"));
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(groupedItemRows);
	}

	private prepareGroupRows2(): void {
		performance.mark("start2");
		const groupedItems = this.#groupedItems;
		const scroller = this.#scroller;
		const hWindowMin = scroller.hWindowMin;
		const hWindowMax = scroller.hWindowMax;

		const groupedItemRows: Map<TGroupId, TItem[][]> = new Map();
		for (const [groupId, items] of groupedItems) {
			const rows: TItem[][] = [];
			const rowsByEndTime = new BPlusTree<TItem[]>();

			for (const item of items) {
				const startTime = item.startTime;
				const endTime = item.endTime;

				if (startTime > hWindowMax || endTime <= hWindowMin) {
					continue;
				}

				let [rowEndTime, row] = rowsByEndTime.getMin();
				const lastItem = row?.[row.length - UNIT];

				if (
					rowEndTime === undefined ||
					row === undefined ||
					(lastItem && lastItem.endTime > startTime)
				) {
					row = [];
					rows.push(row);
				} else {
					rowsByEndTime.delete(rowEndTime, row);
				}

				row.push(item);

				// Add row to ordered row
				rowsByEndTime.insert(endTime, row);
			}

			groupedItemRows.set(groupId, rows);
		}

		// biome-ignore lint/nursery/noConsole: Testing
		console.log("#2", performance.measure("measure2", "start2"));
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(groupedItemRows);
	}

	// Ordered row array
	private prepareGroupRows1(): void {
		performance.mark("start1");
		const groupedItems = this.#groupedItems;
		const scroller = this.#scroller;
		const hWindowMin = scroller.hWindowMin;
		const hWindowMax = scroller.hWindowMax;

		const groupedItemRows: Map<TGroupId, TItem[][]> = new Map();
		for (const [groupId, items] of groupedItems) {
			const rows: TItem[][] = [];
			const orderedRows: TItem[][] = [];

			for (const item of items) {
				const startTime = item.startTime;
				const endTime = item.endTime;

				if (startTime > hWindowMax || endTime <= hWindowMin) {
					continue;
				}

				const rowIdx = binarySearch(
					orderedRows,
					startTime,
					BINARY_SEARCH_EQUALS | BINARY_SEARCH_LESS_THAN,
					(row) => row.at(-UNIT)?.endTime,
				);

				let row: TItem[];
				if (rowIdx === -1) {
					row = [];
					rows.push(row);
				} else {
					const removedRow = orderedRows.splice(rowIdx, UNIT)[ZERO];
					if (!removedRow) {
						continue;
					}

					row = removedRow;
				}

				row.push(item);

				// Add row to ordered rows
				const insertRowIdx =
					binarySearch(
						orderedRows,
						endTime,
						BINARY_SEARCH_LESS_THAN,
						(row) => row.at(-UNIT)?.endTime,
					) + UNIT;

				orderedRows.splice(insertRowIdx, ZERO, row);
			}

			groupedItemRows.set(groupId, rows);
		}

		// biome-ignore lint/nursery/noConsole: Testing
		console.log("#1", performance.measure("measure1", "start1"));
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(groupedItemRows);
	}

	// No ordered rows
	private prepareGroupRowsBase(): void {
		performance.mark("base");
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

		// biome-ignore lint/nursery/noConsole: Testing
		console.log("base", performance.measure("measureBase", "base"));
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
		performance.mark("grouping1");
		const groupedItemsByStartDate1 = Map.groupBy(items, (item) => item.groupId);

		for (const items of groupedItemsByStartDate1.values()) {
			items.sort((a, b) => a.startTime - b.startTime);
		}
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(
			"grouping1",
			performance.measure("measureGrouping1", "grouping1"),
		);
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(groupedItemsByStartDate1);

		performance.mark("grouping2");
		const sortedItems2 = items.toSorted((a, b) => a.startTime - b.startTime);
		const groupedItemsByStartDate2 = Map.groupBy(
			sortedItems2,
			(item) => item.groupId,
		);
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(
			"grouping2",
			performance.measure("measureGrouping2", "grouping2"),
		);
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(groupedItemsByStartDate2);

		performance.mark("grouping3");
		const sortedItems3 = [...items].sort((a, b) => a.startTime - b.startTime);
		const groupedItemsByStartDate3 = Map.groupBy(
			sortedItems3,
			(item) => item.groupId,
		);
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(
			"grouping3",
			performance.measure("measureGrouping3", "grouping3"),
		);
		// biome-ignore lint/nursery/noConsole: Testing
		console.log(groupedItemsByStartDate3);

		this.#groupedItems = groupedItemsByStartDate2;

		this.prepareGroupRowsBase();
		this.prepareGroupRows1();
		this.prepareGroupRows2();
		this.prepareGroupRows3();
		this.prepareGroupRows4();
		this.prepareGroupRowsBase();
		this.prepareGroupRows1();
		this.prepareGroupRows2();
		this.prepareGroupRows3();
		this.prepareGroupRows4();
	}
}

if (!customElements.get("cg-timeline")) {
	customElements.define("cg-timeline", Timeline);
}
