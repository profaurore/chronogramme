import type { Timeline as HTMLTimeline } from "@chronogramme/chronogramme";
import type { SyntheticEvent } from "react";
import { RowItemsContextProvider } from "../items/RowItemsContextProvider";
import type {
	BaseGroup,
	BaseItem,
	RctToCoreGroup,
	RctToCoreItem,
	RowRenderer,
} from "../timeline";
import { GroupForHelpersContextProvider } from "./GroupForHelpersContextProvider";
import { GroupRowContextProvider } from "./GroupRowContextProvider";

const getRowLayerRootProps = (): { style: Record<string, never> } => ({
	style: {},
});

export const Row = <
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
	TItem extends BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	> = BaseItem<
		TItemIdKey,
		TItemGroupKey,
		TItemTitleKey,
		TItemDivTitleKey,
		TItemTimeStartKey,
		TItemTimeEndKey
	>,
	TRowData = undefined,
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
	group: RctToCoreGroup<TGroup>;
	groupIndex: number;
	horizontalLineClassNamesForGroup: ((group: TGroup) => string[]) | undefined;
	itemHeightRatio: number;
	onClick?:
		| ((groupId: number, time: number, e: SyntheticEvent) => void)
		| undefined;
	onContextMenu?:
		| ((groupId: number, time: number, e: SyntheticEvent) => void)
		| undefined;
	onDoubleClick?:
		| ((groupId: number, time: number, e: SyntheticEvent) => void)
		| undefined;
	rowData: TRowData;
	rowRenderer: RowRenderer<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
		TGroup,
		TRowData
	>;
	timeline: InstanceType<
		typeof HTMLTimeline<
			number,
			RctToCoreGroup<TGroup>,
			number,
			RctToCoreItem<TItem>
		>
	>;
}): React.ReactNode => (
	<GroupForHelpersContextProvider<
		TGroupIdKey,
		TGroupTitleKey,
		TGroupRightTitleKey,
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
			TGroupIdKey,
			TGroupTitleKey,
			TGroupRightTitleKey,
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
				TGroupIdKey,
				TGroupTitleKey,
				TGroupRightTitleKey,
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
