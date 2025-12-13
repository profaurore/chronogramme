import { type Context, createContext, type MouseEvent } from "react";

export interface GroupRowContextValue<TGroupId> {
	className: string;
	id: TGroupId;
	onClick: ((event: MouseEvent) => void) | undefined;
	onContextMenu: ((event: MouseEvent) => void) | undefined;
	onDoubleClick: ((event: MouseEvent) => void) | undefined;
	position: number;
	size: number;
}

export const GroupRowContext: Context<
	GroupRowContextValue<number> | undefined
> = createContext<GroupRowContextValue<number> | undefined>(undefined);
