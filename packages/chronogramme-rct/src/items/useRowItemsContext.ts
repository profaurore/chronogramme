import { useContext } from "react";
import {
	RowItemsContext,
	type RowItemsContextValue,
} from "../items/RowItemsContext";
import type { AnyGroup, AnyItem, AnyKeys } from "../utils/typeUtils";

export function useRowItemsContext<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>(): RowItemsContextValue<TKeys, TGroup, TItem> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(
		RowItemsContext,
	) as unknown as RowItemsContextValue<TKeys, TGroup, TItem>;

	if (!context) {
		throw new Error(
			"useRowItemsContext() must be used within a <RowItemsProvider />",
		);
	}

	return context;
}
