import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import type {
	BaseGroup,
	BaseItem,
	GroupRenderer,
	RctToCoreGroup,
	RctToCoreItem,
} from "./timeline";

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
	isRightSidebar?: boolean;
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
}) => {
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
				height: `${groupSize.toFixed(4)}px`,
				left: "0px",
				lineHeight: `${groupSize.toFixed(4)}px`,
				position: "absolute",
				right: "0px",
				top: `${groupPosition.toFixed(4)}px`,
			}}
		>
			<GroupComponent
				group={group.originalGroup}
				isRightSidebar={isRightSidebar}
			/>
		</div>
	);
};
