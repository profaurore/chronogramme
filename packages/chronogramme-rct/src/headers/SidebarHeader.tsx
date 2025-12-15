import { type CSSProperties, type ReactNode, useCallback } from "react";
import type { ResizeEdge } from "../Timeline";
import type { UnsupportedType } from "../utils/unsupportedUtils";
import { useHeadersContext } from "./useHeadersContext";

export interface GetRootPropsArguments {
	style?: CSSProperties | undefined;
}

export interface GetRootPropsReturnType {
	style: CSSProperties;
}

export type GetRootProps = (
	args?: GetRootPropsArguments | undefined,
) => GetRootPropsReturnType;

export interface SidebarHeaderBaseProps {
	variant?: ResizeEdge | undefined;
}

export interface SidebarHeaderChildWithoutDataProps {
	getRootProps: GetRootProps;
}

export interface SidebarHeaderChildWithDataProps<THeaderData>
	extends SidebarHeaderChildWithoutDataProps {
	data: THeaderData;
}

export type SidebarHeaderChildProps<THeaderData> =
	| SidebarHeaderChildWithoutDataProps
	| SidebarHeaderChildWithDataProps<THeaderData>;

/**
 * @deprecated Unsupported type from React Calendar Timeline's API. Use
 * `SidebarHeaderChildProps` instead.
 */
export type SidebarHeaderChildrenFnProps<THeaderData> = UnsupportedType<
	SidebarHeaderChildProps<THeaderData>,
	"Use `SidebarHeaderChildProps` instead."
>;

export type SidebarHeaderChildWithoutData = (
	props: SidebarHeaderChildWithoutDataProps,
) => ReactNode;

export type SidebarHeaderChildWithData<THeaderData> = (
	props: SidebarHeaderChildWithDataProps<THeaderData>,
) => ReactNode;

export type SidebarHeaderChild<THeaderData> =
	| SidebarHeaderChildWithoutData
	| SidebarHeaderChildWithData<THeaderData>;

export interface SidebarHeaderWithoutDataProps extends SidebarHeaderBaseProps {
	children?: SidebarHeaderChildWithoutData | undefined;
}

export interface SidebarHeaderWithDataProps<THeaderData>
	extends SidebarHeaderBaseProps {
	children?: SidebarHeaderChildWithData<THeaderData> | undefined;
	headerData: THeaderData;
}

export type SidebarHeaderProps<THeaderData> =
	| SidebarHeaderWithoutDataProps
	| SidebarHeaderWithDataProps<THeaderData>;

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
