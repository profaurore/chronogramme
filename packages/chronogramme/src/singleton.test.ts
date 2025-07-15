import { describe, expect, test, vi } from "vitest";
import { Singleton } from "./singleton";

describe("Singleton", () => {
	test("Singleton without destructor", () => {
		const data = { theData: "data" };
		const constructorFn = vi.fn(() => data);
		const unsubscribeFn = vi.fn();

		const singleton = new Singleton(constructorFn);
		expect(singleton.subscribeCount).toEqual(0);
		expect(constructorFn).toHaveBeenCalledTimes(0);

		expect(singleton.subscribe()).toEqual(data);
		expect(singleton.subscribeCount).toEqual(1);
		expect(constructorFn).toHaveBeenCalledTimes(1);
		expect(constructorFn).toHaveBeenCalledWith();

		expect(singleton.subscribe()).toEqual(data);
		expect(singleton.subscribeCount).toEqual(2);

		expect(singleton.unsubscribe(unsubscribeFn)).toEqual(undefined);
		expect(singleton.subscribeCount).toEqual(1);
		expect(unsubscribeFn).toHaveBeenCalledTimes(1);
		expect(unsubscribeFn).toHaveBeenCalledWith(data);

		expect(singleton.unsubscribe()).toEqual(undefined);
		expect(singleton.subscribeCount).toEqual(0);

		expect(singleton.unsubscribe(unsubscribeFn)).toEqual(undefined);
		expect(singleton.subscribeCount).toEqual(0);
		expect(constructorFn).toHaveBeenCalledTimes(1);
		expect(unsubscribeFn).toHaveBeenCalledTimes(1);
	});

	test("Singleton with destructor", () => {
		const data = { theData: "data" };
		const constructorFn = vi.fn(() => data);
		const destructorFn = vi.fn();
		const unsubscribeFn = vi.fn();

		const singleton = new Singleton(constructorFn, destructorFn);
		expect(singleton.subscribeCount).toEqual(0);
		expect(constructorFn).toHaveBeenCalledTimes(0);

		expect(singleton.subscribe()).toEqual(data);
		expect(singleton.subscribeCount).toEqual(1);
		expect(constructorFn).toHaveBeenCalledTimes(1);
		expect(constructorFn).toHaveBeenCalledWith();

		expect(singleton.subscribe()).toEqual(data);
		expect(singleton.subscribeCount).toEqual(2);

		expect(singleton.unsubscribe(unsubscribeFn)).toEqual(undefined);
		expect(singleton.subscribeCount).toEqual(1);
		expect(unsubscribeFn).toHaveBeenCalledTimes(1);
		expect(unsubscribeFn).toHaveBeenCalledWith(data);

		expect(singleton.unsubscribe()).toEqual(undefined);
		expect(singleton.subscribeCount).toEqual(0);
		expect(destructorFn).toHaveBeenCalledTimes(1);

		expect(singleton.unsubscribe(unsubscribeFn)).toEqual(undefined);
		expect(singleton.subscribeCount).toEqual(0);
		expect(constructorFn).toHaveBeenCalledTimes(1);
		expect(destructorFn).toHaveBeenCalledTimes(1);
		expect(destructorFn).toHaveBeenCalledWith(data);
		expect(unsubscribeFn).toHaveBeenCalledTimes(1);
	});
});
