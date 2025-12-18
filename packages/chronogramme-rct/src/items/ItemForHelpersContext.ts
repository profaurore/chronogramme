import { type Context, createContext } from "react";

export interface ItemForHelpersContextValue<TItemId> {
	id: TItemId;
	range: number;
	renderedHSize: number;
	renderedHStartPos: number;
	renderedVSize: number;
	renderedVStartPos: number;
	renderedVStartPosInGroup: number;
	startTime: number;
}

export const ItemForHelpersContext: Context<
	ItemForHelpersContextValue<unknown> | undefined
> = createContext<ItemForHelpersContextValue<unknown> | undefined>(undefined);
