import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { HALF, UNIT } from "@chronogramme/chronogramme";
import { type ReactNode, useMemo } from "react";
import {
	RowItemsContext,
	type RowItemsContextValue,
} from "../items/RowItemsContext";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
} from "../timeline";

interface RowItemsContextProviderProps<
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
> {
	children?: ReactNode | undefined;
	index: number;
	itemHeightRatio: number;
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
}
export const RowItemsContextProvider = <
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
>({
	children,
	index,
	itemHeightRatio,
	timeline,
}: RowItemsContextProviderProps<
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
>): ReactNode => {
	const position = timeline.getGroupPosition(index);
	const lineSize = timeline.getGroupLineSize(index);
	const itemVOffset = HALF * (UNIT - itemHeightRatio) * lineSize;
	const itemVSize = itemHeightRatio * lineSize;

	const contextValue = useMemo<
		RowItemsContextValue<
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
	>(
		() => ({
			index,
			itemVOffset,
			itemVSize,
			position,
			timeline,
		}),
		[index, position, itemVOffset, itemVSize, timeline],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<RowItemsContext.Provider
			value={contextValue as unknown as RowItemsContextValue}
		>
			{children}
		</RowItemsContext.Provider>
	);
};
