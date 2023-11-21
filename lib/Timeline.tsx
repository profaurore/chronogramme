import { css, cx } from "@linaria/core";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type UIEvent,
  useRef,
  useState,
} from "react";

import { mean } from "./math";

const containerClass = css`
  /* Defaults */
  --bottom-bar-height: 0px;
  --left-bar-width: 0px;
  --right-bar-width: 0px;
  --timeline-height: 1000px;
  --timeline-width: 1000px;
  --top-bar-height: 0px;

  display: flex;
  position: relative;
`;

const contentClass = css`
  display: grid;
  flex: 1;
  grid-template-areas:
    "top-left top top-right"
    "left center right"
    "bottom-left bottom bottom-right";
  grid-template-columns: var(--left-bar-width) var(--timeline-width) var(
      --right-bar-width
    );
  grid-template-rows: var(--top-bar-height) var(--timeline-height) var(
      --bottom-bar-height
    );
  overflow: auto;
  position: relative;

  /* Hide the scrollbars */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const timelineClass = css`
  background-image: repeating-linear-gradient(-45deg, #0000ff, #ff00ff 100px);
  grid-area: center;
  position: relative;
`;

const topBarClass = css`
  background-color: #ff0000;
  grid-area: top;
  position: sticky;
  top: 0;
`;

const leftBarClass = css`
  background-color: #00ff00;
  left: 0;
  grid-area: left;
  position: sticky;
`;

const rightBarClass = css`
  background-color: #00ff00;
  grid-area: right;
  position: sticky;
  right: 0;
`;

const bottomBarClass = css`
  background-color: #ff0000;
  bottom: 0;
  grid-area: bottom;
  position: sticky;
`;

const topLeftBarClass = css`
  background-color: #00ffff;
  left: 0;
  grid-area: top-left;
  position: sticky;
  top: 0;
`;

const topRightBarClass = css`
  background-color: #00ffff;
  grid-area: top-right;
  position: sticky;
  right: 0;
  top: 0;
`;

const bottomLeftBarClass = css`
  background-color: #00ffff;
  bottom: 0;
  left: 0;
  grid-area: bottom-left;
  position: sticky;
`;

const bottomRightBarClass = css`
  background-color: #00ffff;
  bottom: 0;
  grid-area: bottom-right;
  position: sticky;
  right: 0;
`;

const topDividerClass = css`
  /* Shared with *DividerClass */
  --bar-size: 3px;
  --interact-margin: 5px;
  --hover-size: 60px;

  /* Interaction area */
  & {
    top: var(--top-bar-height);

    /* Shared with bottomDividerClass */
    clip-path: polygon(
      var(--hover-size) calc(50% - var(--hover-size)),
      calc(100% - var(--hover-size)) calc(50% - var(--hover-size)),
      100% 50%,
      calc(100% - var(--hover-size)) calc(50% + var(--hover-size)),
      var(--hover-size) calc(50% + var(--hover-size)),
      0 50%
    );
    height: var(--bar-size);
    left: var(--left-bar-width);
    padding: var(--interact-margin) 0;
    right: var(--right-bar-width);
    transform: translateY(-50%);

    /* Shared with *DividerClass */
    background-clip: content-box;
    background-color: #ccc;
    box-sizing: content-box;
    opacity: 0;
    position: absolute;
    transition: opacity 0.25s ease-in 0.5s;

    &:hover {
      /* Shared with *DividerClass */
      opacity: 1;
      transition-delay: 0s;
      transition-duration: 0s;
    }
  }

  /* Cursor area */
  &::before {
    /* Shared with bottomDividerClass */
    cursor: ns-resize;

    /* Shared with *DividerClass */
    content: "";
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
    width: 100%;
  }

  /* Hover area */
  &::after {
    /* Shared with bottomDividerClass */
    height: var(--hover-size);
    top: 50%;
    transform: translateY(-50%);
    width: 100%;

    /* Shared with *DividerClass */
    content: "";
    position: absolute;
    z-index: -1;
  }
`;

const leftDividerClass = css`
  /* Shared with *DividerClass */
  --bar-size: 3px;
  --interact-margin: 5px;
  --hover-size: 60px;

  /* Interaction area */
  & {
    left: var(--left-bar-width);

    /* Shared with rightDividerClass */
    bottom: var(--bottom-bar-height);
    clip-path: polygon(
      calc(50% - var(--hover-size)) var(--hover-size),
      calc(50% - var(--hover-size)) calc(100% - var(--hover-size)),
      50% 100%,
      calc(50% + var(--hover-size)) calc(100% - var(--hover-size)),
      calc(50% + var(--hover-size)) var(--hover-size),
      50% 0
    );
    padding: 0 var(--interact-margin);
    top: var(--top-bar-height);
    transform: translateX(-50%);
    width: var(--bar-size);

    /* Shared with *DividerClass */
    background-clip: content-box;
    background-color: #ccc;
    box-sizing: content-box;
    opacity: 0;
    position: absolute;
    transition: opacity 0.25s ease-in 0.5s;

    &:hover {
      /* Shared with *DividerClass */
      opacity: 1;
      transition-delay: 0s;
      transition-duration: 0s;
    }
  }

  /* Cursor area */
  &::before {
    /* Shared with rightDividerClass */
    cursor: ew-resize;

    /* Shared with *DividerClass */
    content: "";
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
    width: 100%;
  }

  /* Hover area */
  &::after {
    /* Shared with rightDividerClass */
    height: 100%;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: var(--hover-size);

    /* Shared with *DividerClass */
    content: "";
    position: absolute;
    z-index: -1;
  }
`;

const rightDividerClass = css`
  /* Shared with *DividerClass */
  --bar-size: 3px;
  --interact-margin: 5px;
  --hover-size: 60px;

  /* Interaction area */
  & {
    left: calc(100% - var(--right-bar-width));

    /* Shared with rightDividerClass */
    bottom: var(--bottom-bar-height);
    clip-path: polygon(
      calc(50% - var(--hover-size)) var(--hover-size),
      calc(50% - var(--hover-size)) calc(100% - var(--hover-size)),
      50% 100%,
      calc(50% + var(--hover-size)) calc(100% - var(--hover-size)),
      calc(50% + var(--hover-size)) var(--hover-size),
      50% 0
    );
    padding: 0 var(--interact-margin);
    top: var(--top-bar-height);
    transform: translateX(-50%);
    width: var(--bar-size);

    /* Shared with *DividerClass */
    background-clip: content-box;
    background-color: #ccc;
    box-sizing: content-box;
    opacity: 0;
    position: absolute;
    transition: opacity 0.25s ease-in 0.5s;

    &:hover {
      /* Shared with *DividerClass */
      opacity: 1;
      transition-delay: 0s;
      transition-duration: 0s;
    }
  }

  /* Cursor area */
  &::before {
    /* Shared with rightDividerClass */
    cursor: ew-resize;

    /* Shared with *DividerClass */
    content: "";
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
    width: 100%;
  }

  /* Hover area */
  &::after {
    /* Shared with rightDividerClass */
    height: 100%;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: var(--hover-size);

    /* Shared with *DividerClass */
    content: "";
    position: absolute;
    z-index: -1;
  }
`;

const bottomDividerClass = css`
  /* Shared with *DividerClass */
  --bar-size: 3px;
  --interact-margin: 5px;
  --hover-size: 60px;

  /* Interaction area */
  & {
    top: calc(100% - var(--bottom-bar-height));

    /* Shared with topDividerClass */
    clip-path: polygon(
      var(--hover-size) calc(50% - var(--hover-size)),
      calc(100% - var(--hover-size)) calc(50% - var(--hover-size)),
      100% 50%,
      calc(100% - var(--hover-size)) calc(50% + var(--hover-size)),
      var(--hover-size) calc(50% + var(--hover-size)),
      0 50%
    );
    height: var(--bar-size);
    left: var(--left-bar-width);
    padding: var(--interact-margin) 0;
    right: var(--right-bar-width);
    transform: translateY(-50%);

    /* Shared with *DividerClass */
    background-clip: content-box;
    background-color: #ccc;
    box-sizing: content-box;
    opacity: 0;
    position: absolute;
    transition: opacity 0.25s ease-in 0.5s;

    &:hover {
      /* Shared with *DividerClass */
      opacity: 1;
      transition-delay: 0s;
      transition-duration: 0s;
    }
  }

  /* Cursor area */
  &::before {
    /* Shared with topDividerClass */
    cursor: ns-resize;

    /* Shared with *DividerClass */
    content: "";
    height: 100%;
    left: 0;
    top: 0;
    position: absolute;
    width: 100%;
  }

  /* Hover area */
  &::after {
    /* Shared with topDividerClass */
    height: var(--hover-size);
    top: 50%;
    transform: translateY(-50%);
    width: 100%;

    /* Shared with *DividerClass */
    content: "";
    position: absolute;
    z-index: -1;
  }
`;

interface Coordinates {
  x: number;
  y: number;
}

enum BarSide {
  Bottom = "bottom",
  Left = "left",
  Right = "right",
  Top = "top",
}

const ResizeDivider = ({
  className,
  onResize,
  side,
}: Readonly<{
  className?: string;
  onResize: (target: Coordinates, side: BarSide) => void;
  side: BarSide;
}>): ReactNode => {
  const onStartResizing = (event: Readonly<ReactMouseEvent>): void => {
    event.stopPropagation();

    const { clientX, clientY, currentTarget } = event;

    const { bottom, left, right, top } = currentTarget.getBoundingClientRect();
    const isInsideBoundingRect =
      clientX >= left &&
      clientX <= right &&
      clientY >= top &&
      clientY <= bottom;

    /*
     * The element may have pseudo-elements that are rendered outside of its
     * bounding rectangle. Only start dragging if the event started inside of
     * the rectangle.
     */
    if (!isInsideBoundingRect) return;

    /*
     * Determine the distance from the centerline of the divider so that the
     * relative position can be maintained while dragging. This avoids jumping
     * caused by the center of the divider jumping to the location of the
     * cursor.
     */
    const centerX = mean(left, right);
    const centerY = mean(bottom, top);
    const offsetX = centerX - clientX;
    const offsetY = centerY - clientY;

    const onMoveResizing = (event: Readonly<MouseEvent>): void => {
      event.stopPropagation();

      const { clientX, clientY } = event;

      // Maintain the position of the divider relative to the cursor.
      const target = {
        x: clientX + offsetX,
        y: clientY + offsetY,
      };

      onResize(target, side);
    };

    const onStopResizing = (): void => {
      document.removeEventListener("mousemove", onMoveResizing, false);
      document.removeEventListener("mouseup", onStopResizing, false);
    };

    document.addEventListener("mousemove", onMoveResizing, false);
    document.addEventListener("mouseup", onStopResizing, false);
  };

  return <div className={className} onMouseDown={onStartResizing} />;
};

const timelineMinHeight = 100;
const timelineMinWidth = 100;
const verticalBarMinHeight = 50;
const horizontalBarMinWidth = 100;

const calcNewBarsDimensions = (
  container: HTMLDivElement | null | undefined,
  barsDimensions: BarsDimensions,
  dimension: BarSide,
  targetCoordinates: Coordinates,
): BarsDimensions | undefined => {
  if (!container) {
    return;
  }

  let containerSize: number;

  let barMinSize: number;

  let otherBarSize: number;

  /*
   * The target size is defined as the distance from the outer edge of the bar
   * to the target position of the inner edge.
   */
  let targetSize: number;

  let timelineMinSize: number;

  switch (dimension) {
    case BarSide.Bottom:
      containerSize = container.clientHeight;
      barMinSize = verticalBarMinHeight;
      otherBarSize = barsDimensions.top;
      targetSize =
        container.clientTop + container.clientHeight - targetCoordinates.y;
      timelineMinSize = timelineMinHeight;
      break;

    case BarSide.Left:
      containerSize = container.clientWidth;
      barMinSize = horizontalBarMinWidth;
      otherBarSize = barsDimensions.right;
      targetSize = targetCoordinates.x - container.clientLeft;
      timelineMinSize = timelineMinWidth;
      break;

    case BarSide.Right:
      containerSize = container.clientWidth;
      barMinSize = horizontalBarMinWidth;
      otherBarSize = barsDimensions.left;
      targetSize =
        container.clientLeft + container.clientWidth - targetCoordinates.x;
      timelineMinSize = timelineMinWidth;
      break;

    case BarSide.Top:
      containerSize = container.clientHeight;
      barMinSize = verticalBarMinHeight;
      otherBarSize = barsDimensions.bottom;
      targetSize = targetCoordinates.y - container.clientTop;
      timelineMinSize = timelineMinHeight;
      break;
  }

  /*
   * The maximum width is defined by the maximum available size assuming the
   * timeline shrinks to its minimum size.
   */
  const barMaxSize = containerSize - timelineMinSize - otherBarSize;

  /*
   * If the minimum possible size of the bar exceeds its maximum possible size,
   * do not update its dimensions.
   */
  if (barMinSize > barMaxSize) {
    return;
  }

  /*
   * The resulting width is clamped between the minimum width of the bar and
   * the maximum available width if the timeline shrank as much as it can.
   */
  const newBarSize = Math.min(Math.max(targetSize, barMinSize), barMaxSize);

  return {
    ...barsDimensions,
    [dimension]: newBarSize,
  };
};

export interface DimensionCSSProperties extends CSSProperties {
  "--bottom-bar-height": string;
  "--left-bar-width": string;
  "--right-bar-width": string;
  "--timeline-height": string;
  "--timeline-width": string;
  "--top-bar-height": string;
}

type BarsDimensions = {
  [key in BarSide]: number;
};

export const Timeline = ({
  className,
  timeEnd,
  timeStart,
}: Readonly<{
  className?: string;
  timeEnd: number;
  timeStart: number;
}>): ReactNode => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [barDimensions, setBarDimensions] = useState<BarsDimensions>({
    bottom: verticalBarMinHeight,
    left: horizontalBarMinWidth,
    right: horizontalBarMinWidth,
    top: verticalBarMinHeight,
  });

  const [visibleTime, setVisibleTime] = useState<{
    end: number;
    start: number;
  }>({
    end: timeEnd,
    start: timeStart,
  });

  const onResizeBar = (
    targetCoordinates: Coordinates,
    dimension: BarSide,
  ): void => {
    const containerBar = containerRef.current;

    const newBarDimensions = calcNewBarsDimensions(
      containerBar,
      barDimensions,
      dimension,
      targetCoordinates,
    );

    if (newBarDimensions) {
      setBarDimensions(newBarDimensions);
    }
  };

  const lastScrollPositionRef = useRef<Coordinates>({ x: 0, y: 0 });
  const onScrollHandler = (event: Readonly<UIEvent<HTMLDivElement>>): void => {
    const { target } = event;

    if (target instanceof Element) {
      const { clientWidth, scrollLeft, scrollTop } = target;

      const timelineWidth =
        clientWidth - barDimensions.left - barDimensions.right;

      const { x: lastX, y: lastY } = lastScrollPositionRef.current;

      const deltaX = scrollLeft - lastX;
      const deltaY = scrollTop - lastY;
      console.log(deltaX, deltaY);

      // numerical stability + overflow
      const { start: lastVisibleStart, end: lastVisibleEnd } = visibleTime;
      const dateRange = lastVisibleEnd - lastVisibleStart;
      const deltaDate = dateRange * (deltaX / timelineWidth);
      const newVisibleTimeStart = lastVisibleStart + deltaDate;
      const newVisibleTimeEnd = newVisibleTimeStart + dateRange;

      setVisibleTime({ end: newVisibleTimeEnd, start: newVisibleTimeStart });

      lastScrollPositionRef.current = { x: scrollLeft, y: scrollTop };
    }
  };

  const dimensionStyles: DimensionCSSProperties = {
    "--bottom-bar-height": `${barDimensions.bottom}px`,
    "--left-bar-width": `${barDimensions.left}px`,
    "--right-bar-width": `${barDimensions.right}px`,
    "--timeline-height": "500px",
    "--timeline-width": "1000px",
    "--top-bar-height": `${barDimensions.top}px`,
  };

  const start = new Date(visibleTime.start);
  const dateStartString = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}T${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}Z`;
  const end = new Date(visibleTime.end);
  const dateEndString = `${end.getFullYear()}-${end.getMonth()}-${end.getDate()}T${end.getHours()}:${end.getMinutes()}:${end.getSeconds()}Z`;

  console.log(`${dateStartString} - ${dateEndString}`);

  return (
    <div
      className={cx(containerClass, className)}
      ref={containerRef}
      style={dimensionStyles}
    >
      <div className={contentClass} onScroll={onScrollHandler}>
        {/* Center */}
        <div className={timelineClass}>timeline</div>

        {/* Sides */}
        <div className={topBarClass}>top</div>
        <div className={leftBarClass}>left</div>
        <div className={rightBarClass}>right</div>
        <div className={bottomBarClass}>bottom</div>

        {/* Corners */}
        <div className={topLeftBarClass}>top-left</div>
        <div className={topRightBarClass}>top-right</div>
        <div className={bottomLeftBarClass}>bottom-left</div>
        <div className={bottomRightBarClass}>bottom-right</div>
      </div>

      {/* Resize handles */}
      <ResizeDivider
        className={topDividerClass}
        onResize={onResizeBar}
        side={BarSide.Top}
      />
      <ResizeDivider
        className={leftDividerClass}
        onResize={onResizeBar}
        side={BarSide.Left}
      />
      <ResizeDivider
        className={rightDividerClass}
        onResize={onResizeBar}
        side={BarSide.Right}
      />
      <ResizeDivider
        className={bottomDividerClass}
        onResize={onResizeBar}
        side={BarSide.Bottom}
      />
    </div>
  );
};
