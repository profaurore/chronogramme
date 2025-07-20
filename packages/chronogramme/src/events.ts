export type ConnectedEventDetail = undefined;

export type DisconnectedEventDetail = undefined;

export class DragCancelEventDetail {
	public target: HTMLElement;

	public constructor(target: HTMLElement) {
		this.target = target;
	}
}

export class DragEndEventDetail {
	public event: PointerEvent;

	public target: HTMLElement;

	public constructor(target: HTMLElement, event: PointerEvent) {
		this.event = event;
		this.target = target;
	}
}

export class DragMoveEventDetail {
	public event: PointerEvent;

	public x: number;

	public xPrevious: number;

	public target: HTMLElement;

	public y: number;

	public yPrevious: number;

	public constructor(
		target: HTMLElement,
		event: PointerEvent,
		xPrevious: number,
		yPrevious: number,
		x: number,
		y: number,
	) {
		this.event = event;
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
	public event: PointerEvent;

	public target: HTMLElement;

	public constructor(event: PointerEvent, target: HTMLElement) {
		this.event = event;
		this.target = target;
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
