import { useContext } from "react";
import { GroupForHelpersContext } from "./GroupForHelpersContext";

export function useGroupForHelpersContext() {
	const context = useContext(GroupForHelpersContext);

	if (!context) {
		throw new Error(
			"useGroupForHelpersContext() must be used within a <GroupForHelpersContextProvider />",
		);
	}

	return context;
}
