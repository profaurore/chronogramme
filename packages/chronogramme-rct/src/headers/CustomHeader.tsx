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

	const windowRange = timeline.hWindowRange;
	const halfWindow = windowRange * HALF;
	const canvasStartTarget = timeline.hWindowMin - windowRange;
	const canvasEndTarget = timeline.hWindowMax + windowRange;
	const canvasStart = Math.max(
		canvasStartTarget - (canvasStartTarget % halfWindow),
		timeline.hMin,
	);
	const canvasEnd = Math.min(
		canvasEndTarget + (halfWindow - (canvasEndTarget % halfWindow)),
		timeline.hMax,
	);

	const intervals = useMemo(() => {
		// Align to the period start.
		const periodStart = startOfUnit(unit, canvasStart);

		// Align to the time step.
		let time = alignWithUnitStep(
			unit,
			unit === "week" ? UNIT : timeSteps[unit],
			periodStart,
		);

		const result: TimeInterval[] = [];

		while (time < canvasEnd) {
			const nextTime = addUnitStep(
				unit,
				unit === "week" ? UNIT : timeSteps[unit],
				time,
			);

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
	}, [canvasEnd, canvasStart, timeSteps, timeline.getHPos, unit]);

	const canvasTimeEnd = timeline.getHCanvasValueMax();
	const canvasTimeStart = timeline.getHCanvasValueMin();
	const timelineContext = useMemo(
		() => ({
			timelineWidth: timeline.hWindowSize,
			visibleTimeEnd: timeline.hWindowMax,
			visibleTimeStart: timeline.hWindowMin,
			canvasTimeEnd,
			canvasTimeStart,
		}),
		[
			canvasTimeEnd,
			canvasTimeStart,
			timeline.hWindowMax,
			timeline.hWindowMin,
			timeline.hWindowSize,
		],
	);

	const headerContext = useMemo(
		() => ({
			unit: unit ?? timelineUnit,
			intervals,
		}),
		[intervals, timelineUnit, unit],
	);

	const getRootProps: GetRootProps = useCallback(
		(props) => ({
			style: {
				...props?.style,
				position: "relative",
				width: timeline.hScrollSize,
				height,
			},
		}),
		[height, timeline.hScrollSize],
	);

	const getIntervalProps: GetIntervalProps = useCallback(
		({ interval, style }) => {
			const { labelWidth, left } = interval;

			return {
				style: {
					...style,
					left,
					position: "absolute",
					width: labelWidth,
				},
			};
		},
		[],
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
