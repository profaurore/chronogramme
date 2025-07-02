import type { EventHandler, SyntheticEvent } from "react";

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
