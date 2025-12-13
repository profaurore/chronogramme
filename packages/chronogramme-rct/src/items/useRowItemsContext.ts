import { useContext } from "react";
import {
	RowItemsContext,
	type RowItemsContextValue,
} from "../items/RowItemsContext";
import type { BaseGroup, BaseItem } from "../Timeline";

export function useRowItemsContext<
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
>(): RowItemsContextValue<
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
> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(
		RowItemsContext,
	) as unknown as RowItemsContextValue<
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
	>;

	if (!context) {
		throw new Error(
			"useRowItemsContext() must be used within a <RowItemsProvider />",
		);
	}

	return context;
}
