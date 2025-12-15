import {
	EVEN_MULTIPLE,
	type Timeline as HTMLTimeline,
	ZERO,
} from "@chronogramme/chronogramme";
import type { ReactNode } from "react";
import { STYLE_SIZE_PRECISION } from "../constants";
import type { BaseGroup, BaseItem, GroupRenderer } from "../Timeline";
import type { RctToCoreGroup, RctToCoreItem } from "../utils/typeUtils";
import { GroupForHelpersContextProvider } from "./GroupForHelpersContextProvider";

interface GroupProps<
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
	group: RctToCoreGroup<TGroupId, TGroup>;
	groupIndex: number;
	groupRenderer: GroupRenderer<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup
	>;
	isRightSidebar?: boolean | undefined;
	timeline: InstanceType<
		typeof HTMLTimeline<
			TGroupId,
			RctToCoreGroup<TGroupId, TGroup>,
			TItemId,
			RctToCoreItem<TGroupId, TItemId, TItem>
		>
	>;
}

export const Group = <
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
	group,
	groupIndex,
	groupRenderer: GroupRendererComponent,
	isRightSidebar,
	timeline,
}: GroupProps<
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
	const groupPosition = timeline.getGroupPosition(groupIndex);
	const groupSize = timeline.getGroupSize(groupIndex);

	return (
		<div
			key={String(group.id)}
			className={
				"rct-sidebar-row rct-sidebar-row-" +
				(groupIndex % EVEN_MULTIPLE === ZERO ? "even" : "odd")
			}
			style={{
				height: `${groupSize.toFixed(STYLE_SIZE_PRECISION)}px`,
				left: "0px",
				lineHeight: `${groupSize.toFixed(STYLE_SIZE_PRECISION)}px`,
				position: "absolute",
				right: "0px",
				top: `${groupPosition.toFixed(STYLE_SIZE_PRECISION)}px`,
			}}
		>
			<GroupForHelpersContextProvider<
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
				group={group}
				index={groupIndex}
				timeline={timeline}
			>
				<GroupRendererComponent
					group={group.originalGroup}
					isRightSidebar={isRightSidebar}
				/>
			</GroupForHelpersContextProvider>
		</div>
	);
};
