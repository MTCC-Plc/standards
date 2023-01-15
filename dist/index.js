"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeDurationHumanReadable = exports.DT_FORMATS = void 0;
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
function timeDurationHumanReadable(_a) {
    var minutes = _a.minutes, hours = _a.hours, seconds = _a.seconds;
    var min;
    if (minutes)
        min = minutes;
    else if (seconds)
        min = seconds / 60;
    else if (hours)
        min = hours * 60;
    else {
        throw new Error("Enter either the minute, second or hour value to format.");
    }
    if (min < 60) {
        var minutesRounded_1 = Math.floor(min);
        var secondsRounded = Math.round((min - minutesRounded_1) * 60);
        return "".concat(minutesRounded_1, "m").concat(secondsRounded > 0 ? " ".concat(secondsRounded, "s") : "");
    }
    var hoursRounded = Math.floor(min / 60);
    var minutesRounded = Math.floor(min - hoursRounded * 60);
    return "".concat(hoursRounded, "h").concat(minutesRounded > 0 ? " ".concat(minutesRounded, "m") : "");
}
exports.timeDurationHumanReadable = timeDurationHumanReadable;
