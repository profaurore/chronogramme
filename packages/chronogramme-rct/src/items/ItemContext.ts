import type { DragState } from "@chronogramme/chronogramme";
import { type Context, createContext, type SyntheticEvent } from "react";
import type { ItemRenderer } from "../Timeline";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
} from "../utils/typeUtils";

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
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	canMove: boolean;
	canResizeLeft: boolean;
	canResizeRight: boolean;
	canSelect: boolean;
	itemDragState: DragState<undefined>;
	itemRenderer: ItemRenderer<TKeys, TGroup, TItem>;
	itemResizeState: DragState<undefined>;
	keys: TKeys;
	minResizeWidth: number;
	onClick: ItemOnClick<TItem["id"]> | undefined;
	onContextMenu: OnContextMenu<TItem["id"]> | undefined;
	onDoubleClick: OnDoubleClick<TItem["id"]> | undefined;
	onSelect: OnSelect<TItem["id"]> | undefined;
	selected: TItem["id"][] | undefined;
	selectedItemId: TItem["id"] | undefined;
	setSelectedItemId: SetSelectedItemId<TItem["id"]>;
	timeline: CoreTimeline<TKeys, TGroup, TItem>;
}

export const ItemContext: Context<
	| ItemContextVariable<
			AnyKeys,
			AnyGroup<AnyKeys>,
			AnyItem<AnyKeys, AnyGroup<AnyKeys>>
	  >
	| undefined
> = createContext<
	| ItemContextVariable<
			AnyKeys,
			AnyGroup<AnyKeys>,
			AnyItem<AnyKeys, AnyGroup<AnyKeys>>
	  >
	| undefined
>(undefined);
