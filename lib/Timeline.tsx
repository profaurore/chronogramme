import { css, cx } from "@linaria/core";
import {
  type CSSProperties,
  forwardRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { clamp, half, mean, unit, unitPercent, zero } from "./math";
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

class ScrollState {
  public readonly container: Element;

  public readonly scrollX: number;

  public readonly scrollY: number;

  public readonly timeEnd: number;

  public readonly timeMax: number;

  public readonly timeMin: number;

  public readonly timeStart: number;

  private constructor(
    container: Element,
    timeStart: number,
    timeEnd: number,
    timeMin: number,
    timeMax: number,
    scrollX: number,
    scrollY: number,
  ) {
    this.container = container;
    this.scrollX = scrollX;
    this.scrollY = scrollY;
    this.timeEnd = timeEnd;
    this.timeMax = timeMax;
    this.timeMin = timeMin;
    this.timeStart = timeStart;
  }

  public static build(
    container: Element,
    parameters: Partial<{
      scrollX: number;
      scrollY: number;
      timeEnd: number;
      timeMax: number;
      timeMin: number;
      timeStart: number;
    }> = {},
  ): ScrollState {
    const {
      scrollX = zero,
      scrollY = zero,
      timeEnd = TIME_MAX,
      timeMax = TIME_MAX,
      timeMin = TIME_MIN,
      timeStart = TIME_MIN,
    } = parameters;

    const scrollState = new ScrollState(
      container,
      timeStart,
      timeEnd,
      timeMin,
      timeMax,
      scrollX,
      scrollY,
    );

    scrollState.validateTimeBounds();
    scrollState.validateTimeInterval();
    scrollState.initResizeHandler();

    return scrollState;
  }

  public setTimeInterval(timeStart: number, timeEnd: number): ScrollState {
    if (timeStart === this.timeStart && timeEnd === this.timeEnd) {
      return this;
    }

    const newScrollState = new ScrollState(
      this.container,
      timeStart,
      timeEnd,
      this.timeMin,
      this.timeMax,
      this.scrollX,
      this.scrollY,
    );

    newScrollState.validateTimeInterval();

    return newScrollState;
  }

  public setTimeBounds(timeMin: number, timeMax: number): ScrollState {
    if (timeMin === this.timeMin && timeMax === this.timeMax) {
      return this;
    }

    const newScrollState = new ScrollState(
      this.container,
      this.timeStart,
      this.timeEnd,
      timeMin,
      timeMax,
      this.scrollX,
      this.scrollY,
    );

    newScrollState.validateTimeBounds();

    return newScrollState;
  }

  public onScrollHandler(
    barsDimensions: BarsDimensions,
    onTimeChange: TimeChangeHandler | undefined,
  ): ScrollState {
    console.log("onScrollHandler");
    const { scrollX, scrollY, timeEnd, timeMax, timeMin, timeStart } = this;
    const {
      clientWidth: viewportWidth,
      scrollLeft,
      scrollTop,
    } = this.container;

    let newTimeStart = this.timeStart;
    let newTimeEnd = this.timeEnd;
    let newScrollX = scrollLeft;
    const newScrollY = scrollTop;

    // Determine the change in pixels due to scrolling.
    const deltaX = newScrollX - scrollX;
    const deltaY = newScrollY - scrollY;

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

      [newTimeStart, newTimeEnd] = clampTimeRange(
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
        newScrollX < leftScrollUpdateThreshold * viewportWidth ||
        newScrollX > rightScrollUpdateThreshold * viewportWidth
      ) {
        newScrollX = this.updateScrollX(barsDimensions);
      }

      if (newTimeStart !== timeStart || newTimeEnd !== timeEnd) {
        onTimeChange?.({
          lastTimeEnd: timeEnd,
          lastTimeStart: timeStart,
          timeEnd: newTimeEnd,
          timeStart: newTimeStart,
        });
      }
    }

    if (deltaY) {
      console.log("Vertical scroll", deltaY);
    }

    const newScrollState = new ScrollState(
      this.container,
      newTimeStart,
      newTimeEnd,
      this.timeMin,
      this.timeMax,
      newScrollX,
      newScrollY,
    );

    return newScrollState;
  }

  public updateScroll(barsDimensions: BarsDimensions): ScrollState {
    console.log("updateScroll");
    const newScrollX = this.updateScrollX(barsDimensions);

    return newScrollX === this.scrollX
      ? this
      : new ScrollState(
          this.container,
          this.timeStart,
          this.timeEnd,
          this.timeMin,
          this.timeMax,
          newScrollX,
          this.scrollY,
        );
  }

  private validateTimeInterval(): void {
    if (this.timeStart < this.timeMin) {
      throw new Error("timeStart must be greater than or equal to timeMin");
    }

    if (this.timeEnd > this.timeMax) {
      throw new Error("timeEnd must be less than or equal to timeMax");
    }
  }

  private validateTimeBounds(): void {
    if (this.timeMax <= this.timeMin) {
      throw new Error("timeMax must be greater than timeMin");
    }
  }

  private initResizeHandler(): void {
    const { container } = this;

    if (container.parentElement) {
      // Detect changes in size.
      const resizeObserver = new ResizeObserver(([entry]) => {
        if (entry) {
          console.log("Resize", entry.contentRect);
        }
      });
      resizeObserver.observe(container);

      // Detect the element being removed from the DOM to cancel the resize
      // observer.
      new MutationObserver((_mutations, mutationObserver) => {
        if (!container.isConnected) {
          resizeObserver.disconnect();
          mutationObserver.disconnect();
        }
      }).observe(container.parentElement, { childList: true });
    }
  }

  private updateScrollX(barsDimensions: BarsDimensions): number {
    const { scrollLeft, scrollWidth, clientWidth } = this.container;
    const { scrollX, timeEnd, timeMax, timeMin, timeStart } = this;

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
      scrollX < leftScrollUpdateThreshold * clientWidth ||
      scrollX > rightScrollUpdateThreshold * clientWidth;

    if (!isViewportNearTimeBounds && !isViewportNearContentBounds) {
      return scrollX;
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
      console.log(`scrollTo from ${scrollLeft} to ${newScrollX}`);

      this.container.scrollTo({ left: newScrollX });
    }

    // Return the scroll position.
    return newScrollX;
  }
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

  const [scrollState, setScrollState] = useState<ScrollState | undefined>();

  useImperativeHandle(ref, () => ({
    setTime: (targetTimeStart, targetTimeEnd): void => {
      if (!scrollState) {
        return;
      }

      const { timeEnd, timeMax, timeMin, timeStart } = scrollState;

      const [newTimeStart, newTimeEnd] = clampTimeRangeProperties(
        targetTimeStart,
        targetTimeEnd,
        timeMin,
        timeMax,
      );

      // If the new times differ from the old times, trigger the appropriate
      // actions for an update.
      if (newTimeStart !== timeStart || newTimeEnd !== timeEnd) {
        let newScrollState = scrollState.setTimeInterval(
          newTimeStart,
          newTimeEnd,
        );

        newScrollState = newScrollState.updateScroll(barsDimensions);

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

  const onContentScrollHandler = (): void => {
    if (scrollState) {
      const newScrollState = scrollState.onScrollHandler(
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
      let newScrollState = ScrollState.build(content, {
        timeEnd: initTimeEnd,
        timeMax: TIME_MAX,
        timeMin: TIME_MIN,
        timeStart: initTimeStart,
      });
      newScrollState = newScrollState.updateScroll(barsDimensions);

      setScrollState(newScrollState);
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
