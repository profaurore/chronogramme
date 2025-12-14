import { type CSSProperties, type ReactNode, useMemo } from "react";
import { DEFAULT_HEADER_HEIGHT, nextTimeUnits } from "../constants";
import { defaultLabelFormat } from "../utils/dateUtils";
import { UnsupportedPropertyValueError } from "../utils/unsupportedUtils";
import {
	CustomDateHeader,
	type CustomDateHeaderDataWithData,
	type CustomDateHeaderDataWithoutData,
	type CustomDateHeaderWithDataProps,
	type CustomDateHeaderWithoutDataProps,
} from "./CustomDateHeader";
import { CustomHeader } from "./CustomHeader";
import type {
	IntervalRendererWithData,
	IntervalRendererWithoutData,
} from "./Interval";
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

interface DateHeaderBaseProps {
	className?: string | undefined;
	height?: number | undefined;
	labelFormat?: (LabelFormatFn | string) | undefined;
	style?: CSSProperties | undefined;
	unit?: Unit | "primaryHeader" | undefined;
}

interface DateHeaderPropsWithoutData extends DateHeaderBaseProps {
	intervalRenderer?: IntervalRendererWithoutData | undefined;
}

interface DateHeaderPropsWithData<THeaderData> extends DateHeaderBaseProps {
	headerData: THeaderData;
	intervalRenderer?: IntervalRendererWithData<THeaderData> | undefined;
}

export function DateHeader(props: DateHeaderPropsWithoutData): ReactNode;
export function DateHeader<THeaderData>(
	props: DateHeaderPropsWithData<THeaderData>,
): ReactNode;
export function DateHeader<THeaderData>({
	className,
	headerData,
	height = DEFAULT_HEADER_HEIGHT,
	intervalRenderer,
	labelFormat = defaultLabelFormat,
	style,
	unit,
}: DateHeaderBaseProps & {
	headerData?: THeaderData;
	intervalRenderer?: IntervalRendererWithData<THeaderData> | undefined;
}): ReactNode {
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
					throw new UnsupportedPropertyValueError(
						"Format strings are unsupported. Implement a formatting function or use the default formatter.",
						"labelFormat",
						labelFormat,
					);
				}

				return labelFormat(interval, labelUnit, labelWidth);
			},
			...(headerData === undefined ? {} : { headerData }),
			intervalRenderer,
			style,
			unitProp: unit,
		}),
		[className, headerData, intervalRenderer, labelFormat, style, unit],
	);

	if (headerData === undefined) {
		const CustomDateHeaderWithoutData = CustomDateHeader as (
			props: CustomDateHeaderWithoutDataProps,
		) => ReactNode;
		const innerHeaderDataWithoutData =
			innerHeaderData as CustomDateHeaderDataWithoutData;

		return (
			<CustomHeader
				unit={
					unit === "primaryHeader"
						? nextTimeUnits[timelineUnit]
						: (unit ?? timelineUnit)
				}
				height={height}
				headerData={innerHeaderDataWithoutData}
			>
				{CustomDateHeaderWithoutData}
			</CustomHeader>
		);
	}

	const CustomDateHeaderWithData = CustomDateHeader as (
		props: CustomDateHeaderWithDataProps<THeaderData>,
	) => ReactNode;
	const innerHeaderDataWithData =
		innerHeaderData as CustomDateHeaderDataWithData<THeaderData>;

	return (
		<CustomHeader
			unit={
				unit === "primaryHeader"
					? nextTimeUnits[timelineUnit]
					: (unit ?? timelineUnit)
			}
			height={height}
			headerData={innerHeaderDataWithData}
		>
			{CustomDateHeaderWithData}
		</CustomHeader>
	);
}
