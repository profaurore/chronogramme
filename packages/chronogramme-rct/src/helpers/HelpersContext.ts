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

export interface HelpersContextValue<TGroupId, TItemId> {
	getDateFromLeftOffsetPosition: GetDateFromLeftOffsetPosition;
	getGroupDimensions: (groupId: TGroupId) => GroupDimensions | undefined;
	getItemAbsoluteDimensions: (
		itemId: TItemId,
	) => ItemAbsoluteDimensions | undefined;
	getItemDimensions: (itemId: TItemId) => ItemDimensions | undefined;
	getLeftOffsetFromDate: GetLeftOffsetFromDate;
}

export const HelpersContext: Context<
	HelpersContextValue<number, number> | undefined
> = createContext<HelpersContextValue<number, number> | undefined>(undefined);
