import { type CSSProperties, type ReactNode, useCallback } from "react";
import type { ResizeEdge } from "../Timeline";
import { useHeadersContext } from "./useHeadersContext";

interface GetRootPropsArguments {
	style?: CSSProperties | undefined;
}

interface GetRootPropsReturnType {
	style: CSSProperties;
}

type GetRootProps = (
	args?: GetRootPropsArguments | undefined,
) => GetRootPropsReturnType;

interface SidebarHeaderBaseProps {
	variant?: ResizeEdge | undefined;
}

interface SidebarHeaderChildWithoutDataProps {
	getRootProps: GetRootProps;
}

export interface SidebarHeaderChildWithDataProps<THeaderData>
	extends SidebarHeaderChildWithoutDataProps {
	data: THeaderData;
}

type SidebarHeaderChildWithoutData = (
	props: SidebarHeaderChildWithoutDataProps,
) => ReactNode;

type SidebarHeaderChildWithData<THeaderData> = (
	props: SidebarHeaderChildWithDataProps<THeaderData>,
) => ReactNode;

interface SidebarHeaderWithoutDataProps extends SidebarHeaderBaseProps {
	children?: SidebarHeaderChildWithoutData | undefined;
}

interface SidebarHeaderWithDataProps<THeaderData>
	extends SidebarHeaderBaseProps {
	children?: SidebarHeaderChildWithData<THeaderData> | undefined;
	headerData: THeaderData;
}

export function SidebarHeader(props: SidebarHeaderWithoutDataProps): ReactNode;
export function SidebarHeader<THeaderData>(
	props: SidebarHeaderWithDataProps<THeaderData>,
): ReactNode;
export function SidebarHeader<THeaderData>({
	children: ChildrenComponent,
	headerData,
	variant,
}: SidebarHeaderBaseProps & {
	children?:
		| SidebarHeaderChildWithoutData
		| SidebarHeaderChildWithData<THeaderData>
		| undefined;
	headerData?: THeaderData;
}): ReactNode {
	const { leftSidebarWidth, rightSidebarWidth } = useHeadersContext();

	const getRootProps: GetRootProps = useCallback(
		(props) => ({
			style: {
				...props?.style,
				width: variant === "right" ? rightSidebarWidth : leftSidebarWidth,
			},
		}),
		[leftSidebarWidth, rightSidebarWidth, variant],
	);

	if (ChildrenComponent === undefined) {
		return <div data-testid="sidebarHeader" {...getRootProps()} />;
	}

	if (headerData === undefined) {
		const ChildrenComponentWithoutData =
			ChildrenComponent as SidebarHeaderChildWithoutData;

		return <ChildrenComponentWithoutData getRootProps={getRootProps} />;
	}

	return <ChildrenComponent getRootProps={getRootProps} data={headerData} />;
}

SidebarHeader.secretKey = "Chronogramme-SidebarHeader";
