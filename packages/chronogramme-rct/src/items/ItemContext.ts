import type {
	DragState,
	Timeline as HTMLTimeline,
} from "@chronogramme/chronogramme";

import { type Context, createContext, type SyntheticEvent } from "react";
import type {
	BaseGroup,
	BaseItem,
	ItemRenderer,
	RctToCoreGroup,
	RctToCoreItem,
	TimelineKeys,
} from "../Timeline";

export interface ItemContextVariable<
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
	canMove: boolean;
	canResizeLeft: boolean;
	canResizeRight: boolean;
	canSelect: boolean;
	itemDragState: DragState<undefined>;
	itemRenderer: ItemRenderer<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TItem
	>;
	itemResizeState: DragState<undefined>;
	keys: TimelineKeys<
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
	minResizeWidth: number;
	onClick:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	onContextMenu:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	onDoubleClick:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	onSelect:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	selected: number[] | undefined;
	selectedItemId: number | undefined;
	setSelectedItemId: (itemId: number) => void;
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
}

export const ItemContext: Context<
	| ItemContextVariable<
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
	| ItemContextVariable<
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
