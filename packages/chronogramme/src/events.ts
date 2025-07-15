import { HALF } from "./math";

export type ConnectedEventDetail = undefined;

export type DisconnectedEventDetail = undefined;

export class ScrollPosChangeEventDetail {
	public hScrollPos: number;

	public hScrollPosPrev: number;

	public vScrollPos: number;

	public vScrollPosPrev: number;

	public constructor(
		hScrollPosPrev: number,
		vScrollPosPrev: number,
		hScrollPos: number,
		vScrollPos: number,
	) {
		this.hScrollPosPrev = hScrollPosPrev;
		this.vScrollPosPrev = vScrollPosPrev;
		this.hScrollPos = hScrollPos;
		this.vScrollPos = vScrollPos;
	}
}

export class ScrollSizeChangeEventDetail {
	public hScrollSize: number;

	public hScrollSizePrev: number;

	public vScrollSize: number;

	public vScrollSizePrev: number;

	public constructor(
		hScrollSizePrev: number,
		vScrollSizePrev: number,
		hScrollSize: number,
		vScrollSize: number,
	) {
		this.hScrollSizePrev = hScrollSizePrev;
		this.vScrollSizePrev = vScrollSizePrev;
		this.hScrollSize = hScrollSize;
		this.vScrollSize = vScrollSize;
	}
}

export class WindowChangeEventDetail {
	public hWindowMax: number;

	public hWindowMaxPrev: number;

	public hWindowMin: number;

	public hWindowMinPrev: number;

	public vWindowMax: number;

	public vWindowMaxPrev: number;

	public vWindowMin: number;

	public vWindowMinPrev: number;

	public constructor(
		hWindowMinPrev: number,
		hWindowMaxPrev: number,
		vWindowMinPrev: number,
		vWindowMaxPrev: number,
		hWindowMin: number,
		hWindowMax: number,
		vWindowMin: number,
		vWindowMax: number,
	) {
		this.hWindowMinPrev = hWindowMinPrev;
		this.hWindowMaxPrev = hWindowMaxPrev;
		this.vWindowMinPrev = vWindowMinPrev;
		this.vWindowMaxPrev = vWindowMaxPrev;
		this.hWindowMin = hWindowMin;
		this.hWindowMax = hWindowMax;
		this.vWindowMin = vWindowMin;
		this.vWindowMax = vWindowMax;
	}
}

export class WindowSizeChangeEventDetail {
	public hWindowSize: number;

	public hWindowSizePrev: number;

	public vWindowSize: number;

	public vWindowSizePrev: number;

	public constructor(
		hWindowSizePrev: number,
		vWindowSizePrev: number,
		hWindowSize: number,
		vWindowSize: number,
	) {
		this.hWindowSizePrev = hWindowSizePrev;
		this.vWindowSizePrev = vWindowSizePrev;
		this.hWindowSize = hWindowSize;
		this.vWindowSize = vWindowSize;
	}
}

export const calcMouseEventCenterOffsetX = (event: MouseEvent) => {
	const currentTarget = event.currentTarget as HTMLElement;
	const clientX = event.clientX;

	const targetBBox = currentTarget.getBoundingClientRect();
	const left = targetBBox.left;
	const right = targetBBox.right;
	const centerX = HALF * left + HALF * right;
	const offsetX = centerX - clientX;

	return offsetX;
};

export const calcMouseEventCenterOffsetY = (event: MouseEvent) => {
	const currentTarget = event.currentTarget as HTMLElement;
	const clientY = event.clientY;

	const targetBBox = currentTarget.getBoundingClientRect();
	const top = targetBBox.top;
	const bottom = targetBBox.bottom;
	const centerY = HALF * top + HALF * bottom;
	const offsetY = centerY - clientY;

	return offsetY;
};
