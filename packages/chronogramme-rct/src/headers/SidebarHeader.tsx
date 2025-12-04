import { useCallback } from "react";
import { RIGHT_VARIANT } from "../constants";
import { useHeadersContext } from "./useHeadersContext";

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
	children?:
		| ((props: {
				getRootProps: GetRootProps;
				data?: THeaderData | undefined;
		  }) => React.ReactNode)
		| undefined;
	headerData?: THeaderData | undefined;
	variant?: "left" | "right" | undefined;
}): React.ReactNode => {
	const { leftSidebarWidth, rightSidebarWidth } = useHeadersContext();

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
