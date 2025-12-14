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

type GetGroupDimensions<TGroupId> = (
	groupId: TGroupId,
) => GroupDimensions | undefined;

type GetItemAbsoluteDimensions<TItemId> = (
	itemId: TItemId,
) => ItemAbsoluteDimensions | undefined;

type GetItemDimensions<TItemId> = (
	itemId: TItemId,
) => ItemDimensions | undefined;

export interface HelpersContextValue<TGroupId, TItemId> {
	getDateFromLeftOffsetPosition: GetDateFromLeftOffsetPosition;
	getGroupDimensions: GetGroupDimensions<TGroupId>;
	getItemAbsoluteDimensions: GetItemAbsoluteDimensions<TItemId>;
	getItemDimensions: GetItemDimensions<TItemId>;
	getLeftOffsetFromDate: GetLeftOffsetFromDate;
}

export const HelpersContext: Context<
	HelpersContextValue<number, number> | undefined
> = createContext<HelpersContextValue<number, number> | undefined>(undefined);
