import { type ReactNode, useMemo } from "react";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
	RctToCoreGroup,
} from "../utils/typeUtils";
import {
	GroupForHelpersContext,
	type GroupForHelpersContextValue,
} from "./GroupForHelpersContext";

interface GroupForHelpersProviderProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	children?: ReactNode | undefined;
	group: RctToCoreGroup<TKeys, TGroup>;
	index: number;
	timeline: CoreTimeline<TKeys, TGroup, TItem>;
}

export const GroupForHelpersContextProvider = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>({
	children,
	group,
	index,
	timeline,
}: GroupForHelpersProviderProps<TKeys, TGroup, TItem>): ReactNode => {
	const position = timeline.getGroupPosition(index);
	const size = timeline.getGroupSize(index);

	const id = group.id;

	const contextValue = useMemo<GroupForHelpersContextValue<TGroup["id"]>>(
		() => ({
			id,
			position,
			size,
		}),
		[id, position, size],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<GroupForHelpersContext.Provider
			value={contextValue as unknown as GroupForHelpersContextValue<number>}
		>
			{children}
		</GroupForHelpersContext.Provider>
	);
};
