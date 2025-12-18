import { HALF, UNIT } from "@chronogramme/chronogramme";
import { type ReactNode, useMemo } from "react";
import {
	RowItemsContext,
	type RowItemsContextValue,
} from "../items/RowItemsContext";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
} from "../utils/typeUtils";

interface RowItemsContextProviderProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	children?: ReactNode | undefined;
	index: number;
	itemHeightRatio: number;
	timeline: CoreTimeline<TKeys, TGroup, TItem>;
}

export const RowItemsContextProvider = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>({
	children,
	index,
	itemHeightRatio,
	timeline,
}: RowItemsContextProviderProps<TKeys, TGroup, TItem>): ReactNode => {
	const position = timeline.getGroupPosition(index);
	const lineSize = timeline.getGroupLineSize(index);
	const itemVOffset = HALF * (UNIT - itemHeightRatio) * lineSize;
	const itemVSize = itemHeightRatio * lineSize;

	const contextValue = useMemo<RowItemsContextValue<TKeys, TGroup, TItem>>(
		() => ({
			index,
			itemVOffset,
			itemVSize,
			position,
			timeline,
		}),
		[index, position, itemVOffset, itemVSize, timeline],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<RowItemsContext.Provider
			value={
				contextValue as unknown as RowItemsContextValue<
					AnyKeys,
					AnyGroup<AnyKeys>,
					AnyItem<AnyKeys, AnyGroup<AnyKeys>>
				>
			}
		>
			{children}
		</RowItemsContext.Provider>
	);
};
