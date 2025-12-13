import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { type ReactNode, useContext, useMemo } from "react";
import { GroupForHelpersContext } from "../groups/GroupForHelpersContext";
import { ItemForHelpersContext } from "../items/ItemForHelpersContext";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
} from "../Timeline";
import { UnsupportedPropertyValueError } from "../utils/unsupportedUtils";
import { HelpersContext, type HelpersContextValue } from "./HelpersContext";

interface HelpersProviderProps<
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
	timeline: InstanceType<
		typeof HTMLTimeline<
			TGroupId,
			RctToCoreGroup<TGroupId, TGroup>,
			TItemId,
			RctToCoreItem<TGroupId, TItemId, TItem>
		>
	>;
}

export const HelpersContextProvider = <
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
	timeline,
}: HelpersProviderProps<
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
	const groupForHelpersContext = useContext(GroupForHelpersContext);
	const itemForHelpersContext = useContext(ItemForHelpersContext);

	const contextValue = useMemo<HelpersContextValue<TGroupId, TItemId>>(
		() => ({
			getDateFromLeftOffsetPosition: timeline.getHValue,
			getGroupDimensions: (groupId: TGroupId) => {
				if (groupId !== groupForHelpersContext?.id) {
					throw new UnsupportedPropertyValueError(
						"getGroupDimensions() must be used within the group renderer for the provided identifier",
						"groupId",
						groupId,
					);
				}

				return {
					top: groupForHelpersContext.position,
					height: groupForHelpersContext.size,
				};
			},
			getItemAbsoluteDimensions: (itemId: TItemId) => {
				if (itemId !== itemForHelpersContext?.id) {
					throw new UnsupportedPropertyValueError(
						"getItemAbsoluteDimensions() must be used within the item renderer for the provided identifier",
						"itemId",
						itemId,
					);
				}

				return {
					left: itemForHelpersContext.renderedHStartPos,
					top: itemForHelpersContext.renderedVStartPos,
					width: itemForHelpersContext.renderedHSize,
				};
			},
			getItemDimensions: (itemId: TItemId) => {
				if (itemId !== itemForHelpersContext?.id) {
					throw new UnsupportedPropertyValueError(
						"getItemDimensions() must be used within the item renderer for the provided identifier",
						"itemId",
						itemId,
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

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<HelpersContext.Provider
			value={contextValue as unknown as HelpersContextValue<number, number>}
		>
			{children}
		</HelpersContext.Provider>
	);
};
