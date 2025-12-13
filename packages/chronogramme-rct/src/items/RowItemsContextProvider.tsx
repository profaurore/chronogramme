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
} from "../Timeline";

interface RowItemsContextProviderProps<
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
> {
	children?: ReactNode | undefined;
	index: number;
	itemHeightRatio: number;
	timeline: InstanceType<
		typeof HTMLTimeline<
			TGroupId,
			RctToCoreGroup<TGroupId, TGroup>,
			TItemId,
			RctToCoreItem<TGroupId, TItemId, TItem>
		>
	>;
}
export const RowItemsContextProvider = <
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
>({
	children,
	index,
	itemHeightRatio,
	timeline,
}: RowItemsContextProviderProps<
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
>): ReactNode => {
	const position = timeline.getGroupPosition(index);
	const lineSize = timeline.getGroupLineSize(index);
	const itemVOffset = HALF * (UNIT - itemHeightRatio) * lineSize;
	const itemVSize = itemHeightRatio * lineSize;

	const contextValue = useMemo<
		RowItemsContextValue<
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
			value={
				contextValue as unknown as RowItemsContextValue<
					number,
					"id",
					"title",
					"rightTitle",
					number,
					"id",
					"group",
					"title",
					"title",
					"start_time",
					"end_time",
					BaseGroup<number, "id", "title", "rightTitle">,
					BaseItem<
						number,
						number,
						"id",
						"group",
						"title",
						"title",
						"start_time",
						"end_time"
					>
				>
			}
		>
			{children}
		</RowItemsContext.Provider>
	);
};
