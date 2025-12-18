import {
	type CSSProperties,
	type MouseEventHandler,
	type ReactNode,
	useMemo,
} from "react";
import { DEFAULT_HEADER_HEIGHT, nextTimeUnits } from "../constants";
import { defaultLabelFormat } from "../utils/dateUtils";
import {
	UnsupportedPropertyValueError,
	type UnsupportedType,
} from "../utils/unsupportedUtils";
import {
	CustomDateHeader,
	type CustomDateHeaderDataWithData,
	type CustomDateHeaderDataWithoutData,
	type CustomDateHeaderWithDataProps,
	type CustomDateHeaderWithoutDataProps,
} from "./CustomDateHeader";
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
	interval: [start: EpochTimeStamp, end: EpochTimeStamp],
	unit: Unit,
	labelWidth: number,
) => string;

export interface GetIntervalPropsArguments {
	onClick?: MouseEventHandler | undefined;
	style?: CSSProperties | undefined;
}

export type GetIntervalProps = (
	args?: GetIntervalPropsArguments | undefined,
) => {
	style: CSSProperties;
};

export interface TimeInterval {
	endTime: EpochTimeStamp;
	labelWidth: number;
	left: number;
	startTime: EpochTimeStamp;
}

export interface IntervalContext {
	interval: TimeInterval;
	intervalText: string;
}

export interface IntervalRendererWithoutDataProps {
	getIntervalProps: GetIntervalProps;
	intervalContext: IntervalContext;
}

export interface IntervalRendererWithDataProps<THeaderData>
	extends IntervalRendererWithoutDataProps {
	data: THeaderData;
}

export type IntervalRendererProps<THeaderData> =
	| IntervalRendererWithoutDataProps
	| IntervalRendererWithDataProps<THeaderData>;

export type IntervalRendererWithoutData = (
	props: IntervalRendererWithoutDataProps,
) => ReactNode;

export type IntervalRendererWithData<THeaderData> = (
	props: IntervalRendererWithDataProps<THeaderData>,
) => ReactNode;

export type IntervalRenderer<THeaderData> =
	| IntervalRendererWithoutData
	| IntervalRendererWithData<THeaderData>;

export interface DateHeaderBaseProps {
	className?: string | undefined;
	height?: number | undefined;
	/**
	 * Strings, from React Calendar Timeline's API, are not a supported type for
	 * the label format. Use a formatting function or the default formatter.
	 */
	labelFormat?:
		| (
				| LabelFormatFn
				| UnsupportedType<
						string,
						"Use a formatting function or the default formatter."
				  >
		  )
		| undefined;
	style?: CSSProperties | undefined;
	unit?: Unit | "primaryHeader" | undefined;
}

export interface DateHeaderWithoutDataProps extends DateHeaderBaseProps {
	intervalRenderer?: IntervalRendererWithoutData | undefined;
}

export interface DateHeaderWithDataProps<THeaderData>
	extends DateHeaderBaseProps {
	headerData: THeaderData;
	intervalRenderer?: IntervalRendererWithData<THeaderData> | undefined;
}

export type DateHeaderProps<THeaderData> =
	| DateHeaderWithoutDataProps
	| DateHeaderWithDataProps<THeaderData>;

export function DateHeader(props: DateHeaderWithoutDataProps): ReactNode;
export function DateHeader<THeaderData>(
	props: DateHeaderWithDataProps<THeaderData>,
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
				interval: [EpochTimeStamp, EpochTimeStamp],
				labelUnit: Unit,
				labelWidth: number,
			) => {
				if (typeof labelFormat === "string") {
					throw new UnsupportedPropertyValueError(
						"Format strings are unsupported. Use a formatting function or the default formatter.",
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
