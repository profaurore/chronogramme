/** Unit value. */
export const unit = 1;

/** Half value. */
export const half = 0.5;

/** One hundred percent. */
export const unitPercent = 100;

/** Mean value of zero items. */
const meanZeroValues = 0;

/**
 * Clamps a value between two values.
 *
 * - If the value is less than `min`, `min` is returned.
 * - If the value is more than `max`, `max` is returned.
 *
 * @param value The value to be clamped. Must be a finite or infinite number.
 * @param min The minimum value. Must be a finite or infinite number.
 * @param max The maximum value. Must be a finite or infinite number.
 * @returns The value, bound between `min` and `max`.
 */
export const clamp = (value: number, min: number, max: number): number => {
  let clamped;

  if (value <= min) {
    clamped = min;
  } else if (value >= max) {
    clamped = max;
  } else {
    clamped = value;
  }

  return clamped;
};

/**
 * Compute the mean of an array of numbers.
 *
 * @param ...values Array of numbers. Must be a finite number.
 * @returns Mean of the values.
 */
export const mean = (...values: number[]): number => {
  const ratio = unit / values.length;

  return values.reduce((acc, value) => acc + ratio * value, meanZeroValues);
};
