import { useMemo } from "react";
import type { BaseGroup, BaseItem } from "../timeline";
import {
	type TimelineState,
	TimelineStateContext,
} from "./TimelineStateContext";

export const TimelineStateProvider = <
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
	itemDragStateRef,
	itemResizeStateRef,
	keys,
	minResizeWidth,
	onItemClick,
	onItemContextMenu,
	onItemDoubleClick,
	onItemSelect,
	selected,
	selectedItemId,
	setSelectedItemId,
	timelineRef,
}: React.PropsWithChildren<
	TimelineState<
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
>) => {
	const contextValue = useMemo<
		TimelineState<
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
			itemDragStateRef,
			itemResizeStateRef,
			keys,
			minResizeWidth,
			onItemClick,
			onItemContextMenu,
			onItemDoubleClick,
			onItemSelect,
			selected,
			selectedItemId,
			setSelectedItemId,
			timelineRef,
		}),
		[
			canMove,
			canResizeLeft,
			canResizeRight,
			canSelect,
			itemDragStateRef,
			itemResizeStateRef,
			keys,
			minResizeWidth,
			onItemClick,
			onItemContextMenu,
			onItemDoubleClick,
			onItemSelect,
			selected,
			selectedItemId,
			setSelectedItemId,
			timelineRef,
		],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<TimelineStateContext.Provider
			value={contextValue as unknown as TimelineState}
		>
			{children}
		</TimelineStateContext.Provider>
	);
};
