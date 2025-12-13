import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import type { ReactNode, SyntheticEvent } from "react";
import { RowItemsContextProvider } from "../items/RowItemsContextProvider";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
	RowRenderer,
} from "../Timeline";
import { GroupForHelpersContextProvider } from "./GroupForHelpersContextProvider";
import { GroupRowContextProvider } from "./GroupRowContextProvider";

const getRowLayerRootProps = (): { style: Record<string, never> } => ({
	style: {},
});

export const Row = <
	TGroupId,
	TGroupIdKey extends string,
	TGroupTitleKey extends string,
	TGroupRightTitleKey extends string,
	TItemId,
	TItemIdKey extends string,
	TItemGroupKey extends string,
	TItemTitleKey extends string,
	TItemDivTitleKey extends string,
	TItemTimeStartKey extends string,
	TItemTimeEndKey extends string,
	TGroup extends BaseGroup<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey
	>,
	TItem extends BaseItem<
		TGroupId,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData,
>({
	group,
	groupIndex,
	horizontalLineClassNamesForGroup,
	itemHeightRatio,
	onClick,
	onContextMenu,
	onDoubleClick,
	rowData,
	rowRenderer: RowComponent,
	timeline,
}: {
	group: RctToCoreGroup<TGroupId, TGroup>;
	groupIndex: number;
	horizontalLineClassNamesForGroup: ((group: TGroup) => string[]) | undefined;
	itemHeightRatio: number;
	onClick?:
		| ((groupId: TGroupId, time: number, e: SyntheticEvent) => void)
		| undefined;
	onContextMenu?:
		| ((groupId: TGroupId, time: number, e: SyntheticEvent) => void)
		| undefined;
	onDoubleClick?:
		| ((groupId: TGroupId, time: number, e: SyntheticEvent) => void)
		| undefined;
	rowData: TRowData;
	rowRenderer: RowRenderer<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup,
		TRowData
	>;
	timeline: InstanceType<
		typeof HTMLTimeline<
			TGroupId,
			RctToCoreGroup<TGroupId, TGroup>,
			TItemId,
			RctToCoreItem<TGroupId, TItemId, TItem>
		>
	>;
}): ReactNode => (
	<GroupForHelpersContextProvider<
		TGroupId,
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TItemId,
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey,
		TGroup,
		TItem
	>
		group={group}
		index={groupIndex}
		timeline={timeline}
	>
		<GroupRowContextProvider<
			TGroupId,
			TGroupIdKey,
			TGroupTitleKey,
			TGroupRightTitleKey,
			TItemId,
			TItemIdKey,
			TItemGroupKey,
			TItemTitleKey,
			TItemDivTitleKey,
			TItemTimeStartKey,
			TItemTimeEndKey,
			TGroup,
			TItem
		>
			group={group}
			horizontalLineClassNamesForGroup={horizontalLineClassNamesForGroup}
			index={groupIndex}
			key={`group-${group.id}`}
			onClick={onClick}
			onContextMenu={onContextMenu}
			onDoubleClick={onDoubleClick}
			timeline={timeline}
		>
			<RowItemsContextProvider<
				TGroupId,
				TGroupIdKey,
				TGroupTitleKey,
				TGroupRightTitleKey,
				TItemId,
				TItemIdKey,
				TItemGroupKey,
				TItemTitleKey,
				TItemDivTitleKey,
				TItemTimeStartKey,
				TItemTimeEndKey,
				TGroup,
				TItem
			>
				index={groupIndex}
				itemHeightRatio={itemHeightRatio}
				timeline={timeline}
			>
				<RowComponent
					getLayerRootProps={getRowLayerRootProps}
					group={group.originalGroup}
					rowData={rowData}
				/>
			</RowItemsContextProvider>
		</GroupRowContextProvider>
	</GroupForHelpersContextProvider>
);
