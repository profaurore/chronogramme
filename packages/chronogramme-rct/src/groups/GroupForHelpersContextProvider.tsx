import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { type ReactNode, useMemo } from "react";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
} from "../timeline";
import {
	GroupForHelpersContext,
	type GroupForHelpersContextValue,
} from "./GroupForHelpersContext";

interface GroupForHelpersProviderProps<
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
	group: RctToCoreGroup<TGroup>;
	index: number;
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
}

export const GroupForHelpersContextProvider = <
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
	group,
	index,
	timeline,
}: GroupForHelpersProviderProps<
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
	const size = timeline.getGroupSize(index);

	const id = group.id;

	const contextValue = useMemo<GroupForHelpersContextValue>(
		() => ({
			id,
			position,
			size,
		}),
		[id, position, size],
	);

	return (
		<GroupForHelpersContext.Provider value={contextValue}>
			{children}
		</GroupForHelpersContext.Provider>
	);
};
