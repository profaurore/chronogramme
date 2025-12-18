import { useContext } from "react";
import type { AnyGroup, AnyItem, AnyKeys } from "../utils/typeUtils";
import { HeadersContext, type HeadersContextValue } from "./HeadersContext";

export function useHeadersContext<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>(): HeadersContextValue<TKeys, TGroup, TItem> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(HeadersContext) as unknown as HeadersContextValue<
		TKeys,
		TGroup,
		TItem
	>;

	if (!context) {
		throw new Error(
			"useHeadersContext() must be used within a <HeadersContextProvider />",
		);
	}

	return context;
}
