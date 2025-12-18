import { type PropsWithChildren, type ReactNode, useMemo } from "react";
import type { AnyGroup, AnyItem, AnyKeys } from "../utils/typeUtils";
import { ItemContext, type ItemContextVariable } from "./ItemContext";

export const ItemContextProvider = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>({
	canMove,
	canResizeLeft,
	canResizeRight,
	canSelect,
	children,
	itemDragState,
	itemRenderer,
	itemResizeState,
	keys,
	minResizeWidth,
	onClick,
	onContextMenu,
	onDoubleClick,
	onSelect,
	selected,
	selectedItemId,
	setSelectedItemId,
	timeline,
}: PropsWithChildren<ItemContextVariable<TKeys, TGroup, TItem>>): ReactNode => {
	const contextValue = useMemo<ItemContextVariable<TKeys, TGroup, TItem>>(
		() => ({
			canMove,
			canResizeLeft,
			canResizeRight,
			canSelect,
			itemDragState,
			itemRenderer,
			itemResizeState,
			keys,
			minResizeWidth,
			onClick,
			onContextMenu,
			onDoubleClick,
			onSelect,
			selected,
			selectedItemId,
			setSelectedItemId,
			timeline,
		}),
		[
			canMove,
			canResizeLeft,
			canResizeRight,
			canSelect,
			itemDragState,
			itemRenderer,
			itemResizeState,
			keys,
			minResizeWidth,
			onClick,
			onContextMenu,
			onDoubleClick,
			onSelect,
			selected,
			selectedItemId,
			setSelectedItemId,
			timeline,
		],
	);

	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	return (
		<ItemContext.Provider
			value={
				contextValue as unknown as ItemContextVariable<
					AnyKeys,
					AnyGroup<AnyKeys>,
					AnyItem<AnyKeys, AnyGroup<AnyKeys>>
				>
			}
		>
			{children}
		</ItemContext.Provider>
	);
};
