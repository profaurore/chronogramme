import { HALF } from "@chronogramme/chronogramme";
import { type ReactNode, useMemo } from "react";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
} from "../utils/typeUtils";
import {
	buildUnsupportedPropertiesProxy,
	UnsupportedFunctionError,
	type UnsupportedType,
} from "../utils/unsupportedUtils";
import type {
	GetDateFromLeftOffsetPosition,
	GetLeftOffsetFromDate,
} from "./HelpersContext";
import {
	TimelineContext,
	type TimelineContextValue,
	type TimelineState,
} from "./TimelineContext";

interface HelpersProviderProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	children?: ReactNode | undefined;
	timeline: CoreTimeline<TKeys, TGroup, TItem>;
}

const UNSUPPORTED_GET_TIMELINE_STATE_PROPERTIES = [
	"visibleTimeStart",
	"visibleTimeEnd",
	"canvasWidth",
	"timelineUnit",
	"timelineWidth",
	"keys",
] as const;

const UNSUPPORTED_TIMELINE_CONTEXT_VALUE_PROPERTIES = ["showPeriod"] as const;

export const TimelineContextProvider = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>({
	children,
	timeline,
}: HelpersProviderProps<TKeys, TGroup, TItem>): ReactNode => {
	const visibleTimeEnd = timeline.hWindowMax;
	const visibleTimeStart = timeline.hWindowMin;
	const windowRange = timeline.hWindowRange;

	const halfWindow = windowRange * HALF;
	const canvasStartTarget = visibleTimeStart - windowRange;
	const canvasEndTarget = visibleTimeEnd + windowRange;
	const canvasTimeStart = Math.max(
		canvasStartTarget - (canvasStartTarget % halfWindow),
		timeline.hMin,
	);
	const canvasTimeEnd = Math.min(
		canvasEndTarget + (halfWindow - (canvasEndTarget % halfWindow)),
		timeline.hMax,
	);

	const contextValue = useMemo((): TimelineContextValue<TKeys> => {
		const timelineState: TimelineState<TKeys> = buildUnsupportedPropertiesProxy(
			"TimelineState",
			{
				canvasTimeEnd,
				canvasTimeStart,
			},
			UNSUPPORTED_GET_TIMELINE_STATE_PROPERTIES,
		);

		return buildUnsupportedPropertiesProxy(
			"TimelineContextValue",
			{
				getDateFromLeftOffsetPosition: (() => {
					throw new UnsupportedFunctionError(
						"getDateFromLeftOffsetPosition",
						"Use `useHelpersContext().getDateFromLeftOffsetPosition` instead.",
					);
				}) as unknown as UnsupportedType<
					GetDateFromLeftOffsetPosition,
					"Use `useHelpersContext().getDateFromLeftOffsetPosition` instead."
				>,
				getLeftOffsetFromDate: (() => {
					throw new UnsupportedFunctionError(
						"getLeftOffsetFromDate",
						"Use `useHelpersContext().getLeftOffsetFromDate` instead.",
					);
				}) as unknown as UnsupportedType<
					GetLeftOffsetFromDate,
					"Use `useHelpersContext().getLeftOffsetFromDate` instead."
				>,
				getTimelineState: () => timelineState,
			},
			UNSUPPORTED_TIMELINE_CONTEXT_VALUE_PROPERTIES,
		);
	}, [canvasTimeEnd, canvasTimeStart]);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<TimelineContext.Provider
			value={contextValue as TimelineContextValue<AnyKeys>}
		>
			{children}
		</TimelineContext.Provider>
	);
};
