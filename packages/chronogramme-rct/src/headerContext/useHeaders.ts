import { useContext } from "react";
import { HeadersContext } from "./HeadersContext";

export function useHeaders() {
	const context = useContext(HeadersContext);

	if (!context) {
		throw new Error("useHeaders() must be used within a <HeadersProvider />");
	}

	return context;
}
