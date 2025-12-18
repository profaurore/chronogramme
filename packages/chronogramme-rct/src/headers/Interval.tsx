import { UNIT } from "@chronogramme/chronogramme";
import { type ReactNode, useCallback, useMemo } from "react";
import { nextTimeUnits } from "../constants";
import { addUnitStep, startOfUnit } from "../utils/dateUtils";
import { composeEvents } from "../utils/reactUtils";
import type {
	GetIntervalProps as CustomHeaderGetIntervalProps,
	ShowPeriod,
} from "./CustomHeader";
import type {
	GetIntervalProps,
	IntervalRendererWithData,
	IntervalRendererWithoutData,
	TimeInterval,
	Unit,
} from "./DateHeader";

interface IntervalBaseProps {
	getIntervalProps: CustomHeaderGetIntervalProps;
	interval: TimeInterval;
	intervalText: string;
	primaryHeader: boolean;
	showPeriod: ShowPeriod;
	unit: Unit;
}

interface IntervalWithoutDataProps extends IntervalBaseProps {
	intervalRenderer?: IntervalRendererWithoutData | undefined;
}

interface IntervalWithDataProps<THeaderData> extends IntervalBaseProps {
	headerData: THeaderData;
	intervalRenderer?: IntervalRendererWithData<THeaderData> | undefined;
}

export function Interval(props: IntervalWithoutDataProps): ReactNode;
export function Interval<THeaderData>(
	props: IntervalWithDataProps<THeaderData>,
): ReactNode;
export function Interval<THeaderData>({
	getIntervalProps,
	headerData,
	interval,
	intervalRenderer: IntervalRendererComponent,
	intervalText,
	primaryHeader,
	showPeriod,
	unit,
}: IntervalBaseProps & {
	headerData?: THeaderData;
	intervalRenderer?:
		| IntervalRendererWithoutData
		| IntervalRendererWithData<THeaderData>
		| undefined;
}): ReactNode {
	const endTime = interval.endTime;
	const startTime = interval.startTime;

	const onClickHandler = useCallback(() => {
		if (primaryHeader) {
			const nextUnit = nextTimeUnits[unit];
			const newStartTime = startOfUnit(nextUnit, startTime);
			const newEndTime = addUnitStep(unit, UNIT, newStartTime);
			showPeriod(newStartTime, newEndTime);
		} else {
			showPeriod(startTime, endTime);
		}
	}, [endTime, startTime, primaryHeader, showPeriod, unit]);

	const getIntervalPropsHandler: GetIntervalProps = useCallback(
		(props) => ({
			...getIntervalProps({
				interval,
				style: props?.style,
			}),
			onClick: composeEvents(onClickHandler, props?.onClick),
		}),
		[getIntervalProps, interval, onClickHandler],
	);

	const intervalContext = useMemo(
		() => ({
			interval,
			intervalText,
		}),
		[interval, intervalText],
	);

	if (IntervalRendererComponent === undefined) {
		return (
			<div
				{...getIntervalProps({ interval })}
				className={`rct-dateHeader ${primaryHeader ? "rct-dateHeader-primary" : ""}`}
			>
				<span>{intervalText}</span>
			</div>
		);
	}

	if (headerData === undefined) {
		const IntervalComponentWithoutData = IntervalRendererComponent as (props: {
			getIntervalProps: GetIntervalProps;
			intervalContext: {
				interval: TimeInterval;
				intervalText: string;
			};
		}) => ReactNode;

		return (
			<IntervalComponentWithoutData
				getIntervalProps={getIntervalPropsHandler}
				intervalContext={intervalContext}
			/>
		);
	}

	return (
		<IntervalRendererComponent
			getIntervalProps={getIntervalPropsHandler}
			intervalContext={intervalContext}
			data={headerData}
		/>
	);
}
