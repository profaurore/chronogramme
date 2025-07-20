import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { baseViteConfig } from "../../vite-base.config";

export default defineConfig({
	...baseViteConfig,
	build: {
		lib: {
			entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
			formats: ["es"],
		},
		rollupOptions: {
			external: ["react", "react-dom", "react/jsx-runtime"],
		},
		sourcemap: true,
	},
	plugins: [react()],
});
