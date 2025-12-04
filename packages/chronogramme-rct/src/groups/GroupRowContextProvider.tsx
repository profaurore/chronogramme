import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { EVEN_MULTIPLE, ZERO } from "@chronogramme/chronogramme";
import {
	type MouseEvent,
	type ReactNode,
	type SyntheticEvent,
	useMemo,
} from "react";
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
	children?: ReactNode | undefined;
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
>): ReactNode => {
	const { position, size } = useGroupForHelpersContext();

	const id = group.id;
	const originalGroup = group.originalGroup;
	const className =
		"rct-hl " +
		(index % EVEN_MULTIPLE === ZERO ? "rct-hl-even " : "rct-hl-odd ") +
		horizontalLineClassNamesForGroup?.(originalGroup)?.join(" ");

	const contextValue = useMemo<GroupRowContextValue>(
		() => ({
			className,
			id,
			onClick(event: MouseEvent): void {
				onClick?.(id, timeline.getHValueFromClient(event.clientX), event);
			},
			onContextMenu(event: MouseEvent): void {
				onContextMenu?.(id, timeline.getHValueFromClient(event.clientX), event);
			},
			onDoubleClick(event: MouseEvent): void {
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
