import { parseBooleanAttribute } from "./boolean";
import {
	GroupPositionsState,
	type ItemDragValidator,
	type ItemResizeValidator,
} from "./groupPositionsState";
import { parseFloatAttribute, UNIT, ZERO } from "./math";
import "./scroller";
import { SCROLLER_OBSERVED_ATTRIBUTES, Scroller } from "./scroller";
import { validateStringOptions } from "./string";

const TIMELINE_OBSERVED_ATTRIBUTES = [
	...SCROLLER_OBSERVED_ATTRIBUTES,
	"item-time-snap",
	"items-draggable",
	"items-end-resizable",
	"items-start-resizable",
	"line-size",
	"timezone-offset",
] as const;

export interface BaseItem<TItemId, TGroupId> {
	endTime: EpochTimeStamp;
	groupId: TGroupId;
	id: TItemId;
	isDraggable?: boolean | undefined;
	isEndResizable?: boolean | undefined;
	isStartResizable?: boolean | undefined;
	startTime: EpochTimeStamp;
}

export interface BaseGroup<TGroupId> {
	id: TGroupId;
	lineSize?: number | undefined;
}

export class Timeline<
	TGroupId,
	TGroup extends BaseGroup<TGroupId>,
	TItemId,
	TItem extends BaseItem<TItemId, TGroupId>,
