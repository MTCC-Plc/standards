"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLevelGradeOrAbove = exports.isGradeOrAbove = exports.isLevelOrAbove = exports.timeDurationHumanReadable = exports.DT_FORMATS = void 0;
const helpers_1 = require("./helpers");
exports.DT_FORMATS = {
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
function timeDurationHumanReadable({ minutes, hours, seconds, }) {
    let min;
    if ((0, helpers_1.isNotNullOrUndefinedAndValidNumber)(minutes))
        min = minutes !== null && minutes !== void 0 ? minutes : 0;
    else if ((0, helpers_1.isNotNullOrUndefinedAndValidNumber)(seconds))
        min = (seconds !== null && seconds !== void 0 ? seconds : 0) / 60;
    else if ((0, helpers_1.isNotNullOrUndefinedAndValidNumber)(hours))
        min = (hours !== null && hours !== void 0 ? hours : 0) * 60;
    else {
        throw new Error("Enter either the minute, second or hour value to format.");
    }
    if (min < 60) {
        const minutesRounded = Math.floor(min);
        const secondsRounded = Math.round((min - minutesRounded) * 60);
        return `${minutesRounded}m${secondsRounded > 0 ? ` ${secondsRounded}s` : ""}`;
    }
    const hoursRounded = Math.floor(min / 60);
    const minutesRounded = Math.floor(min - hoursRounded * 60);
    return `${hoursRounded}h${minutesRounded > 0 ? ` ${minutesRounded}m` : ""}`;
}
exports.timeDurationHumanReadable = timeDurationHumanReadable;
/**
 *
 * @returns {[boolean, number]} the first element signifies whether the
 * condition is met, the second element is the number value of the employee level
 */
function isLevelOrAbove(userLevelGrade, checkLevel) {
    let matchInt = 0;
    // match L followed by 1 or more numbers
    const match = userLevelGrade.match(/L[0-9]+/);
    if (!match)
        return [false, matchInt];
    // remove non numeric characters
    matchInt = parseInt(match[0].replace(/\D/g, ""));
    if (matchInt >= checkLevel)
        return [true, matchInt];
    return [false, matchInt];
}
exports.isLevelOrAbove = isLevelOrAbove;
/**
 *
 * @returns {[boolean, number]} the first element signifies whether the
 * condition is met, the second element is the number value of the employee grade
 */
function isGradeOrAbove(userLevelGrade, checkGrade) {
    let matchInt = 0;
    // match G followed by 1 or more numbers
    const match = userLevelGrade.match(/G[0-9]+/);
    if (!match)
        return [false, matchInt];
    // remove non numeric characters
    matchInt = parseInt(match[0].replace(/\D/g, ""));
    if (matchInt >= checkGrade)
        return [true, matchInt];
    return [false, matchInt];
}
exports.isGradeOrAbove = isGradeOrAbove;
function isLevelGradeOrAbove(userLevelGrade, checkLevel, checkGrade) {
    const [_, level] = isLevelOrAbove(userLevelGrade, checkLevel);
    // if level is greater than the check level, grade does not need to be checked
    if (level > checkLevel)
        return true;
    // similarly if level is less than the check level
    else if (level < checkLevel)
        return false;
    // only need to check grade if level is equal to check level
    else {
        const [gradeIsOrAbove, _] = isGradeOrAbove(userLevelGrade, checkGrade);
        return gradeIsOrAbove;
    }
}
exports.isLevelGradeOrAbove = isLevelGradeOrAbove;
