import { useContext } from "react";
import type { AnyKeys } from "../utils/typeUtils";
import {
	UnsupportedFunctionError,
	type UnsupportedType,
} from "../utils/unsupportedUtils";
import { TimelineContext, type TimelineContextValue } from "./TimelineContext";

export function useTimelineContext<
	TKeys extends AnyKeys,
>(): TimelineContextValue<TKeys> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(
		TimelineContext,
	) as unknown as TimelineContextValue<TKeys>;

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
