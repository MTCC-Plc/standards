export interface Calendar {
    id: number;
    date: string;
    year: number;
    month: number;
    day: number;
    month_type: string;
    month_eng: string;
    month_dhi: string;
    weekday_eng: string;
    weekday_dhi: string;
    day_type: string;
    day_type_code: number;
    day_description: string | null;
    monsoon_eng: string | null;
    monsoon_dhi: string | null;
    nakaiy_dhi: string | null;
    nakaiy_eng: string | null;
    modified_by: string;
    modified_on: string;
}
