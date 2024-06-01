import type { ResizeStrategy, SideResizeStrategy } from "./stickyBarState";

import { UNIT, ZERO, clampMaxWins } from "./math";

interface FlexSegment {
	idealSize: number | undefined;
	max: number;
	min: number;
}

const flexSegments = (
	segments: readonly [
		Readonly<FlexSegment>,
		Readonly<FlexSegment>,
		Readonly<FlexSegment>,
	],
	targetSize: number,
): [number | undefined, number | undefined, number | undefined] => {
	const segment0 = segments[0];
	const segment1 = segments[1];
	const segment2 = segments[2];

	const segment0IdealSize = segment0.idealSize;
	const segment1IdealSize = segment1.idealSize;
	const segment2IdealSize = segment2.idealSize;

	interface CalculationFlexSegment {
		factor: number;
		max: number;
		min: number;
		size: number;
	}

	const localSegments: [
		CalculationFlexSegment,
		CalculationFlexSegment,
		CalculationFlexSegment,
	] = [
		segment0IdealSize === undefined
			? { factor: ZERO, max: ZERO, min: ZERO, size: ZERO }
			: {
					factor: segment0IdealSize,
					max: segment0.max,
					min: segment0.min,
					size: segment0IdealSize,
				},
		segment1IdealSize === undefined
			? { factor: ZERO, max: ZERO, min: ZERO, size: ZERO }
			: {
					factor: segment1IdealSize,
					max: segment1.max,
					min: segment1.min,
					size: segment1IdealSize,
				},
		segment2IdealSize === undefined
			? { factor: ZERO, max: ZERO, min: ZERO, size: ZERO }
			: {
					factor: segment2IdealSize,
					max: segment2.max,
					min: segment2.min,
					size: segment2IdealSize,
				},
	];

	// This array and `segments` will reference the same objects.
	const sortableSegments = localSegments.slice();

	let numFlexibleSegments = localSegments.reduce(
		(acc, segment) => acc + Math.abs(Math.sign(segment.factor)),
		ZERO,
	);

	let usedRemainingSize = true;

	while (numFlexibleSegments > ZERO && usedRemainingSize) {
		// Sort the segments from largest to smallest absolute size before
		// calculating the remaining size to minimize floating point error.
		sortableSegments.sort((a, b) => Math.abs(b.size) - Math.abs(a.size));

		let remainingSize = targetSize;
		let factorsSum = ZERO;

		for (const segment of sortableSegments) {
			remainingSize -= segment.size;
			factorsSum += segment.factor;
		}

		const ratio = remainingSize / factorsSum;

		if (ratio === ZERO) {
			break;
		}

		usedRemainingSize = false;

		for (const segment of localSegments) {
			const factor = segment.factor;

			if (factor) {
				const size = segment.size;
				const min = segment.min;
				const max = segment.max;

				const targetSize = size + factor * ratio;
				const clampedSize = clampMaxWins(targetSize, min, max);
				segment.size = clampedSize;

				usedRemainingSize ||= clampedSize !== size;

				if (clampedSize !== targetSize) {
					segment.factor = ZERO;
					numFlexibleSegments -= UNIT;
				}
			}
		}
	}

	return [
		segment0IdealSize === undefined ? undefined : localSegments[0].size,
		segment1IdealSize === undefined ? undefined : localSegments[1].size,
		segment2IdealSize === undefined ? undefined : localSegments[2].size,
	];
};

export const proportionalResizeStrategy: ResizeStrategy = (
	state,
	targetSize,
) => {
	const endIdeal = state.endIdeal;
	const endMax = state.endMax;
	const endMin = state.endMin;
	const middleIdeal = state.middleIdeal;
	const middleMin = state.middleMin;
	const startIdeal = state.startIdeal;
	const startMax = state.startMax;
	const startMin = state.startMin;

	const segments = [
		{ idealSize: startIdeal, max: startMax, min: startMin },
		{
			idealSize: middleIdeal,
			max: Number.MAX_VALUE,
			min: middleMin,
		},
		{ idealSize: endIdeal, max: endMax, min: endMin },
	] as const;

	const [newStartSize, , newEndSize] = flexSegments(segments, targetSize);

	return { endSize: newEndSize, startSize: newStartSize };
};

