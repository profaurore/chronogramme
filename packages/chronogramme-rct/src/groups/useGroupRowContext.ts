import { useContext } from "react";
import { GroupRowContext, type GroupRowContextValue } from "./GroupRowContext";

export function useGroupRowContext<TGroupId>(): GroupRowContextValue<TGroupId> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(
		GroupRowContext,
	) as unknown as GroupRowContextValue<TGroupId>;

	if (!context) {
		throw new Error(
			"useGroupRowContext() must be used within a <GroupRowContextProvider />",
		);
	}

	return context;
}
