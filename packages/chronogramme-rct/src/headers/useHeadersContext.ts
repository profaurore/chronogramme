import { useContext } from "react";
import { HeadersContext } from "./HeadersContext";

export function useHeadersContext() {
	const context = useContext(HeadersContext);

	if (!context) {
		throw new Error(
			"useHeadersContext() must be used within a <HeadersContextProvider />",
		);
	}

	return context;
}
