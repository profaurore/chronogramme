import type { ReactNode } from "react";
import { Item } from "../items/Item";
import { ItemForHelpersContextProvider } from "../items/ItemForHelpersContextProvider";
import type { AnyGroup, AnyItem, AnyKeys } from "../utils/typeUtils";
import { useRowItemsContext } from "./useRowItemsContext";

export const RowItems = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>(): ReactNode => {
	const {
		index: groupIndex,
		itemVOffset,
		itemVSize,
		position: groupPosition,
		timeline,
	} = useRowItemsContext<TKeys, TGroup, TItem>();

	const renderedItems: ReactNode[] = [];

	const lineIndices = timeline.getVisibleGroupLinesIter(groupIndex);

	for (const lineIndex of lineIndices) {
		const linePosition = timeline.getLinePosition(groupIndex, lineIndex);
		const itemIndices = timeline.getVisibleLineItemsIter(groupIndex, lineIndex);

		const vOffsetInGroup = linePosition + itemVOffset;

		for (const itemIndex of itemIndices) {
			const item = timeline.getItem(groupIndex, lineIndex, itemIndex);

			if (item !== undefined) {
				renderedItems.push(
					<ItemForHelpersContextProvider<TKeys, TGroup, TItem>
						groupPosition={groupPosition}
						item={item}
						key={`item-${item.id}`}
						vOffsetInGroup={vOffsetInGroup}
						vSize={itemVSize}
					>
						<Item<TKeys, TGroup, TItem>
							item={item}
							vOffsetInGroup={vOffsetInGroup}
						/>
					</ItemForHelpersContextProvider>,
				);
			}
		}
	}

	return <div className="rct-items">{renderedItems}</div>;
};
