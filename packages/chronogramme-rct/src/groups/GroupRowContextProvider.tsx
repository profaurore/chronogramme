import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { EVEN_MULTIPLE, ZERO } from "@chronogramme/chronogramme";
import {
	type MouseEvent,
	type ReactNode,
	type SyntheticEvent,
	useMemo,
} from "react";
import type { BaseGroup, BaseItem } from "../Timeline";
import type { RctToCoreGroup, RctToCoreItem } from "../utils/typeUtils";
import { GroupRowContext, type GroupRowContextValue } from "./GroupRowContext";
import { useGroupForHelpersContext } from "./useGroupForHelpersContext";

interface GroupRowProviderProps<
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
	group: RctToCoreGroup<TGroupId, TGroup>;
	horizontalLineClassNamesForGroup: ((group: TGroup) => string[]) | undefined;
	index: number;
	onClick?:
		| ((groupId: TGroupId, time: number, e: SyntheticEvent) => void)
		| undefined;
	onContextMenu?:
		| ((groupId: TGroupId, time: number, e: SyntheticEvent) => void)
		| undefined;
	onDoubleClick?:
		| ((groupId: TGroupId, time: number, e: SyntheticEvent) => void)
		| undefined;
	timeline: InstanceType<
		typeof HTMLTimeline<
			TGroupId,
			RctToCoreGroup<TGroupId, TGroup>,
			TItemId,
			RctToCoreItem<TGroupId, TItemId, TItem>
		>
	>;
}

export const GroupRowContextProvider = <
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
	group,
	horizontalLineClassNamesForGroup,
	index,
	onClick,
	onContextMenu,
	onDoubleClick,
	timeline,
}: GroupRowProviderProps<
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
	const { position, size } = useGroupForHelpersContext();

	const id = group.id;
	const originalGroup = group.originalGroup;
	const className =
		"rct-hl " +
		(index % EVEN_MULTIPLE === ZERO ? "rct-hl-even " : "rct-hl-odd ") +
		horizontalLineClassNamesForGroup?.(originalGroup)?.join(" ");

	const contextValue = useMemo<GroupRowContextValue<TGroupId>>(
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

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<GroupRowContext.Provider
			value={contextValue as unknown as GroupRowContextValue<number>}
		>
			{children}
		</GroupRowContext.Provider>
	);
};
