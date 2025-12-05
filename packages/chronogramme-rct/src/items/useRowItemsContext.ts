import { useContext } from "react";
import {
	RowItemsContext,
	type RowItemsContextValue,
} from "../items/RowItemsContext";
import type { BaseGroup, BaseItem } from "../Timeline";

export function useRowItemsContext<
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TGroup extends BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
	TItem extends BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
>(): RowItemsContextValue<
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
> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(
		RowItemsContext,
	) as unknown as RowItemsContextValue<
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
	>;

	if (!context) {
		throw new Error(
			"useRowItemsContext() must be used within a <RowItemsProvider />",
		);
	}

	return context;
}
