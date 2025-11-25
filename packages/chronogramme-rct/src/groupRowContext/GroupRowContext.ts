import { createContext } from "react";
import type { BaseGroup } from "../timeline";

export interface GroupRow<
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
> {
	group: TGroup;
	groupHeight: number;
	groupPosition: number;
	horizontalLineClassNamesForGroup: ((group: TGroup) => string[]) | undefined;
	isEvenRow: boolean;
	onClick?: ((event: React.MouseEvent) => void) | undefined;
	onContextMenu?: ((event: React.MouseEvent) => void) | undefined;
	onDoubleClick?: ((event: React.MouseEvent) => void) | undefined;
}

export const GroupRowContext = createContext<GroupRow | undefined>(undefined);
