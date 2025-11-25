import { useGroupRow } from "./groupRowContext/useGroupRow";
import type { BaseGroup } from "./timeline";
import { useTimelineState } from "./timelineStateContext/useTimelineState";

interface GroupRowProps {
	children: React.ReactNode | undefined;
}

export const GroupRow = <
	TGroupIdKey extends string = "id",
	TGroupTitleKey extends string = "title",
	TGroupRightTitleKey extends string = "rightTitle",
	TItemIdKey extends string = "id",
	TItemGroupKey extends string = "group",
	TItemTitleKey extends string = "title",
	TItemDivTitleKey extends string = "title",
	TItemTimeStartKey extends string = "start_time",
	TItemTimeEndKey extends string = "end_time",
	TGroup extends BaseGroup<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	> = BaseGroup<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey>,
>({
	children,
}: GroupRowProps) => {
	const { keys } = useTimelineState<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>();
	const {
		group,
		groupHeight,
		groupPosition,
		horizontalLineClassNamesForGroup,
		isEvenRow,
		onClick,
		onContextMenu,
		onDoubleClick,
	} = useGroupRow<TGroupIdKey, TGroupTitleKey, TGroupRightTitleKey, TGroup>();

	const classNamesForGroup = horizontalLineClassNamesForGroup?.(group) ?? [];

	const className =
		"rct-hl " +
		(isEvenRow ? "rct-hl-even " : "rct-hl-odd ") +
		(classNamesForGroup ? classNamesForGroup.join(" ") : "");

	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Original implementation
		// biome-ignore lint/a11y/noStaticElementInteractions: Original implementation
		// biome-ignore lint/a11y/useKeyWithClickEvents: Original implementation
		<div
			className={className}
			data-groupid={group[keys.groupIdKey]}
			data-testid="groupRow"
			onClick={onClick}
			onContextMenu={onContextMenu}
			onDoubleClick={onDoubleClick}
			style={{
				height: `${groupHeight.toFixed(4)}px`,
				left: "0px",
				position: "absolute",
				right: "0px",
				top: `${groupPosition.toFixed(4)}px`,
			}}
		>
			{children}
		</div>
	);
};
