import { useMemo } from "react";
import type { BaseGroup } from "../timeline";
import { type GroupRow, GroupRowContext } from "./GroupRowContext";

interface GroupRowProviderProps<
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
> extends GroupRow<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey, TGroup> {
	children?: React.ReactNode | undefined;
}

export const GroupRowProvider = <
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
>({
	children,
	group,
	groupHeight,
	groupPosition,
	horizontalLineClassNamesForGroup,
	isEvenRow,
	onClick,
	onContextMenu,
	onDoubleClick,
}: GroupRowProviderProps<
	TGroupIdKey,
	TGroupTitleKey,
	TGroupRightTitleKey,
	TGroup
>) => {
	const contextValue = useMemo<
		GroupRow<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey, TGroup>
	>(
		() => ({
			group,
			groupHeight,
			groupPosition,
			horizontalLineClassNamesForGroup,
			isEvenRow,
			onClick,
			onContextMenu,
			onDoubleClick,
		}),
		[
			group,
			groupHeight,
			groupPosition,
			horizontalLineClassNamesForGroup,
			isEvenRow,
			onClick,
			onContextMenu,
			onDoubleClick,
		],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<GroupRowContext.Provider value={contextValue as unknown as GroupRow}>
			{children}
		</GroupRowContext.Provider>
	);
};
