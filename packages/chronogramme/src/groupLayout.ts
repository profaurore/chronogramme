import { MOST_SIGNIFICANT_BIT, UNIT, ZERO } from "./math";
import type { BaseItem } from "./timeline";

// Paper folding sequence (https://oeis.org/A014707)
function paperFoldingSequenceTerm(n: number): boolean {
	// biome-ignore lint/style/noMagicNumbers: Mathematical formula.
	return n % 4 !== 0 && (n % 4 === 2 || paperFoldingSequenceTerm((n - 1) / 2));
}

export function layoutGroupLines<
	TGroupId,
	TItemId,
	TItem extends BaseItem<TGroupId, TItemId>,
>(
	items: readonly Readonly<TItem>[],
	draggedItemInit: TItem | undefined,
	draggedItem: TItem | undefined,
	min: number,
	max: number,
): TItem[][] {
	const lines: TItem[][] = [];
	const linesMaxs: number[] = [];
	const leftMinOfMaxs: number[] = [];
	const rightMinOfMaxs: number[] = [];

	function findInsertIdx(startTime: number): number | undefined {
		// `Math.ceil` is not required because `leftMinOfMaxes` should always
		// contain a power of 2 items.
		const powerOfTwo = Math.log2(leftMinOfMaxs.length);

		let currentIdx = (UNIT << powerOfTwo) - UNIT;
		let selectedIdx: number | undefined;

		for (let power = powerOfTwo; power >= ZERO; power -= UNIT) {
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

	function insertValueAtIdx(updateIdx: number, endTime: number): void {
		linesMaxs[updateIdx] = endTime;
		leftMinOfMaxs[updateIdx] = endTime;
		rightMinOfMaxs[updateIdx] = endTime;

		const powerOfTwo = Math.ceil(Math.log2(linesMaxs.length));

		// The power of the update index within the binary tree.
		// From https://stackoverflow.com/a/61442366
		const updateIdxAsInt = (updateIdx + UNIT) | ZERO;
		const updateIdxPower =
			MOST_SIGNIFICANT_BIT - Math.clz32(updateIdxAsInt & -updateIdxAsInt);

		let currentIdx = updateIdx;

		for (let power = updateIdxPower; power <= powerOfTwo; power += UNIT) {
			if (power !== ZERO) {
				const substep = UNIT << (power - UNIT);
				const leftSubstep = currentIdx - substep;
				const rightSubstep = currentIdx + substep;

				// biome-ignore lint/style/noNonNullAssertion: Guaranteed by the data.
				const leftOfLeftMin = leftMinOfMaxs[leftSubstep]!;
				// biome-ignore lint/style/noNonNullAssertion: Guaranteed by the data.
				const rightOfLeftMin = rightMinOfMaxs[leftSubstep]!;
				const lineMax = linesMaxs[currentIdx] ?? Number.POSITIVE_INFINITY;
				const rightMin =
					rightMinOfMaxs[rightSubstep] ?? Number.POSITIVE_INFINITY;

				const leftMin = Math.min(leftOfLeftMin, rightOfLeftMin, lineMax);
				leftMinOfMaxs[currentIdx] = leftMin;
				rightMinOfMaxs[currentIdx] = Math.min(leftMin, lineMax, rightMin);
			}

			// Uses the paper folding sequence  to determine which branch of a node
			// the index is in.
			const isRightBranch = paperFoldingSequenceTerm(currentIdx);
			currentIdx += (isRightBranch ? -UNIT : UNIT) * (UNIT << power);
		}
	}

	const filteredItems: TItem[] = [];

	for (const item of items) {
		if (
			item.startTime < max &&
			item.endTime > min &&
			item !== draggedItemInit
		) {
			filteredItems.push(item);
		}
	}

	if (
		draggedItem !== undefined &&
		draggedItem.startTime < max &&
		draggedItem.endTime > min
	) {
		filteredItems.push(draggedItem);
	}

	// TODO: Implement a manual algorithm (heap sort).
	filteredItems.sort((a, b) => a.startTime - b.startTime);

	for (const item of filteredItems) {
		let insertIdx = findInsertIdx(item.startTime);
		let line = lines[insertIdx ?? -UNIT];

		if (insertIdx === undefined || line === undefined) {
			insertIdx = lines.length;

			line = [];
			lines.push(line);
		}

		line.push(item);

		insertValueAtIdx(insertIdx, item.endTime);
	}

	return lines;
}

// Very inefficient for larger item counts. Only use for testing.
export function layoutGroupLinesReference<
	TGroupId,
	TItemId,
	TItem extends BaseItem<TGroupId, TItemId>,
>(items: readonly Readonly<TItem>[], min: number, max: number): TItem[][] {
	const lines: TItem[][] = [];

	const filteredItems = items.filter(
		(item) => item.startTime < max && item.endTime > min,
	);
	filteredItems.sort((a, b) => a.startTime - b.startTime);

	for (const item of filteredItems) {
		const startTime = item.startTime;

		let line = lines.find((r) => {
			const lastItem = r.at(-1);

			return lastItem && lastItem.endTime <= startTime;
		});

		if (line === undefined) {
			line = [];
			lines.push(line);
		}

		line.push(item);
	}

	return lines;
}

export function groupOrderedItems<
	TGroupId,
	TItemId,
	TItem extends BaseItem<TGroupId, TItemId>,
>(items: readonly Readonly<TItem>[]): Map<TGroupId, TItem[]> {
	const orderedItemsByGroup = Map.groupBy(items, (item) => item.groupId);

	for (const groupItems of orderedItemsByGroup.values()) {
		groupItems.sort((a, b) => a.startTime - b.startTime);
	}

	return orderedItemsByGroup;
}
