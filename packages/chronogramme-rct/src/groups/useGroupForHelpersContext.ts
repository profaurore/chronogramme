import { useContext } from "react";
import {
	GroupForHelpersContext,
	type GroupForHelpersContextValue,
} from "./GroupForHelpersContext";

export function useGroupForHelpersContext<
	TGroupId,
>(): GroupForHelpersContextValue<TGroupId> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(
		GroupForHelpersContext,
	) as unknown as GroupForHelpersContextValue<TGroupId>;

	if (!context) {
		throw new Error(
			"useGroupForHelpersContext() must be used within a <GroupForHelpersContextProvider />",
		);
	}

	return context;
}
