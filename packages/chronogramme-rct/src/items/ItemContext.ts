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

type ItemOnClick<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

type OnContextMenu<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

type OnDoubleClick<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

type OnSelect<TItemId> = (
	itemId: TItemId,
	e: SyntheticEvent,
	time: number,
) => void;

type SetSelectedItemId<TItemId> = (itemId: TItemId) => void;

export interface ItemContextVariable<
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
	canMove: boolean;
	canResizeLeft: boolean;
	canResizeRight: boolean;
	canSelect: boolean;
	itemDragState: DragState<undefined>;
	itemRenderer: ItemRenderer<
		TGroupId,
		TItemId,
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
	onClick: ItemOnClick<TItemId> | undefined;
	onContextMenu: OnContextMenu<TItemId> | undefined;
	onDoubleClick: OnDoubleClick<TItemId> | undefined;
	onSelect: OnSelect<TItemId> | undefined;
	selected: TItemId[] | undefined;
	selectedItemId: TItemId | undefined;
	setSelectedItemId: SetSelectedItemId<TItemId>;
	timeline: InstanceType<
		typeof HTMLTimeline<
			TGroupId,
			RctToCoreGroup<TGroupId, TGroup>,
			TItemId,
			RctToCoreItem<TGroupId, TItemId, TItem>
		>
	>;
}

export const ItemContext: Context<
	| ItemContextVariable<
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
	| ItemContextVariable<
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
