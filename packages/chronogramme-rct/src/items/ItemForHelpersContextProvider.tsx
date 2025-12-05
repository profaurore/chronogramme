import { ZERO } from "@chronogramme/chronogramme";
import { type ReactNode, useMemo } from "react";
import type { BaseGroup, BaseItem, RctToCoreItem } from "../Timeline";
import {
	ItemForHelpersContext,
	type ItemForHelpersContextValue,
} from "./ItemForHelpersContext";
import { useItemContext } from "./useItemContext";

interface ItemForHelpersContextProviderProps<
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TItem extends BaseItem<
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
	item: RctToCoreItem<TItem>;
	vOffsetInGroup: number;
	vSize: number;
}

export const ItemForHelpersContextProvider = <
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
	groupPosition,
	item,
	vOffsetInGroup: renderedVStartPos,
	vSize: renderedVSize,
}: ItemForHelpersContextProviderProps<
	TItemIdKey,
	TItemGroupKey,
	TItemTitleKey,
	TItemDivTitleKey,
	TItemTimeStartKey,
	TItemTimeEndKey,
	TItem
>): ReactNode => {
	const { timeline } = useItemContext<
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

	const contextValue = useMemo<ItemForHelpersContextValue>(
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
			value={contextValue as unknown as ItemForHelpersContextValue}
		>
			{children}
		</ItemForHelpersContext.Provider>
	);
};
