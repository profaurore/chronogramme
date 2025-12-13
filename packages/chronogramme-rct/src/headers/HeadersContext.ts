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
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
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
			TGroupId,
			RctToCoreGroup<TGroupId, TGroup>,
			TItemId,
			RctToCoreItem<TGroupId, TItemId, TItem>
		>
	>;
	timelineUnit: Unit;
}

export const HeadersContext: Context<
	| HeadersContextValue<
			number,
			"id",
			"title",
			"rightTitle",
			number,
			"id",
			"group",
			"title",
			"title",
			"start_time",
			"end_time",
			BaseGroup<number, "id", "title", "rightTitle">,
			BaseItem<
				number,
				number,
				"id",
				"group",
				"title",
				"title",
				"start_time",
				"end_time"
			>
	  >
	| undefined
> = createContext<
	| HeadersContextValue<
			number,
			"id",
			"title",
			"rightTitle",
			number,
			"id",
			"group",
			"title",
			"title",
			"start_time",
			"end_time",
			BaseGroup<number, "id", "title", "rightTitle">,
			BaseItem<
				number,
				number,
				"id",
				"group",
				"title",
				"title",
				"start_time",
				"end_time"
			>
	  >
	| undefined
>(undefined);
