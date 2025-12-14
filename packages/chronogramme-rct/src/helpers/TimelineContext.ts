import { type Context, createContext } from "react";
import type { Unit } from "../headers/DateHeader";
import type { ShowPeriod } from "../headers/HeadersContext";
import type { TimelineKeys } from "../Timeline";
import type {
	GetDateFromLeftOffsetPosition,
	GetLeftOffsetFromDate,
} from "./HelpersContext";

export interface TimelineState<
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
> {
	canvasTimeStart: number;
	canvasTimeEnd: number;
	visibleTimeStart: number;
	visibleTimeEnd: number;
	canvasWidth: number;
	timelineUnit: Unit;
	timelineWidth: number;
	keys: Readonly<
		TimelineKeys<
			TGroupIdKey,
			TGroupTitleKey,
			TGroupRightTitleKey,
			TItemIdKey,
			TItemGroupKey,
			TItemTitleKey,
			TItemDivTitleKey,
			TItemTimeStartKey,
			TItemTimeEndKey
		>
	>;
}

type GetTimelineState<
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
> = () => Readonly<
	TimelineState<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>
>;

export interface TimelineContextValue<
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
> {
	getDateFromLeftOffsetPosition: GetDateFromLeftOffsetPosition;
	getLeftOffsetFromDate: GetLeftOffsetFromDate;
	getTimelineState: GetTimelineState<
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
	showPeriod: ShowPeriod;
}

// Unfortunate type cast to handle the trickiness of creating context
// providers with generics.
export const TimelineContext: Context<
	| TimelineContextValue<
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
	| undefined
> = createContext<
	| TimelineContextValue<
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
	| undefined
>(undefined);
