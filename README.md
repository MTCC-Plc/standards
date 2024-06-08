# standards

Libraries, constants and functions that are standard to MTCC and that can be used across different applications to achieve consistency.

### Installation

```sh
npm i https://github.com/MTCC-Plc/standards#{hash of the commit}
```

Unlike a regular install from the npm registry, this package will be fetched from GitHub.

In order to pin to a specific version, the hash of the commit should be passed at the end of the url. If unsure which commit to use, pick the latest one. For example:

```sh
npm i https://github.com/MTCC-Plc/standards#cb32233
```

Either the short or long hash are fine.

### Libraries

Nestjs libraries can be imported.
Check the library readmes for details.
- [Herald](./src/libs/herald/README.md) - Integration with the herald api.


### Usage

#### Date Formats

To use the same date formats across all apps, use the defined formats from this library. Can be used with either moment or dayjs.

```ts
import { DT_FORMATS } from "standards";
dayjs(comment.createdAt).format(DT_FORMATS.SHORT);
moment(comment.createdAt).format(DT_FORMATS.SHORT);
```

#### Time Durations

To display time durations in a human readable format. Enter either the total minutes, hours or seconds. Enter only one value of the three. If multiple values are entered, only one will be considered in the following order of preference: minutes, seconds, hours. If none of the values are entered, an error will be thrown.

```ts
import { timeDurationHumanReadable } from "standards";
timeDurationHumanReadable({ seconds: 500 });
```

#### Level and Grade Check

Pass in employee level_grade string to check if employee is above a certain level, grade or both.

```ts
import { isLevelOrAbove, isGradeOrAbove, isLevelGradeOrAbove } from "standards";
isLevelOrAbove("L2G2", 2); // returns [true, 2]
isGradeOrAbove("L2G3", 2); // returns [true, 3]
isLevelGradeOrAbove("L5G3", 4, 6); // returns false
```


