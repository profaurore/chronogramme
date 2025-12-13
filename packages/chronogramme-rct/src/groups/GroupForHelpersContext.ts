import { type Context, createContext } from "react";

export interface GroupForHelpersContextValue<TGroupId> {
	id: TGroupId;
	position: number;
	size: number;
}

export const GroupForHelpersContext: Context<
	GroupForHelpersContextValue<number> | undefined
> = createContext<GroupForHelpersContextValue<number> | undefined>(undefined);
