import type { ResizeStrategy } from "./barState.ts";

import { UNIT, ZERO, clampMaxWins } from "./math.ts";

interface FlexSegment {
	idealSize: number;
	max: number;
	min: number;
}

interface OptionalFlexSegment {
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

function prepareFlexSegment(
	segment: FlexSegment | OptionalFlexSegment,
): CalculationFlexSegment {
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
		Readonly<OptionalFlexSegment>,
		Readonly<FlexSegment>,
		Readonly<OptionalFlexSegment>,
	],
	targetSize: number,
): [number | undefined, number, number | undefined] => {
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
		localSegments[1].size,
		segment2.idealSize === undefined ? undefined : localSegments[2].size,
	];
};

export const proportionalResizeStrategy: ResizeStrategy = (state) => {
	const size = state.size;
	const endIdeal = state.endIdeal;
	const endMax = state.endMax;
	const endMin = state.endMin;
	const endMinTrue = endIdeal === undefined ? ZERO : endMin;
	const middleIdeal = state.middleIdeal;
	const middleMin = state.middleMin;
	const startIdeal = state.startIdeal;
	const startMax = state.startMax;
	const startMin = state.startMin;
	const startMinTrue = startIdeal === undefined ? ZERO : startMin;

	let startSize: number | undefined;
	let endSize: number | undefined;

	if (size < middleMin + startMinTrue + endMinTrue) {
		startSize = undefined;
		endSize = undefined;
	} else {
		const segments = [
			{ idealSize: startIdeal, max: startMax, min: startMin },
			{
				idealSize: middleIdeal,
				max: Number.MAX_VALUE,
				min: middleMin,
			},
			{ idealSize: endIdeal, max: endMax, min: endMin },
		] as const;

		[startSize, , endSize] = flexSegments(segments, size);
	}

	return { endSize, startSize };
};

export const preserveSidesResizeStrategy: ResizeStrategy = (state) => {
	const size = state.size;
	const endIdeal = state.endIdeal;
	const endMax = state.endMax;
	const endMin = state.endMin;
	const endMinTrue = endIdeal === undefined ? ZERO : endMin;
	const endIdealClamped =
		endIdeal === undefined ? endIdeal : clampMaxWins(endIdeal, endMin, endMax);
	const middleMin = state.middleMin;
	const startIdeal = state.startIdeal;
	const startMax = state.startMax;
	const startMin = state.startMin;
	const startMinTrue = startIdeal === undefined ? ZERO : startMin;
	const startIdealClamped =
		startIdeal === undefined
			? startIdeal
			: clampMaxWins(startIdeal, startMin, startMax);

	let startSize: number | undefined;
	let endSize: number | undefined;

	const maxSides = size - middleMin;

	if (maxSides < startMinTrue + endMinTrue) {
		startSize = undefined;
		endSize = undefined;
	} else if (
		maxSides <
		(startIdealClamped ?? ZERO) + (endIdealClamped ?? ZERO)
	) {
		const segments = [
			{ idealSize: startIdeal, max: startMax, min: startMin },
			{ idealSize: middleMin, max: middleMin, min: middleMin },
			{ idealSize: endIdeal, max: endMax, min: endMin },
		] as const;

		[startSize, , endSize] = flexSegments(segments, size);
	} else {
		startSize = startIdealClamped;
		endSize = endIdealClamped;
	}

	return { endSize, startSize };
};

export const preserveMiddleResizeStrategy: ResizeStrategy = (state) => {
	const size = state.size;
	const endIdeal = state.endIdeal;
	const endMax = state.endMax;
	const endMin = state.endMin;
	const endMinTrue = endIdeal === undefined ? ZERO : endMin;
	const middleIdeal = state.middleIdeal;
	const middleMin = state.middleMin;
	const startIdeal = state.startIdeal;
	const startMax = state.startMax;
	const startMin = state.startMin;
	const startMinTrue = startIdeal === undefined ? ZERO : startMin;

	let startSize: number | undefined;
	let endSize: number | undefined;

	const middleMax = size - startMinTrue - endMinTrue;

	if (middleMax < middleMin) {
		startSize = undefined;
		endSize = undefined;
	} else if (middleMax < middleIdeal) {
		startSize = startIdeal === undefined ? startIdeal : startMin;
		endSize = endIdeal === undefined ? endIdeal : endMin;
	} else {
		const segments = [
			{ idealSize: startIdeal, max: startMax, min: startMin },
			{ idealSize: middleIdeal, max: middleIdeal, min: middleIdeal },
			{ idealSize: endIdeal, max: endMax, min: endMin },
		] as const;

		[startSize, , endSize] = flexSegments(segments, size);
	}

	return { endSize, startSize };
};
