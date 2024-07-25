import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../lib/Scroller.tsx";
import { App } from "./App.tsx";

const root = document.getElementById("root");

if (root) {
	createRoot(root).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
