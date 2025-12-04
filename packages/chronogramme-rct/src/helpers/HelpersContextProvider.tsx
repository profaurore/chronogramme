import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { type ReactNode, useContext, useMemo } from "react";
import { GroupForHelpersContext } from "../groups/GroupForHelpersContext";
import { ItemForHelpersContext } from "../items/ItemForHelpersContext";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
} from "../timeline";
import { HelpersContext, type HelpersContextValue } from "./HelpersContext";

interface HelpersProviderProps<
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
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
}

export const HelpersContextProvider = <
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
	timeline,
}: HelpersProviderProps<
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
	const groupForHelpersContext = useContext(GroupForHelpersContext);
	const itemForHelpersContext = useContext(ItemForHelpersContext);

	const contextValue = useMemo<HelpersContextValue>(
		() => ({
			getDateFromLeftOffsetPosition: timeline.getHValue,
			getGroupDimensions: (groupId: number) => {
				if (groupId !== groupForHelpersContext?.id) {
					throw new Error(
						"getGroupDimensions() must be used within the group renderer for the provided identifier",
					);
				}

				return {
					top: groupForHelpersContext.position,
					height: groupForHelpersContext.size,
				};
			},
			getItemAbsoluteDimensions: (itemId: number) => {
				if (itemId !== itemForHelpersContext?.id) {
					throw new Error(
						"getItemAbsoluteDimensions() must be used within the item renderer for the provided identifier",
					);
				}

				return {
					left: itemForHelpersContext.renderedHStartPos,
					top: itemForHelpersContext.renderedVStartPos,
					width: itemForHelpersContext.renderedHSize,
				};
			},
			getItemDimensions: (itemId: number) => {
				if (itemId !== itemForHelpersContext?.id) {
					throw new Error(
						"getItemDimensions() must be used within the item renderer for the provided identifier",
					);
				}

				return {
					collisionLeft: itemForHelpersContext.startTime,
					collisionWidth: itemForHelpersContext.range,
					height: itemForHelpersContext.renderedVSize,
					left: itemForHelpersContext.renderedHStartPos,
					top: itemForHelpersContext.renderedVStartPosInGroup,
					width: itemForHelpersContext.renderedHSize,
				};
			},
			getLeftOffsetFromDate: timeline.getHPos,
		}),
		[
			groupForHelpersContext,
			itemForHelpersContext,
			timeline.getHPos,
			timeline.getHValue,
		],
	);

	return (
		<HelpersContext.Provider value={contextValue}>
			{children}
		</HelpersContext.Provider>
	);
};
