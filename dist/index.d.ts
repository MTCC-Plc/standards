import { TimeDurationHumanReadableInput } from "./inputs";
export declare const DT_FORMATS: {
    short: string;
    long: string;
    time: string;
    longTime: string;
    dateAndTime: string;
};
/**
 * Enter either the total minutes, hours or seconds. Enter only one value of the
 * three. If multiple values are entered, only one will be considered in the
 * following order of preference: minutes, seconds, hours.
 *
 * If none of the values are entered, an error will be thrown.
 */
export declare function timeDurationHumanReadable({ minutes, hours, seconds, }: TimeDurationHumanReadableInput): string;
