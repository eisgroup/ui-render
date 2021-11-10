// Return type when validation passes
export const OK = undefined

// Check that given value is not within any of the given number ranges
export function notWithinRange (number, ranges, errMsg) {
  const error = ranges.find(([start, end]) => start <= number && number <= end)
  return error ? (errMsg || `Cannot be within [${error[0]}, ${error[1]}] range`) : OK
}
