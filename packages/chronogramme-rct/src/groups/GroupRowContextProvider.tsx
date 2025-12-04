import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { ZERO } from "@chronogramme/chronogramme";
import { type SyntheticEvent, useMemo } from "react";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
} from "../timeline";
import { GroupRowContext, type GroupRowContextValue } from "./GroupRowContext";
import { useGroupForHelpersContext } from "./useGroupForHelpersContext";

interface GroupRowProviderProps<
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
	children?: React.ReactNode | undefined;
	group: RctToCoreGroup<TGroup>;
	horizontalLineClassNamesForGroup: ((group: TGroup) => string[]) | undefined;
	index: number;
	onClick?:
		| ((groupId: number, time: number, e: SyntheticEvent) => void)
		| undefined;
	onContextMenu?:
		| ((groupId: number, time: number, e: SyntheticEvent) => void)
		| undefined;
	onDoubleClick?:
		| ((groupId: number, time: number, e: SyntheticEvent) => void)
		| undefined;
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
}

export const GroupRowContextProvider = <
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
	horizontalLineClassNamesForGroup,
	index,
	onClick,
	onContextMenu,
	onDoubleClick,
	timeline,
}: GroupRowProviderProps<
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
>) => {
	const { position, size } = useGroupForHelpersContext();

	const id = group.id;
	const originalGroup = group.originalGroup;
	const className =
		"rct-hl " +
		(index % 2 === ZERO ? "rct-hl-even " : "rct-hl-odd ") +
		horizontalLineClassNamesForGroup?.(originalGroup)?.join(" ");

	const contextValue = useMemo<GroupRowContextValue>(
		() => ({
			className,
			id,
			onClick(event: React.MouseEvent) {
				onClick?.(id, timeline.getHValueFromClient(event.clientX), event);
			},
			onContextMenu(event: React.MouseEvent) {
				onContextMenu?.(id, timeline.getHValueFromClient(event.clientX), event);
			},
			onDoubleClick(event: React.MouseEvent) {
				onDoubleClick?.(id, timeline.getHValueFromClient(event.clientX), event);
			},
			position,
			size,
		}),
		[
			className,
			id,
			onClick,
			onContextMenu,
			onDoubleClick,
			position,
			size,
			timeline,
		],
	);

	return (
		<GroupRowContext.Provider value={contextValue}>
			{children}
		</GroupRowContext.Provider>
	);
};
