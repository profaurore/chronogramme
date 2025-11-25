import { useMemo } from "react";
import type { BaseItem } from "../timeline";
import { type RowItems, RowItemsContext } from "./RowItemsContext";

export const RowItemsProvider = <
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
>({
	children,
	groupIndex,
	itemRenderer,
	itemVOffset,
	itemVSize,
	lineSize,
}: React.PropsWithChildren<
	RowItems<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem
	>
>) => {
	const contextValue = useMemo<
		RowItems<
			TItemIdKey,
			TItemGroupKey,
			TItemTitleKey,
			TItemDivTitleKey,
			TItemTimeStartKey,
			TItemTimeEndKey,
			TItem
		>
	>(
		() => ({
			groupIndex,
			itemRenderer,
			itemVOffset,
			itemVSize,
			lineSize,
		}),
		[groupIndex, itemRenderer, itemVOffset, itemVSize, lineSize],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<RowItemsContext.Provider value={contextValue as unknown as RowItems}>
			{children}
		</RowItemsContext.Provider>
	);
};
