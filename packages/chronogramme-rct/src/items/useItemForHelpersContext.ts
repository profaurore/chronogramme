import { useContext } from "react";
import { ItemForHelpersContext } from "./ItemForHelpersContext";

export function useItemForHelpersContext() {
	const context = useContext(ItemForHelpersContext);

	if (!context) {
		throw new Error(
			"useItemForHelpersContext() must be used within an <ItemForHelpersContextProvider />",
		);
	}

	return context;
}
