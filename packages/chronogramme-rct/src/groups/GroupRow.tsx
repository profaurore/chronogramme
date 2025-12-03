import { useGroupRowContext } from "./useGroupRowContext";

interface GroupRowProps {
	children: React.ReactNode | undefined;
}

export const GroupRow = ({ children }: GroupRowProps) => {
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
			data-testid="groupRow"
			onClick={onClick}
			onContextMenu={onContextMenu}
			onDoubleClick={onDoubleClick}
			style={{
				height: `${size.toFixed(4)}px`,
				left: "0px",
				position: "absolute",
				right: "0px",
				top: `${position.toFixed(4)}px`,
			}}
		>
			{children}
		</div>
	);
};
