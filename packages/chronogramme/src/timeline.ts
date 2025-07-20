import { GroupPositionsState } from "./groupPositionsState";
import { parseFloatAttribute, ZERO } from "./math";
import "./scroller";
import { SCROLLER_OBSERVED_ATTRIBUTES, Scroller } from "./scroller";
import { validateStringOptions } from "./string";

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

const TIMELINE_OBSERVED_ATTRIBUTES = [
	...SCROLLER_OBSERVED_ATTRIBUTES,
	"line-size",
] as const;

export class Timeline<
	TGroupId = number,
	TGroup extends BaseGroup<TGroupId> = BaseGroup<TGroupId>,
	TItemId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
> extends Scroller {
	protected override observedAttributes = TIMELINE_OBSERVED_ATTRIBUTES;

	readonly #groupPositionsState: GroupPositionsState<
		TGroupId,
		TGroup,
		TItemId,
		TItem
	>;

	public constructor() {
		super();

		this.addEventListener("windowChange", this.updateWindows.bind(this));

		const groupPositionsState = new GroupPositionsState<
			TGroupId,
			TGroup,
			TItemId,
			TItem
		>();
		groupPositionsState.addEventListener(
			"renderRequest",
			this.onRenderRequestHandler.bind(this),
		);
		this.#groupPositionsState = groupPositionsState;

		super.setVScrollResizeStrategy("preserveUnitPerPixel");
	}

	public getGroup(groupIndex: number): Readonly<TGroup> | undefined {
		return this.#groupPositionsState.getGroup(groupIndex);
	}

	public getGroupLineSize(groupIndex: number): number {
		return this.#groupPositionsState.getGroupLineSize(groupIndex);
	}

	public getGroupPosition(groupIndex: number): number {
		return this.#groupPositionsState.getGroupPosition(groupIndex);
	}

	public getItem(
		groupIndex: number,
		lineIndex: number,
		itemIndex: number,
	): Readonly<TItem> | undefined {
		return this.#groupPositionsState.getItem(groupIndex, lineIndex, itemIndex);
	}

	public getLinePosition(groupIndex: number, lineIndex: number): number {
		return this.#groupPositionsState.getLinePosition(groupIndex, lineIndex);
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

	public setGroups(groups: readonly Readonly<TGroup>[]): void {
		this.#groupPositionsState.setGroups(groups);
	}

	public setItems(items: readonly Readonly<TItem>[]): void {
		this.#groupPositionsState.setItems(items);
	}

	public setLineSize(lineSize: number | undefined): void {
		this.#groupPositionsState.setLineSize(lineSize);
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

		const bbox = this.getBoundingClientRect();
		const vSize = bbox.height;
		this.setVExtrema(ZERO, vSize);
		this.setVWindow(ZERO, vSize);

		this.updateFullHeight();
	}

	protected override disconnectedCallback(): void {
		this.#groupPositionsState.clearGroupsAndItems();

		super.disconnectedCallback();
	}

	private onRenderRequestHandler(): void {
		this.updateFullHeight();

		this.dispatchEvent(new CustomEvent("renderRequest"));
	}

	private updateFullHeight(): void {
		const groupPositionsState = this.#groupPositionsState;

		const fullHeight = groupPositionsState.getHeight();
		const bbox = this.getBoundingClientRect();
		const vSize = bbox.height;

		this.setVExtrema(ZERO, Math.max(fullHeight, vSize));
	}

	private updateWindows(): void {
		const groupPositionsState = this.#groupPositionsState;

		const hWindowMax = this.hWindowMax;
		const hWindowMin = this.hWindowMin;
		const vWindowMax = this.vWindowMax;
		const vWindowMin = this.vWindowMin;

		groupPositionsState.setGroupWindow(vWindowMin, vWindowMax);
		groupPositionsState.setItemWindow(hWindowMin, hWindowMax);

		this.dispatchEvent(new CustomEvent("renderRequest"));
	}
}

if (!customElements.get("cg-timeline")) {
	customElements.define("cg-timeline", Timeline);
}
