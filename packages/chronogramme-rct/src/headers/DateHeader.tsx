import { useMemo } from "react";
import { nextTimeUnits } from "../constants";
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
	height = 30,
	intervalRenderer,
	labelFormat = defaultLabelFormat,
	style,
	unit,
}: {
	className?: string | undefined;
	headerData?: THeaderData;
	height?: number | undefined;
	intervalRenderer?: (() => React.ReactNode) | undefined;
	labelFormat?: (LabelFormatFn | string) | undefined;
	style?: React.CSSProperties | undefined;
	unit?: Unit | "primaryHeader" | undefined;
}): React.ReactNode => {
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
