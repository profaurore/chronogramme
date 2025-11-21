export class ConnectedEventDetail {}

export class DisconnectedEventDetail {}

export class DragCancelEventDetail {
	public target: HTMLElement;

	public constructor(target: HTMLElement) {
		this.target = target;
	}
}

export class DragEndEventDetail {
	public target: HTMLElement;

	public constructor(target: HTMLElement) {
		this.target = target;
	}
}

export class DragMoveEventDetail {
	public x: number;

	public xPrevious: number;

	public target: HTMLElement;

	public y: number;

	public yPrevious: number;

	public constructor(
		target: HTMLElement,
		xPrevious: number,
		yPrevious: number,
		x: number,
		y: number,
	) {
		this.x = x;
		this.xPrevious = xPrevious;
		this.target = target;
		this.y = y;
		this.yPrevious = yPrevious;
	}

	public get xDelta(): number {
		return this.x - this.xPrevious;
	}

	public get yDelta(): number {
		return this.y - this.yPrevious;
	}
}

export class DragStartEventDetail {
	public clientX: number;

	public clientY: number;

	public target: HTMLElement;

	public constructor(target: HTMLElement, clientX: number, clientY: number) {
		this.target = target;
		this.clientX = clientX;
		this.clientY = clientY;
	}
}

export class ScrollBoundsChangeEventDetail {
	public hValueStartPrev: number;

	public hValueEndPrev: number;

	public vValueStartPrev: number;

	public vValueEndPrev: number;

	public hValueStart: number;

	public hValueEnd: number;

	public vValueStart: number;

	public vValueEnd: number;

	public constructor(
		hValueStartPrev: number,
		hValueEndPrev: number,
		vValueStartPrev: number,
		vValueEndPrev: number,
		hValueStart: number,
		hValueEnd: number,
		vValueStart: number,
		vValueEnd: number,
	) {
		this.hValueStartPrev = hValueStartPrev;
		this.hValueEndPrev = hValueEndPrev;
		this.vValueStartPrev = vValueStartPrev;
		this.vValueEndPrev = vValueEndPrev;
		this.hValueStart = hValueStart;
		this.hValueEnd = hValueEnd;
		this.vValueStart = vValueStart;
		this.vValueEnd = vValueEnd;
	}
}

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
