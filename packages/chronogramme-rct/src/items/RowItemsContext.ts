import { type Context, createContext } from "react";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
} from "../utils/typeUtils";

export interface RowItemsContextValue<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	index: number;
	itemVOffset: number;
	itemVSize: number;
	position: number;
	timeline: CoreTimeline<TKeys, TGroup, TItem>;
}

export const RowItemsContext: Context<
	| RowItemsContextValue<
			AnyKeys,
			AnyGroup<AnyKeys>,
			AnyItem<AnyKeys, AnyGroup<AnyKeys>>
	  >
	| undefined
> = createContext<
	| RowItemsContextValue<
			AnyKeys,
			AnyGroup<AnyKeys>,
			AnyItem<AnyKeys, AnyGroup<AnyKeys>>
	  >
	| undefined
>(undefined);
