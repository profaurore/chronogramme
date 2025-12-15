import { useContext } from "react";
import {
	UnsupportedFunctionError,
	type UnsupportedType,
} from "../utils/unsupportedUtils";
import { TimelineContext, type TimelineContextValue } from "./TimelineContext";

export function useTimelineContext<
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
>(): TimelineContextValue<
	TGroupIdKey,
	TGroupTitleKey,
	TGroupRightTitleKey,
	TItemIdKey,
	TItemGroupKey,
	TItemTitleKey,
	TItemDivTitleKey,
	TItemTimeStartKey,
	TItemTimeEndKey
> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(
		TimelineContext,
	) as unknown as TimelineContextValue<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>;

	if (!context) {
		throw new Error(
			"useTimelineContext() must be used within a <TimelineContextProvider />",
		);
	}

	return context;
}

/**
 * @deprecated Unsupported function from React Calendar Timeline's API. Use
 * `useTimelineState` instead.
 */
export const useTimelineState: UnsupportedType<
	typeof useTimelineContext,
	"Use `useTimelineContext` instead."
> = (() => {
	throw new UnsupportedFunctionError(
		"useTimelineState",
		"Use `useTimelineContext` instead.",
	);
}) as unknown as UnsupportedType<
	typeof useTimelineContext,
	"Use `useTimelineContext` instead."
>;
