import { layoutGroupLines } from "./groupLayout";
import { clampMinWins, UNIT, validateNumberInterval, ZERO } from "./math";
import { validateObject } from "./object";
import type { BaseGroup, BaseItem } from "./timeline";
import { yieldToMain } from "./yieldToMain";

interface ItemChangeState<
	TGroupId = number,
	TItemId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
> {
	changeType:
		| typeof ITEM_CHANGE_TYPE_DRAG
		| typeof ITEM_CHANGE_TYPE_RESIZE_END
		| typeof ITEM_CHANGE_TYPE_RESIZE_START;
	item: TItem;
	newItem: TItem;
	prevRawEndTime: number;
	prevRawStartTime: number;
	triggerTime: number;
}

const ITEM_CHANGE_TYPE_DRAG = 0;
const ITEM_CHANGE_TYPE_RESIZE_END = 1;
const ITEM_CHANGE_TYPE_RESIZE_START = 2;

const GROUP_LINE_SIZE_DEFAULT = 30;

const GROUP_OVERDRAW_DEFAULT = 100;

const ASYNC_PROCESSING_SIZE_DEFAULT = 1_000_000;

export type ItemDragValidator<TItem> = (
	item: TItem,
	startTime: number,
	endTime: number,
) => { startTime: number; endTime: number };

