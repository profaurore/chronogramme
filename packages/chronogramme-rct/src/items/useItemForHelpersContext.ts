import { useContext } from "react";
import {
	ItemForHelpersContext,
	type ItemForHelpersContextValue,
} from "./ItemForHelpersContext";

export function useItemForHelpersContext(): ItemForHelpersContextValue {
	const context = useContext(ItemForHelpersContext);

	if (!context) {
		throw new Error(
			"useItemForHelpersContext() must be used within an <ItemForHelpersContextProvider />",
		);
	}

	return context;
}
