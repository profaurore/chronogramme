import { ZERO } from "@chronogramme/chronogramme";
import { type ReactNode, useMemo } from "react";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	RctToCoreItem,
} from "../utils/typeUtils";
import {
	ItemForHelpersContext,
	type ItemForHelpersContextValue,
} from "./ItemForHelpersContext";
import { useItemContext } from "./useItemContext";

interface ItemForHelpersContextProviderProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	children?: ReactNode | undefined;
	groupPosition: number;
	item: RctToCoreItem<TKeys, TGroup, TItem>;
	vOffsetInGroup: number;
	vSize: number;
}

export const ItemForHelpersContextProvider = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>({
	children,
	groupPosition,
	item,
	vOffsetInGroup: renderedVStartPos,
	vSize: renderedVSize,
}: ItemForHelpersContextProviderProps<TKeys, TGroup, TItem>): ReactNode => {
	const { timeline } = useItemContext<TKeys, TGroup, TItem>();

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

	const contextValue = useMemo<ItemForHelpersContextValue<TItem["id"]>>(
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
			value={contextValue as unknown as ItemForHelpersContextValue<unknown>}
		>
			{children}
		</ItemForHelpersContext.Provider>
	);
};
