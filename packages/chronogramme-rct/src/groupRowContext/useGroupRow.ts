import { useContext } from "react";
import type { BaseGroup } from "../timeline";
import { type GroupRow, GroupRowContext } from "./GroupRowContext";

export function useGroupRow<
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
>() {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(GroupRowContext) as unknown as GroupRow<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup
	>;

	if (!context) {
		throw new Error("useGroupRow() must be used within a <GroupRowProvider />");
	}

	return context;
}
