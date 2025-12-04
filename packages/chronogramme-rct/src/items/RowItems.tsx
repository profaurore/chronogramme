import type { ReactNode } from "react";
import { Item } from "../items/Item";
import { ItemForHelpersContextProvider } from "../items/ItemForHelpersContextProvider";
import type { BaseGroup, BaseItem } from "../timeline";
import { useRowItemsContext } from "./useRowItemsContext";

export const RowItems = <
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TItemIdKey extends string = "id",
	TItemGroupKey extends string = "group",
	TItemTitleKey extends string = "title",
	TItemDivTitleKey extends string = "title",
	TItemTimeStartKey extends string = "start_time",
	TItemTimeEndKey extends string = "end_time",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
	TItem extends BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	> = BaseItem<
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
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
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
						TGroupIdKey,
						TGroupTitleKey,
						TGroupRightTitleKey,
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
							TGroupIdKey,
							TGroupTitleKey,
							TGroupRightTitleKey,
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
