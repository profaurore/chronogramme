import { type CSSProperties, type ReactNode, useCallback } from "react";
import type { ResizeEdge } from "../Timeline";
import type { UnsupportedType } from "../utils/unsupportedUtils";

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
	// Unused by the component, but used by `TimelineHeaders` to associate the
	// header to the correct side.
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
}: SidebarHeaderBaseProps & {
	children?:
		| SidebarHeaderChildWithoutData
		| SidebarHeaderChildWithData<THeaderData>
		| undefined;
	headerData?: THeaderData;
}): ReactNode {
	const getRootProps: GetRootProps = useCallback(
		(props) => ({
			style: {
				...props?.style,
				height: "100%",
			},
		}),
		[],
	);

	if (ChildrenComponent === undefined) {
		return <div {...getRootProps()} />;
	}

	if (headerData === undefined) {
		const ChildrenComponentWithoutData =
			ChildrenComponent as SidebarHeaderChildWithoutData;

		return <ChildrenComponentWithoutData getRootProps={getRootProps} />;
	}

	return <ChildrenComponent getRootProps={getRootProps} data={headerData} />;
}

SidebarHeader.secretKey = "Chronogramme-SidebarHeader";
