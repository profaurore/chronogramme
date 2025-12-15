import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { type ReactNode, useMemo } from "react";
import type { BaseGroup, BaseItem } from "../Timeline";
import type { RctToCoreGroup, RctToCoreItem } from "../utils/typeUtils";
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
	const contextValue = useMemo<HelpersContextValue<TGroupId, TItemId>>(
		() => ({
			getDateFromLeftOffsetPosition: timeline.getHValue,

			getGroupDimensions: (groupId: TGroupId) => {
				throw new UnsupportedPropertyValueError(
					"getGroupDimensions() must be used via useHelpersContext() within the group renderer for the provided identifier",
					"groupId",
					groupId,
				);
			},

			getItemAbsoluteDimensions: (itemId: TItemId) => {
				throw new UnsupportedPropertyValueError(
					"getItemAbsoluteDimensions() must be used via useHelpersContext() within the item renderer for the provided identifier",
					"itemId",
					itemId,
				);
			},

			getItemDimensions: (itemId: TItemId) => {
				throw new UnsupportedPropertyValueError(
					"getItemDimensions() must be used via useHelpersContext() within the item renderer for the provided identifier",
					"itemId",
					itemId,
				);
			},

			getLeftOffsetFromDate: timeline.getHPos,
		}),
		[timeline.getHPos, timeline.getHValue],
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
