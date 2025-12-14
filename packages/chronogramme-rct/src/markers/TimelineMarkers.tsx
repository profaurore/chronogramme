import type { ReactNode } from "react";

interface TimelineMarkersProps {
	children?: ReactNode | undefined;
}

export const TimelineMarkers = ({
	children,
}: TimelineMarkersProps): ReactNode => children;

TimelineMarkers.secretKey = "Chronogramme-TimelineMarkers";
