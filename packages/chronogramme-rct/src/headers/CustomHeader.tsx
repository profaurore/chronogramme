import { HALF, UNIT } from "@chronogramme/chronogramme";
import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useMemo,
} from "react";
import { DEFAULT_HEADER_HEIGHT } from "../constants";
import {
	addUnitStep,
	alignWithUnitStep,
	startOfUnit,
} from "../utils/dateUtils";
import type { Unit } from "./DateHeader";
import type { ShowPeriod } from "./HeadersContext";
import { useHeadersContext } from "./useHeadersContext";

type GetRootProps = (args?: { style?: CSSProperties | undefined }) => {
	style: CSSProperties;
};

const getIntervalProps: GetIntervalProps = ({
	interval,
	style,
}: {
	interval: TimeInterval;
	style?: CSSProperties | undefined;
}) => {
	const { labelWidth, left } = interval;

	return {
		style: {
			...style,
			left,
			position: "absolute",
			width: labelWidth,
		},
	};
};

export interface TimeInterval {
	endTime: number;
	labelWidth: number;
	left: number;
	startTime: number;
}

export type GetIntervalProps = (args: {
	interval: TimeInterval;
	style?: CSSProperties | undefined;
}) => { style: CSSProperties };

export interface CustomHeaderChildProps<THeaderData> {
	timelineContext: {
		timelineWidth: number;
		visibleTimeEnd: number;
		visibleTimeStart: number;
		canvasTimeEnd: number;
		canvasTimeStart: number;
	};
	headerContext: {
		unit: Unit;
		intervals: TimeInterval[];
	};
	getRootProps: GetRootProps;
	getIntervalProps: GetIntervalProps;
	showPeriod: ShowPeriod;
	data: THeaderData;
}

export const CustomHeader = <THeaderData,>({
	unit,
	children: ChildrenComponent,
	headerData,
	height = DEFAULT_HEADER_HEIGHT,
}: {
	children: (props: CustomHeaderChildProps<THeaderData>) => ReactNode;
	headerData: THeaderData;
	height?: number | undefined;
	unit: Unit;
}): ReactNode => {
	const { showPeriod, timeSteps, timeline, timelineUnit } = useHeadersContext();

	const canvasTimeEnd = timeline.getHCanvasValueMax();
	const canvasTimeStart = timeline.getHCanvasValueMin();
	const timelineWidth = timeline.hWindowSize;
	const visibleTimeEnd = timeline.hWindowMax;
	const visibleTimeStart = timeline.hWindowMin;
	const width = timeline.hScrollSize;
	const windowRange = timeline.hWindowRange;

	const halfWindow = windowRange * HALF;
	const canvasStartTarget = visibleTimeStart - windowRange;
	const canvasEndTarget = visibleTimeEnd + windowRange;
	const canvasStart = Math.max(
		canvasStartTarget - (canvasStartTarget % halfWindow),
		timeline.hMin,
	);
	const canvasEnd = Math.min(
		canvasEndTarget + (halfWindow - (canvasEndTarget % halfWindow)),
		timeline.hMax,
	);

	const timeStep = unit === "week" ? UNIT : timeSteps[unit];
	const resolvedUnit = unit ?? timelineUnit;

	const intervals = useMemo(() => {
		// Align to the period start.
		const periodStart = startOfUnit(unit, canvasStart);

		// Align to the time step.
		let time = alignWithUnitStep(unit, timeStep, periodStart);

		const result: TimeInterval[] = [];

		while (time < canvasEnd) {
			const nextTime = addUnitStep(unit, timeStep, time);

			const left = timeline.getHPos(time);

			result.push({
				endTime: nextTime,
				labelWidth: timeline.getHPos(nextTime) - left,
				left,
				startTime: time,
			});

			time = nextTime;
		}

		return result;
	}, [canvasEnd, canvasStart, timeStep, timeline, unit]);

	const timelineContext = useMemo(
		() => ({
			canvasTimeEnd,
			canvasTimeStart,
			timelineWidth,
			visibleTimeEnd,
			visibleTimeStart,
		}),
		[
			canvasTimeEnd,
			canvasTimeStart,
			timelineWidth,
			visibleTimeEnd,
			visibleTimeStart,
		],
	);

	const headerContext = useMemo(
		() => ({
			intervals,
			unit: resolvedUnit,
		}),
		[intervals, resolvedUnit],
	);

	const getRootProps: GetRootProps = useCallback(
		(props) => ({
			style: {
				...props?.style,
				height,
				position: "relative",
				width,
			},
		}),
		[height, width],
	);

	return (
		<ChildrenComponent
			timelineContext={timelineContext}
			headerContext={headerContext}
			getRootProps={getRootProps}
			getIntervalProps={getIntervalProps}
			showPeriod={showPeriod}
			data={headerData}
		/>
	);
};
