/**
 * Checks if the value passed in is not null or undefined.
 * Also checks if the type is number.
 */
export function isNotNullOrUndefinedAndValidNumber(value: any): boolean {
  if ([null, undefined].includes(value)) return false;
  if (typeof value !== "number") return false;
  return true;
}