> extends Scroller {
	protected static override observedAttributes = TIMELINE_OBSERVED_ATTRIBUTES;

	readonly #groupPositionsState: GroupPositionsState<
		TGroupId,
		TGroup,
		TItemId,
		TItem
	>;

	public constructor() {
		super();

		this.addEventListener("windowChange", this.updateWindows.bind(this), {
			passive: true,
		});
		this.addEventListener(
			"windowSizeChange",
			this.updateScrollWindow.bind(this),
			{
				passive: true,
			},
		);

		const groupPositionsState = new GroupPositionsState<
			TGroupId,
			TGroup,
			TItemId,
			TItem
		>();
		groupPositionsState.addEventListener(
			"renderRequest",
			this.requestRender.bind(this),
			{ passive: true },
		);
		this.#groupPositionsState = groupPositionsState;

		super.setVScrollResizeStrategy("preserveUnitPerPixel");
	}

	public getDragOffset(): number | undefined {
		return this.#groupPositionsState.getDragOffset();
	}

	public getDraggedItem(): TItem | undefined {
		return this.#groupPositionsState.getDraggedItem();
	}

	public getGroup(groupIndex: number): Readonly<TGroup> | undefined {
		return this.#groupPositionsState.getGroup(groupIndex);
	}

	public getGroupIndexById(groupId: TGroupId): number | undefined {
		return this.#groupPositionsState.getGroupIndexById(groupId);
	}

	public getGroupLineSize(groupIndex: number): number {
		return this.#groupPositionsState.getGroupLineSize(groupIndex);
	}

	public getGroupPosition(groupIndex: number): number {
		return this.#groupPositionsState.getGroupPosition(groupIndex);
	}

	public getGroupSize(groupIndex: number): number {
		return this.#groupPositionsState.getGroupSize(groupIndex);
	}

	public getItem(
		groupIndex: number,
		lineIndex: number,
		itemIndex: number,
	): Readonly<TItem> | undefined {
		return this.#groupPositionsState.getItem(groupIndex, lineIndex, itemIndex);
	}

	public getItemById(itemId: TItemId): TItem | undefined {
		return this.#groupPositionsState.getItemById(itemId);
	}

	public getItemIndicesById(
		itemId: TItemId,
	): [groupIndex: number, lineIndex: number, itemIndex: number] | undefined {
		return this.#groupPositionsState.getItemIndicesById(itemId);
	}

	public getLinePosition(groupIndex: number, lineIndex: number): number {
		return this.#groupPositionsState.getLinePosition(groupIndex, lineIndex);
	}

	public getResizedItem(): TItem | undefined {
		return this.#groupPositionsState.getResizedItem();
	}

	public getResizeIsStart(): boolean | undefined {
		return this.#groupPositionsState.getResizeIsStart();
	}

	public getResizeOffset(): number | undefined {
		return this.#groupPositionsState.getResizeOffset();
	}

	public getVisibleGroupsIter(): Generator<number, void, undefined> {
		const groupPositionsState = this.#groupPositionsState;

		return groupPositionsState.getVisibleGroupsIter();
	}

	public getVisibleGroupLinesIter(
		groupIndex: number,
	): Generator<number, void, undefined> {
		return this.#groupPositionsState.getVisibleGroupLinesIter(groupIndex);
	}

	public getVisibleLineItemsIter(
		groupIndex: number,
		lineIndex: number,
	): Generator<number, void, undefined> {
		return this.#groupPositionsState.getVisibleLineItemsIter(
			groupIndex,
			lineIndex,
		);
	}

	public itemDragCancel(): void {
		this.#groupPositionsState.itemDragCancel();
	}

	public itemDragEnd(skipRender?: boolean | undefined):
		| {
				endTime: number;
				groupId: TGroupId;
				id: TItemId;
				startTime: number;
		  }
		| undefined {
		return this.#groupPositionsState.itemDragEnd(skipRender);
	}

	public itemDragMove(
		clientX: number,
		clientY: number,
	):
		| { endTime: number; groupId: TGroupId; id: TItemId; startTime: number }
		| undefined {
		return this.#groupPositionsState.itemDragMove(
			this.getHValueFromClient(clientX),
			this.getVValueFromClient(clientY),
		);
	}

	public itemDragStart(id: TItemId, clientX: number): void {
		this.#groupPositionsState.itemDragStart(
			id,
			this.getHValueFromClient(clientX),
		);
	}

	public itemResizeCancel(): void {
		this.#groupPositionsState.itemResizeCancel();
	}

	public itemResizeEnd(skipRender?: boolean | undefined):
		| {
				endTime: number;
				id: TItemId;
				isStart: boolean;
				startTime: number;
		  }
		| undefined {
		return this.#groupPositionsState.itemResizeEnd(skipRender);
	}

	public itemEndResizeStart(id: TItemId, clientX: number): void {
		this.#groupPositionsState.itemEndResizeStart(
			id,
			this.getHValueFromClient(clientX),
		);
	}

	public itemResizeMove(clientX: number):
		| {
				endTime: number;
				id: TItemId;
				isStart: boolean;
				startTime: number;
		  }
		| undefined {
		return this.#groupPositionsState.itemResizeMove(
			this.getHValueFromClient(clientX),
		);
	}

	public itemStartResizeStart(id: TItemId, clientX: number): void {
		this.#groupPositionsState.itemStartResizeStart(
			id,
			this.getHValueFromClient(clientX),
		);
	}

	public setGroups(groups: readonly Readonly<TGroup>[]): void {
		this.#groupPositionsState.setGroups(groups);
	}

	public setItemDragValidator(
		itemDragValidator: ItemDragValidator<TItem> | undefined,
	): void {
		this.#groupPositionsState.setItemDragValidator(itemDragValidator);
	}

	public setItemResizeValidator(
		itemResizeValidator: ItemResizeValidator<TItem> | undefined,
	): void {
		this.#groupPositionsState.setItemResizeValidator(itemResizeValidator);
	}

	public setItemTimeSnap(itemTimeSnap: number | undefined): void {
		this.#groupPositionsState.setItemTimeSnap(itemTimeSnap);
	}

	public setItems(items: readonly Readonly<TItem>[]): void {
		this.#groupPositionsState.setItems(items);
	}

	public setItemsDraggable(itemsDraggable: boolean | undefined): void {
		this.#groupPositionsState.setItemsDraggable(itemsDraggable);
	}

	public setItemsEndResizable(itemsEndResizable: boolean | undefined): void {
		this.#groupPositionsState.setItemsEndResizable(itemsEndResizable);
	}

	public setItemsStartResizable(
		itemsStartResizable: boolean | undefined,
	): void {
		this.#groupPositionsState.setItemsStartResizable(itemsStartResizable);
	}

	public setLineSize(lineSize: number | undefined): void {
		this.#groupPositionsState.setLineSize(lineSize);
	}

	public setTimezoneOffset(timezoneOffset: number | undefined): void {
		this.#groupPositionsState.setTimezoneOffset(timezoneOffset);
	}

	protected override attributeChangedCallback(
		name: string,
		oldValue: string | null,
		newValue: string | null,
	): void {
		validateStringOptions("attributeName", name, TIMELINE_OBSERVED_ATTRIBUTES);

		if (!this.isConnected || newValue === oldValue) {
			return;
		}

		switch (name) {
			case "line-size": {
				this.setLineSize(parseFloatAttribute(newValue));
				break;
			}

			case "item-time-snap": {
				this.setItemTimeSnap(parseFloatAttribute(newValue));
				break;
			}

			case "items-draggable": {
				this.setItemsDraggable(parseBooleanAttribute(newValue));
				break;
			}

			case "items-end-resizable": {
				this.setItemsEndResizable(parseBooleanAttribute(newValue));
				break;
			}

			case "items-start-resizable": {
				this.setItemsStartResizable(parseBooleanAttribute(newValue));
				break;
			}

			case "timezone-offset": {
				this.setTimezoneOffset(parseFloatAttribute(newValue));
				break;
			}

			default: {
				super.attributeChangedCallback(name, oldValue, newValue);
				break;
			}
		}
	}

	protected override connectedCallback(): void {
		super.connectedCallback();

		this.#groupPositionsState.setLineSize(
			parseFloatAttribute(this.getAttribute("row-height")),
		);

		this.updateScrollHeight();
		this.updateScrollWindow();
	}

	protected override disconnectedCallback(): void {
		this.#groupPositionsState.clearGroupsAndItems();

		super.disconnectedCallback();
	}

	private requestRender(): void {
		this.updateScrollHeight();
		this.dispatchEvent(new CustomEvent("renderRequest"));
	}

	private updateScrollHeight(): void {
		const groupPositionsState = this.#groupPositionsState;

		const size = groupPositionsState.size;

		this.setVExtrema(ZERO, size > ZERO ? size : UNIT);
	}

	private updateScrollWindow(): void {
		const vWindowMin = this.vWindowMin;
		const vWindowSize = this.vWindowSize;

		this.setVWindow(vWindowMin, vWindowMin + vWindowSize);
	}

	private updateWindows(): void {
		const groupPositionsState = this.#groupPositionsState;

		const hWindowMax = this.hWindowMax;
		const hWindowMin = this.hWindowMin;
		const vWindowMax = this.vWindowMax;
		const vWindowMin = this.vWindowMin;

		groupPositionsState.setWindow(
			this.getVPos(vWindowMin),
			this.getVPos(vWindowMax),
			hWindowMin,
			hWindowMax,
		);
	}
}

if (!customElements.get("cg-timeline")) {
	customElements.define("cg-timeline", Timeline);
}
