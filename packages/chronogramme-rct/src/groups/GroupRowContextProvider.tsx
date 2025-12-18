import { EVEN_MULTIPLE, ZERO } from "@chronogramme/chronogramme";
import {
	type MouseEvent,
	type ReactNode,
	type SyntheticEvent,
	useMemo,
} from "react";
import type { HorizontalClassNamesForGroup } from "../Timeline";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
	RctToCoreGroup,
} from "../utils/typeUtils";
import { GroupRowContext, type GroupRowContextValue } from "./GroupRowContext";
import { useGroupForHelpersContext } from "./useGroupForHelpersContext";

interface GroupRowProviderProps<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	children?: ReactNode | undefined;
	group: RctToCoreGroup<TKeys, TGroup>;
	horizontalLineClassNamesForGroup:
		| HorizontalClassNamesForGroup<TKeys, TGroup>
		| undefined;
	index: number;
	onClick?:
		| ((groupId: TGroup["id"], time: number, e: SyntheticEvent) => void)
		| undefined;
	onContextMenu?:
		| ((groupId: TGroup["id"], time: number, e: SyntheticEvent) => void)
		| undefined;
	onDoubleClick?:
		| ((groupId: TGroup["id"], time: number, e: SyntheticEvent) => void)
		| undefined;
	timeline: CoreTimeline<TKeys, TGroup, TItem>;
}

export const GroupRowContextProvider = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>({
	children,
	group,
	horizontalLineClassNamesForGroup,
	index,
	onClick,
	onContextMenu,
	onDoubleClick,
	timeline,
}: GroupRowProviderProps<TKeys, TGroup, TItem>): ReactNode => {
	const { position, size } = useGroupForHelpersContext();

	const id = group.id;
	const originalGroup = group.originalGroup;
	const className =
		"rct-hl " +
		(index % EVEN_MULTIPLE === ZERO ? "rct-hl-even " : "rct-hl-odd ") +
		horizontalLineClassNamesForGroup?.(originalGroup)?.join(" ");

	const contextValue = useMemo<GroupRowContextValue<TGroup["id"]>>(
		() => ({
			className,
			id,
			onClick(event: MouseEvent): void {
				onClick?.(id, timeline.getHValueFromClient(event.clientX), event);
			},
			onContextMenu(event: MouseEvent): void {
				onContextMenu?.(id, timeline.getHValueFromClient(event.clientX), event);
			},
			onDoubleClick(event: MouseEvent): void {
				onDoubleClick?.(id, timeline.getHValueFromClient(event.clientX), event);
			},
			position,
			size,
		}),
		[
			className,
			id,
			onClick,
			onContextMenu,
			onDoubleClick,
			position,
			size,
			timeline,
		],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<GroupRowContext.Provider
			value={contextValue as unknown as GroupRowContextValue<number>}
		>
			{children}
		</GroupRowContext.Provider>
	);
};
