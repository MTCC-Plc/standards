import { Employee } from "./employee.interface";

export interface ShiftType {
  id: number;
  name: string;
  description: string;
}

export interface DayBasedShiftTime {
  id: number;
  name: string;
  normal_start_time: string;
  normal_end_time: string;
  ramazan_start_time: string;
  ramazan_end_time: string;
  employees?: Employee[];
}

export interface ShiftPlan {
  id: number;
  shift_type_id: number;
  shiftType?: ShiftType;
  start_date: string;
  name: string;
  description: string;
  modified_by: string;
  modified_on: string;
  employees?: Employee[];
  shiftTimes?: DayBasedShiftTime[];
}
