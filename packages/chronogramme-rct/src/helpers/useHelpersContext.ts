import { useContext } from "react";
import { HelpersContext } from "./HelpersContext";

export function useHelpersContext() {
	const context = useContext(HelpersContext);

	if (!context) {
		throw new Error(
			"useHelpersContext() must be used within a <HelpersContextProvider />",
		);
	}

	return context;
}
