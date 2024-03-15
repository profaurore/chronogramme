import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		coverage: {
			include: ["lib"],
			reporter: ["html", "text", "text-summary"],
		},
		exclude: ["eslint", "node_modules"],
	},
});
