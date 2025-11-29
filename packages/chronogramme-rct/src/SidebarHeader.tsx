import { useCallback } from "react";
import { RIGHT_VARIANT } from "./constants";
import { useHeaders } from "./headerContext/useHeaders";

type GetRootProps = (
	args?: { style?: React.CSSProperties | undefined } | undefined,
) => {
	style: React.CSSProperties;
};

export const SidebarHeader = <THeaderData,>({
	children: ChildrenComponent,
	headerData,
	variant,
}: {
	children?: (props?: {
		getRootProps: GetRootProps;
		data?: THeaderData | undefined;
	}) => React.ReactNode;
	headerData?: THeaderData | undefined;
	variant?: "left" | "right";
}): React.ReactNode => {
	const { leftSidebarWidth, rightSidebarWidth } = useHeaders();

	const getRootProps: GetRootProps = useCallback(
		(props) => ({
			style: {
				...props?.style,
				width: variant === RIGHT_VARIANT ? rightSidebarWidth : leftSidebarWidth,
			},
		}),
		[leftSidebarWidth, rightSidebarWidth, variant],
	);

	return ChildrenComponent ? (
		<ChildrenComponent getRootProps={getRootProps} data={headerData} />
	) : (
		<div data-testid="sidebarHeader" {...getRootProps()} />
	);
};

SidebarHeader.secretKey = "Chronogramme-SidebarHeader";
