import { isNotNullOrUndefinedAndValidNumber } from "./helpers";

export const DT_FORMATS = {
  short: "DD-MMM-YY",
  long: "ddd DD-MMM-YY",
  time: "HH:mm",
  longTime: "HH:mm:ss",
  dateAndTime: "DD-MMM-YY HH:mm",
};

/**
 * Enter either the total minutes, hours or seconds. Enter only one value of the
 * three. If multiple values are entered, only one will be considered in the
 * following order of preference: minutes, seconds, hours.
 *
 * If none of the values are entered, an error will be thrown.
 */
export function timeDurationHumanReadable({
  minutes,
  hours,
  seconds,
}: {
  seconds?: number;
  minutes?: number;
  hours?: number;
}): string {
  let min;
  if (isNotNullOrUndefinedAndValidNumber(minutes)) min = minutes ?? 0;
  else if (isNotNullOrUndefinedAndValidNumber(seconds))
    min = (seconds ?? 0) / 60;
  else if (isNotNullOrUndefinedAndValidNumber(hours)) min = (hours ?? 0) * 60;
  else {
    throw new Error("Enter either the minute, second or hour value to format.");
  }
  if (min < 60) {
    const minutesRounded = Math.floor(min);
    const secondsRounded = Math.round((min - minutesRounded) * 60);
    return `${minutesRounded}m${
      secondsRounded > 0 ? ` ${secondsRounded}s` : ""
    }`;
  }
  const hoursRounded = Math.floor(min / 60);
  const minutesRounded = Math.floor(min - hoursRounded * 60);
  return `${hoursRounded}h${minutesRounded > 0 ? ` ${minutesRounded}m` : ""}`;
}

/**
 *
 * @returns {[boolean, number]} the first element signifies whether the
 * condition is met, the second element is the number value of the employee level
 */
export function isLevelOrAbove(
  userLevelGrade: string,
  checkLevel: number
): [boolean, number] {
  let matchInt: number = 0;
  // match L followed by 1 or more numbers
  const match = userLevelGrade.match(/L[0-9]+/);
  if (!match) return [false, matchInt];
  // remove non numeric characters
  matchInt = parseInt(match[0].replace(/\D/g, ""));
  if (matchInt >= checkLevel) return [true, matchInt];
  return [false, matchInt];
}

/**
 *
 * @returns {[boolean, number]} the first element signifies whether the
 * condition is met, the second element is the number value of the employee grade
 */
export function isGradeOrAbove(
  userLevelGrade: string,
  checkGrade: number
): [boolean, number] {
  let matchInt: number = 0;
  // match G followed by 1 or more numbers
  const match = userLevelGrade.match(/G[0-9]+/);
  if (!match) return [false, matchInt];
  // remove non numeric characters
  matchInt = parseInt(match[0].replace(/\D/g, ""));
  if (matchInt >= checkGrade) return [true, matchInt];
  return [false, matchInt];
}

export function isLevelGradeOrAbove(
  userLevelGrade: string,
  checkLevel: number,
  checkGrade: number
): boolean {
  const [_, level] = isLevelOrAbove(userLevelGrade, checkLevel);
  // if level is greater than the check level, grade does not need to be checked
  if (level > checkLevel) return true;
  // similarly if level is less than the check level
  else if (level < checkLevel) return false;
  // only need to check grade if level is equal to check level
  else {
    const [gradeIsOrAbove, _] = isGradeOrAbove(userLevelGrade, checkGrade);
    return gradeIsOrAbove;
  }
}
