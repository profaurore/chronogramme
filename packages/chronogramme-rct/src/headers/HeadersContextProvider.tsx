import { type PropsWithChildren, type ReactNode, useMemo } from "react";
import type { BaseGroup, BaseItem } from "../Timeline";
import { HeadersContext, type HeadersContextValue } from "./HeadersContext";

export const HeadersContextProvider = <
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
			value={contextValue as unknown as HeadersContextValue}
		>
			{children}
		</HeadersContext.Provider>
	);
};
