import { css, cx } from "@linaria/core";
import {
  type CSSProperties,
  forwardRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type UIEvent,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { clamp, half, mean, unit, unitPercent } from "./math";
import {
  clampTimeRange,
  clampTimeRangeProperties,
  TIME_MAX,
  TIME_MIN,
} from "./time";

const contentToViewportRatio = 3;

const containerClass = css`
  /* Defaults */
  --bottom-bar-height: 0px;
  --left-bar-width: 0px;
  --right-bar-width: 0px;
  --timeline-height: 1000px;
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
  grid-template-columns: var(--left-bar-width) 300% var(--right-bar-width);
  grid-template-rows: var(--top-bar-height) minmax(var(--timeline-height), 1fr) var(
      --bottom-bar-height
    );
  height: 100%;
  overflow: auto;
  position: relative;
  width: ${contentToViewportRatio * unitPercent}%;

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

interface ScrollState {
  scrollX: number;
  scrollY: number;
  timeEnd: number;
  timeMax: number;
  timeMin: number;
  timeStart: number;
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

    // The element may have pseudo-elements that are rendered outside of its
    // bounding rectangle. Only start dragging if the event started inside of
    // the rectangle.
    if (!isInsideBoundingRect) {
      return;
    }

    // Determine the distance from the centerline of the divider so that the
    // relative position can be maintained while dragging. This avoids jumping
    // caused by the center of the divider jumping to the location of the
    // cursor.
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

const barResizeHandler = (
  container: HTMLDivElement,
  barsDimensions: BarsDimensions,
  dimension: BarSide,
  targetCoordinates: Coordinates,
): BarsDimensions => {
  let containerSize: number;

  let barMinSize: number;

  let otherBarSize: number;

  // The target size is defined as the distance from the outer edge of the bar
  // to the target position of the inner edge.
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

  // The maximum width is defined by the maximum available size assuming the
  // timeline shrinks to its minimum size.
  const barMaxSize = containerSize - timelineMinSize - otherBarSize;

  // If the minimum possible size of the bar exceeds its maximum possible size,
  // do not update its dimensions.
  if (barMinSize > barMaxSize) {
    return barsDimensions;
  }

  // The resulting width is clamped between the minimum width of the bar and
  // the maximum available width if the timeline shrank as much as it can.
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
  "--top-bar-height": string;
}

type BarsDimensions = {
  [key in BarSide]: number;
};

export type TimeChangeHandler = (times: {
  lastTimeEnd: number;
  lastTimeStart: number;
  timeEnd: number;
  timeStart: number;
}) => void;

const updateScroll = (
  timeline: Element,
  scrollState: ScrollState,
  barsDimensions: BarsDimensions,
): ScrollState => {
  const { scrollLeft, scrollWidth, clientWidth } = timeline;
  const { scrollX, timeEnd, timeMax, timeMin, timeStart } = scrollState;

  const visibleRange = timeEnd - timeStart;

  // The thresholds for adjusting the alignment of the scroll viewport are a
  // half viewport from the content bounds. This ensures that if the user is
  // scrolling, the user does not hit the end before the viewport can be
  // adjusted.
  //
  // The viewport width is subtracted from the right threshold because the
  // left side of the viewport is used to perform the check.
  // ```
  // rightThreshold = contentWidth - halfViewportWidth - viewportWidth
  // ```
  const leftScrollUpdateThreshold = half;
  const rightScrollUpdateThreshold = contentToViewportRatio - unit - half;

  // When the viewport is near the bounds of the timeline, a recalculation is
  // required to ensure any further scrolling stops at the bounds.
  const isViewportNearTimeBounds =
    timeStart < timeMin + visibleRange || timeEnd > timeMax - visibleRange;

  // When the viewport is near the bounds of the content, a recalculation is
  // required to ensure any further scrolling can continue.
  const isViewportNearContentBounds =
    scrollState.scrollX < leftScrollUpdateThreshold * clientWidth ||
    scrollState.scrollX > rightScrollUpdateThreshold * clientWidth;

  if (!isViewportNearTimeBounds && !isViewportNearContentBounds) {
    return scrollState;
  }

  console.log("recalc");

  // The width of the timeline is the content width minus both vertical bars.
  const timelineWidth =
    clientWidth - barsDimensions.left - barsDimensions.right;

  // Horizontally center the scroll viewport on the content.
  const scrollCenter = half * (scrollWidth - clientWidth);

  // Determine the ratio of pixels per second.
  //
  // In the extreme case of
  // - a timeline of width 1px and
  // - a visible range of all possible time,
  // the ratio will have an approximate value of 1.15e-16, far from the smallest
  // representable value of 5e-324.
  const pixelPerSecond = timelineWidth / visibleRange;

  // The distance from the viewport bounds to the timeline bounds.
  const minTimeDistance = (timeStart - timeMin) * pixelPerSecond;
  const maxTimeDistance = (timeMax - timeEnd) * pixelPerSecond;

  // The scrolling bounds for the content, given the size of the viewport.
  const minContentScroll = 0;
  const maxContentScroll = scrollWidth - clientWidth;

  // Clamp the value to the permitted time range. There is a case where the
  // values of `minTime` and `maxTime` could conflict. The caller must ensure
  // that `visibleTimeEnd - visibleTimeStart <= maxTime - minTime`.
  //
  // The value is rounded to the nearest integer to align with the behavior of
  // browser scrolling.
  const newScrollX = Math.round(
    clamp(
      scrollCenter,
      maxContentScroll - maxTimeDistance,
      minContentScroll + minTimeDistance,
    ),
  );

  // Update the viewport.
  if (newScrollX !== scrollLeft) {
    console.log(
      "scrollTo",
      newScrollX - timeline.scrollLeft,
      scrollLeft,
      newScrollX,
    );

    timeline.scrollTo({ left: newScrollX });
  }

  // Return the scroll position.
  return newScrollX === scrollX
    ? scrollState
    : { ...scrollState, scrollX: newScrollX };
};

