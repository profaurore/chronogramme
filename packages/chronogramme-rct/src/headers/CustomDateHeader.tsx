import type { CSSProperties, ReactNode } from "react";
import type { CustomHeaderChildProps } from "./CustomHeader";
import type { Unit } from "./DateHeader";
import { Interval } from "./Interval";

export const CustomDateHeader = <THeaderData,>({
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
}: CustomHeaderChildProps<{
	className: string | undefined;
	getLabelFormat: (
		interval: [number, number],
		labelUnit: Unit,
		labelWidth: number,
	) => string;
	headerData: THeaderData | undefined;
	intervalRenderer: (() => ReactNode) | undefined;
	style: CSSProperties | undefined;
	unitProp: Unit | "primaryHeader" | undefined;
}>): ReactNode => (
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
