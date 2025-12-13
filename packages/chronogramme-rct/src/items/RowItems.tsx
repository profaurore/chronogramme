import type { ReactNode } from "react";
import { Item } from "../items/Item";
import { ItemForHelpersContextProvider } from "../items/ItemForHelpersContextProvider";
import type { BaseGroup, BaseItem } from "../Timeline";
import { useRowItemsContext } from "./useRowItemsContext";

export const RowItems = <
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
>(): ReactNode => {
	const {
		index: groupIndex,
		itemVOffset,
		itemVSize,
		position: groupPosition,
		timeline,
	} = useRowItemsContext<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TGroup,
		TItem
	>();

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
					<ItemForHelpersContextProvider<
						TGroupId,
						TGroupIdKey,
						TGroupTitleKey,
						TGroupRightTitleKey,
						TItemId,
						TItemIdKey,
						TItemGroupKey,
						TItemTitleKey,
						TItemDivTitleKey,
						TItemTimeStartKey,
						TItemTimeEndKey,
						TGroup,
						TItem
					>
						groupPosition={groupPosition}
						item={item}
						key={`item-${item.id}`}
						vOffsetInGroup={vOffsetInGroup}
						vSize={itemVSize}
					>
						<Item<
							TGroupId,
							TGroupIdKey,
							TGroupTitleKey,
							TGroupRightTitleKey,
							TItemId,
							TItemIdKey,
							TItemGroupKey,
							TItemTitleKey,
							TItemDivTitleKey,
							TItemTimeStartKey,
							TItemTimeEndKey,
							TGroup,
							TItem
						>
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
