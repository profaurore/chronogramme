import { UNIT, ZERO } from "./math.ts";

export class Singleton<T> {
	private readonly build: () => T;

	private data: { count: number; instance: T } | null = null;

	private readonly destruct: ((instance: T) => void) | undefined;

	public constructor(build: () => T, destruct?: (instance: T) => void) {
		this.build = build;
		this.destruct = destruct;
	}

	public subscribe(): T {
		let data = this.data;

		if (data === null) {
			data = { count: ZERO, instance: this.build() };
			this.data = data;
		}

		data.count += UNIT;

		return data.instance;
	}

	public unsubscribe(callback?: (instance: T) => void): void {
		const data = this.data;

		if (data) {
			data.count -= UNIT;

			callback?.(data.instance);

			if (data.count === ZERO) {
				this.destruct?.(data.instance);
				this.data = null;
			}
		}
	}
}
