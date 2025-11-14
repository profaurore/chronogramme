import { ZERO } from "./math";

let yieldToMain: () => Promise<void>;

if (
	"scheduler" in window &&
	typeof window.scheduler === "object" &&
	window.scheduler !== null &&
	"yield" in window.scheduler &&
	typeof window.scheduler.yield === "function"
) {
	yieldToMain = window.scheduler.yield.bind(window.scheduler);
} else {
	yieldToMain = function yieldToMainUsingPromise() {
		return new Promise((resolve) => {
			setTimeout(resolve, ZERO);
		});
	};
}

export { yieldToMain };
