"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let ApsService = class ApsService {
    constructor(config) {
        this.config = config;
    }
    queryAps(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, method = "get", body, params, responseType) {
            const result = yield axios_1.default
                .request({
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
                var _a;
                if ((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) {
                    const e = err.response.data;
                    throw new common_1.InternalServerErrorException(`APS-API: ${e.message}`);
                }
                throw new common_1.InternalServerErrorException(err);
            });
            return result.data;
        });
    }
    buildParams(input) {
        const params = {};
        for (const [key, value] of Object.entries(input)) {
            if (value === undefined || value === null)
                continue;
            if (Array.isArray(value)) {
                params[key] = value.join(",");
            }
            else {
                params[key] = value;
            }
        }
        return params;
    }
    // ─── Calendar ───────────────────────────────────────────────────────────────
    getCalendarAll(start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("calendar/all", "get", undefined, {
                start,
                end,
            });
        });
    }
    getCalendar(date) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("calendar", "get", undefined, { date });
        });
    }
    // ─── Attendance Devices ──────────────────────────────────────────────────────
    getAttendanceDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("attendance-device");
        });
    }
    getAttendanceDeviceLastEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("attendance-device/last-events");
        });
    }
    // ─── Matrix Relay ────────────────────────────────────────────────────────────
    postMatrixRelayEvent(packet) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryAps("matrixrelay/event", "post", packet);
        });
    }
    // ─── Shift Plans ─────────────────────────────────────────────────────────────
    getShiftPlans(typeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("shift-plans", "get", undefined, typeId ? { typeId } : undefined);
        });
    }
    getShiftPlanEmployees(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps(`shift-plans/${id}/employees`);
        });
    }
    getShiftPlanShiftTimes(id, date) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps(`shift-plans/${id}/shift-times/${date}`);
        });
    }
    // ─── Timesheet ───────────────────────────────────────────────────────────────
    getTimesheet(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("timesheet", "get", undefined, this.buildParams({
                from: input.from,
                to: input.to,
                rcnos: input.rcnos,
            }));
        });
    }
    // ─── Attachments ─────────────────────────────────────────────────────────────
    getSharePointToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("attachment/token");
        });
    }
    getGraphToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("attachment/graph-token");
        });
    }
    // ─── Employees ───────────────────────────────────────────────────────────────
    getEmployee(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee", "get", undefined, this.buildParams(params));
        });
    }
    searchEmployees(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee/search", "get", undefined, {
                query,
            });
        });
    }
    getEmployeeDirectory(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee/directory", "get", undefined, {
                query,
            });
        });
    }
    getRecentEmployees() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee/recents");
        });
    }
    getEmployeeExtPhoto(rcno) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps(`employee/ext/photo/${rcno}`, "get", undefined, undefined, "arraybuffer");
        });
    }
    getEmployeeFull(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee/full", "get", undefined, this.buildParams(params));
        });
    }
    getEmployeesFullMany(rcnos) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee/full/many", "get", undefined, this.buildParams({ rcnos }));
        });
    }
    getResignedEmployees(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee/resigned", "get", undefined, params ? this.buildParams(params) : undefined);
        });
    }
    getEmployeePosts() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee/posts");
        });
    }
    getEmployeeRcnos() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee/rcno");
        });
    }
    getEmployeeRcnoList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee/rcno/list", "get", undefined, params ? this.buildParams(params) : undefined);
        });
    }
    getEmployeeList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("employee/list", "get", undefined, params ? this.buildParams(params) : undefined);
        });
    }
    patchHrisSync(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryAps("employee/hris-sync", "patch", data);
        });
    }
    postHrisCreate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryAps("employee/hris-create", "post", data);
        });
    }
    postHrisSsoSync(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryAps("employee/hris-sso-sync", "post", data);
        });
    }
    // ─── Leave Requests ───────────────────────────────────────────────────────────
    getLeave(leaveId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("leave", "get", undefined, { leaveId });
        });
    }
    getLeavesBetween(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("leave/between", "get", undefined, this.buildParams(input));
        });
    }
    getLeavesIn(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("leave/in", "post", input);
        });
    }
    getLeaveDays(leaveId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("leave/days", "get", undefined, { leaveId });
        });
    }
    // ─── Sites / Projects ─────────────────────────────────────────────────────────
    getSites() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("projects");
        });
    }
    getSiteEmployees(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("projects/employees", "get", undefined, this.buildParams({ ids }));
        });
    }
    getSiteAttendance(id, date) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps(`projects/${id}/attendance`, "get", undefined, { date });
        });
    }
    // ─── Divisions ────────────────────────────────────────────────────────────────
    getDivisions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("divisions");
        });
    }
    getEmployeeDivision(rcno) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("divisions/employee", "get", undefined, {
                rcno,
            });
        });
    }
    getDepartments() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("divisions/departments");
        });
    }
    // ─── Leave Types ─────────────────────────────────────────────────────────────
    getLeaveTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("leave-types");
        });
    }
    // ─── Hierarchy ───────────────────────────────────────────────────────────────
    getHierarchy(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("hierarchy", "get", undefined, this.buildParams(params));
        });
    }
    // ─── Payroll Periods ──────────────────────────────────────────────────────────
    findPayrollPeriods(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("payroll-period/find", "post", {
                ids,
            });
        });
    }
    // ─── Duties ───────────────────────────────────────────────────────────────────
    getDuties(employeeId, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("duties", "get", undefined, {
                employeeId,
                start,
                end,
            });
        });
    }
    // ─── Leave Allocations ────────────────────────────────────────────────────────
    getEmployeeLeaveAllocations(employeeId, leaveTypeIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryAps("leave-allocation/employee", "get", undefined, this.buildParams({
                employeeId,
                leaveTypeIdsString: leaveTypeIds ? leaveTypeIds.join(",") : undefined,
            }));
        });
    }
};
exports.ApsService = ApsService;
exports.ApsService = ApsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], ApsService);
