import { UNIT, ZERO } from "@chronogramme/chronogramme";
import { type EventHandler, type SyntheticEvent, useReducer } from "react";

export function composeEvents<TEvent>(
	...fns: (EventHandler<SyntheticEvent<TEvent>> | undefined)[]
): EventHandler<SyntheticEvent<TEvent>> {
	return (event, ...args) => {
		event.preventDefault();
		for (const fn of fns) {
			fn?.(event, ...args);
		}
	};
}

const RENDER_WRAP_BITMASK = 0xff;

export function useRender(): [number, () => void] {
	return useReducer((x) => (x + UNIT) & RENDER_WRAP_BITMASK, ZERO);
}
