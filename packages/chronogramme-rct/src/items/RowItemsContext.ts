import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import { type Context, createContext } from "react";
import type { BaseGroup, BaseItem } from "../Timeline";
import type { RctToCoreGroup, RctToCoreItem } from "../utils/typeUtils";

export interface RowItemsContextValue<
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
	index: number;
	itemVOffset: number;
	itemVSize: number;
	position: number;
	timeline: InstanceType<
		typeof HTMLTimeline<
			TGroupId,
			RctToCoreGroup<TGroupId, TGroup>,
			TItemId,
			RctToCoreItem<TGroupId, TItemId, TItem>
		>
	>;
}

export const RowItemsContext: Context<
	| RowItemsContextValue<
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
	| RowItemsContextValue<
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