const timelineInitResizeHandler = (content: Element): void => {
  // Detect changes to the size of the timeline.
  if (content.parentElement) {
    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) {
        console.log("Resize", entry.contentRect);
      }
    });
    resizeObserver.observe(content);

    new MutationObserver((_mutations, mutationObserver) => {
      if (!content.isConnected) {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      }
    }).observe(content.parentElement, { childList: true });
  }
};

const timelineInitScrollHandler = (
  timeline: Element,
  scrollState: ScrollState,
  barsDimensions: BarsDimensions,
): ScrollState => {
  const newScrollState = updateScroll(timeline, scrollState, barsDimensions);

  // Set the initial scroll position.
  return newScrollState;
};

const timelineScrollHandler = (
  timeline: Element,
  scrollState: ScrollState,
  barsDimensions: BarsDimensions,
  onTimeChange: TimeChangeHandler | undefined,
): ScrollState => {
  const { scrollX, scrollY, timeEnd, timeMax, timeMin, timeStart } =
    scrollState;
  const { clientWidth: viewportWidth, scrollLeft, scrollTop } = timeline;

  let newScrollState: ScrollState = {
    ...scrollState,
    scrollX: scrollLeft,
    scrollY: scrollTop,
  };

  // Determine the change in pixels due to scrolling.
  const deltaX = newScrollState.scrollX - scrollX;
  const deltaY = newScrollState.scrollY - scrollY;

  if (deltaX) {
    const lastTimeStart = timeStart;
    const lastTimeEnd = timeEnd;
    const visibleRange = lastTimeEnd - lastTimeStart;

    // Determine the time offset.
    const timelineWidth =
      viewportWidth - barsDimensions.left - barsDimensions.right;
    const secondPerPixel = visibleRange / timelineWidth;
    const timeDelta = deltaX * secondPerPixel;

    const unclampedTimeStart = lastTimeStart + timeDelta;
    const unclampedTimeEnd = unclampedTimeStart + visibleRange;

    [newScrollState.timeStart, newScrollState.timeEnd] = clampTimeRange(
      unclampedTimeStart,
      unclampedTimeEnd,
      timeMin,
      timeMax,
    );

    // Adjust the alignment of the scroll viewport if it is nearing either
    // extremity. The thresholds are a half viewport from the content
    // bounds.
    //
    // The viewport width is subtracted from the right threshold because the
    // left side of the viewport is used to perform the check.
    // ```
    // rightThreshold = contentWidth - halfViewportWidth - viewportWidth
    // ```
    const leftScrollUpdateThreshold = half;
    const rightScrollUpdateThreshold = contentToViewportRatio - unit - half;

    if (
      newScrollState.scrollX < leftScrollUpdateThreshold * viewportWidth ||
      newScrollState.scrollX > rightScrollUpdateThreshold * viewportWidth
    ) {
      newScrollState = updateScroll(timeline, newScrollState, barsDimensions);
    }

    if (
      newScrollState.timeStart !== timeStart ||
      newScrollState.timeEnd !== timeEnd
    ) {
      onTimeChange?.({
        lastTimeEnd: timeEnd,
        lastTimeStart: timeStart,
        timeEnd: newScrollState.timeEnd,
        timeStart: newScrollState.timeStart,
      });
    }
  }

  if (deltaY) {
    console.log("Vertical scroll", deltaY);
  }

  return newScrollState;
};

