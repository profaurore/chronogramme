import { useContext, useMemo } from "react";
import { GroupForHelpersContext } from "../groups/GroupForHelpersContext";
import { ItemForHelpersContext } from "../items/ItemForHelpersContext";
import { UnsupportedPropertyValueError } from "../utils/unsupportedUtils";
import { HelpersContext, type HelpersContextValue } from "./HelpersContext";

export function useHelpersContext<TGroupId, TItemId>(): HelpersContextValue<
	TGroupId,
	TItemId
> {
	// Unfortunate type cast to handle the trickiness of creating context
	// providers with generics.
	const context = useContext(HelpersContext) as unknown as HelpersContextValue<
		TGroupId,
		TItemId
	>;

	const groupForHelpersContext = useContext(GroupForHelpersContext);
	const itemForHelpersContext = useContext(ItemForHelpersContext);

	const mergedContext = useMemo(
		() => ({
			...context,

			getGroupDimensions: (groupId: TGroupId) => {
				if (groupId !== groupForHelpersContext?.id) {
					throw new UnsupportedPropertyValueError(
						"getGroupDimensions() must be used within the group renderer for the provided identifier",
						"groupId",
						groupId,
					);
				}

				return {
					top: groupForHelpersContext.position,
					height: groupForHelpersContext.size,
				};
			},

			getItemAbsoluteDimensions: (itemId: TItemId) => {
				if (itemId !== itemForHelpersContext?.id) {
					throw new UnsupportedPropertyValueError(
						"getItemAbsoluteDimensions() must be used within the item renderer for the provided identifier",
						"itemId",
						itemId,
					);
				}

				return {
					left: itemForHelpersContext.renderedHStartPos,
					top: itemForHelpersContext.renderedVStartPos,
					width: itemForHelpersContext.renderedHSize,
				};
			},

			getItemDimensions: (itemId: TItemId) => {
				if (itemId !== itemForHelpersContext?.id) {
					throw new UnsupportedPropertyValueError(
						"getItemDimensions() must be used within the item renderer for the provided identifier",
						"itemId",
						itemId,
					);
				}

				return {
					collisionLeft: itemForHelpersContext.startTime,
					collisionWidth: itemForHelpersContext.range,
					height: itemForHelpersContext.renderedVSize,
					left: itemForHelpersContext.renderedHStartPos,
					top: itemForHelpersContext.renderedVStartPosInGroup,
					width: itemForHelpersContext.renderedHSize,
				};
			},
		}),
		[context, groupForHelpersContext, itemForHelpersContext],
	);

	if (!context) {
		throw new Error(
			"useHelpersContext() must be used within a <HelpersContextProvider />",
		);
	}

	return mergedContext;
}
