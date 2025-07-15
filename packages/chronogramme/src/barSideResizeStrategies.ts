import type { BarSideResizeStrategy } from "./barState";
import { clampMaxWins, ZERO } from "./math";

export const consumeSideBarResizeStrategy: BarSideResizeStrategy = (
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

export const constrainBarSideResizeStrategy: BarSideResizeStrategy = (
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
