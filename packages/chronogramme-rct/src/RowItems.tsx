import { Item } from "./Item";
import { useRowItems } from "./rowItemsContext/useRowItems";
import type { BaseGroup, BaseItem } from "./timeline";
import { useTimelineState } from "./timelineStateContext/useTimelineState";

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
>(): React.ReactNode => {
	const { timelineRef } = useTimelineState<
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

	const { groupIndex, itemVOffset } = useRowItems<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem
	>();

	const timeline = timelineRef.current;

	if (!timeline) {
		return;
	}

	const renderedItems: React.ReactNode[] = [];

	const lineIndices = timeline.getVisibleGroupLinesIter(groupIndex);

	for (const lineIndex of lineIndices) {
		const linePosition = timeline.getLinePosition(groupIndex, lineIndex);
		const itemIndices = timeline.getVisibleLineItemsIter(groupIndex, lineIndex);

		const itemVStartPos = linePosition + itemVOffset;

		for (const itemIndex of itemIndices) {
			const item = timeline.getItem(groupIndex, lineIndex, itemIndex);

			if (!item) {
				continue;
			}

			renderedItems.push(
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
					itemVStartPos={itemVStartPos}
					timeline={timeline}
				/>,
			);
		}
	}

	return <div className="rct-items">{renderedItems}</div>;
};
