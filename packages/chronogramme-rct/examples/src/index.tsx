import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@chronogramme/chronogramme";
import { App } from "./app";

const root: HTMLElement | null = document.getElementById("root");

if (root) {
	createRoot(root).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
