import { type PropsWithChildren, type ReactNode, useMemo } from "react";
import type { BaseGroup, BaseItem } from "../Timeline";
import { HeadersContext, type HeadersContextValue } from "./HeadersContext";

export const HeadersContextProvider = <
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
	children,
	leftSidebarWidth,
	rightSidebarWidth,
	showPeriod,
	timeSteps,
	timeline,
	timelineUnit,
}: PropsWithChildren<
	HeadersContextValue<
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
		HeadersContextValue<
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
		</HeadersContext.Provider>
	);
};
