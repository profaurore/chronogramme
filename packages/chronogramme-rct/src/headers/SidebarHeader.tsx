import { type CSSProperties, type ReactNode, useCallback } from "react";
import type { ResizeEdge } from "../Timeline";
import { useHeadersContext } from "./useHeadersContext";

type GetRootProps = (
	args?: { style?: CSSProperties | undefined } | undefined,
) => {
	style: CSSProperties;
};

interface SidebarHeaderBaseProps {
	variant?: ResizeEdge | undefined;
}

interface SidebarHeaderChildBaseProps {
	getRootProps: GetRootProps;
}

interface SidebarHeaderComponent {
	(
		props: SidebarHeaderBaseProps & {
			children?:
				| ((props: SidebarHeaderChildBaseProps) => ReactNode)
				| undefined;
			variant?: ResizeEdge | undefined;
		},
	): ReactNode;

	<THeaderData>(
		props: SidebarHeaderBaseProps & {
			children?:
				| ((
						props: SidebarHeaderChildBaseProps & {
							data: THeaderData;
						},
				  ) => ReactNode)
				| undefined;
			headerData: THeaderData | undefined;
			variant?: ResizeEdge | undefined;
		},
	): ReactNode;

	secretKey: string;
}

export type SidebarHeaderChildProps<THeaderData> = THeaderData extends never
	? SidebarHeaderChildBaseProps
	: SidebarHeaderChildBaseProps & {
			data: THeaderData | undefined;
		};

export const SidebarHeader: SidebarHeaderComponent = <THeaderData,>({
	children: ChildrenComponent,
	headerData,
	variant,
}: {
	children?:
		| ((
				props: SidebarHeaderChildBaseProps & { data: THeaderData },
		  ) => ReactNode)
		| undefined;
	headerData?: THeaderData;
	variant?: ResizeEdge | undefined;
}): ReactNode => {
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
		const ChildrenComponentWithoutData = ChildrenComponent as (
			props: SidebarHeaderChildBaseProps,
		) => ReactNode;

		return <ChildrenComponentWithoutData getRootProps={getRootProps} />;
	}

	return <ChildrenComponent getRootProps={getRootProps} data={headerData} />;
};

SidebarHeader.secretKey = "Chronogramme-SidebarHeader";
