import { UNIT, ZERO } from "@chronogramme/chronogramme";
import { type EventHandler, type SyntheticEvent, useReducer } from "react";

const RENDER_WRAP_BITMASK = 0xff;

export function composeEvents<TEvent>(
	...fns: (EventHandler<SyntheticEvent<TEvent>> | undefined)[]
): EventHandler<SyntheticEvent<TEvent>> {
	return (event: React.SyntheticEvent<TEvent>) => {
		event.preventDefault();
		for (const fn of fns) {
			fn?.(event);
		}
	};
}

export function useRender(): [number, () => void] {
	return useReducer((x) => (x + UNIT) & RENDER_WRAP_BITMASK, ZERO);
}

export function reactChildHasSecretKey(
	child: unknown,
	secretKey: string,
): boolean {
	return (
		child !== null &&
		typeof child === "object" &&
		"type" in child &&
		child.type !== null &&
		typeof child.type === "object" &&
		"secretKey" in child.type &&
		child.type.secretKey === secretKey
	);
}

export function getReactChildProp<T>(
	child: unknown,
	property: string,
): T | undefined {
	return child !== null &&
		typeof child === "object" &&
		"props" in child &&
		child.props !== null &&
		typeof child.props === "object" &&
		property in child.props
		? ((child.props as Record<string, unknown>)[property] as T | undefined)
		: undefined;
}
