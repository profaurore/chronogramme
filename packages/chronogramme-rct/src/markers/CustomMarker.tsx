import { type CSSProperties, type ReactNode, useMemo } from "react";
import { markerStyle } from "../constants";
import { useHelpersContext } from "../helpers/useHelpersContext";
import { validateTime } from "../utils/unsupportedUtils";

export interface CustomMarkerChildArgs {
	date: number;
	styles: CSSProperties;
}

export type CustomMarkerChild = (args: CustomMarkerChildArgs) => ReactNode;

export interface CustomMarkerProps {
	children?: CustomMarkerChild;
	date: EpochTimeStamp;
}

export const CustomMarker = ({
	children: Children,
	date,
}: CustomMarkerProps): ReactNode => {
	validateTime("CustomMarker.date", date);

	const { getLeftOffsetFromDate } = useHelpersContext();

	const leftOffset = getLeftOffsetFromDate(date);

	const style = useMemo(
		() => ({
			...markerStyle,
			left: leftOffset,
		}),
		[leftOffset],
	);

	return Children ? (
		<Children date={date} styles={style} />
	) : (
		<div style={style} />
	);
};
