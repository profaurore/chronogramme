import {
	HALF,
	type Timeline as HTMLTimeline,
} from "@chronogramme/chronogramme";
import { type ReactNode, useMemo } from "react";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
} from "../Timeline";
import {
	buildUnsupportedFunction,
	buildUnsupportedPropertiesProxy,
} from "../utils/unsupportedUtils";
import {
	TimelineContext,
	type TimelineContextValue,
	type TimelineState,
} from "./TimelineContext";

interface HelpersProviderProps<
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
> {
	children?: ReactNode | undefined;
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
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
	timeline,
}: HelpersProviderProps<
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
>): ReactNode => {
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

	const contextValue = useMemo((): TimelineContextValue<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	> => {
		const timelineState: TimelineState<
			TGroupIdKey,
			TGroupTitleKey,
			TGroupRightTitleKey,
			TItemIdKey,
			TItemGroupKey,
			TItemTitleKey,
			TItemDivTitleKey,
			TItemTimeStartKey,
			TItemTimeEndKey
		> = buildUnsupportedPropertiesProxy(
			{
				canvasTimeEnd,
				canvasTimeStart,
			},
			UNSUPPORTED_GET_TIMELINE_STATE_PROPERTIES,
		);

		return buildUnsupportedPropertiesProxy(
			{
				getDateFromLeftOffsetPosition: buildUnsupportedFunction(
					"getDateFromLeftOffsetPosition",
				),
				getLeftOffsetFromDate: buildUnsupportedFunction(
					"getLeftOffsetFromDate",
				),
				getTimelineState: () => timelineState,
			},
			UNSUPPORTED_TIMELINE_CONTEXT_VALUE_PROPERTIES,
		);
	}, [canvasTimeEnd, canvasTimeStart]);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<TimelineContext.Provider
			value={
				contextValue as TimelineContextValue<
					"id",
					"title",
					"rightTitle",
					"id",
					"group",
					"title",
					"title",
					"start_time",
					"end_time"
				>
			}
		>
			{children}
		</TimelineContext.Provider>
	);
};
