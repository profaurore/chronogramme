import { UNIT, ZERO } from "@chronogramme/chronogramme";
import {
	Children,
	type CSSProperties,
	type ReactNode,
	useEffect,
	useRef,
} from "react";
import { getReactChildProp, getReactChildSecretKey } from "../utils/reactUtils";
import {
	type UnsupportedType,
	validateComponentProperties,
} from "../utils/unsupportedUtils";
import { DateHeader } from "./DateHeader";
import { SidebarHeader } from "./SidebarHeader";
import { useHeadersContext } from "./useHeadersContext";

const UNSUPPORTED_PROPERTIES = ["className", "style"] as const;

export interface TimelineHeadersProps {
	calendarHeaderClassName?: string | undefined;
	calendarHeaderStyle?: CSSProperties | undefined;
	children?: ReactNode | undefined;
	className?: string | undefined;

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

	const { leftSidebarWidth, rightSidebarWidth, setMaxHeight } =
		useHeadersContext();

	const leftRef = useRef<HTMLDivElement>(null);
	const centerRef = useRef<HTMLDivElement>(null);
	const rightRef = useRef<HTMLDivElement>(null);

	const leftContainer = leftRef?.current;
	const centerContainer = centerRef?.current;
	const rightContainer = rightRef?.current;

	useEffect(() => {
		const containers = [leftContainer, centerContainer, rightContainer].filter(
			(container): container is HTMLDivElement => container !== null,
		);

		if (containers.length > ZERO) {
			const observer = new ResizeObserver(() => {
				let maxHeight = ZERO;

				for (const container of containers) {
					maxHeight = Math.max(maxHeight, container.scrollHeight);
				}

				// Set a non-zero height so that the header isn't completely removed.
				setMaxHeight(maxHeight || Number.MIN_VALUE);
			});

			for (const container of containers) {
				if (container !== null) {
					observer.observe(container);
				}
			}

			return () => observer.disconnect();
		}

		// Set a non-zero height so that the header isn't completely removed.
		setMaxHeight(Number.MIN_VALUE);

		return;
	}, [centerContainer, leftContainer, rightContainer, setMaxHeight]);

	const { calendarHeaderClassName, calendarHeaderStyle, children, className } =
		props;

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

	return (
		<>
			{leftSidebarWidth > ZERO && (
				<div
					className={`rct-header-root ${className ?? ""}`}
					ref={leftRef}
					slot="corner-h-start-v-start"
					style={{ height: "100%", width: "100%" }}
				>
					{leftSidebarHeaders[0] ?? <SidebarHeader />}
				</div>
			)}
			<div
				className={`rct-header-root ${className ?? ""}`}
				ref={centerRef}
				style={{ height: "100%", width: "100%" }}
				slot="bar-v-start"
			>
				<div
					className={`rct-calendar-header ${calendarHeaderClassName ?? ""}`}
					ref={centerRef}
					style={calendarHeaderStyle}
				>
					{calendarHeaders.length > ZERO ? (
						calendarHeaders
					) : (
						<>
							<DateHeader unit="primaryHeader" />
							<DateHeader />
						</>
					)}
				</div>
			</div>
			{rightSidebarWidth > ZERO && (
				<div
					className={`rct-header-root ${className ?? ""}`}
					ref={rightRef}
					slot="corner-h-end-v-start"
					style={{ height: "100%", width: "100%" }}
				>
					{rightSidebarHeaders[0] ?? <SidebarHeader variant="right" />}
				</div>
			)}
		</>
	);
};

TimelineHeaders.secretKey = "Chronogramme-TimelineHeaders";
