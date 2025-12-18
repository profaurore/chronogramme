import { type Context, createContext } from "react";
import type { ShowPeriod } from "../headers/CustomHeader";
import type { Unit } from "../headers/DateHeader";
import type { AnyKeys } from "../utils/typeUtils";
import type { UnsupportedType } from "../utils/unsupportedUtils";
import type {
	GetDateFromLeftOffsetPosition,
	GetLeftOffsetFromDate,
} from "./HelpersContext";

export interface TimelineState<TKeys extends AnyKeys> {
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
	keys: UnsupportedType<Readonly<TKeys>, "No alternative available.">;
}

type GetTimelineState<TKeys extends AnyKeys> = () => Readonly<
	TimelineState<TKeys>
>;

export interface TimelineContextValue<TKeys extends AnyKeys> {
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

	getTimelineState: GetTimelineState<TKeys>;

	/**
	 * @deprecated Unsupported type from React Calendar Timeline's API. No
	 * alternative available.
	 */
	showPeriod: UnsupportedType<ShowPeriod, "No alternative available.">;
}

// Unfortunate type cast to handle the trickiness of creating context
// providers with generics.
export const TimelineContext: Context<
	TimelineContextValue<AnyKeys> | undefined
> = createContext<TimelineContextValue<AnyKeys> | undefined>(undefined);
