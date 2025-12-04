import type { TimeSteps } from "./timeline";

export const RIGHT_VARIANT = "right";

export const leftResizeStyle = {
	position: "absolute",
	width: 24,
	maxWidth: "20%",
	minWidth: 2,
	height: "100%",
	top: 0,
	left: 0,
	cursor: "pointer",
	zIndex: 88,
} as const;

export const overridableStyles = {
	fontSize: 12,
	color: "white",
	cursor: "pointer",
	background: "#2196f3",
	borderTopWidth: "1px",
	borderBottomWidth: "1px",
	borderLeftWidth: "1px",
	borderRightWidth: "1px",
	borderStyle: "solid",
	borderColor: "#1a6fb3",
	zIndex: 80,
} as const;

export const rightResizeStyle = {
	position: "absolute",
	width: 24,
	maxWidth: "20%",
	minWidth: 2,
	height: "100%",
	top: 0,
	right: 0,
	cursor: "pointer",
	zIndex: 88,
} as const;

export const selectedAndCanMove = {
	willChange: "left, top, width",
	cursor: "move",
} as const;

export const selectedAndCanResizeLeft = {
	borderLeftWidth: 3,
} as const;

export const selectedAndCanResizeLeftAndDragLeft = {
	cursor: "w-resize",
} as const;

export const selectedAndCanResizeRight = {
	borderRightWidth: "3px",
} as const;

export const selectedAndCanResizeRightAndDragRight = {
	cursor: "e-resize",
} as const;

export const selectedStyle = {
	background: "#ffc107",
	borderTopWidth: "1px",
	borderLeftWidth: "1px",
	borderRightWidth: "1px",
	borderBottomWidth: "1px",
	borderStyle: "solid",
	borderColor: "#ff9800",
	zIndex: 82,
} as const;

export const defaultKeys = {
	groupIdKey: "id",
	groupRightTitleKey: "rightTitle",
	groupTitleKey: "title",
	itemDivTitleKey: "title",
	itemGroupKey: "group",
	itemIdKey: "id",
	itemTimeEndKey: "end_time",
	itemTimeStartKey: "start_time",
	itemTitleKey: "title",
} as const;

export const defaultTimeSteps = {
	second: 1,
	minute: 1,
	hour: 1,
	day: 1,
	month: 1,
	year: 1,
} as const;

export const minCellWidth = 17;

export const timeFactors: Record<keyof TimeSteps, number> = {
	second: 1000,
	minute: 60,
	hour: 60,
	day: 24,
	month: 30,
	year: 12,
} as const;

export const nextTimeUnits = {
	second: "minute",
	minute: "hour",
	hour: "day",
	day: "week",
	week: "month",
	month: "year",
	year: "year",
} as const;

export const STYLE_SIZE_PRECISION = 4;

export const DEFAULT_HEADER_HEIGHT = 30;