export interface TimelineRef {
  setTime: (timeStart: number, timeEnd: number) => void;
}

export const Timeline = forwardRef<
  TimelineRef,
  Readonly<{
    className?: string;
    onTimeChange?: TimeChangeHandler;
    initTimeEnd: number;
    initTimeStart: number;
  }>
>(({ className, onTimeChange, initTimeEnd, initTimeStart }, ref): ReactNode => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [barsDimensions, setBarsDimensions] = useState<BarsDimensions>({
    bottom: verticalBarMinHeight,
    left: horizontalBarMinWidth,
    right: horizontalBarMinWidth,
    top: verticalBarMinHeight,
  });

  const [scrollState, setScrollState] = useState<ScrollState>(() => {
    const timeMin = TIME_MIN;
    const timeMax = TIME_MAX;

    const [timeStart, timeEnd] = clampTimeRangeProperties(
      initTimeStart,
      initTimeEnd,
      timeMin,
      timeMax,
    );

    return {
      scrollX: 0,
      scrollY: 0,
      timeEnd,
      timeMax,
      timeMin,
      timeStart,
    };
  });

  useImperativeHandle(ref, () => ({
    setTime: (targetTimeStart, targetTimeEnd): void => {
      const { timeEnd, timeMax, timeMin, timeStart } = scrollState;

      const [newTimeStart, newTimeEnd] = clampTimeRangeProperties(
        targetTimeStart,
        targetTimeEnd,
        timeMin,
        timeMax,
      );

      const content = contentRef.current;

      // If the new times differ from the old times, trigger the appropriate
      // actions for an update.
      if ((newTimeStart !== timeStart || newTimeEnd !== timeEnd) && content) {
        let newScrollState = {
          ...scrollState,
          timeEnd: newTimeEnd,
          timeStart: newTimeStart,
        };

        newScrollState = updateScroll(content, newScrollState, barsDimensions);

        setScrollState(newScrollState);

        onTimeChange?.({
          lastTimeEnd: timeEnd,
          lastTimeStart: timeStart,
          timeEnd: newTimeEnd,
          timeStart: newTimeStart,
        });
      }
    },
  }));

  const onBarResizeHandler = (
    targetCoordinates: Coordinates,
    dimension: BarSide,
  ): void => {
    const container = containerRef.current;

    if (container) {
      const newBarDimensions = barResizeHandler(
        container,
        barsDimensions,
        dimension,
        targetCoordinates,
      );
      setBarsDimensions(newBarDimensions);
    }
  };

  const onContentScrollHandler = (
    event: Readonly<UIEvent<HTMLDivElement>>,
  ): void => {
    const { target } = event;

    if (target instanceof Element) {
      const newScrollState = timelineScrollHandler(
        target,
        scrollState,
        barsDimensions,
        onTimeChange,
      );
      setScrollState(newScrollState);
    }
  };

  // Configure component on mount.
  useLayoutEffect(() => {
    const content = contentRef.current;

    if (content) {
      const newScrollState = timelineInitScrollHandler(
        content,
        scrollState,
        barsDimensions,
      );
      setScrollState(newScrollState);

      timelineInitResizeHandler(content);
    }

    // This effect sets up the initial state of the component. Since it depends
    // on the initial values of some states.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dimensionStyles: DimensionCSSProperties = {
    "--bottom-bar-height": `${barsDimensions.bottom}px`,
    "--left-bar-width": `${barsDimensions.left}px`,
    "--right-bar-width": `${barsDimensions.right}px`,
    "--timeline-height": "500px",
    "--top-bar-height": `${barsDimensions.top}px`,
  };

  return (
    <div
      className={cx(containerClass, className)}
      ref={containerRef}
      style={dimensionStyles}
    >
      <div
        className={contentClass}
        onScroll={onContentScrollHandler}
        ref={contentRef}
      >
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
        onResize={onBarResizeHandler}
        side={BarSide.Top}
      />
      <ResizeDivider
        className={leftDividerClass}
        onResize={onBarResizeHandler}
        side={BarSide.Left}
      />
      <ResizeDivider
        className={rightDividerClass}
        onResize={onBarResizeHandler}
        side={BarSide.Right}
      />
      <ResizeDivider
        className={bottomDividerClass}
        onResize={onBarResizeHandler}
        side={BarSide.Bottom}
      />
    </div>
  );
});
Timeline.displayName = "Timeline";
