import type { BaseItem } from "./Timeline.ts";
import { MOST_SIGNIFICANT_BIT, UNIT, ZERO } from "./math.ts";

export function layoutGroupRows<
	TGroupId = number,
	TItemId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
>(items: readonly Readonly<TItem>[], min: number, max: number): TItem[][] {
	const rows: TItem[][] = [];
	const rowMaxs: number[] = [];
	const leftMinOfMaxs: number[] = [];
	const rightMinOfMaxs: number[] = [];

	function findInsertIdx(startTime: number): number | undefined {
		// `Math.ceil` is not required because `leftMinOfMaxes` should always
		// contain a power of 2 items.
		const powerOfTwo = Math.log2(leftMinOfMaxs.length);

		let currentIdx = (UNIT << powerOfTwo) - UNIT;
		let selectedIdx: number | undefined;

		for (let power = powerOfTwo; power >= ZERO; power--) {
			const branchMin = leftMinOfMaxs[currentIdx];

			if (branchMin === undefined) {
				break;
			}

			const substep = UNIT << (power - UNIT);

			if (branchMin <= startTime) {
				selectedIdx = currentIdx;
				currentIdx -= substep;
			} else {
				currentIdx += substep;
			}
		}

		return selectedIdx;
	}

	function insertValueAtIdx(updateIdx: number, endTime: number) {
		rowMaxs[updateIdx] = endTime;
		leftMinOfMaxs[updateIdx] = endTime;
		rightMinOfMaxs[updateIdx] = endTime;

		const powerOfTwo = Math.ceil(Math.log2(rowMaxs.length));

		// The power of the update index within the binary tree.
		// From https://stackoverflow.com/a/61442366
		const updateIdxAsInt = (updateIdx + UNIT) | ZERO;
		const updateIdxPower =
			MOST_SIGNIFICANT_BIT - Math.clz32(updateIdxAsInt & -updateIdxAsInt);

		let currentIdx = updateIdx;

		for (let power = updateIdxPower; power <= powerOfTwo; power++) {
			if (power !== ZERO) {
				const substep = UNIT << (power - UNIT);
				const leftSubstep = currentIdx - substep;
				const rightSubstep = currentIdx + substep;

				// biome-ignore lint/style/noNonNullAssertion: Guaranteed by the data.
				const leftOfLeftMin = leftMinOfMaxs[leftSubstep]!;
				// biome-ignore lint/style/noNonNullAssertion: Guaranteed by the data.
				const rightOfLeftMin = rightMinOfMaxs[leftSubstep]!;
				const rowMax = rowMaxs[currentIdx] ?? Number.POSITIVE_INFINITY;
				const rightMin =
					rightMinOfMaxs[rightSubstep] ?? Number.POSITIVE_INFINITY;

				const leftMin = Math.min(leftOfLeftMin, rightOfLeftMin, rowMax);
				leftMinOfMaxs[currentIdx] = leftMin;
				rightMinOfMaxs[currentIdx] = Math.min(leftMin, rowMax, rightMin);
			}

			// Uses the paper folding sequence  to determine which branch of a node
			// the index is in.
			const isRightBranch = paperFoldingSequenceTerm(currentIdx);
			currentIdx += (isRightBranch ? -UNIT : UNIT) * (UNIT << power);
		}
	}

	const filteredItems = items.filter((item) => {
		return item.startTime < max && item.endTime > min;
	});
	filteredItems.sort((a, b) => a.startTime - b.startTime);

	for (const item of filteredItems) {
		let insertIdx = findInsertIdx(item.startTime);
		let row = rows[insertIdx ?? -UNIT];

		if (insertIdx === undefined || row === undefined) {
			insertIdx = rows.length;

			row = [];
			rows.push(row);
		}

		row.push(item);

		insertValueAtIdx(insertIdx, item.endTime);
	}

	return rows;
}

// Paper folding sequence (https://oeis.org/A014707)
function paperFoldingSequenceTerm(n: number): boolean {
	return n % 4 !== 0 && (n % 4 === 2 || paperFoldingSequenceTerm((n - 1) / 2));
}

// Very inefficient for larger item counts. Only use for testing.
export function layoutGroupRowsReference<
	TGroupId = number,
	TItemId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
>(items: readonly Readonly<TItem>[], min: number, max: number): TItem[][] {
	const rows: TItem[][] = [];

	const filteredItems = items.filter((item) => {
		return item.startTime < max && item.endTime > min;
	});
	filteredItems.sort((a, b) => a.startTime - b.startTime);

	for (const item of filteredItems) {
		const startTime = item.startTime;

		let row = rows.find((row) => {
			const lastItem = row[row.length - 1];

			return lastItem && lastItem.endTime <= startTime;
		});

		if (row === undefined) {
			row = [];
			rows.push(row);
		}

		row.push(item);
	}

	return rows;
}

export function groupOrderedItems<
	TGroupId = number,
	TItemId = number,
	TItem extends BaseItem<TItemId, TGroupId> = BaseItem<TItemId, TGroupId>,
>(items: readonly Readonly<TItem>[]): Map<TGroupId, TItem[]> {
	const orderedItemsByGroup = Map.groupBy(items, (item) => item.groupId);

	for (const items of orderedItemsByGroup.values()) {
		items.sort((a, b) => a.startTime - b.startTime);
	}

	return orderedItemsByGroup;
}