export type ItemResizeValidator<TItem> = (
	item: TItem,
	isStart: boolean,
	time: number,
) => { startTime: number; endTime: number };

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

	#itemDragValidator: ItemDragValidator<TItem> | undefined;

	#groups: readonly Readonly<TGroup>[];

	#groupLineSets: (readonly (readonly Readonly<TItem>[])[])[];

	readonly #groupOverdraw: number;

	#groupPositions: number[];

	#groupSizes: number[];

	#groupPosWindowMax: number;

	#groupPosWindowMin: number;

	#size: number;

	#itemChangeState: ItemChangeState<TGroupId, TItemId, TItem> | undefined;

	#itemGroups: (readonly Readonly<TItem>[])[];

	#itemGroupsSignalController: AbortController | undefined;

	#items: readonly Readonly<TItem>[];

	#itemsDraggable: boolean;

	#itemTimeSnap: number | undefined;

	#timezoneOffset: number;

	#itemsEndResizable: boolean;

	#itemsStartResizable: boolean;

	#itemWindowMax: number;

	#itemWindowMin: number;

	#itemResizeValidator: ItemResizeValidator<TItem> | undefined;

	#lineSize: number;

	#visibleGroupIndexMin: number;

	#visibleGroupIndexMax: number;

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
		this.#groupPosWindowMax = ZERO;
		this.#groupPosWindowMin = ZERO;
		this.#itemGroups = [];
		this.#items = [];
		this.#itemsDraggable = true;
		this.#itemsEndResizable = true;
		this.#itemsStartResizable = true;
		this.#itemWindowMax = ZERO;
		this.#itemWindowMin = ZERO;
		this.#size = ZERO;
		this.#timezoneOffset = ZERO;
		this.#visibleGroupIndexMax = ZERO;
		this.#visibleGroupIndexMin = ZERO;
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

	public get size(): number {
		return this.#size;
	}

	public getDragOffset(): number | undefined {
		const itemChangeState = this.#itemChangeState;

		return itemChangeState?.changeType === ITEM_CHANGE_TYPE_DRAG
			? itemChangeState.item.startTime - itemChangeState.triggerTime
			: undefined;
	}

	public getDraggedItem(): TItem | undefined {
		const itemChangeState = this.#itemChangeState;

		return itemChangeState?.changeType === ITEM_CHANGE_TYPE_DRAG
			? itemChangeState.newItem
			: undefined;
	}

	public getGroup(index: number): Readonly<TGroup> | undefined {
		const groups = this.#groups;

		return groups[index];
	}

	public getGroupIndexById(groupId: TGroupId): number | undefined {
		const groups = this.#groups;

		for (const [groupIdx, group] of groups.entries()) {
			if (group.id === groupId) {
				return groupIdx;
			}
		}

		return;
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
			for (; lastKnownIndex >= ZERO; lastKnownIndex -= UNIT) {
				lastKnownPosition = groupPositions[lastKnownIndex];
				if (lastKnownPosition !== undefined) {
					break;
				}
			}

			let currentPos = lastKnownPosition ?? ZERO;
			for (let i = Math.max(lastKnownIndex, ZERO); i < index; i += UNIT) {
				groupPositions[i] = currentPos;
				currentPos += this.getGroupSize(i);
			}

			groupPosition = currentPos;
			groupPositions[index] = currentPos;
		}

		return groupPosition;
	}

	public getGroupSize(index: number): number {
		const groupSizes = this.#groupSizes;

		let groupSize = groupSizes[index];

		if (groupSize === undefined) {
			groupSize = this.getGroupLineSize(index);
		}

		return groupSize;
	}

	public getItem(
		groupIndex: number,
		lineIndex: number,
		itemIndex: number,
	): Readonly<TItem> | undefined {
		const groupLines = this.getGroupLines(groupIndex);

		return groupLines[lineIndex]?.[itemIndex];
	}

	public getItemById(itemId: TItemId): TItem | undefined {
		const items = this.#items;

		for (const item of items) {
			if (item.id === itemId) {
				return item;
			}
		}

		return;
	}

	public getItemIndicesById(
		itemId: TItemId,
	): [groupIndex: number, lineIndex: number, itemIndex: number] | undefined {
		const groupLineSets = this.#groupLineSets;

		for (const [groupIndex, groupLines] of groupLineSets.entries()) {
			for (const [lineIndex, items] of groupLines.entries()) {
				for (const [itemIndex, item] of items.entries()) {
					if (item.id === itemId) {
						return [groupIndex, lineIndex, itemIndex];
					}
				}
			}
		}

		return;
	}

	public getLinePosition(groupIndex: number, lineIndex: number): number {
		const lineHeight = this.getGroupLineSize(groupIndex);

		return lineIndex * lineHeight;
	}

	public getResizeIsStart(): boolean | undefined {
		const itemChangeState = this.#itemChangeState;

		return itemChangeState !== undefined &&
			itemChangeState.changeType !== ITEM_CHANGE_TYPE_DRAG
			? itemChangeState.changeType === ITEM_CHANGE_TYPE_RESIZE_START
			: undefined;
	}

	public getResizeOffset(): number | undefined {
		const itemChangeState = this.#itemChangeState;

		if (
			itemChangeState === undefined ||
			itemChangeState.changeType === ITEM_CHANGE_TYPE_DRAG
		) {
			return;
		}

		return itemChangeState.changeType === ITEM_CHANGE_TYPE_RESIZE_START
			? itemChangeState.item.startTime - itemChangeState.triggerTime
			: itemChangeState.item.endTime - itemChangeState.triggerTime;
	}

	public getResizedItem(): TItem | undefined {
		const itemChangeState = this.#itemChangeState;

		return itemChangeState !== undefined &&
			itemChangeState.changeType !== ITEM_CHANGE_TYPE_DRAG
			? itemChangeState.newItem
			: undefined;
	}

	public *getVisibleGroupsIter(): Generator<number, void, undefined> {
		const visibleGroupIndexMax = this.#visibleGroupIndexMax;
		const visibleGroupIndexMin = this.#visibleGroupIndexMin;

		for (
			let index = visibleGroupIndexMin;
			index < visibleGroupIndexMax;
			index += UNIT
		) {
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
			lineIndex += UNIT
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

		for (let itemIndex = ZERO; itemIndex < numItems; itemIndex += UNIT) {
			yield itemIndex;
		}
	}

	public setWindow(
		groupPosWindowMin: number,
		groupPosWindowMax: number,
		itemWindowMin: number,
		itemWindowMax: number,
	): void {
		const prevItemWindowMax = this.#itemWindowMax;
		const prevItemWindowMin = this.#itemWindowMin;

		this.#groupPosWindowMin = groupPosWindowMin;
		this.#groupPosWindowMax = groupPosWindowMax;
		this.#itemWindowMin = itemWindowMin;
		this.#itemWindowMax = itemWindowMax;

		if (
			itemWindowMin !== prevItemWindowMin ||
			itemWindowMax !== prevItemWindowMax
		) {
			this.clearItemCaches();
		}

		this.requestRender();
	}

	public setGroups(groups: readonly Readonly<TGroup>[]): void {
		this.#groups = groups;

		this.clearItemCaches();

		void this.prepareItemGroups();
	}

	public setItemDragValidator(
		itemDragValidator: ItemDragValidator<TItem> | undefined,
	): void {
		this.#itemDragValidator = itemDragValidator;
	}

	public setItemResizeValidator(
		itemResizeValidator: ItemResizeValidator<TItem> | undefined,
	): void {
		this.#itemResizeValidator = itemResizeValidator;
	}

	public setItemTimeSnap(itemTimeSnap: number | undefined): void {
		this.#itemTimeSnap = itemTimeSnap;
	}

	public setItems(items: readonly Readonly<TItem>[]): void {
		this.#items = items;

		const itemChangeState = this.#itemChangeState;

		if (itemChangeState !== undefined) {
			const changedItem = this.getItemById(itemChangeState.item.id);

			if (changedItem !== undefined) {
				const previousNewItem = itemChangeState.newItem;
				const newItem = { ...changedItem };
				newItem.startTime = previousNewItem.startTime;
				newItem.endTime = previousNewItem.endTime;
				newItem.groupId = previousNewItem.groupId;

				itemChangeState.item = changedItem;
				itemChangeState.newItem = newItem;
			}
		}

		this.clearItemCaches();

		void this.prepareItemGroups();
	}

	public setItemsDraggable(itemsDraggable: boolean | undefined): void {
		this.#itemsDraggable = itemsDraggable ?? true;
	}

	public setItemsEndResizable(itemsEndResizable: boolean | undefined): void {
		this.#itemsEndResizable = itemsEndResizable ?? true;
	}

	public setItemsStartResizable(
		itemsStartResizable: boolean | undefined,
	): void {
		this.#itemsStartResizable = itemsStartResizable ?? true;
	}

	public setLineSize(lineSize: number | undefined): void {
		this.#lineSize = lineSize ?? GROUP_LINE_SIZE_DEFAULT;

		this.#groupPositions.length = ZERO;
		this.#groupSizes.length = ZERO;
	}

	public setTimezoneOffset(timezoneOffset: number | undefined): void {
		this.#timezoneOffset = timezoneOffset ?? ZERO;
	}

	public itemDragCancel(): void {
		const itemChangeState = this.#itemChangeState;

		if (
			itemChangeState &&
			itemChangeState.changeType === ITEM_CHANGE_TYPE_DRAG
		) {
			this.#itemChangeState = undefined;

			this.clearChangedItemGroupCaches(itemChangeState);
		}
	}

	public itemDragEnd(skipRender?: boolean | undefined):
		| {
				endTime: number;
				groupId: TGroupId;
				id: TItemId;
				startTime: number;
		  }
		| undefined {
		const itemChangeState = this.#itemChangeState;

		if (
			itemChangeState &&
			itemChangeState.changeType === ITEM_CHANGE_TYPE_DRAG
		) {
			this.#itemChangeState = undefined;

			this.clearChangedItemGroupCaches(itemChangeState, skipRender);

			const newItem = itemChangeState.newItem;

			return {
				endTime: newItem.endTime,
				groupId: newItem.groupId,
				id: newItem.id,
				startTime: newItem.startTime,
			};
		}

		return;
	}

	public itemDragMove(
		dragTime: number,
		dragGroupPos: number,
	):
		| { endTime: number; groupId: TGroupId; id: TItemId; startTime: number }
		| undefined {
		const itemChangeState = this.#itemChangeState;

		if (
			itemChangeState &&
			itemChangeState.changeType === ITEM_CHANGE_TYPE_DRAG
		) {
			const itemDragValidator = this.#itemDragValidator;

			const triggerTime = itemChangeState.triggerTime;
			const prevRawStartTime = itemChangeState.prevRawStartTime;

			const initItem = itemChangeState.item;
			const initStartTime = initItem.startTime;
			const initEndTime = initItem.endTime;

			const item = itemChangeState.newItem;
			const startTime = item.startTime;
			const endTime = item.endTime;
			const groupId = item.groupId;

			const delta = dragTime - triggerTime;
			const rawStartTime = this.snapItemTime(initStartTime + delta);
			const initDelta = initEndTime - initStartTime;
			const rawEndTime = rawStartTime + initDelta;

			const rawItemHMoved = rawStartTime !== prevRawStartTime;

			let newStartTime: number;
			let newEndTime: number;

			if (rawItemHMoved && itemDragValidator) {
				const validatedTimes = itemDragValidator(
					initItem,
					rawStartTime,
					rawEndTime,
				);
				this.validateItemChangeValidatorReturn<ItemDragValidator<TItem>>(
					"itemDragValidator",
					validatedTimes,
				);

				newStartTime = validatedTimes.startTime;
				newEndTime = validatedTimes.endTime;
			} else {
				newStartTime = rawStartTime;
				newEndTime = rawEndTime;
			}

			const [newGroupIndex] = this.getGroupByPosition(dragGroupPos, true);
			const newGroupId = this.#groups[newGroupIndex]?.id ?? groupId;

			const itemHMoved = newStartTime !== startTime || newEndTime !== endTime;
			const itemVMoved = newGroupId !== groupId;

			if (itemVMoved && newGroupIndex !== undefined) {
				this.clearGroupCaches(newGroupIndex);
			}

			if (itemHMoved || itemVMoved) {
				const groupIndex = this.getGroupIndexById(groupId);

				if (groupIndex !== undefined) {
					this.clearGroupCaches(groupIndex);
				}

				const newItem = {
					...initItem,
					startTime: newStartTime,
					endTime: newEndTime,
					groupId: newGroupId,
				};
				itemChangeState.newItem = newItem;
				itemChangeState.prevRawStartTime = rawStartTime;
				itemChangeState.prevRawEndTime = rawEndTime;

				this.requestRender();

				return {
					endTime: newItem.endTime,
					groupId: newItem.groupId,
					id: newItem.id,
					startTime: newItem.startTime,
				};
			}
		}

		return;
	}

	public itemDragStart(id: TItemId, dragTime: number): void {
		const draggedItem = this.getItemById(id);

		if (draggedItem && (draggedItem.isDraggable ?? this.#itemsDraggable)) {
			this.#itemChangeState = {
				changeType: ITEM_CHANGE_TYPE_DRAG,
				triggerTime: dragTime,
				item: draggedItem,
				newItem: { ...draggedItem },
				prevRawEndTime: draggedItem.endTime,
				prevRawStartTime: draggedItem.startTime,
			};
		}
	}

	public itemEndResizeStart(id: TItemId, resizeTime: number): void {
		const resizedItem = this.getItemById(id);

		if (
			resizedItem &&
			(resizedItem.isEndResizable ?? this.#itemsEndResizable)
		) {
			this.#itemChangeState = {
				changeType: ITEM_CHANGE_TYPE_RESIZE_END,
				triggerTime: resizeTime,
				item: resizedItem,
				newItem: { ...resizedItem },
				prevRawEndTime: resizedItem.endTime,
				prevRawStartTime: resizedItem.startTime,
			};
		}
	}

	public itemStartResizeStart(id: TItemId, resizeTime: number): void {
		const resizedItem = this.getItemById(id);

		if (
			resizedItem !== undefined &&
			(resizedItem.isStartResizable ?? this.#itemsStartResizable)
		) {
			this.#itemChangeState = {
				changeType: ITEM_CHANGE_TYPE_RESIZE_START,
				triggerTime: resizeTime,
				item: resizedItem,
				newItem: { ...resizedItem },
				prevRawEndTime: resizedItem.endTime,
				prevRawStartTime: resizedItem.startTime,
			};
		}
	}

	public itemResizeMove(resizeTime: number):
		| {
				endTime: number;
				id: TItemId;
				isStart: boolean;
				startTime: number;
		  }
		| undefined {
		const itemChangeState = this.#itemChangeState;

		if (
			itemChangeState &&
			itemChangeState.changeType !== ITEM_CHANGE_TYPE_DRAG
		) {
			const itemResizeValidator = this.#itemResizeValidator;

			const triggerTime = itemChangeState.triggerTime;
			const isStart =
				itemChangeState.changeType === ITEM_CHANGE_TYPE_RESIZE_START;

			const initItem = itemChangeState.item;
			const initStartTime = initItem.startTime;
			const initEndTime = initItem.endTime;

			const item = itemChangeState.newItem;
			const startTime = item.startTime;
			const endTime = item.endTime;
			const groupId = item.groupId;

			const delta = resizeTime - triggerTime;
			let rawStartTime: number;
			let rawEndTime: number;
			let prevRawTime: number;
			let rawTime: number;

			if (isStart) {
				rawStartTime = this.snapItemTime(initStartTime + delta);
				rawEndTime = initEndTime;
				prevRawTime = itemChangeState.prevRawStartTime;
				rawTime = rawStartTime;
			} else {
				rawStartTime = initStartTime;
				rawEndTime = this.snapItemTime(initEndTime + delta);
				prevRawTime = itemChangeState.prevRawEndTime;
				rawTime = rawEndTime;
			}

			const itemHRawMoved = rawTime !== prevRawTime;

			let newStartTime: number;
			let newEndTime: number;

			if (itemHRawMoved && itemResizeValidator) {
				const validatedTimes = itemResizeValidator(initItem, isStart, rawTime);
				this.validateItemChangeValidatorReturn<ItemResizeValidator<TItem>>(
					"itemResizeValidator",
					validatedTimes,
				);

				newStartTime = validatedTimes.startTime;
				newEndTime = validatedTimes.endTime;
			} else {
				newStartTime = rawStartTime;
				newEndTime = rawEndTime;
			}

			const itemHMoved = newStartTime !== startTime || newEndTime !== endTime;

			if (itemHMoved) {
				const groupIndex = this.getGroupIndexById(groupId);

				if (groupIndex !== undefined) {
					this.clearGroupCaches(groupIndex);
				}

				const newItem = {
					...initItem,
					startTime: newStartTime,
					endTime: newEndTime,
				};
				itemChangeState.newItem = newItem;
				itemChangeState.prevRawStartTime = rawStartTime;
				itemChangeState.prevRawEndTime = rawEndTime;

				this.requestRender();

				return {
					endTime: newItem.endTime,
					id: newItem.id,
					isStart,
					startTime: newItem.startTime,
				};
			}
		}

		return;
	}

	public itemResizeCancel(): void {
		const itemChangeState = this.#itemChangeState;

		if (
			itemChangeState &&
			itemChangeState.changeType !== ITEM_CHANGE_TYPE_DRAG
		) {
			this.#itemChangeState = undefined;

			this.clearChangedItemGroupCaches(itemChangeState);
		}
	}

	public itemResizeEnd(skipRender?: boolean | undefined):
		| {
				endTime: number;
				id: TItemId;
				isStart: boolean;
				startTime: number;
		  }
		| undefined {
		const itemChangeState = this.#itemChangeState;

		if (
			itemChangeState &&
			itemChangeState.changeType !== ITEM_CHANGE_TYPE_DRAG
		) {
			this.#itemChangeState = undefined;

			this.clearChangedItemGroupCaches(itemChangeState, skipRender);

			const newItem = itemChangeState.newItem;

			return {
				endTime: newItem.endTime,
				id: newItem.id,
				isStart: itemChangeState.changeType === ITEM_CHANGE_TYPE_RESIZE_START,
				startTime: newItem.startTime,
			};
		}

		return;
	}

	private buildGroupLines(index: number): TItem[][] {
		const itemChangeState = this.#itemChangeState;
		const itemWindowMin = this.#itemWindowMin;
		const itemWindowMax = this.#itemWindowMax;

		const group = this.getGroup(index);

		const itemGroup = this.getItemGroup(index);
		const changedItemInit = itemChangeState?.item;
		const changedItem = itemChangeState?.newItem;

		const lines = layoutGroupLines<TGroupId, TItemId, TItem>(
			itemGroup,
			changedItemInit,
			changedItem?.groupId === group?.id ? changedItem : undefined,
			itemWindowMin,
			itemWindowMax,
		);

		if (lines.length === ZERO) {
			lines.push([]);
		}

		return lines;
	}

	private buildGroupSize(index: number): number {
		const defaultLineSize = this.#lineSize;
		const groups = this.#groups;

		const group = groups[index];
		const lineSize = group?.lineSize || defaultLineSize;
		const itemGroupLines = this.getGroupLines(index).length;
		const lineCount = Math.max(itemGroupLines, UNIT);

		return lineSize * lineCount;
	}

	private async buildItemGroupsMap(
		signal: AbortSignal,
	): Promise<Map<TGroupId, TItem[]> | undefined> {
		const asyncProcessingSize = this.#asyncProcessingSize;
		const items = this.#items;

		const itemGroupsMap = new Map<TGroupId, TItem[]>();

		for (const [itemIndex, item] of items.entries()) {
			const groupId = item.groupId;

			let itemGroup = itemGroupsMap.get(groupId);

			if (!itemGroup) {
				itemGroup = [];
				itemGroupsMap.set(groupId, itemGroup);
			}

			itemGroup.push(item);

			if ((itemIndex + UNIT) % asyncProcessingSize === ZERO) {
				// biome-ignore lint/performance/noAwaitInLoops: This is intentional to break up the processing of the list.
				await yieldToMain();

				if (signal.aborted) {
					return;
				}
			}
		}

		return itemGroupsMap;
	}

	public buildSize(): void {
		const groups = this.#groups;
		const groupSizes = this.#groupSizes;

		const numGroups = groups.length;
		let size = ZERO;

		for (let index = ZERO; index < numGroups; index += UNIT) {
			size += groupSizes[index] ?? this.getGroupLineSize(index);
		}

		this.#size = size;
	}

	private clearGroupCaches(index: number): void {
		delete this.#groupLineSets[index];
		delete this.#groupSizes[index];
		this.#groupPositions.length = index;
	}

	private clearChangedItemGroupCaches(
		itemState: { item: TItem; newItem: TItem },
		skipRender?: boolean | undefined,
	): void {
		const initItem = itemState.item;
		const initEndTime = initItem.endTime;
		const initGroupId = initItem.groupId;
		const initStartTime = initItem.startTime;

		const newItem = itemState.newItem;
		const newEndTime = newItem.endTime;
		const newGroupId = newItem.groupId;
		const newStartTime = newItem.startTime;

		const itemHMoved =
			newStartTime !== initStartTime || newEndTime !== initEndTime;
		const itemVMoved = newGroupId !== initGroupId;

		if (itemVMoved) {
			const newGroupIndex = this.getGroupIndexById(newGroupId);

			if (newGroupIndex !== undefined) {
				this.clearGroupCaches(newGroupIndex);
			}
		}

		if (itemHMoved || itemVMoved) {
			const groupIndex = this.getGroupIndexById(initGroupId);

			if (groupIndex !== undefined) {
				this.clearGroupCaches(groupIndex);
			}

			if (!skipRender) {
				this.requestRender();
			}
		}
	}

	private clearItemCaches(): void {
		this.#groupLineSets.length = ZERO;
		this.#groupPositions.length = ZERO;
		this.#groupSizes.length = ZERO;
	}

	private getGroupByPosition(
		position: number,
		excludeChangingItem?: boolean | undefined,
	): [index: number, startPos: number] {
		const groupSizes = this.#groupSizes;

		let changingItemGroupIndex: number | undefined;
		if (excludeChangingItem !== undefined) {
			const changingItemGroupId = this.#itemChangeState?.item.groupId;

			if (changingItemGroupId !== undefined) {
				changingItemGroupIndex = this.getGroupIndexById(changingItemGroupId);
			}
		}

		const numGroups = groupSizes.length;

		let group: [index: number, startPos: number] | undefined;
		let currentPos = ZERO;

		for (let index = ZERO; index < numGroups; index += UNIT) {
			const cachedGroupSize = groupSizes[index];
			const groupSize = cachedGroupSize ?? this.getGroupLineSize(index);

			const startPos = currentPos;

			if (currentPos + groupSize > position) {
				group = [index, startPos];
				break;
			}

			if (index === changingItemGroupIndex && cachedGroupSize !== undefined) {
				const lines = layoutGroupLines<TGroupId, TItemId, TItem>(
					this.getItemGroup(index),
					this.#itemChangeState?.item,
					undefined,
					this.#itemWindowMin,
					this.#itemWindowMax,
				);

				currentPos += lines.length * this.getGroupLineSize(index);
			} else {
				currentPos += groupSize;
			}
		}

		return group ?? [ZERO, ZERO];
	}

	private getGroupDrawMax(): number {
		const groupOverdraw = this.#groupOverdraw;
		const groupPosWindowMax = this.#groupPosWindowMax;

		return groupPosWindowMax + groupOverdraw;
	}

	private getGroupDrawMin(): number {
		const groupOverdraw = this.#groupOverdraw;
		const groupPosWindowMin = this.#groupPosWindowMin;

		return groupPosWindowMin - groupOverdraw;
	}

	private getGroupLines(
		index: number,
	): readonly (readonly Readonly<TItem>[])[] {
		const groupLineSets = this.#groupLineSets;

		let groupLines = groupLineSets[index];

		if (groupLines === undefined) {
			groupLines = this.buildGroupLines(index);
			groupLineSets[index] = groupLines;
		}

		return groupLines;
	}

	private getGroupSizeCached(index: number): number {
		const groupSizes = this.#groupSizes;

		let groupSize = groupSizes[index];

		if (groupSize === undefined) {
			groupSize = this.buildGroupSize(index);
			groupSizes[index] = groupSize;
		}

		return groupSize;
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

		await yieldToMain();

		if (signal.aborted) {
			return;
		}

		if (groups.length === ZERO || items.length === ZERO) {
			this.#itemGroups = [];
			this.requestRender();
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
				// biome-ignore lint/performance/noAwaitInLoops: This is intentional to break up the processing of the list.
				await yieldToMain();

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

		this.clearItemCaches();

		this.requestRender();
	}

	private requestRender(): void {
		const groups = this.#groups;

		const groupDrawMin = this.getGroupDrawMin();
		const groupDrawMax = this.getGroupDrawMax();

		let [visibleGroupIndexMin, visibleGroupStartPos] = this.getGroupByPosition(
			this.getGroupDrawMin(),
		);
		const numGroups = groups.length;

		let currentPos = visibleGroupStartPos;
		let visibleGroupIndexMax: number;

		for (
			visibleGroupIndexMax = visibleGroupIndexMin;
			visibleGroupIndexMax < numGroups && currentPos < groupDrawMax;
			visibleGroupIndexMax += UNIT
		) {
			currentPos += this.getGroupSizeCached(visibleGroupIndexMax);
		}

		const windowMinAdjusted = currentPos - (groupDrawMax - groupDrawMin);
		currentPos = visibleGroupStartPos;

		// If the selected groups are shorter than the window range, snap them to
		// the end of the range and add more groups to the start as long as there
		// are some.
		for (
			;
			visibleGroupIndexMin > ZERO && currentPos > windowMinAdjusted;
			visibleGroupIndexMin -= UNIT
		) {
			currentPos -= this.getGroupSizeCached(visibleGroupIndexMin);
		}

		this.#visibleGroupIndexMin = visibleGroupIndexMin;
		this.#visibleGroupIndexMax = visibleGroupIndexMax;

		this.buildSize();

		this.dispatchEvent(new CustomEvent("renderRequest"));
	}

	private snapItemTime(time: number): number {
		const itemTimeSnap = this.#itemTimeSnap;

		if (itemTimeSnap === undefined) {
			return time;
		}

		const timezoneOffset = this.#timezoneOffset;

		return (
			Math.round(time / itemTimeSnap) * itemTimeSnap -
			(timezoneOffset % itemTimeSnap)
		);
	}

	private validateItemChangeValidatorReturn<
		// biome-ignore lint/suspicious/noExplicitAny: Generic type.
		TValidator extends (...args: any[]) => unknown,
	>(
		validatorName: string,
		value: unknown,
	): asserts value is ReturnType<TValidator> {
		if (value === undefined) {
			return;
		}

		validateObject(`${validatorName}()`, value, ["endTime", "startTime"], []);

		validateNumberInterval(
			`${validatorName}().startTime`,
			`${validatorName}().end`,
			`${validatorName}()`,
			[value.startTime, value.endTime],
		);
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
