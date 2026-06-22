export interface Employee {
    id: number;
    user_id: string | null;
    rcno: number;
    employment_type_hcmid: number;
    employment_type: string;
    nid_passport: string | null;
    full_name: string | null;
    gender: string | null;
    blood_group: string | null;
    marital_status: string;
    tel_office: number | null;
    tel_extension: number | null;
    tel_mobile: string | null;
    email: string | null;
    dob: string | null;
    doj: string | null;
    dor: string | null;
    post_id: number;
    post: string | null;
    level_grade_id: number;
    level_grade: string | null;
    basic_salary: number;
    company_id: number;
    company: string | null;
    division_id: number;
    division_code: string | null;
    division: string | null;
    department_id: number;
    department_code: string | null;
    department: string | null;
    section_id: number;
    section_code: string | null;
    section: string | null;
    unit_id: number | null;
    unit_code: string | null;
    unit: string | null;
    site_id: number | null;
    site_code: string | null;
    site: string | null;
    project_id: number | null;
    project_code: string | null;
    project: string | null;
    reporting_employee_hcmid: string | null;
    hod_employee_hcmid: number | null;
    work_type_id: number | null;
    is_local: boolean;
    is_exco_member: boolean;
    odi_team: string | null;
    odi_team_position: string | null;
    currentLeaveEnd?: string | null;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
}
export interface GetEmployeeParams {
    rcno?: string;
    uuid?: string;
    covering?: string;
    coveringFor?: string;
}
export interface GetEmployeeFullParams {
    uuid?: string;
    rcno?: string;
    id?: string;
    email?: string;
}
export interface GetResignedParams {
    after?: string;
    days?: number;
}
export interface EmployeeListQueryDto {
    limit?: number;
    offset?: number;
    rcno?: number;
    email?: string;
    post?: string[];
    division?: string;
    department?: string;
    section?: string;
    unit?: string;
    resigned?: boolean | null;
}
export interface TimesheetInput {
    from: string;
    to: string;
    rcnos: number[];
}
export interface HrisSyncDto {
    rcno: number;
    full_name?: string | null;
    gender?: string | null;
    email?: string | null;
    dob?: string | null;
    doj?: string | null;
    dor?: string | null;
    marital_status?: string | null;
    nid_passport?: string | null;
    nationality?: string | null;
    blood_group?: string | null;
    tel_mobile?: string | null;
    tel_office?: number | null;
    tel_extension?: number | null;
    employment_type?: string | null;
    employment_type_hcmid?: number | null;
    post?: string | null;
    post_id?: number | null;
    is_local?: boolean;
    is_exco_member?: boolean;
    odi_team?: string | null;
    odi_team_position?: string | null;
    work_type_id?: number | null;
    hod_employee_hcmid?: number | null;
    reporting_employee_hcmid?: number | null;
    division_id?: number | null;
    department_id?: number | null;
    section_id?: number | null;
    unit_id?: number | null;
    company_id?: number | null;
    site_id?: number | null;
    division_code?: string | null;
    division?: string | null;
    department_code?: string | null;
    department?: string | null;
    section_code?: string | null;
    section?: string | null;
    unit_code?: string | null;
    unit?: string | null;
    company?: string | null;
    level_grade?: string | null;
    level_grade_id?: number | null;
    education_level?: number | null;
    basic_salary?: number | null;
}
export interface HrisCreateDto {
    id: number;
    rcno: number;
    user_id: string;
    full_name?: string | null;
    gender?: string | null;
    email?: string | null;
    dob?: string | null;
    doj?: string | null;
    dor?: string | null;
    is_local?: boolean;
    is_exco_member?: boolean;
    marital_status?: string | null;
    employment_type?: string | null;
    employment_type_hcmid?: number | null;
    post?: string | null;
    post_id?: number | null;
    level_grade?: string | null;
    level_grade_id?: number | null;
    basic_salary?: number | null;
    division_id?: number | null;
    division_code?: string | null;
    division?: string | null;
    department_id?: number | null;
    department_code?: string | null;
    department?: string | null;
    section_id?: number | null;
    section_code?: string | null;
    section?: string | null;
    unit_id?: number | null;
    unit_code?: string | null;
    unit?: string | null;
    company_id?: number | null;
    company?: string | null;
    hod_employee_hcmid?: number | null;
    reporting_employee_hcmid?: number | null;
    tel_office?: number | null;
    tel_extension?: number | null;
    nid_passport?: string | null;
    nationality?: string | null;
    blood_group?: string | null;
    tel_mobile?: string | null;
    odi_team?: string | null;
    odi_team_position?: string | null;
    education_level?: number | null;
    work_type_id?: number | null;
}
export interface EmployeePost {
    division_id: number;
    division_code: string;
    division: string;
    post_id: number;
    post: string;
}
export interface HrisSsoSyncDto {
    rcno: number;
    user_id?: string | null;
    nid_passport?: string | null;
    email?: string | null;
    tel_mobile?: string | null;
    doj?: string | null;
    dor?: string | null;
}
