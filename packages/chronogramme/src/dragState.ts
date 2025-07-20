import {
	DragCancelEventDetail,
	DragEndEventDetail,
	DragMoveEventDetail,
	DragStartEventDetail,
} from "./events";
import { MOUSE_BUTTON_PRIMARY, MOUSE_BUTTONS_PRIMARY } from "./mouse";

interface ActiveState<StateData> {
	abortController: AbortController;
	data: StateData | undefined;
	mutationObserver: MutationObserver;
	target: HTMLElement;
	xPrevious: number;
	yPrevious: number;
}

export class DragState<StateData = undefined> extends EventTarget {
	#activeState: ActiveState<StateData> | undefined;

	readonly #mutationObserver: MutationObserver;

	public constructor() {
		super();

		this.#mutationObserver = new MutationObserver(
			this.onRemoveHandler.bind(this),
		);
	}

	public get data(): StateData | undefined {
		return this.#activeState?.data;
	}

	public setStateData(data: StateData): void {
		const activeState = this.#activeState;

		if (activeState) {
			activeState.data = data;
		}
	}

	public setupDragListener(element: HTMLElement) {
		element.addEventListener("pointerdown", this.onStartHandler.bind(this));
	}

	public reset(): void {
		this.endAndMaybeCommit();
	}

	private endAndMaybeCommit(event?: PointerEvent): void {
		const activeState = this.#activeState;

		if (activeState) {
			const target = activeState.target;

			activeState.abortController.abort();
			activeState.mutationObserver.disconnect();

			this.#activeState = undefined;

			if (event) {
				this.dispatchEvent(
					new CustomEvent<DragEndEventDetail>("end", {
						detail: new DragEndEventDetail(target, event),
					}),
				);
			} else {
				this.dispatchEvent(
					new CustomEvent<DragCancelEventDetail>("cancel", {
						detail: new DragCancelEventDetail(target),
					}),
				);
			}
		}
	}

	private onEscapeHandler(event: KeyboardEvent): void {
		if (event.key === "Escape") {
			this.endAndMaybeCommit();
		}
	}

	private onMoveHandler(event: PointerEvent): void {
		const activeState = this.#activeState;

		if (activeState && event.buttons & MOUSE_BUTTONS_PRIMARY) {
			const x = event.clientX;
			const y = event.clientY;

			this.dispatchEvent(
				new CustomEvent<DragMoveEventDetail>("move", {
					detail: new DragMoveEventDetail(
						activeState.target,
						event,
						activeState.xPrevious,
						activeState.yPrevious,
						x,
						y,
					),
				}),
			);

			activeState.xPrevious = x;
			activeState.yPrevious = y;
		} else {
			this.endAndMaybeCommit();
		}
	}

	private onRemoveHandler(): void {
		const activeState = this.#activeState;

		if (activeState && !activeState?.target.isConnected) {
			this.endAndMaybeCommit();
		}
	}

	private onStartHandler(event: PointerEvent): void {
		const target = event.target;

		// Only the primary mouse button triggers scroll drag.
		if (
			event.button === MOUSE_BUTTON_PRIMARY &&
			target instanceof HTMLElement &&
			parent
		) {
			const parent = target?.parentNode;

			if (parent) {
				this.endAndMaybeCommit();

				const mutationObserver = new MutationObserver(
					this.onRemoveHandler.bind(this),
				);

				const abortController = new AbortController();
				const signal = abortController.signal;

				const x = event.clientX;
				const y = event.clientY;

				this.#activeState = {
					abortController,
					data: undefined,
					mutationObserver,
					target,
					xPrevious: x,
					yPrevious: y,
				};

				this.#mutationObserver.observe(parent, { childList: true });

				const onCancel = this.reset.bind(this);
				const onStop = this.onStopHandler.bind(this);
				const onMove = this.onMoveHandler.bind(this);
				const onVisibilityChange = this.onVisibilityChangeHandler.bind(this);
				const onEscape = this.onEscapeHandler.bind(this);

				const options = { signal };
				const onceOptions = { once: true, signal };

				document.addEventListener("contextmenu", onCancel, onceOptions);
				document.addEventListener("keydown", onEscape, onceOptions);
				document.addEventListener("pointercancel", onCancel, onceOptions);
				document.addEventListener("pointermove", onMove, options);
				document.addEventListener("pointerup", onStop, onceOptions);
				document.addEventListener(
					"visibilitychange",
					onVisibilityChange,
					options,
				);
				window.addEventListener("blur", onCancel, onceOptions);

				this.dispatchEvent(
					new CustomEvent<DragStartEventDetail>("start", {
						detail: new DragStartEventDetail(event, target),
					}),
				);
			}
		}
	}

	private onStopHandler(event: PointerEvent): void {
		this.endAndMaybeCommit(event);
	}

	private onVisibilityChangeHandler(): void {
		if (document.visibilityState === "hidden") {
			this.endAndMaybeCommit();
		}
	}
}
