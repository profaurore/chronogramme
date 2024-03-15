import type { DetailedHTMLProps, HTMLAttributes } from "react";

import type { Timeline2 } from "./Timeline2.tsx";

declare global {
	namespace JSX {
		interface IntrinsicElements {
			[Timeline2.webComponentName]: Omit<
				DetailedHTMLProps<HTMLAttributes<Timeline2>, Timeline2>,
				"className"
			> & {
				class?: string;
				defaultResizeHandles: boolean;
				timeExtrema?: [number, number] | string;
				windowTime: [number, number] | string;
			};
		}
	}
}
