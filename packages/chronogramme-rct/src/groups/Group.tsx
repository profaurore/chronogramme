import { EVEN_MULTIPLE, ZERO } from "@chronogramme/chronogramme";
import type { ReactNode } from "react";
import { STYLE_SIZE_PRECISION } from "../constants";
import type { GroupRenderer } from "../Timeline";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
	RctToCoreGroup,
} from "../utils/typeUtils";
import { GroupForHelpersContextProvider } from "./GroupForHelpersContextProvider";

interface GroupProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
	TRowData,
> {
	group: RctToCoreGroup<TKeys, TGroup>;
	groupIndex: number;
	groupRenderer: GroupRenderer<TKeys, TGroup, TRowData>;
	isRightSidebar?: boolean | undefined;
	rowData: TRowData;
	timeline: CoreTimeline<TKeys, TGroup, TItem>;
}

export const Group = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
	TRowData,
>({
	group,
	groupIndex,
	groupRenderer: GroupRendererComponent,
	isRightSidebar,
	rowData,
	timeline,
}: GroupProps<TKeys, TGroup, TItem, TRowData>): ReactNode => {
	const groupPosition = timeline.getGroupPosition(groupIndex);
	const groupSize = timeline.getGroupSize(groupIndex);

	return (
		<div
			key={String(group.id)}
			className={
				"rct-sidebar-row rct-sidebar-row-" +
				(groupIndex % EVEN_MULTIPLE === ZERO ? "even" : "odd")
			}
			style={{
				height: `${groupSize.toFixed(STYLE_SIZE_PRECISION)}px`,
				left: "0px",
				lineHeight: `${groupSize.toFixed(STYLE_SIZE_PRECISION)}px`,
				position: "absolute",
				right: "0px",
				top: `${groupPosition.toFixed(STYLE_SIZE_PRECISION)}px`,
			}}
		>
			<GroupForHelpersContextProvider<TKeys, TGroup, TItem>
				group={group}
				index={groupIndex}
				timeline={timeline}
			>
				<GroupRendererComponent
					group={group.originalGroup}
					isRightSidebar={isRightSidebar}
					rowData={rowData}
				/>
			</GroupForHelpersContextProvider>
		</div>
	);
};
