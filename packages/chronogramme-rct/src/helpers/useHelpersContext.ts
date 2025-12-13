import { useContext } from "react";
import { HelpersContext, type HelpersContextValue } from "./HelpersContext";

export function useHelpersContext<TGroupId, TItemId>(): HelpersContextValue<
	TGroupId,
	TItemId
> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(HelpersContext) as unknown as HelpersContextValue<
		TGroupId,
		TItemId
	>;

	if (!context) {
		throw new Error(
			"useHelpersContext() must be used within a <HelpersContextProvider />",
		);
	}

	return context;
}
