import { useContext } from "react";
import { HelpersContext, type HelpersContextValue } from "./HelpersContext";

export function useHelpersContext(): HelpersContextValue {
	const context = useContext(HelpersContext);

	if (!context) {
		throw new Error(
			"useHelpersContext() must be used within a <HelpersContextProvider />",
		);
	}

	return context;
}
