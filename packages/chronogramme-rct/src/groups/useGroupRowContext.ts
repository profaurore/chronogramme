import { useContext } from "react";
import { GroupRowContext, type GroupRowContextValue } from "./GroupRowContext";

export function useGroupRowContext(): GroupRowContextValue {
	const context = useContext(GroupRowContext);

	if (!context) {
		throw new Error(
			"useGroupRowContext() must be used within a <GroupRowContextProvider />",
		);
	}

	return context;
}
