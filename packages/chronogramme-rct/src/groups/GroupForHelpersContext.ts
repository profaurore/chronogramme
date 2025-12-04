import { type Context, createContext } from "react";

export interface GroupForHelpersContextValue {
	id: number;
	position: number;
	size: number;
}

export const GroupForHelpersContext: Context<
	GroupForHelpersContextValue | undefined
> = createContext<GroupForHelpersContextValue | undefined>(undefined);
