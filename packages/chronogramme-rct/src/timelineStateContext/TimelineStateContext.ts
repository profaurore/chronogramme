import type {
	DragState,
	Timeline as HTMLTimeline,
} from "@chronogramme/chronogramme";

import { createContext, type SyntheticEvent } from "react";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
	TimelineKeys,
} from "../timeline";

export interface TimelineState<
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
	itemDragStateRef: React.RefObject<DragState<undefined>>;
	itemResizeStateRef: React.RefObject<DragState<undefined>>;
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
	onItemClick?:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	onItemContextMenu?:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	onItemDoubleClick?:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	onItemSelect?:
		| ((itemId: number, e: SyntheticEvent, time: number) => void)
		| undefined;
	selected?: number[] | undefined;
	selectedItemId: number | undefined;
	setSelectedItemId: (itemId: number) => void;
	// showPeriod: (from: number, to: number) => void; // TODO: Implement
	timelineRef: React.RefObject<InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	> | null>;
	// timelineUnit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'; // TODO: Implement
}

export const TimelineStateContext = createContext<TimelineState | undefined>(
	undefined,
);
