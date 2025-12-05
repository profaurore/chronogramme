import { describe, expect, test } from "vitest";
import {
	groupOrderedItems,
	layoutGroupLines,
	layoutGroupLinesReference,
} from "./groupLayout";
import { UNIT } from "./math";
import type { BaseItem } from "./timeline";

describe("layoutGroupLines", () => {
	test("No items returns an empty list of lines", () => {
		expect(layoutGroupLines([], undefined, undefined, 0, 100)).toEqual([]);
	});

	test("Random values match reference implementation", () => {
		const itemCount = 1000;
		const items: BaseItem<number, number>[] = [];

		let min = Number.POSITIVE_INFINITY;
		let max = Number.NEGATIVE_INFINITY;

		for (let i = 0; i < itemCount; i += UNIT) {
			const startTime = Math.random() * 10_000_000 + i * 1_000_000;
			const endTime = startTime + 1_000_000 + Math.random() * 39_000_000;

			items.push({
				endTime,
				groupId: 0,
				id: i,
				startTime,
			});

			min = Math.min(min, endTime);
			max = Math.max(max, startTime);
		}

		items.sort((a, b) => a.startTime - b.startTime);

		// Offsets to test filtering.
		min += UNIT;
		max -= UNIT;

		expect(layoutGroupLines(items, undefined, undefined, min, max)).toEqual(
			layoutGroupLinesReference(items, min, max),
		);

		// for (const [lineIdx, line] of lines.entries()) {
		// 	for (const [itemIdx, item] of line.entries()) {
		// 		const baseItem = referenceLines[lineIdx]?.[itemIdx];

		// 		if (item !== baseItem) {
		// 			// biome-ignore lint/suspicious/noConsole: Logging for debugging.
		// 			console.log("bad item", baseItem?.id, item.id);
		// 		}
		// 	}
		// }
	});
});

describe("groupOrderedItems", () => {
	test("No items returns no groups", () => {
		expect(groupOrderedItems([])).toEqual(new Map([]));
	});

	test("Items are grouped by group ID", () => {
		const group1Item1 = { endTime: 1, id: 1, groupId: 1, startTime: 2 };
		const group1Item2 = { endTime: 1, id: 2, groupId: 1, startTime: 3 };
		const group2Item1 = { endTime: 1, id: 1, groupId: 2, startTime: 0 };
		const group2Item2 = { endTime: 1, id: 2, groupId: 2, startTime: 1 };

		const items = [group2Item2, group1Item1, group2Item1, group1Item2];

		expect(groupOrderedItems(items)).toEqual(
			new Map([
				[1, [group1Item1, group1Item2]],
				[2, [group2Item1, group2Item2]],
			]),
		);
	});
});
