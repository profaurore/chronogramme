import { HALF, UNIT, ZERO } from "./math.ts";

export const BINARY_SEARCH_EQUALS = 0x1;
export const BINARY_SEARCH_LESS_THAN = 0x2;

export function binarySearch<TItem>(
	items: TItem[],
	value: number,
	mode: number,
	getValue: (item: TItem) => number | undefined,
): number {
	const equalsMode = mode & BINARY_SEARCH_EQUALS;
	const lessThanMode = mode & BINARY_SEARCH_LESS_THAN;

	let low = ZERO;
	let high = items.length - UNIT;
	let result = -UNIT;

	while (low <= high) {
		const middle = Math.floor(HALF * low + HALF * high);

		const item = items[middle];
		if (!item) {
			return -UNIT;
		}

		const itemValue = getValue(item);
		if (itemValue === undefined) {
			return -UNIT;
		}

		if (itemValue > value) {
			high = middle - UNIT;
		} else if (itemValue < value) {
			low = middle + UNIT;

			if (lessThanMode) {
				result = middle;
			}
		} else {
			high = middle - UNIT;

			if (equalsMode) {
				result = middle;
			}
		}
	}

	return result;
}
