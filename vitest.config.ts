import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		coverage: {
			include: ["packages/*/src/**/*"],
			reporter: ["html", "text", "text-summary"],
		},
		projects: ["packages/*"],
	},
});
