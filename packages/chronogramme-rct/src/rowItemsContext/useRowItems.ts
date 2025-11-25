import { useContext } from "react";
import type { BaseItem } from "../timeline";
import { type RowItems, RowItemsContext } from "./RowItemsContext";

export function useRowItems<
	TItemIdKey extends string = "id",
	TItemGroupKey extends string = "group",
	TItemTitleKey extends string = "title",
	TItemDivTitleKey extends string = "title",
	TItemTimeStartKey extends string = "start_time",
	TItemTimeEndKey extends string = "end_time",
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
>() {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(RowItemsContext) as unknown as RowItems<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem
	>;

	if (!context) {
		throw new Error("useRowItems must be used within a RowItemsProvider");
	}

	return context;
}
