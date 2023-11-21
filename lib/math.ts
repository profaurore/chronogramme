/** Unit value. */
const unit = 1;

/** Mean value of zero items. */
const meanZeroValues = 0;

/**
 * Compute the mean of an array of numbers.
 *
 * @param ...values Array of numbers.
 * @returns Mean value.
 */
export const mean = (...values: number[]): number => {
  const ratio = unit / values.length;

  return values.reduce((acc, value) => acc + ratio * value, meanZeroValues);
};
