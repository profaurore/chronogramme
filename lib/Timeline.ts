import { GroupPositionsState } from "./groupPositionsState.ts";
import { ZERO, parseFloatAttribute } from "./math.ts";
import "./Scroller.ts";
import { Scroller } from "./Scroller.ts";
import { validateStringOptions } from "./string.ts";

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
	"h-extrema",
	"h-window",
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

		this.addEventListener("windowChange", this.render.bind(this));

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

		this.render();
	}

	protected override disconnectedCallback(): void {
		this.#groupPositionsState.clearGroupsAndItems();

		super.disconnectedCallback();
	}

	private render(): void {
		performance.mark("render-start");

		if (!this.isConnected) {
			return;
		}

		const groupPositionsState = this.#groupPositionsState;

		const hWindowMax = this.hWindowMax;
		const hWindowMin = this.hWindowMin;
		const vWindowMax = this.vWindowMax;
		const vWindowMin = this.vWindowMin;

		groupPositionsState.setGroupWindow(vWindowMin, vWindowMax);
		groupPositionsState.setItemWindow(hWindowMin, hWindowMax);
		const groups = groupPositionsState.getVisibleGroupsIter();

		while (this.firstChild) {
			this.removeChild(this.firstChild);
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

					const startPos = Math.max(this.getHPos(startTime), ZERO);
					const endPos = Math.min(this.getHPos(endTime), this.hScrollSize);
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

				this.appendChild(rowElement);
			}
		}

		this.updateFullHeight();

		const perf = performance.measure("render", "render-start");
		// biome-ignore lint/suspicious/noConsole: Testing
		console.log(perf);
	}

	private updateFullHeight() {
		const groupPositionsState = this.#groupPositionsState;

		const fullHeight = groupPositionsState.getHeight();
		const bbox = this.getBoundingClientRect();
		const vSize = bbox.height;

		this.setVExtrema(ZERO, Math.max(fullHeight, vSize));
	}
}

if (!customElements.get("cg-timeline")) {
	customElements.define("cg-timeline", Timeline);
}
