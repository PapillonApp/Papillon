import { AttendanceItem, AttendanceItemState, AttendanceItemType, Kind, Skolengo } from "skolengojs";
import { Absence, Attendance, Delay } from "../shared/attendance";

export async function fetchSkolengoAttendance(session: Skolengo, accountId: string): Promise<Attendance> {
	const delays: Delay[] = []
	const absences: Absence[] = []

	if (session.kind === Kind.STUDENT) {
		const attendance = await session.GetAttendanceItems()
		delays.push(...mapSkolengoDelays(attendance, accountId))
		absences.push(...mapSkolengoAbsences(attendance, accountId))
	} else {
		for (const kid of session.kids ?? []) {
			const attendance = await kid.GetAttendanceItems()
			delays.push(...mapSkolengoDelays(attendance, accountId, `${kid.firstName} ${kid.lastName}`))
			absences.push(...mapSkolengoAbsences(attendance, accountId, `${kid.firstName} ${kid.lastName}`))
		}
	}

	return {
		delays,
		absences,
		punishments: [],
		observations: [],
		createdByAccount: accountId
	}
}

function mapSkolengoDelays(data: AttendanceItem[], accountId: string, kidName?: string): Delay[] {
	return data.filter(a => a.type === AttendanceItemType.LATENESS).map(item => ({
		id: item.id,
		givenAt: item.startDate,
		reason: item.reason,
		justified: (item.state === AttendanceItemState.LOCKED),
		duration: (item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60),
		createdByAccount: accountId,
		kidName: kidName
	}))
}

function mapSkolengoAbsences(data: AttendanceItem[], accountId: string, kidName?: string): Absence[] {
	return data.filter(a => a.type === AttendanceItemType.ABSENCE).map(item => ({
		id: item.id,
		from: item.startDate,
		to: item.endDate,
		reason: item.reason,
		justified: (item.state === AttendanceItemState.LOCKED),
		createdByAccount: accountId,
		kidName: kidName
	}))
}