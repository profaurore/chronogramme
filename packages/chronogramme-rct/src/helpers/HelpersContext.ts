import { createContext } from "react";

interface ItemDimensions {
	collisionLeft: number;
	collisionWidth: number;
	height: number;
	left: number;
	top: number;
	width: number;
}

interface ItemAbsoluteDimensions {
	left: number;
	top: number;
	width: number;
}

interface GroupDimensions {
	height: number;
	top: number;
}

export interface HelpersContextValue {
	getDateFromLeftOffsetPosition: (offset: number) => number;
	getGroupDimensions: (groupId: number) => GroupDimensions | undefined;
	getItemAbsoluteDimensions: (
		itemId: number,
	) => ItemAbsoluteDimensions | undefined;
	getItemDimensions: (itemId: number) => ItemDimensions | undefined;
	getLeftOffsetFromDate: (date: number) => number;
}

export const HelpersContext = createContext<HelpersContextValue | undefined>(
	undefined,
);
