import { type Context, createContext } from "react";

export interface GroupRowContextValue {
	className: string;
	id: number;
	onClick: ((event: React.MouseEvent) => void) | undefined;
	onContextMenu: ((event: React.MouseEvent) => void) | undefined;
	onDoubleClick: ((event: React.MouseEvent) => void) | undefined;
	position: number;
	size: number;
}

export const GroupRowContext: Context<GroupRowContextValue | undefined> =
	createContext<GroupRowContextValue | undefined>(undefined);
