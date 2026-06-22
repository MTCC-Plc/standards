import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios, { Method } from "axios";
import { ApsConfig } from "./aps.module";
import {
  AttendanceDevice,
  AttendanceDeviceLastEvent,
  Duty,
  MatrixPacket,
  PayrollPeriod,
  Site,
  SiteAttendanceEmployee,
  SiteWithEmployees,
  TimesheetDay,
} from "./interfaces/attendance.interface";
import { GraphToken, SharePointToken } from "./interfaces/attachment.interface";
import { Calendar } from "./interfaces/calendar.interface";
import {
  Division,
  DivisionWithHOD,
} from "./interfaces/division.interface";
import {
  Employee,
  EmployeeListQueryDto,
  EmployeePost,
  GetEmployeeFullParams,
  GetEmployeeParams,
  GetResignedParams,
  HrisCreateDto,
  HrisSsoSyncDto,
  HrisSyncDto,
  PaginatedResponse,
  TimesheetInput,
} from "./interfaces/employee.interface";
import {
  GetHierarchyParams,
  StaffHierarchy,
} from "./interfaces/hierarchy.interface";
import {
  LeaveAllocation,
  LeaveRequest,
  LeaveRequestsInInput,
  LeavesBetweenInput,
  LeaveType,
} from "./interfaces/leave.interface";
import {
  DayBasedShiftTime,
  ShiftPlan,
} from "./interfaces/shift-plan.interface";

@Injectable()
export class ApsService {
  constructor(private config: ApsConfig) {}

  private async queryAps<T>(
    endpoint: string,
    method: Method = "get",
    body?: any,
    params?: Record<string, any>,
    responseType?: "json" | "arraybuffer",
  ): Promise<T> {
    const result = await axios
      .request<T>({
        url: `${this.config.baseUrl}/${endpoint}`,
        method,
        headers: {
          Authorization: this.config.apiKey,
        },
        data: body,
        params,
        responseType,
      })
      .catch((err) => {
        if (err?.response?.data) {
          const e = err.response.data;
          throw new InternalServerErrorException(`APS-API: ${e.message}`);
        }
        throw new InternalServerErrorException(err);
      });
    return result.data;
  }

