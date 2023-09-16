import { isGradeOrAbove, isLevelGradeOrAbove, isLevelOrAbove } from ".";

test("L2G2 is level 2 or above", () => {
  expect(isLevelOrAbove("L2G2", 2)).toStrictEqual([true, 2]);
});

test("L3G2 is level 2 or above", () => {
  expect(isLevelOrAbove("L3G2", 2)).toStrictEqual([true, 3]);
});

test("L1G2 is NOT level 2 or above", () => {
  expect(isLevelOrAbove("L1G2", 2)).toStrictEqual([false, 1]);
});

test("L2G2 is grade 2 or above", () => {
  expect(isGradeOrAbove("L2G2", 2)).toStrictEqual([true, 2]);
});

test("L2G3 is grade 2 or above", () => {
  expect(isGradeOrAbove("L2G3", 2)).toStrictEqual([true, 3]);
});

test("L2G1 is NOT grade 2 or above", () => {
  expect(isGradeOrAbove("L2G1", 2)).toStrictEqual([false, 1]);
});

test("L2G2 is level 2 and grade 2 or above", () => {
  expect(isLevelGradeOrAbove("L2G2", 2, 2)).toBe(true);
});

test("L3G2 is level 2 and grade 2 or above", () => {
  expect(isLevelGradeOrAbove("L3G2", 2, 2)).toBe(true);
});

test("L2G3 is level 2 and grade 2 or above", () => {
  expect(isLevelGradeOrAbove("L2G3", 2, 2)).toBe(true);
});

test("L1G1 is NOT level 2 and grade 2 or above", () => {
  expect(isLevelGradeOrAbove("L1G1", 2, 2)).toBe(false);
});

test("L1G2 is NOT level 2 and grade 2 or above", () => {
  expect(isLevelGradeOrAbove("L1G2", 2, 2)).toBe(false);
});

test("L2G1 is NOT level 2 and grade 2 or above", () => {
  expect(isLevelGradeOrAbove("L2G1", 2, 2)).toBe(false);
});

test("L4G6 is level 4 and grade 6 or above", () => {
  expect(isLevelGradeOrAbove("L4G6", 4, 6)).toBe(true);
});

test("L3G6 is NOT level 4 and grade 6 or above", () => {
  expect(isLevelGradeOrAbove("L3G6", 4, 6)).toBe(false);
});

test("L4G3 is NOT level 4 and grade 6 or above", () => {
  expect(isLevelGradeOrAbove("L4G3", 4, 6)).toBe(false);
});

test("L5G3 is level 4 and grade 6 or above", () => {
  expect(isLevelGradeOrAbove("L5G3", 4, 6)).toBe(true);
});
