import { Employee } from "./employee.interface";

export interface AttendanceDeviceLastEvent {
  deviceId: number;
  lastEventId: number;
}

/** A single timesheet day record as returned by GET /timesheet */
export interface TimesheetDay {
  id: number;
  date: string;
  month_type: string;
  day_type: string;
  duty_in_time: string | null;
  duty_out_time: string | null;
  att_in_time: string | null;
  att_out_time: string | null;
  late_dur_mins: number;
  not_dur_mins_approved: number | null;
  dot_dur_mins_approved: number | null;
  not_dur_mins_pending: number | null;
  dot_dur_mins_pending: number | null;
  status: string;
  details: string | null;
  release_id: number | null;
  duty_travel_id: number | null;
  signout_id: number | null;
  absent_confirmed: boolean | null;
  rcno?: number;
}

/** A single duty record as returned by GET /duties */
export interface Duty {
  id: number;
  employee_id: number;
  pap_id: number;
  date: string;
  expected: boolean;
  status: string;
}

export interface SiteEmployee {
  user_id: string;
  rcno: number;
  full_name: string;
  post: string;
  from_date: string;
  to_date: string | null;
  gender: string;
}

/** Returned by GET /projects/employees */
export interface SiteWithEmployees {
  id: number;
  code: string | null;
  name: string;
  employees: SiteEmployee[];
}

/** Returned by GET /projects/:id/attendance */
export interface SiteAttendanceEmployee {
  user_id: string;
  rcno: number;
  full_name: string;
  post: string;
  gender: string;
  attendance: string | null;
}

export interface AttendanceDevice {
  id: number;
  type: number;
  name: string;
  mac: string;
  ip: string;
  active: boolean;
  attendance_enabled: boolean;
  breakmonitoring_enabled?: boolean | null;
  modified_by: string;
  modified_on: string;
  maxEvtId?: number | null;
}

export interface MatrixDevice {
  id: number;
  type: number;
  name: string;
  ip: string;
  mac: string;
}

export interface MatrixPacket {
  bytes: number[];
  string: string;
  type: string;
  from: string;
  to: string;
  mapped: { [key: string]: string };
  relayReceivedAt: string;
  parseError: boolean;
  device: MatrixDevice;
}

export interface Site {
  id: number;
  code?: string | null;
  name: string;
  admins?: Employee[];
  employees?: Employee[];
  workplan_id?: number | null;
  modified_by: string;
  modified_on: string;
  processed: boolean;
  division?: string | null;
  department?: string | null;
  section?: string | null;
  supervisor_id?: number | null;
  supervisor?: Employee | null;
}

export interface PayrollPeriod {
  id: number;
  code: string;
  year: number;
  month: number;
  from_date: string;
  to_date: string;
  from_time: string;
  to_time: string;
  total_days: number;
  working_days: number;
  holidays: number;
  fridays: number;
  saturdays: number;
  locked: boolean;
  enable_payslip_viewing: boolean;
  attendanceLocked: boolean;
}
