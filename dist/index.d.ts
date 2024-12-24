export * from "./libs/cluster";
export * from "./libs/herald/src";
export * from "./libs/logger";
export * from "./libs/search/src";
export declare const DT_FORMATS: {
    short: string;
    long: string;
    time: string;
    longTime: string;
    dateAndTime: string;
};
export declare const COUNTRIES: string[];
/**
 * Enter either the total minutes, hours or seconds. Enter only one value of the
 * three. If multiple values are entered, only one will be considered in the
 * following order of preference: minutes, seconds, hours.
 *
 * If none of the values are entered, an error will be thrown.
 */
export declare function timeDurationHumanReadable({ minutes, hours, seconds, }: {
    seconds?: number;
    minutes?: number;
    hours?: number;
}): string;
/**
 *
 * @returns {[boolean, number]} the first element signifies whether the
 * condition is met, the second element is the number value of the employee level
 */
export declare function isLevelOrAbove(userLevelGrade: string, checkLevel: number): [boolean, number];
/**
 *
 * @returns {[boolean, number]} the first element signifies whether the
 * condition is met, the second element is the number value of the employee grade
 */
export declare function isGradeOrAbove(userLevelGrade: string, checkGrade: number): [boolean, number];
export declare function isLevelGradeOrAbove(userLevelGrade: string, checkLevel: number, checkGrade: number): boolean;
