import { type Context, createContext } from "react";

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

export type GetLeftOffsetFromDate = (date: number) => number;
export type GetDateFromLeftOffsetPosition = (date: number) => number;

export interface HelpersContextValue {
	getDateFromLeftOffsetPosition: GetDateFromLeftOffsetPosition;
	getGroupDimensions: (groupId: number) => GroupDimensions | undefined;
	getItemAbsoluteDimensions: (
		itemId: number,
	) => ItemAbsoluteDimensions | undefined;
	getItemDimensions: (itemId: number) => ItemDimensions | undefined;
	getLeftOffsetFromDate: GetLeftOffsetFromDate;
}

export const HelpersContext: Context<HelpersContextValue | undefined> =
	createContext<HelpersContextValue | undefined>(undefined);
