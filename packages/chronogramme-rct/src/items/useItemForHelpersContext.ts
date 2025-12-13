import { useContext } from "react";
import {
	ItemForHelpersContext,
	type ItemForHelpersContextValue,
} from "./ItemForHelpersContext";

export function useItemForHelpersContext<
	TItemId,
>(): ItemForHelpersContextValue<TItemId> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(
		ItemForHelpersContext,
	) as unknown as ItemForHelpersContextValue<TItemId>;

	if (!context) {
		throw new Error(
			"useItemForHelpersContext() must be used within an <ItemForHelpersContextProvider />",
		);
	}

	return context;
}
