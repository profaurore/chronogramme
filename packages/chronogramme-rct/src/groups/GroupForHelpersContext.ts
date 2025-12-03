import { createContext } from "react";

export interface GroupForHelpersContextValue {
	id: number;
	position: number;
	size: number;
}

export const GroupForHelpersContext = createContext<
	GroupForHelpersContextValue | undefined
>(undefined);
