import { type PropsWithChildren, type ReactNode, useMemo } from "react";
import type { BaseGroup, BaseItem } from "../Timeline";
import { HeadersContext, type HeadersContextValue } from "./HeadersContext";

export const HeadersContextProvider = <
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
	leftSidebarWidth,
	rightSidebarWidth,
	showPeriod,
	timeSteps,
	timeline,
	timelineUnit,
}: PropsWithChildren<
	HeadersContextValue<
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
	>
>): ReactNode => {
	const contextValue = useMemo<
		HeadersContextValue<
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
		>
	>(
		() => ({
			leftSidebarWidth,
			rightSidebarWidth,
			showPeriod,
			timeSteps,
			timeline,
			timelineUnit,
		}),
		[
			leftSidebarWidth,
			rightSidebarWidth,
			showPeriod,
			timeSteps,
			timeline,
			timelineUnit,
		],
	);

	return (
		<HeadersContext.Provider
			value={
				contextValue as unknown as HeadersContextValue<
					number,
					"id",
					"title",
					"rightTitle",
					number,
					"id",
					"group",
					"title",
					"title",
					"start_time",
					"end_time",
					BaseGroup<number, "id", "title", "rightTitle">,
					BaseItem<
						number,
						number,
						"id",
						"group",
						"title",
						"title",
						"start_time",
						"end_time"
					>
				>
			}
		>
			{children}
		</HeadersContext.Provider>
	);
};
