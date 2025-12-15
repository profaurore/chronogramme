import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		cssMinify: "lightningcss",

		lib: {
			entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
			formats: ["es"],
		},

		sourcemap: true,

		watch: {},
	},
});
