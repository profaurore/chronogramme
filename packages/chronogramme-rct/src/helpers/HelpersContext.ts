import { type Context, createContext } from "react";
import type { UnsupportedType } from "../utils/unsupportedUtils";

export interface ItemDimensions {
	collisionLeft: number;
	collisionWidth: number;
	height: number;
	left: number;
	top: number;
	width: number;
}

export interface ItemAbsoluteDimensions {
	left: number;
	top: number;
	width: number;
}

export interface GroupDimensions {
	height: number;
	top: number;
}

export type GetLeftOffsetFromDate = (date: number) => number;

export type GetDateFromLeftOffsetPosition = (date: number) => number;

export type GetGroupDimensions<TGroupId> = (
	groupId: TGroupId,
) => GroupDimensions | undefined;

export type GetItemAbsoluteDimensions<TItemId> = (
	itemId: TItemId,
) => ItemAbsoluteDimensions | undefined;

export type GetItemDimensions<TItemId> = (
	itemId: TItemId,
) => ItemDimensions | undefined;

export interface HelpersContextValue<TGroupId, TItemId> {
	getDateFromLeftOffsetPosition: GetDateFromLeftOffsetPosition;
	getGroupDimensions: GetGroupDimensions<TGroupId>;
	getItemAbsoluteDimensions: GetItemAbsoluteDimensions<TItemId>;
	getItemDimensions: GetItemDimensions<TItemId>;
	getLeftOffsetFromDate: GetLeftOffsetFromDate;
}

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `SidebarHeaderChildProps` instead.
 */
export type HelpersContextValues<TGroupId, TItemId> = UnsupportedType<
	HelpersContextValue<TGroupId, TItemId>,
	"Use `HelpersContextValue` instead."
>;

export const HelpersContext: Context<
	HelpersContextValue<number, number> | undefined
> = createContext<HelpersContextValue<number, number> | undefined>(undefined);
