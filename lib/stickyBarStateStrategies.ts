import type { ResizeStrategy, SideResizeStrategy } from "./stickyBarState";

import { UNIT, ZERO, clampMaxWins } from "./math";

interface FlexSegment {
	idealSize: number | undefined;
	max: number;
	min: number;
}

interface CalculationFlexSegment {
	factor: number;
	max: number;
	min: number;
	size: number;
}

function prepareFlexSegment(segment: FlexSegment): CalculationFlexSegment {
	const idealSize = segment.idealSize;

	if (idealSize === undefined) {
		return { factor: ZERO, max: ZERO, min: ZERO, size: ZERO };
	}

	return {
		factor: idealSize,
		max: segment.max,
		min: segment.min,
		size: idealSize,
	};
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

	const localSegments: [
		CalculationFlexSegment,
		CalculationFlexSegment,
		CalculationFlexSegment,
	] = [
		prepareFlexSegment(segment0),
		prepareFlexSegment(segment1),
		prepareFlexSegment(segment2),
	];

	// The number of segments that have a non-zero flex factor.
	let numFlexibleSegments = ZERO;
	for (const segment of localSegments) {
		numFlexibleSegments += Math.sign(segment.factor);
	}

	while (numFlexibleSegments > ZERO) {
		let remainingSize = targetSize;
		let factorsSum = ZERO;

		for (const segment of localSegments) {
			remainingSize -= segment.size;
			factorsSum += segment.factor;
		}

		const ratio = remainingSize / factorsSum;

		for (const segment of localSegments) {
			const factor = segment.factor;

			if (!factor) {
				continue;
			}

			const size = segment.size;
			const min = segment.min;
			const max = segment.max;

			const targetSize = size + factor * ratio;
			const clampedSize = clampMaxWins(targetSize, min, max);
			segment.size = clampedSize;

			if (clampedSize === size || clampedSize !== targetSize) {
				segment.factor = ZERO;
				numFlexibleSegments -= UNIT;
			}
		}
	}

	return [
		segment0.idealSize === undefined ? undefined : localSegments[0].size,
		segment1.idealSize === undefined ? undefined : localSegments[1].size,
		segment2.idealSize === undefined ? undefined : localSegments[2].size,
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

	let newBarSize: number | undefined;
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

	let newBarSize: number | undefined;

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
