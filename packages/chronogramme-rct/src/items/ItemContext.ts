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
} from "../timeline";

export interface ItemContextVariable<
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TItemIdKey extends string = "id",
	TItemGroupKey extends string = "group",
	TItemTitleKey extends string = "title",
	TItemDivTitleKey extends string = "title",
	TItemTimeStartKey extends string = "start_time",
	TItemTimeEndKey extends string = "end_time",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
	TItem extends BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	> = BaseItem<
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

export const ItemContext: Context<ItemContextVariable | undefined> =
	createContext<ItemContextVariable | undefined>(undefined);
