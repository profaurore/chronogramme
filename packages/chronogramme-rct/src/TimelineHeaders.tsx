import { UNIT } from "@chronogramme/chronogramme";
import { Children } from "react";
import { RIGHT_VARIANT } from "./constants";
import { SidebarHeader } from "./SidebarHeader";
import { getReactChildProp, reactChildHasSecretKey } from "./utils";

export const TimelineHeaders = ({
	calendarHeaderClassName,
	calendarHeaderStyle,
	children,
}: React.PropsWithChildren<{
	calendarHeaderClassName?: string | undefined;
	calendarHeaderStyle?: React.CSSProperties | undefined;

	/**
	 * @deprecated This property cannot be supported with this library's
	 * structure.
	 */
	className?: string | undefined;

	/**
	 * @deprecated This property cannot be supported with this library's
	 * structure.
	 */
	style?: React.CSSProperties | undefined;
}>): React.ReactNode => {
	const rightSidebarHeaders: React.ReactNode[] = [];
	const leftSidebarHeaders: React.ReactNode[] = [];
	const calendarHeaders: React.ReactNode[] = [];

	Children.map(children, (child) => {
		if (reactChildHasSecretKey(child, SidebarHeader.secretKey)) {
			if (getReactChildProp(child, "variant") === RIGHT_VARIANT) {
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
				style={{
					...calendarHeaderStyle,
				}}
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
