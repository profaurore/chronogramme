import react from "@vitejs/plugin-react-swc";
import wyw from "@wyw-in-js/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [wyw(), react()],
});
