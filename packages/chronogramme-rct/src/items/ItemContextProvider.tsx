import { type ReactNode, useMemo } from "react";
import type { BaseGroup, BaseItem } from "../timeline";
import { ItemContext, type ItemContextVariable } from "./ItemContext";

export const ItemContextProvider = <
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
	canMove,
	canResizeLeft,
	canResizeRight,
	canSelect,
	children,
	itemDragState,
	itemRenderer,
	itemResizeState,
	keys,
	minResizeWidth,
	onClick,
	onContextMenu,
	onDoubleClick,
	onSelect,
	selected,
	selectedItemId,
	setSelectedItemId,
	timeline,
}: React.PropsWithChildren<
	ItemContextVariable<
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
>): ReactNode => {
	const contextValue = useMemo<
		ItemContextVariable<
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
			canMove,
			canResizeLeft,
			canResizeRight,
			canSelect,
			itemDragState,
			itemRenderer,
			itemResizeState,
			keys,
			minResizeWidth,
			onClick,
			onContextMenu,
			onDoubleClick,
			onSelect,
			selected,
			selectedItemId,
			setSelectedItemId,
			timeline,
		}),
		[
			canMove,
			canResizeLeft,
			canResizeRight,
			canSelect,
			itemDragState,
			itemRenderer,
			itemResizeState,
			keys,
			minResizeWidth,
			onClick,
			onContextMenu,
			onDoubleClick,
			onSelect,
			selected,
			selectedItemId,
			setSelectedItemId,
			timeline,
		],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<ItemContext.Provider
			value={contextValue as unknown as ItemContextVariable}
		>
			{children}
		</ItemContext.Provider>
	);
};
