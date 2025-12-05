import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { type Context, createContext } from "react";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
} from "../Timeline";

export interface RowItemsContextValue<
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
	index: number;
	itemVOffset: number;
	itemVSize: number;
	position: number;
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
}

export const RowItemsContext: Context<
	| RowItemsContextValue<
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
	| RowItemsContextValue<
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
