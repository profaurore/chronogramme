import { type PropsWithChildren, type ReactNode, useMemo } from "react";
import type { AnyGroup, AnyItem, AnyKeys } from "../utils/typeUtils";
import { HeadersContext, type HeadersContextValue } from "./HeadersContext";

export const HeadersContextProvider = <
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
>({
	children,
	leftSidebarWidth,
	rightSidebarWidth,
	showPeriod,
	timeSteps,
	timeline,
	timelineUnit,
}: PropsWithChildren<HeadersContextValue<TKeys, TGroup, TItem>>): ReactNode => {
	const contextValue = useMemo<HeadersContextValue<TKeys, TGroup, TItem>>(
		() => ({
			leftSidebarWidth,
			rightSidebarWidth,
			showPeriod,
			timeSteps,
			timeline,
			timelineUnit,
		}),
		[
			leftSidebarWidth,
			rightSidebarWidth,
			showPeriod,
			timeSteps,
			timeline,
			timelineUnit,
		],
	);

	return (
		<HeadersContext.Provider
			value={
				contextValue as unknown as HeadersContextValue<
					AnyKeys,
					AnyGroup<AnyKeys>,
					AnyItem<AnyKeys, AnyGroup<AnyKeys>>
				>
			}
		>
			{children}
		</HeadersContext.Provider>
	);
};
