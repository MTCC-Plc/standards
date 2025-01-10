"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotNullOrUndefinedAndValidNumber = void 0;
/**
 * Checks if the value passed in is not null or undefined.
 * Also checks if the type is number.
 */
function isNotNullOrUndefinedAndValidNumber(value) {
    if ([null, undefined].includes(value))
        return false;
    if (typeof value !== "number")
        return false;
    return true;
}
exports.isNotNullOrUndefinedAndValidNumber = isNotNullOrUndefinedAndValidNumber;
