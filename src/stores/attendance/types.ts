import type { Attendance } from "@/services/shared/Attendance";
import type { Period } from "@/services/shared/Period";

export interface AttendanceStore {
  defaultPeriod: string
  periods: Period[]

  attendances: { [periodName: string]: Attendance }

  updatePeriods: (periods: Period[], defaultPeriodName: string) => void
  updateAttendance: (periodName: string, attendance: Attendance) => void
}
