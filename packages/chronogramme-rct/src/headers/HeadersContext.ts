import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { type Context, createContext } from "react";
import type { BaseGroup, BaseItem, TimeSteps } from "../Timeline";
import type { RctToCoreGroup, RctToCoreItem } from "../utils/typeUtils";
import type { ShowPeriod } from "./CustomHeader";
import type { Unit } from "./DateHeader";

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
