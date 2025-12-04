import { UNIT } from "@chronogramme/chronogramme";
import {
	type CSSProperties,
	type MouseEventHandler,
	type ReactNode,
	useCallback,
	useMemo,
} from "react";
import { nextTimeUnits } from "../constants";
import { addUnitStep, startOfUnit } from "../utils/dateUtils";
import { composeEvents } from "../utils/reactUtils";
import type {
	GetIntervalProps as CustomHeaderGetIntervalProps,
	TimeInterval,
} from "./CustomHeader";
import type { Unit } from "./DateHeader";
import type { ShowPeriod } from "./HeadersContext";

type GetIntervalProps = (
	args?:
		| {
				onClick?: MouseEventHandler | undefined;
				style?: CSSProperties | undefined;
		  }
		| undefined,
) => { style: CSSProperties };

type IntervalRenderer<THeaderData> = (props: {
	getIntervalProps: GetIntervalProps;
	intervalContext: {
		interval: TimeInterval;
		intervalText: string;
	};
	data: THeaderData;
}) => ReactNode;

export const Interval = <THeaderData,>({
	getIntervalProps,
	headerData,
	interval,
	intervalRenderer: IntervalComponent,
	intervalText,
	primaryHeader,
	showPeriod,
	unit,
}: {
	getIntervalProps: CustomHeaderGetIntervalProps;
	headerData: THeaderData;
	interval: TimeInterval;
	intervalRenderer: IntervalRenderer<THeaderData> | undefined;
	intervalText: string;
	primaryHeader: boolean;
	showPeriod: ShowPeriod;
	unit: Unit;
}): ReactNode => {
	const onClickHandler = useCallback(() => {
		if (primaryHeader) {
			const nextUnit = nextTimeUnits[unit];
			const newStartTime = startOfUnit(nextUnit, interval.startTime);
			const newEndTime = addUnitStep(unit, UNIT, newStartTime);
			showPeriod(newStartTime, newEndTime);
		} else {
			showPeriod(interval.startTime, interval.endTime);
		}
	}, [interval.endTime, interval.startTime, primaryHeader, showPeriod, unit]);

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

	if (IntervalComponent !== undefined) {
		return (
			<IntervalComponent
				getIntervalProps={getIntervalPropsHandler}
				intervalContext={intervalContext}
				data={headerData}
			/>
		);
	}

	return (
		<div
			data-testid="dateHeaderInterval"
			{...getIntervalProps({ interval })}
			className={`rct-dateHeader ${primaryHeader ? "rct-dateHeader-primary" : ""}`}
		>
			<span>{intervalText}</span>
		</div>
	);
};
