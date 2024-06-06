import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import linaria from "@linaria/vite";
import react from "@vitejs/plugin-react-swc";
import wyw from "@wyw-in-js/vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const dirnameString = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	build: {
		copyPublicDir: false,
		lib: {
			entry: resolve(dirnameString, "lib/main.ts"),
			formats: ["es"],
		},
		rollupOptions: {
			external: ["react", "react/jsx-runtime"],
			output: {
				globals: {
					react: "React",
				},
			},
		},
	},
	plugins: [
		wyw({
			babelOptions: {
				presets: ["@babel/preset-typescript", "@babel/preset-react"],
			},
			include: ["**/*.{ts,tsx}"],
		}),
		react(),
		linaria({
			babelOptions: {
				presets: ["@babel/preset-typescript", "@babel/preset-react"],
			},
		}),
		dts({ entryRoot: "lib", include: ["lib"] }),
	],
});
