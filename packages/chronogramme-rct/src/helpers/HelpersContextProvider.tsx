import { type ReactNode, useMemo } from "react";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
} from "../utils/typeUtils";
import { UnsupportedPropertyValueError } from "../utils/unsupportedUtils";
import { HelpersContext, type HelpersContextValue } from "./HelpersContext";

interface HelpersProviderProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	children?: ReactNode | undefined;
	timeline: CoreTimeline<TKeys, TGroup, TItem>;
}

export const HelpersContextProvider = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>({
	children,
	timeline,
}: HelpersProviderProps<TKeys, TGroup, TItem>): ReactNode => {
	const contextValue = useMemo<HelpersContextValue<TGroup["id"], TItem["id"]>>(
		() => ({
			getDateFromLeftOffsetPosition: (position: number) =>
				timeline.getHValue(position),

			getGroupDimensions: (groupId: TGroup["id"]) => {
				throw new UnsupportedPropertyValueError(
					"getGroupDimensions() must be used via useHelpersContext() within the group renderer for the provided identifier",
					"groupId",
					groupId,
				);
			},

			getItemAbsoluteDimensions: (itemId: TItem["id"]) => {
				throw new UnsupportedPropertyValueError(
					"getItemAbsoluteDimensions() must be used via useHelpersContext() within the item renderer for the provided identifier",
					"itemId",
					itemId,
				);
			},

			getItemDimensions: (itemId: TItem["id"]) => {
				throw new UnsupportedPropertyValueError(
					"getItemDimensions() must be used via useHelpersContext() within the item renderer for the provided identifier",
					"itemId",
					itemId,
				);
			},

			getLeftOffsetFromDate: (date: EpochTimeStamp) => timeline.getHPos(date),
		}),
		[timeline.getHPos, timeline.getHValue],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<HelpersContext.Provider
			value={contextValue as unknown as HelpersContextValue<number, number>}
		>
			{children}
		</HelpersContext.Provider>
	);
};
