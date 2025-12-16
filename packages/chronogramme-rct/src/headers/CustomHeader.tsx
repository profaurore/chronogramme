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
import type { TimeInterval, Unit } from "./DateHeader";
import { useHeadersContext } from "./useHeadersContext";

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

export interface GetRootPropsArguments {
	style?: CSSProperties | undefined;
}

export interface GetRootPropsReturnType {
	style: CSSProperties;
}

export type GetRootProps = (
	args?: GetRootPropsArguments,
) => GetRootPropsReturnType;

export interface HeaderContext {
	unit: Unit;
	intervals: TimeInterval[];
}

export interface GetIntervalPropsArguments {
	interval: TimeInterval;
	style?: CSSProperties | undefined;
}

export interface GetIntervalPropsReturnType {
	style: CSSProperties;
}

export type GetIntervalProps = (
	args: GetIntervalPropsArguments,
) => GetIntervalPropsReturnType;

export type ShowPeriod = (from: number, to: number) => void;

export interface CustomHeaderChildWithoutDataProps {
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

export type CustomHeaderChildProps<THeaderData> =
	| CustomHeaderChildWithoutDataProps
	| CustomHeaderChildWithDataProps<THeaderData>;

export interface CustomHeaderBaseProps {
	height?: number | undefined;
	unit: Unit;
}

export type CustomHeaderChildWithoutData = (
	props: CustomHeaderChildWithoutDataProps,
) => ReactNode;

export type CustomHeaderChildWithData<THeaderData> = (
	props: CustomHeaderChildWithDataProps<THeaderData>,
) => ReactNode;

export interface CustomHeaderWithoutDataProps extends CustomHeaderBaseProps {
	children: CustomHeaderChildWithoutData;
}

export interface CustomHeaderWithDataProps<THeaderData>
	extends CustomHeaderBaseProps {
	children: CustomHeaderChildWithData<THeaderData>;
	headerData: THeaderData;
}

export type CustomHeaderProps<THeaderData> =
	| CustomHeaderWithoutDataProps
	| CustomHeaderWithDataProps<THeaderData>;

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
	children: CustomHeaderChildWithData<THeaderData>;
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
