import { UNIT } from "@chronogramme/chronogramme";
import { Children, type CSSProperties, type ReactNode } from "react";
import { getReactChildProp, getReactChildSecretKey } from "../utils/reactUtils";
import {
	type UnsupportedType,
	validateComponentProperties,
} from "../utils/unsupportedUtils";
import { SidebarHeader } from "./SidebarHeader";

const UNSUPPORTED_PROPERTIES = ["className", "style"] as const;

export interface TimelineHeadersProps {
	calendarHeaderClassName?: string | undefined;
	calendarHeaderStyle?: CSSProperties | undefined;
	children?: ReactNode | undefined;

	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	className?: UnsupportedType<
		string | undefined,
		"No alternative is available."
	>;

	/**
	 * @deprecated Unsupported property from React Calendar Timeline's API. No
	 * alternative is available.
	 */
	style?: UnsupportedType<
		CSSProperties | undefined,
		"No alternative is available."
	>;
}

export const TimelineHeaders = (props: TimelineHeadersProps): ReactNode => {
	validateComponentProperties("TimelineHeaders", props, UNSUPPORTED_PROPERTIES);

	const { calendarHeaderClassName, calendarHeaderStyle, children } = props;

	const rightSidebarHeaders: ReactNode[] = [];
	const leftSidebarHeaders: ReactNode[] = [];
	const calendarHeaders: ReactNode[] = [];

	Children.map(children, (child) => {
		if (getReactChildSecretKey(child) === SidebarHeader.secretKey) {
			if (getReactChildProp(child, "variant") === "right") {
				rightSidebarHeaders.push(child);
			} else {
				leftSidebarHeaders.push(child);
			}
		} else {
			calendarHeaders.push(child);
		}
	});

	if (leftSidebarHeaders.length > UNIT) {
		throw new Error(
			"more than one left <SidebarHeader /> child found under <TimelineHeaders />",
		);
	}

	if (rightSidebarHeaders.length > UNIT) {
		throw new Error(
			"more than one right <SidebarHeader /> child found under <TimelineHeaders />",
		);
	}

	const renderedLeftSidebarHeader = leftSidebarHeaders[0] ?? <SidebarHeader />;
	const renderedRightSidebarHeader = rightSidebarHeaders[0] ?? (
		<SidebarHeader variant="right" />
	);

	return (
		<>
			<div slot="corner-h-start-v-start">{renderedLeftSidebarHeader}</div>
			<div
				style={calendarHeaderStyle}
				slot="bar-v-start"
				className={`rct-calendar-header${calendarHeaderClassName ?? ""}`}
				data-testid="headerContainer"
			>
				{calendarHeaders}
			</div>
			<div slot="corner-h-end-v-start">{renderedRightSidebarHeader}</div>
		</>
	);
};

TimelineHeaders.secretKey = "Chronogramme-TimelineHeaders";
