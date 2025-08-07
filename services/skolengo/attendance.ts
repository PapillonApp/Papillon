import { AttendanceItem, AttendanceItemState, AttendanceItemType, Skolengo } from "skolengojs";

import { Absence, Attendance, Delay } from "../shared/attendance";

export async function fetchSkolengoAttendance(session: Skolengo, accountId: string): Promise<Attendance> {
  const attendance = await session.GetAttendanceItems()
  const delays = mapSkolengoDelays(attendance)
  const absences = mapSkolengoAbsences(attendance)

  return {
    delays,
    absences,
    punishments: [],
    observations: [],
    createdByAccount: accountId
  }
}

function mapSkolengoDelays(data: AttendanceItem[]): Delay[] {
  return data.filter(a => a.type === AttendanceItemType.LATENESS).map(item => ({
    id: item.id,
    givenAt: item.startDate,
    reason: item.reason,
    justified: (item.state === AttendanceItemState.LOCKED),
    duration: (item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60)
  }))
}

function mapSkolengoAbsences(data: AttendanceItem[]): Absence[] {
  return data.filter(a => a.type === AttendanceItemType.ABSENCE).map(item => ({
    id: item.id,
    from: item.startDate,
    to: item.endDate,
    reason: item.reason,
    justified: (item.state === AttendanceItemState.LOCKED)
  }))
}