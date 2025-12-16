import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { baseViteConfig } from "../../vite-base.config";
import packageJson from "./package.json" with { type: "json" };

const input: Record<string, string> = {};

for (const [outputPath, config] of Object.entries(packageJson.exports)) {
	const distPath = config.import.replace(/^\.\/dist\//, "");
	const entryName = distPath.replace(/\.js$/, "");

	let inputPath = fileURLToPath(new URL(`./src/${entryName}`, import.meta.url));

	if (existsSync(`${inputPath}.ts`)) {
		inputPath += ".ts";
	} else if (existsSync(`${inputPath}.tsx`)) {
		inputPath += ".tsx";
	} else {
		throw new Error(
			`Missing ts/tsx source file for export "${outputPath}": "${inputPath}"`,
		);
	}

	input[entryName] = inputPath;
}

export default defineConfig({
	...baseViteConfig,

	build: {
		minify: false,

		rollupOptions: {
			external: [
				"react/jsx-runtime",
				...Object.keys(packageJson.dependencies),
				...Object.keys(packageJson.peerDependencies),
			],

			input,

			output: {
				entryFileNames: "[name].js",
				format: "es",
				preserveModules: true,
				preserveModulesRoot: "src",
			},

			preserveEntrySignatures: "exports-only",
		},

		sourcemap: true,
	},

	plugins: [react()],
});