export const preserveSidesResizeStrategy: ResizeStrategy = (
	state,
	targetSize,
) => {
	const endIdeal = state.endIdeal;
	const endMax = state.endMax;
	const endMin = state.endMin;
	const middleIdeal = state.middleIdeal;
	const middleMin = state.middleMin;
	const startIdeal = state.startIdeal;
	const startMax = state.startMax;
	const startMin = state.startMin;

	let startSize: number | undefined;
	let endSize: number | undefined;

	const targetMiddle = targetSize - (startIdeal ?? ZERO) - (endIdeal ?? ZERO);

	if (targetMiddle < middleMin) {
		const segments = [
			{ idealSize: startIdeal, max: startMax, min: startMin },
			{ idealSize: middleIdeal, max: middleMin, min: middleMin },
			{ idealSize: endIdeal, max: endMax, min: endMin },
		] as const;

		[startSize, , endSize] = flexSegments(segments, targetSize);
	} else {
		startSize = startIdeal;
		endSize = endIdeal;
	}

	return { endSize, startSize };
};

export const preserveMiddleResizeStrategy: ResizeStrategy = (
	state,
	targetSize,
) => {
	const endIdeal = state.endIdeal;
	const endMax = state.endMax;
	const endMin = state.endMin;
	const middleIdeal = state.middleIdeal;
	const startIdeal = state.startIdeal;
	const startMax = state.startMax;
	const startMin = state.startMin;

	let startSize: number | undefined;
	let endSize: number | undefined;

	const targetSides = targetSize - middleIdeal;

	if (targetSides < startMin + endMin) {
		startSize = startMin;
		endSize = endMin;
	} else {
		const segments = [
			{ idealSize: startIdeal, max: startMax, min: startMin },
			{ idealSize: middleIdeal, max: middleIdeal, min: middleIdeal },
			{ idealSize: endIdeal, max: endMax, min: endMin },
		] as const;

		[startSize, , endSize] = flexSegments(segments, targetSize);
	}

	return { endSize, startSize };
};

export const consumeSideResizeStrategy: SideResizeStrategy = (
	state,
	isStart,
	targetSize,
) => {
	const min = isStart ? state.startMin : state.endMin;
	const max = isStart ? state.startMax : state.endMax;
	const otherBarSize = isStart ? state.endSize : state.startSize;
	const otherBarMin = isStart ? state.endMin : state.startMin;

	let newBarSize;
	let newOtherBarSize = otherBarSize;

	if (targetSize === undefined) {
		newBarSize = undefined;
	} else {
		const middleMin = state.middleMin;
		const size = state.size;

		// The maximum size for both bars combined is defined by the maximum
		// available size assuming the timeline shrinks to its minimum size.
		const maxSizeWithMinCenter = size - middleMin;

		// The maximum size for the bar is the minimum of its permitted upper
		// bound and the available size, assuming the other bar shrinks the most
		// it can.
		const maxAvailable = Math.min(maxSizeWithMinCenter - otherBarMin, max);

		// The resulting size is clamped between the minimum size of the bar and
		// the maximum available size. The maximum size always wins over the
		// minimum size.
		newBarSize = clampMaxWins(targetSize, min, maxAvailable);

		if (otherBarSize !== undefined) {
			newOtherBarSize = Math.min(
				otherBarSize,
				maxSizeWithMinCenter - newBarSize,
			);
		}
	}

	return { barSize: newBarSize, otherBarSize: newOtherBarSize };
};

export const constraintSideResizeStrategy: SideResizeStrategy = (
	state,
	isStart,
	targetSize,
) => {
	const min = isStart ? state.startMin : state.endMin;
	const max = isStart ? state.startMax : state.endMax;
	const otherBarSize = isStart ? state.endSize : state.startSize;

	let newBarSize;

	if (targetSize === undefined) {
		newBarSize = undefined;
	} else {
		const middleMin = state.middleMin;
		const size = state.size;

		// The maximum size for both bars combined is defined by the maximum
		// available size assuming the timeline shrinks to its minimum size.
		const maxSizeWithMinCenter = size - middleMin;

		// The maximum size for the bar is the minimum of its permitted upper
		// bound and the available size, assuming the other bar shrinks the most
		// it can.
		const maxAvailable = Math.min(
			maxSizeWithMinCenter - (otherBarSize ?? ZERO),
			max,
		);

		// The resulting size is clamped between the minimum size of the bar and
		// the maximum available size. The maximum size always wins over the
		// minimum size.
		newBarSize = clampMaxWins(targetSize, min, maxAvailable);
	}

	return { barSize: newBarSize, otherBarSize };
};
