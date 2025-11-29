import { useMemo } from "react";
import { type Headers, HeadersContext } from "./HeadersContext";

interface HeadersProviderProps extends Headers {
	children?: React.ReactNode | undefined;
}

export const HeadersProvider = ({
	children,
	leftSidebarWidth,
	rightSidebarWidth,
	timeSteps,
}: HeadersProviderProps) => {
	const contextValue = useMemo<Headers>(
		() => ({
			leftSidebarWidth,
			rightSidebarWidth,
			timeSteps,
		}),
		[leftSidebarWidth, rightSidebarWidth, timeSteps],
	);

	return (
		<HeadersContext.Provider value={contextValue}>
			{children}
		</HeadersContext.Provider>
	);
};
