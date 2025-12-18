import type { ReactNode } from "react";
import { STYLE_SIZE_PRECISION } from "../constants";
import { useGroupRowContext } from "./useGroupRowContext";

export interface GroupRowProps {
	children: ReactNode | undefined;
}

export const GroupRow = ({ children }: GroupRowProps): ReactNode => {
	const {
		className,
		id,
		size,
		position,
		onClick,
		onContextMenu,
		onDoubleClick,
	} = useGroupRowContext();

	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: Original implementation
		// biome-ignore lint/a11y/noStaticElementInteractions: Original implementation
		// biome-ignore lint/a11y/useKeyWithClickEvents: Original implementation
		<div
			className={className}
			data-groupid={id}
			onClick={onClick}
			onContextMenu={onContextMenu}
			onDoubleClick={onDoubleClick}
			style={{
				height: `${size.toFixed(STYLE_SIZE_PRECISION)}px`,
				left: "0px",
				position: "absolute",
				right: "0px",
				top: `${position.toFixed(STYLE_SIZE_PRECISION)}px`,
			}}
		>
			{children}
		</div>
	);
};
