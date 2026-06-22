## APS

NestJS library for APS API integration.

Provides a fully typed injectable service for all REST endpoints guarded by the API key and PermissionGuard.

### Usage

Register the `ApsModule` in the `AppModule` and pass in the configuration.

```ts
// app.module.ts
import { ApsModule } from 'standards';

@Module({
  imports: [
    ApsModule.register({
      baseUrl: process.env.APS_URL,
      apiKey: process.env.APS_KEY,
    }),
  ],
})

// or using ConfigService
@Module({
  imports: [
    ApsModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        baseUrl: configService.get('APS_URL'),
        apiKey: configService.get('APS_KEY'),
      }),
    }),
  ],
})
```

- `baseUrl` — Base URL of the APS API including the `/api` prefix, e.g. `https://<host>/api`
- `apiKey` — API key used in the `Authorization` header for all requests

Inject `ApsService` in any service that needs to call APS.

```ts
// example.service.ts
import { ApsService } from 'standards';

export class ExampleService {
  constructor(private apsService: ApsService) {}

  async getEmployee(rcno: string) {
    return this.apsService.getEmployeeFull({ rcno });
  }

  async getLeavesBetween(from: string, to: string, employeeId: number) {
    return this.apsService.getLeavesBetween({ from, to, employeeId });
  }
}
```

### Available methods

| Method | Endpoint | Permission |
|--------|----------|------------|
| `getCalendarAll(start, end)` | `GET /calendar/all` | `GET_CALENDAR` |
| `getCalendar(date)` | `GET /calendar` | `GET_CALENDAR` |
| `getAttendanceDevices()` | `GET /attendance-device` | `VIEW_ATTENDANCE_DEVICES` |
| `getAttendanceDeviceLastEvents()` | `GET /attendance-device/last-events` | `VIEW_ATTENDANCE_DEVICES` |
| `postMatrixRelayEvent(packet)` | `POST /matrixrelay/event` | `VIEW_ATTENDANCE_DEVICES` |
| `getShiftPlans(typeId?)` | `GET /shift-plans` | `GET_SHIFT_PLANS` |
| `getShiftPlanEmployees(id)` | `GET /shift-plans/:id/employees` | `GET_SHIFT_PLANS` |
| `getShiftPlanShiftTimes(id, date)` | `GET /shift-plans/:id/shift-times/:date` | `GET_SHIFT_PLANS` |
| `getTimesheet(input)` | `GET /timesheet` | `GET_ATTENDANCE` |
| `getSharePointToken()` | `GET /attachment/token` | `GET_SHAREPOINT_TOKEN` |
| `getGraphToken()` | `GET /attachment/graph-token` | `GET_SHAREPOINT_TOKEN` |
| `getEmployee(params)` | `GET /employee` | `GET_EMPLOYEE` |
| `searchEmployees(query)` | `GET /employee/search` | `GET_EMPLOYEE` |
| `getEmployeeDirectory(query)` | `GET /employee/directory` | `GET_EMPLOYEE` |
| `getRecentEmployees()` | `GET /employee/recents` | `GET_EMPLOYEE` |
| `getEmployeeExtPhoto(rcno)` | `GET /employee/ext/photo/:rcno` | `GET_EMPLOYEE` |
| `getEmployeeFull(params)` | `GET /employee/full` | `GET_EMPLOYEE` |
| `getEmployeesFullMany(rcnos)` | `GET /employee/full/many` | `GET_EMPLOYEE` |
| `getResignedEmployees(params?)` | `GET /employee/resigned` | `GET_EMPLOYEE` |
| `getEmployeePosts()` | `GET /employee/posts` | `GET_EMPLOYEE` |
| `getEmployeeRcnos()` | `GET /employee/rcno` | `GET_EMPLOYEE` |
| `getEmployeeRcnoList(params?)` | `GET /employee/rcno/list` | `GET_EMPLOYEE` |
| `getEmployeeList(params?)` | `GET /employee/list` | `GET_EMPLOYEE` |
| `patchHrisSync(data)` | `PATCH /employee/hris-sync` | `HRIS_PUSH_EMPLOYEE` |
| `postHrisCreate(data)` | `POST /employee/hris-create` | `HRIS_PUSH_EMPLOYEE` |
| `postHrisSsoSync(data)` | `POST /employee/hris-sso-sync` | `HRIS_PUSH_EMPLOYEE` |
| `getLeave(leaveId)` | `GET /leave` | `GET_LEAVES` |
| `getLeavesBetween(input)` | `GET /leave/between` | `GET_LEAVES` |
| `getLeavesIn(input)` | `POST /leave/in` | `GET_LEAVES` |
| `getLeaveDays(leaveId)` | `GET /leave/days` | `GET_LEAVES` |
| `getSites()` | `GET /projects` | `GET_PROJECTS` |
| `getSiteEmployees(ids)` | `GET /projects/employees` | `GET_PROJECTS` |
| `getSiteAttendance(id, date)` | `GET /projects/:id/attendance` | `GET_PROJECTS`, `GET_ATTENDANCE` |
| `getDivisions()` | `GET /divisions` | `GET_DIVISIONS` |
| `getEmployeeDivision(rcno)` | `GET /divisions/employee` | `GET_DIVISIONS` |
| `getDepartments()` | `GET /divisions/departments` | `GET_DIVISIONS` |
| `getLeaveTypes()` | `GET /leave-types` | `GET_LEAVES` |
| `getHierarchy(params)` | `GET /hierarchy` | `GET_HIERARCHY` |
| `findPayrollPeriods(ids)` | `POST /payroll-period/find` | — |
| `getDuties(employeeId, start, end)` | `GET /duties` | `GET_DUTIES` |
| `getEmployeeLeaveAllocations(employeeId, leaveTypeIds?)` | `GET /leave-allocation/employee` | `GET_LEAVES` |

The API key used must have the corresponding permission(s) granted in APS for each method called.
