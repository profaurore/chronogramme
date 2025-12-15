import { type Context, createContext } from "react";
import type { ShowPeriod } from "../headers/CustomHeader";
import type { Unit } from "../headers/DateHeader";
import type { TimelineKeys } from "../Timeline";
import type { UnsupportedType } from "../utils/unsupportedUtils";
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

	/**
	 * @deprecated Unsupported type from React Calendar Timeline's API. No
	 * alternative available.
	 */
	visibleTimeStart: UnsupportedType<number, "No alternative available.">;

	/**
	 * @deprecated Unsupported type from React Calendar Timeline's API. No
	 * alternative available.
	 */
	visibleTimeEnd: UnsupportedType<number, "No alternative available.">;

	/**
	 * @deprecated Unsupported type from React Calendar Timeline's API. No
	 * alternative available.
	 */
	canvasWidth: UnsupportedType<number, "No alternative available.">;

	/**
	 * @deprecated Unsupported type from React Calendar Timeline's API. No
	 * alternative available.
	 */
	timelineUnit: UnsupportedType<Unit, "No alternative available.">;

	/**
	 * @deprecated Unsupported type from React Calendar Timeline's API. No
	 * alternative available.
	 */
	timelineWidth: UnsupportedType<number, "No alternative available.">;

	/**
	 * @deprecated Unsupported type from React Calendar Timeline's API. No
	 * alternative available.
	 */
	keys: UnsupportedType<
		Readonly<
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
		>,
		"No alternative available."
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
	/**
	 * @deprecated Unsupported type from React Calendar Timeline's API. Use
	 * `useHelpersContext().getDateFromLeftOffsetPosition` instead.
	 */
	getDateFromLeftOffsetPosition: UnsupportedType<
		GetDateFromLeftOffsetPosition,
		"Use `useHelpersContext().getDateFromLeftOffsetPosition` instead."
	>;

	/**
	 * @deprecated Unsupported type from React Calendar Timeline's API. Use
	 * `useHelpersContext().getLeftOffsetFromDate` instead.
	 */
	getLeftOffsetFromDate: UnsupportedType<
		GetLeftOffsetFromDate,
		"Use `useHelpersContext().getLeftOffsetFromDate` instead."
	>;

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

	/**
	 * @deprecated Unsupported type from React Calendar Timeline's API. No
	 * alternative available.
	 */
	showPeriod: UnsupportedType<ShowPeriod, "No alternative available.">;
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
