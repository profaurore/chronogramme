import { createContext } from "react";
import type { TimeSteps } from "../timeline";

export interface Headers {
	leftSidebarWidth: number;
	rightSidebarWidth: number;
	timeSteps: TimeSteps;
}

export const HeadersContext = createContext<Headers | undefined>(undefined);
