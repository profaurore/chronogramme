import type { CSSProperties, ReactNode } from "react";
import type { CustomHeaderChildWithDataProps } from "./CustomHeader";
import type { Unit } from "./DateHeader";
import {
	Interval,
	type IntervalRendererWithData,
	type IntervalRendererWithoutData,
} from "./Interval";

type GetLabelFormat = (
	interval: [number, number],
	labelUnit: Unit,
	labelWidth: number,
) => string;

interface CustomDateHeaderDataBase {
	className: string | undefined;
	getLabelFormat: GetLabelFormat;
	style: CSSProperties | undefined;
	unitProp: Unit | "primaryHeader" | undefined;
}

export interface CustomDateHeaderDataWithoutData
	extends CustomDateHeaderDataBase {
	intervalRenderer: IntervalRendererWithoutData;
}

export interface CustomDateHeaderDataWithData<THeaderData>
	extends CustomDateHeaderDataBase {
	intervalRenderer: IntervalRendererWithData<THeaderData>;
	headerData: THeaderData;
}

export type CustomDateHeaderWithoutDataProps =
	CustomHeaderChildWithDataProps<CustomDateHeaderDataWithoutData>;

export type CustomDateHeaderWithDataProps<THeaderData> =
	CustomHeaderChildWithDataProps<CustomDateHeaderDataWithData<THeaderData>>;

export function CustomDateHeader(
	props: CustomDateHeaderWithoutDataProps,
): ReactNode;
export function CustomDateHeader<THeaderData>(
	props: CustomDateHeaderWithDataProps<THeaderData>,
): ReactNode;
export function CustomDateHeader<THeaderData>({
	headerContext: { intervals, unit },
	getRootProps,
	getIntervalProps,
	showPeriod,
	data: {
		style,
		intervalRenderer,
		className,
		getLabelFormat,
		unitProp,
		headerData,
	},
}: CustomHeaderChildWithDataProps<
	CustomDateHeaderDataBase & {
		intervalRenderer:
			| IntervalRendererWithoutData
			| IntervalRendererWithData<THeaderData>;
		headerData?: THeaderData;
	}
>): ReactNode {
	return (
		<div
			data-testid="dateHeader"
			className={className}
			{...getRootProps({ style })}
		>
			{intervals.map((interval) => {
				const intervalText = getLabelFormat(
					[interval.startTime, interval.endTime],
					unit,
					interval.labelWidth,
				);

				if (headerData === undefined) {
					const intervalRendererWithoutData =
						intervalRenderer as IntervalRendererWithoutData;

					return (
						<Interval
							key={`label-${interval.startTime.valueOf()}`}
							unit={unit}
							interval={interval}
							showPeriod={showPeriod}
							intervalText={intervalText}
							primaryHeader={unitProp === "primaryHeader"}
							getIntervalProps={getIntervalProps}
							intervalRenderer={intervalRendererWithoutData}
						/>
					);
				}

				return (
					<Interval
						key={`label-${interval.startTime.valueOf()}`}
						unit={unit}
						interval={interval}
						showPeriod={showPeriod}
						intervalText={intervalText}
						primaryHeader={unitProp === "primaryHeader"}
						getIntervalProps={getIntervalProps}
						intervalRenderer={intervalRenderer}
						headerData={headerData}
					/>
				);
			})}
		</div>
	);
}
