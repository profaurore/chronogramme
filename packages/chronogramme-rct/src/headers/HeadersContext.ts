import { type Context, createContext } from "react";
import type { TimeSteps } from "../Timeline";
import type {
	AnyGroup,
	AnyItem,
	AnyKeys,
	CoreTimeline,
} from "../utils/typeUtils";
import type { ShowPeriod } from "./CustomHeader";
import type { Unit } from "./DateHeader";

type SetMaxHeight = (maxHeight: number) => void;

export interface HeadersContextValue<
	TKeys extends AnyKeys,
	TGroup extends AnyGroup<TKeys>,
	TItem extends AnyItem<TKeys, TGroup>,
> {
	leftSidebarWidth: number;
	rightSidebarWidth: number;
	setMaxHeight: SetMaxHeight;
	showPeriod: ShowPeriod;
	timeSteps: TimeSteps;
	timeline: CoreTimeline<TKeys, TGroup, TItem>;
	timelineUnit: Unit;
}

export const HeadersContext: Context<
	| HeadersContextValue<
			AnyKeys,
			AnyGroup<AnyKeys>,
			AnyItem<AnyKeys, AnyGroup<AnyKeys>>
	  >
	| undefined
> = createContext<
	| HeadersContextValue<
			AnyKeys,
			AnyGroup<AnyKeys>,
			AnyItem<AnyKeys, AnyGroup<AnyKeys>>
	  >
	| undefined
>(undefined);
