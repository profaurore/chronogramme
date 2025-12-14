import { HALF, UNIT } from "@chronogramme/chronogramme";
import {
	type CSSProperties,
	type ReactNode,
	useCallback,
	useMemo,
} from "react";
import { DEFAULT_HEADER_HEIGHT } from "../constants";
import type { TimelineContext } from "../Timeline";
import {
	addUnitStep,
	alignWithUnitStep,
	startOfUnit,
} from "../utils/dateUtils";
import type { Unit } from "./DateHeader";
import type { ShowPeriod } from "./HeadersContext";
import { useHeadersContext } from "./useHeadersContext";

interface GetRootPropsArguments {
	style?: CSSProperties | undefined;
}

interface GetRootPropsReturnType {
	style: CSSProperties;
}

type GetRootProps = (args?: GetRootPropsArguments) => GetRootPropsReturnType;

const getIntervalProps: GetIntervalProps = ({
	interval,
	style,
}: GetIntervalPropsArguments) => {
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

interface HeaderContext {
	unit: Unit;
	intervals: TimeInterval[];
}

interface GetIntervalPropsArguments {
	interval: TimeInterval;
	style?: CSSProperties | undefined;
}

interface GetIntervalPropsReturnType {
	style: CSSProperties;
}

export type GetIntervalProps = (
	args: GetIntervalPropsArguments,
) => GetIntervalPropsReturnType;

interface CustomHeaderChildWithoutDataProps {
	timelineContext: TimelineContext;
	headerContext: HeaderContext;
	getRootProps: GetRootProps;
	getIntervalProps: GetIntervalProps;
	showPeriod: ShowPeriod;
}

export interface CustomHeaderChildWithDataProps<THeaderData>
	extends CustomHeaderChildWithoutDataProps {
	data: THeaderData;
}

interface CustomHeaderBaseProps {
	height?: number | undefined;
	unit: Unit;
}

interface CustomHeaderWithoutDataProps extends CustomHeaderBaseProps {
	children: (props: CustomHeaderChildWithoutDataProps) => ReactNode;
}

interface CustomHeaderWithDataProps<THeaderData> extends CustomHeaderBaseProps {
	children: (props: CustomHeaderChildWithDataProps<THeaderData>) => ReactNode;
	headerData: THeaderData;
}

export function CustomHeader(props: CustomHeaderWithoutDataProps): ReactNode;
export function CustomHeader<THeaderData>(
	props: CustomHeaderWithDataProps<THeaderData>,
): ReactNode;
export function CustomHeader<THeaderData>({
	unit,
	children: ChildrenComponent,
	headerData,
	height = DEFAULT_HEADER_HEIGHT,
}: CustomHeaderBaseProps & {
	children: (props: CustomHeaderChildWithDataProps<THeaderData>) => ReactNode;
	headerData?: THeaderData;
}): ReactNode {
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

	if (headerData === undefined) {
		const ChildrenComponentWithoutData = ChildrenComponent as (
			props: CustomHeaderChildWithoutDataProps,
		) => ReactNode;

		return (
			<ChildrenComponentWithoutData
				timelineContext={timelineContext}
				headerContext={headerContext}
				getRootProps={getRootProps}
				getIntervalProps={getIntervalProps}
				showPeriod={showPeriod}
			/>
		);
	}

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
}
