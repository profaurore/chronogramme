import { UNIT } from "@chronogramme/chronogramme";
import {
	Children,
	type CSSProperties,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { getReactChildProp, getReactChildSecretKey } from "../utils/reactUtils";
import { validateComponentProperties } from "../utils/unsupportedUtils";
import { SidebarHeader } from "./SidebarHeader";

const UNSUPPORTED_PROPERTIES = ["className", "style"] as const;

export const TimelineHeaders = (
	props: PropsWithChildren<{
		calendarHeaderClassName?: string | undefined;
		calendarHeaderStyle?: CSSProperties | undefined;

		/**
		 * @deprecated This property cannot be supported with this library's
		 * structure.
		 */
		className?: string | undefined;

		/**
		 * @deprecated This property cannot be supported with this library's
		 * structure.
		 */
		style?: CSSProperties | undefined;
	}>,
): ReactNode => {
	validateComponentProperties(props, UNSUPPORTED_PROPERTIES);

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