  private buildParams(input: Record<string, any>): Record<string, any> {
    const params: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        params[key] = value.join(",");
      } else {
        params[key] = value;
      }
    }
    return params;
  }

  // ─── Calendar ───────────────────────────────────────────────────────────────

  async getCalendarAll(start: string, end: string): Promise<Calendar[]> {
    return this.queryAps<Calendar[]>("calendar/all", "get", undefined, {
      start,
      end,
    });
  }

  async getCalendar(date: string): Promise<Calendar> {
    return this.queryAps<Calendar>("calendar", "get", undefined, { date });
  }

  // ─── Attendance Devices ──────────────────────────────────────────────────────

  async getAttendanceDevices(): Promise<AttendanceDevice[]> {
    return this.queryAps<AttendanceDevice[]>("attendance-device");
  }

  async getAttendanceDeviceLastEvents(): Promise<AttendanceDeviceLastEvent[]> {
    return this.queryAps<AttendanceDeviceLastEvent[]>("attendance-device/last-events");
  }

  // ─── Matrix Relay ────────────────────────────────────────────────────────────

  async postMatrixRelayEvent(packet: MatrixPacket): Promise<void> {
    await this.queryAps<void>("matrixrelay/event", "post", packet);
  }

  // ─── Shift Plans ─────────────────────────────────────────────────────────────

  async getShiftPlans(typeId?: string): Promise<ShiftPlan[]> {
    return this.queryAps<ShiftPlan[]>(
      "shift-plans",
      "get",
      undefined,
      typeId ? { typeId } : undefined,
    );
  }

  async getShiftPlanEmployees(id: string): Promise<Employee[]> {
    return this.queryAps<Employee[]>(`shift-plans/${id}/employees`);
  }

  async getShiftPlanShiftTimes(
    id: string,
    date: string,
  ): Promise<DayBasedShiftTime> {
    return this.queryAps<DayBasedShiftTime>(
      `shift-plans/${id}/shift-times/${date}`,
    );
  }

  // ─── Timesheet ───────────────────────────────────────────────────────────────

  async getTimesheet(input: TimesheetInput): Promise<TimesheetDay[]> {
    return this.queryAps<TimesheetDay[]>(
      "timesheet",
      "get",
      undefined,
      this.buildParams({
        from: input.from,
        to: input.to,
        rcnos: input.rcnos,
      }),
    );
  }

  // ─── Attachments ─────────────────────────────────────────────────────────────

  async getSharePointToken(): Promise<SharePointToken> {
    return this.queryAps<SharePointToken>("attachment/token");
  }

  async getGraphToken(): Promise<GraphToken> {
    return this.queryAps<GraphToken>("attachment/graph-token");
  }

  // ─── Employees ───────────────────────────────────────────────────────────────

  async getEmployee(params: GetEmployeeParams): Promise<Employee> {
    return this.queryAps<Employee>(
      "employee",
      "get",
      undefined,
      this.buildParams(params),
    );
  }

  async searchEmployees(query: string): Promise<Employee[]> {
    return this.queryAps<Employee[]>("employee/search", "get", undefined, {
      query,
    });
  }

  async getEmployeeDirectory(query: string): Promise<Employee[]> {
    return this.queryAps<Employee[]>("employee/directory", "get", undefined, {
      query,
    });
  }

  async getRecentEmployees(): Promise<Employee[]> {
    return this.queryAps<Employee[]>("employee/recents");
  }

  async getEmployeeExtPhoto(rcno: string): Promise<Buffer> {
    return this.queryAps<Buffer>(
      `employee/ext/photo/${rcno}`,
      "get",
      undefined,
      undefined,
      "arraybuffer",
    );
  }

  async getEmployeeFull(params: GetEmployeeFullParams): Promise<Employee> {
    return this.queryAps<Employee>(
      "employee/full",
      "get",
      undefined,
      this.buildParams(params),
    );
  }

  async getEmployeesFullMany(rcnos: number[]): Promise<Employee[]> {
    return this.queryAps<Employee[]>(
      "employee/full/many",
      "get",
      undefined,
      this.buildParams({ rcnos }),
    );
  }

  async getResignedEmployees(params?: GetResignedParams): Promise<Employee[]> {
    return this.queryAps<Employee[]>(
      "employee/resigned",
      "get",
      undefined,
      params ? this.buildParams(params) : undefined,
    );
  }

  async getEmployeePosts(): Promise<EmployeePost[]> {
    return this.queryAps<EmployeePost[]>("employee/posts");
  }

  async getEmployeeRcnos(): Promise<number[]> {
    return this.queryAps<number[]>("employee/rcno");
  }

  async getEmployeeRcnoList(
    params?: EmployeeListQueryDto,
  ): Promise<PaginatedResponse<Employee>> {
    return this.queryAps<PaginatedResponse<Employee>>(
      "employee/rcno/list",
      "get",
      undefined,
      params ? this.buildParams(params) : undefined,
    );
  }

  async getEmployeeList(
    params?: EmployeeListQueryDto,
  ): Promise<PaginatedResponse<Employee>> {
    return this.queryAps<PaginatedResponse<Employee>>(
      "employee/list",
      "get",
      undefined,
      params ? this.buildParams(params) : undefined,
    );
  }

  async patchHrisSync(data: HrisSyncDto): Promise<void> {
    await this.queryAps<void>("employee/hris-sync", "patch", data);
  }

  async postHrisCreate(data: HrisCreateDto): Promise<void> {
    await this.queryAps<void>("employee/hris-create", "post", data);
  }

  async postHrisSsoSync(data: HrisSsoSyncDto): Promise<void> {
    await this.queryAps<void>("employee/hris-sso-sync", "post", data);
  }

  // ─── Leave Requests ───────────────────────────────────────────────────────────

  async getLeave(leaveId: string): Promise<LeaveRequest> {
    return this.queryAps<LeaveRequest>("leave", "get", undefined, { leaveId });
  }

  async getLeavesBetween(input: LeavesBetweenInput): Promise<LeaveRequest[]> {
    return this.queryAps<LeaveRequest[]>(
      "leave/between",
      "get",
      undefined,
      this.buildParams(input),
    );
  }

  async getLeavesIn(input: LeaveRequestsInInput): Promise<LeaveRequest[]> {
    return this.queryAps<LeaveRequest[]>("leave/in", "post", input);
  }

  async getLeaveDays(leaveId: string): Promise<number> {
    return this.queryAps<number>("leave/days", "get", undefined, { leaveId });
  }

  // ─── Sites / Projects ─────────────────────────────────────────────────────────

  async getSites(): Promise<Site[]> {
    return this.queryAps<Site[]>("projects");
  }

  async getSiteEmployees(ids: string[]): Promise<SiteWithEmployees[]> {
    return this.queryAps<SiteWithEmployees[]>(
      "projects/employees",
      "get",
      undefined,
      this.buildParams({ ids }),
    );
  }

  async getSiteAttendance(
    id: string,
    date: string,
  ): Promise<SiteAttendanceEmployee[]> {
    return this.queryAps<SiteAttendanceEmployee[]>(
      `projects/${id}/attendance`,
      "get",
      undefined,
      { date },
    );
  }

  // ─── Divisions ────────────────────────────────────────────────────────────────

  async getDivisions(): Promise<DivisionWithHOD[]> {
    return this.queryAps<DivisionWithHOD[]>("divisions");
  }

  async getEmployeeDivision(rcno: string): Promise<Division> {
    return this.queryAps<Division>("divisions/employee", "get", undefined, {
      rcno,
    });
  }

  async getDepartments(): Promise<string[]> {
    return this.queryAps<string[]>("divisions/departments");
  }

  // ─── Leave Types ─────────────────────────────────────────────────────────────

  async getLeaveTypes(): Promise<LeaveType[]> {
    return this.queryAps<LeaveType[]>("leave-types");
  }

  // ─── Hierarchy ───────────────────────────────────────────────────────────────

  async getHierarchy(params: GetHierarchyParams): Promise<StaffHierarchy> {
    return this.queryAps<StaffHierarchy>(
      "hierarchy",
      "get",
      undefined,
      this.buildParams(params),
    );
  }

  // ─── Payroll Periods ──────────────────────────────────────────────────────────

  async findPayrollPeriods(ids: number[]): Promise<PayrollPeriod[]> {
    return this.queryAps<PayrollPeriod[]>("payroll-period/find", "post", {
      ids,
    });
  }

  // ─── Duties ───────────────────────────────────────────────────────────────────

  async getDuties(
    employeeId: string,
    start: string,
    end: string,
  ): Promise<Duty[]> {
    return this.queryAps<Duty[]>("duties", "get", undefined, {
      employeeId,
      start,
      end,
    });
  }

  // ─── Leave Allocations ────────────────────────────────────────────────────────

  async getEmployeeLeaveAllocations(
    employeeId: string,
    leaveTypeIds?: number[],
  ): Promise<LeaveAllocation[]> {
    return this.queryAps<LeaveAllocation[]>(
      "leave-allocation/employee",
      "get",
      undefined,
      this.buildParams({
        employeeId,
        leaveTypeIdsString: leaveTypeIds ? leaveTypeIds.join(",") : undefined,
      }),
    );
  }
}
