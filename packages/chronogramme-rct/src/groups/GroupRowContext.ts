import { type Context, createContext, type MouseEvent } from "react";

export interface GroupRowContextValue {
	className: string;
	id: number;
	onClick: ((event: MouseEvent) => void) | undefined;
	onContextMenu: ((event: MouseEvent) => void) | undefined;
	onDoubleClick: ((event: MouseEvent) => void) | undefined;
	position: number;
	size: number;
}

export const GroupRowContext: Context<GroupRowContextValue | undefined> =
	createContext<GroupRowContextValue | undefined>(undefined);
