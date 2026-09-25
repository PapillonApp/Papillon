import {
  notebook,
  NotebookAbsence,
  NotebookDelay,
  NotebookObservation,
  NotebookPunishment,
  SessionHandle,
  TabLocation,
} from "@blockshub/pawnote-lts";

import { Absence, Attendance, Delay, Observation, Punishment } from "@/services/shared/attendance";
import { Period } from "@/services/shared/grade";
import { error } from "@/utils/logger/logger";

/**
 * Fetches student Notebook from PRONOTE for a specified periot.
 * @param {SessionHandle} session - The session handle for the PRONOTE session.
 * @param {string} period - The name of the period to fetch attendance for.
 * @param {string} accountId - The ID of the account making the request.
 * @return {Promise<Attendance>} - A promise that resolves to the attendance data for the specified period.
 */
export async function fetchPronoteAttendance(session: SessionHandle, accountId: string, period: string): Promise<Attendance> {
  if (!session) {
    throw error("Session is undefined", "fetchPronoteAttendance");
  }

  const attendanceTab = session.user.resources[0].tabs.get(TabLocation.Notebook);
  if (!attendanceTab) {
    throw error("Attendance tab not found in session", "fetchPronoteAttendance");
  }

  const pawnotePeriod = attendanceTab.periods.find(p => p.name === period);
  if (!pawnotePeriod) {
    throw error(`Period "${period}" not found in attendance tab`, "fetchPronoteAttendance");
  }

  const attendance = await notebook(session, pawnotePeriod);
  const delays = mapDelays(Array.isArray(attendance.delays) ? attendance.delays : [], accountId).sort((a, b) => a.givenAt.getTime() - b.givenAt.getTime());
  const absences = mapAbsences(Array.isArray(attendance.absences) ? attendance.absences : [], accountId).sort((a, b) => a.from.getTime() - b.from.getTime());
  const punishments = mapPunishments(Array.isArray(attendance.punishments) ? attendance.punishments : [], accountId).sort((a, b) => a.givenAt.getTime() - b.givenAt.getTime());
  const observations = mapObservations(Array.isArray(attendance.observations) ? attendance.observations : []).sort((a, b) => a.givenAt.getTime() - b.givenAt.getTime());

  return {
    delays: delays,
    absences: absences,
    punishments: punishments,
    observations: observations,
    createdByAccount: accountId
  }
}

/**
 * Fetches all attendance periods from PRONOTE.
 * @param {SessionHandle} session - The session handle for the PRONOTE session.
 * @param {string} accountId - The ID of the account making the request.
 * @return {Promise<Array<Period>>} - A promise that resolves to an array of attendance periods.
 */
export async function fetchPronoteAttendancePeriods(session: SessionHandle, accountId: string): Promise<Period[]> {
  const attendanceTab = session.user.resources[0].tabs.get(TabLocation.Notebook);
  if (!attendanceTab) {
    throw error("Attendance tab not found in session", "fetchPronotePeriods");
  }

  return (Array.isArray(attendanceTab.periods) ? attendanceTab.periods : []).map(p => ({
    id: p.id,
    name: p.name,
    start: p.startDate,
    end: p.endDate,
    createdByAccount: accountId
  }));
}

/**
 * Maps a NotebookObservation[] to a shared Observation[].
 * @param observations
 */
function mapObservations(observations: NotebookObservation[]): Observation[] {
  return observations.map(o => ({
    id: o.id,
    givenAt: o.date,
    sectionName: o.name,
    sectionType: o.kind,
    subjectName: o.subject?.name,
    shouldParentsJustify: o.shouldParentsJustify,
    reason: o.reason,
  }));
}

/**
 * Maps NotebookDelay[] to shared Delay[].
 * @param delays
 */
function mapDelays(delays: NotebookDelay[], accountId: string): Delay[] {
  return delays.map(d => ({
    id: d.id,
    givenAt: d.date,
    reason: d.reason,
    justified: d.justified,
    duration: d.minutes,
    createdByAccount: accountId
  }));
}

/**
 * Maps NotebookAbsence[] to shared Absence[].
 * @param absences
 */
function mapAbsences(absences: NotebookAbsence[], accountId: string): Absence[] {
  return absences.map(a => ({
    id: a.id,
    from: a.startDate,
    to: a.endDate,
    reason: a.reason,
    justified: a.justified,
    timeMissed: a.hoursMissed * 60 + a.minutesMissed,
    createdByAccount: accountId
  }));
}

/**
 * Maps NotebookPunishment[] to shared Punishment[].
 * @param punishments
 * @param accountId
 */
function mapPunishments(punishments: NotebookPunishment[], accountId: string): Punishment[] {
  return punishments.map(p => ({
    id: p.id,
    givenAt: p.dateGiven,
    givenBy: p.giver,
    exclusion: p.exclusion,
    duringLesson: p.isDuringLesson,
    homework: {
      text: p.workToDo,
      documents: (Array.isArray(p.workToDoDocuments) ? p.workToDoDocuments : []).map((attachment) => ({
        type: attachment.kind,
        name: attachment.name,
        url: attachment.url,
        createdByAccount: accountId,
      }))
    },
    reason: {
      text: (Array.isArray(p.reasons) ? p.reasons : []).join(", "),
      circumstances: p.circumstances,
      documents: (Array.isArray(p.circumstancesDocuments) ? p.circumstancesDocuments : []).map((attachment) => ({
        type: attachment.kind,
        name: attachment.name,
        url: attachment.url,
        createdByAccount: accountId,
      }))
    },
    nature: p.title,
    duration: p.durationMinutes
  }));
}
