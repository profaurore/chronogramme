import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { type ReactNode, useMemo } from "react";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
} from "../Timeline";
import {
	GroupForHelpersContext,
	type GroupForHelpersContextValue,
} from "./GroupForHelpersContext";

interface GroupForHelpersProviderProps<
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
	group: RctToCoreGroup<TGroupId, TGroup>;
	index: number;
	timeline: InstanceType<
		typeof HTMLTimeline<
			TGroupId,
			RctToCoreGroup<TGroupId, TGroup>,
			TItemId,
			RctToCoreItem<TGroupId, TItemId, TItem>
		>
	>;
}

export const GroupForHelpersContextProvider = <
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
	group,
	index,
	timeline,
}: GroupForHelpersProviderProps<
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
	const size = timeline.getGroupSize(index);

	const id = group.id;

	const contextValue = useMemo<GroupForHelpersContextValue<TGroupId>>(
		() => ({
			id,
			position,
			size,
		}),
		[id, position, size],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<GroupForHelpersContext.Provider
			value={contextValue as unknown as GroupForHelpersContextValue<number>}
		>
			{children}
		</GroupForHelpersContext.Provider>
	);
};
