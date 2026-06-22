import { Employee } from "./employee.interface";

export interface LeaveType {
  id: number;
  name_eng: string;
  name_dhi: string;
  enable_self_request: boolean;
  requires_doc_submissions: boolean;
  annual_balance_refresh: boolean;
  annual_balance_refresh_days: number;
  balance_carry_forward: boolean;
  carry_forward_years: number;
  min_allowed_days: number;
  max_allowed_days: number;
  counted_day_type: string;
  gets_basic_salary: boolean;
  gets_fixed_allowances: boolean;
  gets_attendance_based_allowances: boolean;
}

export interface LeaveRequest {
  id: number;
  requested_by: number;
  requestedBy?: Employee;
  requested_for: number;
  requestedFor?: Employee;
  leave_type_id: number;
  leaveType?: LeaveType;
  leave_type_name_eng: string;
  leave_type_name_dhi: string;
  leave_year: number;
  from_date: string;
  to_date: string;
  details: string;
  coveringEmployee?: Employee | null;
  covering_employee_approved?: boolean | null;
  erp_pending_justification?: string | null;
  status: string;
  hasAttachments?: boolean | null;
  leaveBalanceDays?: number | null;
  leaveCalendarDays?: number | null;
}

export interface LeaveAllocation {
  id: number;
  leave_type_id: number;
  leaveType?: LeaveType;
  employee_id: number;
  employee?: Employee;
  refresh_date: string;
  modified_by: string;
  modified_on: string;
}

export interface LeavesBetweenInput {
  from: string;
  to?: string;
  employeeId?: number;
  leaveTypeIds?: number[];
  status?: string[];
  includeOfLeaveYear?: number;
}

export interface LeaveRequestsInInput {
  leaveRequestIds: number[];
}
