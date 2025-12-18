import type { ReactNode, SyntheticEvent } from "react";
import { RowItemsContextProvider } from "../items/RowItemsContextProvider";
import type { HorizontalClassNamesForGroup, RowRenderer } from "../Timeline";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
	RctToCoreGroup,
} from "../utils/typeUtils";
import { GroupForHelpersContextProvider } from "./GroupForHelpersContextProvider";
import { GroupRowContextProvider } from "./GroupRowContextProvider";

const getRowLayerRootProps = (): { style: Record<string, never> } => ({
	style: {},
});

interface RowProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
	TRowData,
> {
	group: RctToCoreGroup<TKeys, TGroup>;
	groupIndex: number;
	horizontalLineClassNamesForGroup:
		| HorizontalClassNamesForGroup<TKeys, TGroup>
		| undefined;
	itemHeightRatio: number;
	itemsWithInteractions: readonly Readonly<TItem>[];
	onClick?:
		| ((groupId: TGroup["id"], time: number, e: SyntheticEvent) => void)
		| undefined;
	onContextMenu?:
		| ((groupId: TGroup["id"], time: number, e: SyntheticEvent) => void)
		| undefined;
	onDoubleClick?:
		| ((groupId: TGroup["id"], time: number, e: SyntheticEvent) => void)
		| undefined;
	rowData: TRowData;
	rowRenderer: RowRenderer<TKeys, TGroup, TItem, TRowData>;
	timeline: CoreTimeline<TKeys, TGroup, TItem>;
}

export const Row = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
	TRowData,
>({
	group,
	groupIndex,
	horizontalLineClassNamesForGroup,
	itemHeightRatio,
	itemsWithInteractions,
	onClick,
	onContextMenu,
	onDoubleClick,
	rowData,
	rowRenderer: RowRendererComponent,
	timeline,
}: RowProps<TKeys, TGroup, TItem, TRowData>): ReactNode => (
	<GroupForHelpersContextProvider<TKeys, TGroup, TItem>
		group={group}
		index={groupIndex}
		timeline={timeline}
	>
		<GroupRowContextProvider<TKeys, TGroup, TItem>
			group={group}
			horizontalLineClassNamesForGroup={horizontalLineClassNamesForGroup}
			index={groupIndex}
			key={`group-${group.id}`}
			onClick={onClick}
			onContextMenu={onContextMenu}
			onDoubleClick={onDoubleClick}
			timeline={timeline}
		>
			<RowItemsContextProvider<TKeys, TGroup, TItem>
				index={groupIndex}
				itemHeightRatio={itemHeightRatio}
				timeline={timeline}
			>
				<RowRendererComponent
					getLayerRootProps={getRowLayerRootProps}
					group={group.originalGroup}
					itemsWithInteractions={itemsWithInteractions}
					rowData={rowData}
				/>
			</RowItemsContextProvider>
		</GroupRowContextProvider>
	</GroupForHelpersContextProvider>
);
