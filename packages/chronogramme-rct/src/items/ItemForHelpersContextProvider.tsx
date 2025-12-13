import { ZERO } from "@chronogramme/chronogramme";
import { type ReactNode, useMemo } from "react";
import type { BaseGroup, BaseItem, RctToCoreItem } from "../Timeline";
import {
	ItemForHelpersContext,
	type ItemForHelpersContextValue,
} from "./ItemForHelpersContext";
import { useItemContext } from "./useItemContext";

interface ItemForHelpersContextProviderProps<
	TGroupId,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
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
	groupPosition: number;
	item: RctToCoreItem<TGroupId, TItemId, TItem>;
	vOffsetInGroup: number;
	vSize: number;
}

export const ItemForHelpersContextProvider = <
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
	groupPosition,
	item,
	vOffsetInGroup: renderedVStartPos,
	vSize: renderedVSize,
}: ItemForHelpersContextProviderProps<
	TGroupId,
	TItemId,
	TItemIdKey,
	TItemGroupKey,
	TItemTitleKey,
	TItemDivTitleKey,
	TItemTimeStartKey,
	TItemTimeEndKey,
	TItem
>): ReactNode => {
	const { timeline } = useItemContext<
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
	>();

	const endTime = item.endTime;
	const startTime = item.startTime;
	const id = item.id;
	const range = endTime - startTime;

	const startPos = timeline.getHPos(startTime);
	const endPos = timeline.getHPos(endTime);
	const hScrollSize = timeline.hScrollSize;

	const renderedHStartPos = Math.max(startPos, ZERO);
	const renderedHEndPos = Math.min(endPos, hScrollSize);
	const renderedHSize = renderedHEndPos - renderedHStartPos;
	const renderedVStartPosInGroup = groupPosition + renderedVStartPos;

	const contextValue = useMemo<ItemForHelpersContextValue<TItemId>>(
		() => ({
			id,
			range,
			renderedHSize,
			renderedHStartPos,
			renderedVSize,
			renderedVStartPos,
			renderedVStartPosInGroup,
			startTime,
		}),
		[
			id,
			range,
			renderedHSize,
			renderedHStartPos,
			renderedVSize,
			renderedVStartPos,
			renderedVStartPosInGroup,
			startTime,
		],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<ItemForHelpersContext.Provider
			value={contextValue as unknown as ItemForHelpersContextValue<number>}
		>
			{children}
		</ItemForHelpersContext.Provider>
	);
};
