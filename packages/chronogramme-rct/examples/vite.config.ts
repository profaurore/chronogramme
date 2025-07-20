import react from "@vitejs/plugin-react-swc";
import wyw from "@wyw-in-js/vite";
import { defineConfig } from "vite";
import { baseViteConfig } from "../../../vite-base.config";

export default defineConfig({
	...baseViteConfig,
	plugins: [wyw(), react()],
});
