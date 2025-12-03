import { useContext } from "react";
import { GroupRowContext } from "./GroupRowContext";

export function useGroupRowContext() {
	const context = useContext(GroupRowContext);

	if (!context) {
		throw new Error(
			"useGroupRowContext() must be used within a <GroupRowContextProvider />",
		);
	}

	return context;
}
