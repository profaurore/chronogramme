import { type CSSProperties, type ReactNode, useMemo } from "react";
import { DEFAULT_HEADER_HEIGHT, nextTimeUnits } from "../constants";
import { defaultLabelFormat } from "../utils/dateUtils";
import { CustomDateHeader } from "./CustomDateHeader";
import { CustomHeader } from "./CustomHeader";
import { useHeadersContext } from "./useHeadersContext";

export type Unit =
	| "second"
	| "minute"
	| "hour"
	| "day"
	| "week"
	| "month"
	| "year";

export type LabelFormatFn = (
	[timeStart, timeEnd]: [number, number],
	unit: Unit,
	labelWidth: number,
) => string;

export const DateHeader = <THeaderData,>({
	className,
	headerData,
	height = DEFAULT_HEADER_HEIGHT,
	intervalRenderer,
	labelFormat = defaultLabelFormat,
	style,
	unit,
}: {
	className?: string | undefined;
	// TODO: Only make optional if THeaderData is undefined (or never?)
	headerData?: THeaderData;
	height?: number | undefined;
	intervalRenderer?: (() => ReactNode) | undefined;
	labelFormat?: (LabelFormatFn | string) | undefined;
	style?: CSSProperties | undefined;
	unit?: Unit | "primaryHeader" | undefined;
}): ReactNode => {
	const { timelineUnit } = useHeadersContext();

	const innerHeaderData = useMemo(
		() => ({
			className,
			getLabelFormat: (
				interval: [number, number],
				labelUnit: Unit,
				labelWidth: number,
			) => {
				if (typeof labelFormat === "string") {
					throw new Error(
						"Format strings are not supported. Implement a formatting function or use the default formatter.",
					);
				}

				return labelFormat(interval, labelUnit, labelWidth);
			},
			headerData,
			intervalRenderer,
			style,
			unitProp: unit,
		}),
		[className, headerData, intervalRenderer, labelFormat, style, unit],
	);

	return (
		<CustomHeader
			unit={
				unit === "primaryHeader"
					? nextTimeUnits[timelineUnit]
					: (unit ?? timelineUnit)
			}
			height={height}
			headerData={innerHeaderData}
		>
			{CustomDateHeader}
		</CustomHeader>
	);
};
