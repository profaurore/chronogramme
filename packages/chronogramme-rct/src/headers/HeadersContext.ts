import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { type Context, createContext } from "react";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
	TimeSteps,
} from "../Timeline";
import type { Unit } from "./DateHeader";

export type ShowPeriod = (from: number, to: number) => void;

export interface HeadersContextValue<
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
	leftSidebarWidth: number;
	rightSidebarWidth: number;
	showPeriod: ShowPeriod;
	timeSteps: TimeSteps;
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
	timelineUnit: Unit;
}

export const HeadersContext: Context<
	| HeadersContextValue<
			"id",
			"title",
			"rightTitle",
			"id",
			"group",
			"title",
			"title",
			"start_time",
			"end_time",
			BaseGroup<"id", "title", "rightTitle">,
			BaseItem<"id", "group", "title", "title", "start_time", "end_time">
	  >
	| undefined
> = createContext<
	| HeadersContextValue<
			"id",
			"title",
			"rightTitle",
			"id",
			"group",
			"title",
			"title",
			"start_time",
			"end_time",
			BaseGroup<"id", "title", "rightTitle">,
			BaseItem<"id", "group", "title", "title", "start_time", "end_time">
	  >
	| undefined
>(undefined);
