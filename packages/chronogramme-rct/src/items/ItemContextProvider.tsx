import { type PropsWithChildren, type ReactNode, useMemo } from "react";
import type { BaseGroup, BaseItem } from "../Timeline";
import { ItemContext, type ItemContextVariable } from "./ItemContext";

export const ItemContextProvider = <
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
}: PropsWithChildren<
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
			value={
				contextValue as unknown as ItemContextVariable<
					"id",
					"title",
					"rightTitle",
					"id",
					"group",
					"title",
					"title",
					"start_time",
					"end_time",
					BaseGroup<"id", "title", "rightTitle">,
					BaseItem<"id", "group", "title", "title", "start_time", "end_time">
				>
			}
		>
			{children}
		</ItemContext.Provider>
	);
};
