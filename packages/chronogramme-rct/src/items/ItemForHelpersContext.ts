import { createContext } from "react";

export interface ItemForHelpersContextValue {
	id: number;
	range: number;
	renderedHSize: number;
	renderedHStartPos: number;
	renderedVSize: number;
	renderedVStartPos: number;
	renderedVStartPosInGroup: number;
	startTime: number;
}

export const ItemForHelpersContext = createContext<
	ItemForHelpersContextValue | undefined
>(undefined);
