import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import type { ReactNode } from "react";
import { STYLE_SIZE_PRECISION } from "../constants";
import type {
	BaseGroup,
	BaseItem,
	GroupRenderer,
	RctToCoreGroup,
	RctToCoreItem,
} from "../timeline";
import { GroupForHelpersContextProvider } from "./GroupForHelpersContextProvider";

export const Group = <
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
	group,
	groupIndex,
	groupRenderer: GroupComponent,
	isRightSidebar,
	timeline,
}: {
	group: RctToCoreGroup<TGroup>;
	groupIndex: number;
	groupRenderer: GroupRenderer<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup
	>;
	isRightSidebar?: boolean | undefined;
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
}): ReactNode => {
	const groupPosition = timeline.getGroupPosition(groupIndex);
	const groupSize = timeline.getGroupSize(groupIndex);

	return (
		<div
			key={group.id}
			className={
				"rct-sidebar-row rct-sidebar-row-" +
				(groupIndex % 2 === 0 ? "even" : "odd")
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
				group={group}
				index={groupIndex}
				timeline={timeline}
			>
				<GroupComponent
					group={group.originalGroup}
					isRightSidebar={isRightSidebar}
				/>
			</GroupForHelpersContextProvider>
		</div>
	);
};
