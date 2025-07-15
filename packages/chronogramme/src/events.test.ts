import { describe, expect, test, vi } from "vitest";
import {
	calcMouseEventCenterOffsetX,
	calcMouseEventCenterOffsetY,
} from "./events";

describe("calcMouseEventCenterOffsetX", () => {
	test("Left of center", () => {
		const element = document.createElement("div");
		vi.spyOn(element, "getBoundingClientRect").mockImplementation(
			() =>
				({
					bottom: 500,
					left: 100,
					right: 300,
					top: 100,
				}) as DOMRect,
		);

		const event = new MouseEvent("click", {
			clientX: 100,
			clientY: 300,
		});
		vi.spyOn(event, "currentTarget", "get").mockImplementation(() => element);

		expect(calcMouseEventCenterOffsetX(event)).toEqual(100);
	});

	test("At center", () => {
		const element = document.createElement("div");
		vi.spyOn(element, "getBoundingClientRect").mockImplementation(
			() =>
				({
					bottom: 500,
					left: 100,
					right: 300,
					top: 100,
				}) as DOMRect,
		);

		const event = new MouseEvent("click", {
			clientX: 200,
			clientY: 300,
		});
		vi.spyOn(event, "currentTarget", "get").mockImplementation(() => element);

		expect(calcMouseEventCenterOffsetX(event)).toEqual(0);
	});

	test("Right of center", () => {
		const element = document.createElement("div");
		vi.spyOn(element, "getBoundingClientRect").mockImplementation(
			() =>
				({
					bottom: 500,
					left: 100,
					right: 300,
					top: 100,
				}) as DOMRect,
		);

		const event = new MouseEvent("click", {
			clientX: 300,
			clientY: 300,
		});
		vi.spyOn(event, "currentTarget", "get").mockImplementation(() => element);

		expect(calcMouseEventCenterOffsetX(event)).toEqual(-100);
	});
});

describe("calcMouseEventCenterOffsetY", () => {
	test("Left of center", () => {
		const element = document.createElement("div");
		vi.spyOn(element, "getBoundingClientRect").mockImplementation(
			() =>
				({
					bottom: 500,
					left: 100,
					right: 300,
					top: 100,
				}) as DOMRect,
		);

		const event = new MouseEvent("click", {
			clientX: 200,
			clientY: 100,
		});
		vi.spyOn(event, "currentTarget", "get").mockImplementation(() => element);

		expect(calcMouseEventCenterOffsetY(event)).toEqual(200);
	});

	test("At center", () => {
		const element = document.createElement("div");
		vi.spyOn(element, "getBoundingClientRect").mockImplementation(
			() =>
				({
					bottom: 500,
					left: 100,
					right: 300,
					top: 100,
				}) as DOMRect,
		);

		const event = new MouseEvent("click", {
			clientX: 200,
			clientY: 300,
		});
		vi.spyOn(event, "currentTarget", "get").mockImplementation(() => element);

		expect(calcMouseEventCenterOffsetY(event)).toEqual(0);
	});

	test("Right of center", () => {
		const element = document.createElement("div");
		vi.spyOn(element, "getBoundingClientRect").mockImplementation(
			() =>
				({
					bottom: 500,
					left: 100,
					right: 300,
					top: 100,
				}) as DOMRect,
		);

		const event = new MouseEvent("click", {
			clientX: 200,
			clientY: 500,
		});
		vi.spyOn(event, "currentTarget", "get").mockImplementation(() => element);

		expect(calcMouseEventCenterOffsetY(event)).toEqual(-200);
	});
});
