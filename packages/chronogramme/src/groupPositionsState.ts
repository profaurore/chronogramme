import { layoutGroupRows } from "./groupLayout";
import { clampMinWins, UNIT, ZERO } from "./math";
import type { BaseGroup, BaseItem } from "./timeline";

const GROUP_LINE_SIZE_DEFAULT = 30;

const GROUP_OVERDRAW_DEFAULT = 500;

const ASYNC_PROCESSING_SIZE_DEFAULT = 1_000_000;

// interface ScrollReference<TGroupId = number> {
// 	groupId: TGroupId;
// 	groupIdx: number;
// 	offset: number;
// }

export class GroupPositionsState<
	TGroupId = number,
	TGroup extends BaseGroup<TGroupId> = BaseGroup<TGroupId>,
	TItemId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
> extends EventTarget {
	readonly #asyncProcessingSize: number;

	#groups: readonly Readonly<TGroup>[];

	#groupLineSets: (readonly (readonly Readonly<TItem>[])[])[];

	readonly #groupOverdraw: number;

	#groupPositions: number[];

	#groupSizes: number[];

	#groupWindowMax: number;

	#groupWindowMin: number;

	#itemGroups: (readonly Readonly<TItem>[])[];

	#itemGroupsSignalController: AbortController | undefined;

	#items: readonly Readonly<TItem>[];

	#itemWindowMax: number;

	#itemWindowMin: number;

	#lineSize: number;

	// The reference is the distance from the bottom of the first group in the
	// view.
	// #vScrollReference: ScrollReference | undefined;

	public constructor() {
		super();

		this.#asyncProcessingSize = ASYNC_PROCESSING_SIZE_DEFAULT;
		this.#lineSize = GROUP_LINE_SIZE_DEFAULT;
		this.#groups = [];
		this.#groupLineSets = [];
		this.#groupOverdraw = GROUP_OVERDRAW_DEFAULT;
		this.#groupPositions = [];
		this.#groupSizes = [];
		this.#groupWindowMax = ZERO;
		this.#groupWindowMin = ZERO;
		this.#itemGroups = [];
		this.#items = [];
		this.#itemWindowMax = ZERO;
		this.#itemWindowMin = ZERO;
	}

	public clearGroupsAndItems(): void {
		this.#itemGroupsSignalController?.abort();
		this.#itemGroupsSignalController = undefined;

		this.#groups = [];
		this.#groupLineSets = [];
		this.#groupPositions = [];
		this.#groupSizes = [];
		this.#itemGroups = [];
		this.#items = [];
	}

	public getGroup(index: number): Readonly<TGroup> | undefined {
		const groups = this.#groups;

		return groups[index];
	}

	public getGroupLineSize(index: number): number {
		const defaultLineSize = this.#lineSize;
		const groups = this.#groups;

		return groups[index]?.lineSize ?? defaultLineSize;
	}

	public getGroupPosition(index: number): number {
		const groupPositions = this.#groupPositions;

		let groupPosition = groupPositions[index];

		if (groupPosition === undefined) {
			let lastKnownPosition: number | undefined;
			let lastKnownIndex = index;
			for (; lastKnownIndex >= ZERO; lastKnownIndex--) {
				lastKnownPosition = groupPositions[lastKnownIndex];
				if (lastKnownPosition !== undefined) {
					break;
				}
			}

			let currentPos = lastKnownPosition ?? ZERO;
			for (let i = Math.max(lastKnownIndex, ZERO); i < index; i++) {
				groupPositions[i] = currentPos;
				currentPos += this.getGroupSize(i);
			}

			groupPosition = currentPos;
			groupPositions[index] = currentPos;
		}

		return groupPosition;
	}

	public getHeight(): number {
		const groups = this.#groups;
		const groupSizes = this.#groupSizes;

		const numGroups = groups.length;
		let height = ZERO;

		for (let index = ZERO; index < numGroups; index++) {
			height += groupSizes[index] ?? this.getGroupLineSize(index);
		}

		return height;
	}

	public getItem(
		groupIndex: number,
		lineIndex: number,
		itemIndex: number,
	): Readonly<TItem> | undefined {
		const groupLines = this.getGroupLines(groupIndex);

		return groupLines[lineIndex]?.[itemIndex];
	}

	public getLinePosition(groupIndex: number, lineIndex: number): number {
		const lineHeight = this.getGroupLineSize(groupIndex);

		return lineIndex * lineHeight;
	}

	public *getVisibleGroupsIter(): Generator<number, void, undefined> {
		const groups = this.#groups;

		const groupDrawMin = this.getGroupDrawMin();
		const groupDrawMax = this.getGroupDrawMax();

		let [firstGroupIndex, firstGroupStartPos] = this.getFirstGroupInWindow();
		const numGroups = groups.length;

		let currentPos = firstGroupStartPos;
		let lastGroupIndex: number;

		for (
			lastGroupIndex = firstGroupIndex;
			lastGroupIndex < numGroups && currentPos < groupDrawMax;
			lastGroupIndex++
		) {
			currentPos += this.getGroupSize(lastGroupIndex);
		}

		const windowMinAdjusted = currentPos - (groupDrawMax - groupDrawMin);
		currentPos = firstGroupStartPos;

		// If the selected groups are shorter than the window range, snap them to
		// the end of the range and add more groups to the start as long as there
		// are some.
		for (
			;
			firstGroupIndex > ZERO && currentPos > windowMinAdjusted;
			firstGroupIndex--
		) {
			currentPos -= this.getGroupSize(firstGroupIndex);
		}

		// If the selected groups are still shorter than the window range, snap the
		// first group to the start of the range.
		if (currentPos > windowMinAdjusted) {
			currentPos = ZERO;
		}

		for (let index = firstGroupIndex; index < lastGroupIndex; index++) {
			yield index;
		}
	}

	public *getVisibleGroupLinesIter(
		groupIndex: number,
	): Generator<number, void, undefined> {
		const groupDrawMax = this.getGroupDrawMax();
		const groupDrawMin = this.getGroupDrawMin();
		const groupLines = this.getGroupLines(groupIndex);
		const groupPos = this.getGroupPosition(groupIndex);
		const lineSize = this.getGroupLineSize(groupIndex);

		const groupLinesCount = groupLines.length;

		const firstLineIndex = clampMinWins(
			Math.floor((groupDrawMin - groupPos) / lineSize),
			ZERO,
			groupLinesCount,
		);
		const lastLineIndex = clampMinWins(
			Math.ceil((groupDrawMax - groupPos) / lineSize) + UNIT,
			ZERO,
			groupLinesCount,
		);

		for (
			let lineIndex = firstLineIndex;
			lineIndex < lastLineIndex;
			lineIndex++
		) {
			yield lineIndex;
		}
	}

	public *getVisibleLineItemsIter(
		groupIndex: number,
		lineIndex: number,
	): Generator<number, void, undefined> {
		const groupLines = this.getGroupLines(groupIndex);
		const numItems = groupLines[lineIndex]?.length ?? ZERO;

		for (let itemIndex = ZERO; itemIndex < numItems; itemIndex++) {
			yield itemIndex;
		}
	}

	public setGroupWindow(groupWindowMin: number, groupWindowMax: number): void {
		this.#groupWindowMin = groupWindowMin;
		this.#groupWindowMax = groupWindowMax;
	}

	public setGroups(groups: readonly Readonly<TGroup>[]): void {
		this.#groups = groups;

		this.#groupLineSets.length = ZERO;
		this.#groupPositions.length = ZERO;
		this.#groupSizes.length = ZERO;

		void this.prepareItemGroups();
	}

	public setItemWindow(itemWindowMin: number, itemWindowMax: number): void {
		this.#itemWindowMin = itemWindowMin;
		this.#itemWindowMax = itemWindowMax;

		this.#groupLineSets.length = ZERO;
		this.#groupPositions.length = ZERO;
		this.#groupSizes.length = ZERO;
	}

	public setItems(items: readonly Readonly<TItem>[]): void {
		this.#items = items;

		this.#groupLineSets.length = ZERO;
		this.#groupPositions.length = ZERO;
		this.#groupSizes.length = ZERO;

		void this.prepareItemGroups();
	}

	public setLineSize(lineSize: number | undefined): void {
		this.#lineSize = lineSize ?? GROUP_LINE_SIZE_DEFAULT;

		this.#groupPositions.length = ZERO;
		this.#groupSizes.length = ZERO;
	}

	private async buildItemGroupsMap(
		signal: AbortSignal,
	): Promise<Map<TGroupId, TItem[]> | undefined> {
		const asyncProcessingSize = this.#asyncProcessingSize;
		const items = this.#items;

		const itemGroupsMap = new Map<TGroupId, TItem[]>();

		for (const [itemIndex, item] of items.entries()) {
			let itemGroup = itemGroupsMap.get(item.groupId);

			if (!itemGroup) {
				itemGroup = [];
				itemGroupsMap.set(item.groupId, itemGroup);
			}

			itemGroup.push(item);

			if ((itemIndex + UNIT) % asyncProcessingSize === ZERO) {
				// biome-ignore lint/nursery/noAwaitInLoop: This is intentional to break up the processing of the list.
				await new Promise((resolve) => setTimeout(resolve, ZERO));

				if (signal.aborted) {
					return;
				}
			}
		}

		return itemGroupsMap;
	}

	private getFirstGroupInWindow(): [index: number, startPos: number] {
		const defaultGroupSize = this.#lineSize;
		const groupSizes = this.#groupSizes;

		const groupDrawMin = this.getGroupDrawMin();

		const numGroups = groupSizes.length;

		let firstGroup: [index: number, startPos: number] | undefined;
		let currentPos = ZERO;

		for (let index = ZERO; index < numGroups; index++) {
			const groupSize = groupSizes[index] ?? defaultGroupSize;

			const startPos = currentPos;
			currentPos += groupSize;

			if (currentPos > groupDrawMin) {
				firstGroup = [index, startPos];
				break;
			}
		}

		return firstGroup ?? [ZERO, ZERO];
	}

	private getGroupDrawMax(): number {
		const groupOverdraw = this.#groupOverdraw;
		const groupWindowMax = this.#groupWindowMax;

		return groupWindowMax + groupOverdraw;
	}

	private getGroupDrawMin(): number {
		const groupOverdraw = this.#groupOverdraw;
		const groupWindowMin = this.#groupWindowMin;

		return groupWindowMin - groupOverdraw;
	}

	private getGroupSize(index: number): number {
		const groupSizes = this.#groupSizes;

		let groupSize = groupSizes[index];

		if (groupSize === undefined) {
			const defaultLineSize = this.#lineSize;
			const groupLineSets = this.#groupLineSets;
			const groups = this.#groups;

			const group = groups[index];
			const lineSize = group?.lineSize || defaultLineSize;
			const itemGroupLines = this.getGroupLines(index).length;
			const lineCount = Math.max(itemGroupLines, UNIT);

			groupSize = lineSize * lineCount;

			groupLineSets.length = Math.min(groupLineSets.length, index + UNIT);
			groupSizes[index] = groupSize;
		}

		return groupSize;
	}

	private getGroupLines(
		index: number,
	): readonly (readonly Readonly<TItem>[])[] {
		const groupLineSets = this.#groupLineSets;

		let groupLines = groupLineSets[index];

		if (groupLines === undefined) {
			const itemWindowMin = this.#itemWindowMin;
			const itemWindowMax = this.#itemWindowMax;

			const itemGroup = this.getItemGroup(index);

			const lines = layoutGroupRows<TGroupId, TItemId, TItem>(
				itemGroup,
				itemWindowMin,
				itemWindowMax,
			);

			if (lines.length === ZERO) {
				lines.push([]);
			}

			groupLines = lines;
			groupLineSets[index] = groupLines;
		}

		return groupLines;
	}

	private getItemGroup(index: number): readonly Readonly<TItem>[] {
		const itemGroups = this.#itemGroups;

		return itemGroups[index] ?? [];
	}

	private async prepareItemGroups(): Promise<void> {
		this.#itemGroupsSignalController?.abort();

		const signalController = new AbortController();
		this.#itemGroupsSignalController = signalController;
		const signal = signalController.signal;

		const asyncProcessingSize = this.#asyncProcessingSize;
		const groups = this.#groups;
		const items = this.#items;

		await new Promise((resolve) => setTimeout(resolve, ZERO));

		if (signal.aborted) {
			return;
		}

		if (groups.length === ZERO || items.length === ZERO) {
			this.#itemGroups = [];
			this.dispatchEvent(new CustomEvent("renderRequest"));
			return;
		}

		const itemGroupsMap = await this.buildItemGroupsMap(signal);
		if (itemGroupsMap === undefined) {
			return;
		}

		const itemGroups: (readonly Readonly<TItem>[])[] = [];

		for (const [groupIndex, group] of groups.entries()) {
			itemGroups[groupIndex] = itemGroupsMap.get(group.id) ?? [];

			if ((groupIndex + UNIT) % asyncProcessingSize === ZERO) {
				// biome-ignore lint/nursery/noAwaitInLoop: This is intentional to break up the processing of the list.
				await new Promise((resolve) => setTimeout(resolve, ZERO));
				await new Promise((resolve) => setTimeout(resolve, ZERO));

				if (signal.aborted) {
					return;
				}
			}
		}

		if (signal.aborted) {
			return;
		}

		this.#itemGroups = itemGroups;

		if (this.#itemGroupsSignalController === signalController) {
			this.#itemGroupsSignalController = undefined;
		}

		this.dispatchEvent(new CustomEvent("renderRequest"));
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
}
