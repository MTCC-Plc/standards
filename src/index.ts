import { isNotNullOrUndefinedAndValidNumber } from "./helpers";

export const DT_FORMATS = {
  short: "DD-MMM-YY",
  long: "ddd DD-MMM-YY",
  time: "HH:mm",
  longTime: "HH:mm:ss",
  dateAndTime: "DD-MMM-YY HH:mm",
};

export const COUNTRIES = [
  "Maldives",
  "India",
  "Sri Lanka",
  "Bangladesh",
  "Philippines",
  "Nepal",
  "Afghanistan",
  "Åland Islands",
  "Albania",
  "Algeria",
  "American Samoa",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antarctica",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Bouvet Island",
  "Brazil",
  "British Indian Ocean Territory",
  "Brunei Darussalam",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Cayman Islands",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Christmas Island",
  "Cocos Islands",
  "Colombia",
  "Comoros",
  "Congo",
  "Democratic Republic of the Congo",
  "Cook Islands",
  "Costa Rica",
  "Ivory Coast",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Falkland Islands (Malvinas)",
  "Faroe Islands",
  "Fiji",
  "Finland",
  "France",
  "French Guiana",
  "French Polynesia",
  "French Southern Territories",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Gibraltar",
  "Greece",
  "Greenland",
  "Grenada",
  "Guadeloupe",
  "Guam",
  "Guatemala",
  "Guernsey",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Heard Island and Mcdonald Islands",
  "Vatican",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Isle of Man",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jersey",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Democratic People's Republic of Korea",
  "Republic of Korea",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macao",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Martinique",
  "Mauritania",
  "Mauritius",
  "Mayotte",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montserrat",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Netherlands",
  "Netherlands Antilles",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Niue",
  "Norfolk Island",
  "Northern Mariana Islands",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Pitcairn",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Reunion",
  "Romania",
  "Russian Federation",
  "Rwanda",
  "Saint Helena",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Pierre and Miquelon",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia and Montenegro",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Georgia and the South Sandwich Islands",
  "Spain",
  "Sudan",
  "Suriname",
  "Svalbard and Jan Mayen",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan, Province of China",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tokelau",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Turks and Caicos Islands",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "United States Minor Outlying Islands",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Virgin Islands, British",
  "Virgin Islands, U.S.",
  "Wallis and Futuna",
  "Western Sahara",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

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
  let minutesRounded = Math.floor(min);
  const secondsRounded = Math.round((min - minutesRounded) * 60);
  if (min < 1) {
    return `${secondsRounded}s`;
  }
  if (min < 60) {
    return `${minutesRounded}m${
      secondsRounded > 0 ? ` ${secondsRounded}s` : ""
    }`;
  }
  const hoursRounded = Math.floor(min / 60);
  minutesRounded = Math.floor(min - hoursRounded * 60);
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
