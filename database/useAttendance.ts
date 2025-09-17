import { Q } from "@nozbe/watermelondb";

import {Attendance as SharedAttendance } from "@/services/shared/attendance";
import { generateId } from "@/utils/generateId";
import { error } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { mapAbsencesToShared, mapDelaysToShared, mapObservationsToShared,mapPunishmentsToShared } from "./mappers/attendance";
import { Absence, Attendance, Delay, Observation, Punishment } from "./models/Attendance";
import { safeWrite } from "./utils/safeTransaction";

export async function addAttendanceToDatabase(attendances: SharedAttendance[], period: string) {
  const db = getDatabaseInstance();
  for (const attendance of attendances) {
    const id = generateId(attendance.createdByAccount + period + attendance.kidName);

    await safeWrite(db, async () => {
      const existing = await db.get('attendance').query(Q.where('attendanceId', id)).fetch();

      if (existing.length > 0) {
        const existingAttendance = existing[0] as Attendance;

        await existingAttendance.update(record => {
          record.createdByAccount = attendance.createdByAccount;
          record.kidName = attendance.kidName ?? undefined;
          record.period = period;
        });

        await Promise.all([
          ...(await existingAttendance.delays.fetch()).map((d: Delay) => d.markAsDeleted()),
          ...(await existingAttendance.absences.fetch()).map((a: Absence) => a.markAsDeleted()),
          ...(await existingAttendance.observations.fetch()).map((o: Observation) => o.markAsDeleted()),
          ...(await existingAttendance.punishments.fetch()).map((p: Punishment) => p.markAsDeleted()),
        ]);


        for (const delay of attendance.delays) {
          await db.get('delays').create(record => {
            Object.assign(record, {
              givenAt: delay.givenAt.getTime(),
              reason: delay.reason,
              justified: delay.justified,
              duration: delay.duration,
              attendanceId: id,
              kidName: delay.kidName
            });
          });
        }

        for (const absence of attendance.absences) {
          await db.get('absences').create(record => {
            Object.assign(record, {
              from: absence.from.getTime(),
              to: absence.to.getTime(),
              reason: absence.reason,
              justified: absence.justified,
              attendanceId: id,
              kidName: absence.kidName
            });
          });
        }

        for (const observation of attendance.observations) {
          await db.get('observations').create(record => {
            Object.assign(record, {
              givenAt: observation.givenAt.getTime(),
              sectionName: observation.sectionName,
              sectionType: observation.sectionType,
              subjectName: observation.subjectName,
              shouldParentsJustify: observation.shouldParentsJustify,
              reason: observation.reason,
              attendanceId: id
            });
          });
        }

        for (const punishment of attendance.punishments) {
          await db.get('punishments').create(record => {
            Object.assign(record, {
              givenAt: punishment.givenAt.getTime(),
              givenBy: punishment.givenBy,
              exclusion: punishment.exclusion,
              duringLesson: punishment.duringLesson,
              nature: punishment.nature,
              duration: punishment.duration,
              homeworkDocumentsRaw: JSON.stringify(punishment.homework.documents ?? []),
              reasonDocumentsRaw: JSON.stringify(punishment.reason.documents ?? []),
              homeworkText: punishment.homework.text,
              reasonText: punishment.reason.text,
              reasonCircumstances: punishment.reason.circumstances,
              attendanceId: id
            });
          });
        }
      } else {
        await db.get('attendance').create(record => {
          const att = record as Attendance;
          att.attendanceId = id;
          att.createdByAccount = attendance.createdByAccount;
          att.period = period;
        });

        for (const delay of attendance.delays) {
          await db.get('delays').create(record => {
            Object.assign(record, {
              givenAt: delay.givenAt.getTime(),
              reason: delay.reason,
              justified: delay.justified,
              duration: delay.duration,
              attendanceId: id
            });
          });
        }

        for (const absence of attendance.absences) {
          await db.get('absences').create(record => {
            Object.assign(record, {
              from: absence.from.getTime(),
              to: absence.to.getTime(),
              reason: absence.reason,
              justified: absence.justified,
              attendanceId: id
            });
          });
        }

        for (const observation of attendance.observations) {
          await db.get('observations').create(record => {
            Object.assign(record, {
              givenAt: observation.givenAt.getTime(),
              sectionName: observation.sectionName,
              sectionType: observation.sectionType,
              subjectName: observation.subjectName,
              shouldParentsJustify: observation.shouldParentsJustify,
              reason: observation.reason,
              attendanceId: id
            });
          });
        }

        for (const punishment of attendance.punishments) {
          await db.get('punishments').create(record => {
            Object.assign(record, {
              givenAt: punishment.givenAt.getTime(),
              givenBy: punishment.givenBy,
              exclusion: punishment.exclusion,
              duringLesson: punishment.duringLesson,
              nature: punishment.nature,
              duration: punishment.duration,
              homeworkDocumentsRaw: JSON.stringify(punishment.homework.documents ?? []),
              reasonDocumentsRaw: JSON.stringify(punishment.reason.documents ?? []),
              homeworkText: punishment.homework.text,
              reasonText: punishment.reason.text,
              reasonCircumstances: punishment.reason.circumstances,
              attendanceId: id
            });
          });
        }
      }
    }, 10000, 'addAttendanceToDatabase');
  }
}


export async function getAttendanceFromCache(period: string): Promise<SharedAttendance> {
  try {
    const database = getDatabaseInstance();

    const attendance = await database
      .get<Attendance>('attendance')
      .query(Q.where('period', period))
      .fetch();

    if (!attendance[0]) {
      throw new Error("Attendance not found");
    }
    const att = attendance[0];
    console.log(att.delays)
    return {
      createdByAccount: att.createdByAccount,
      delays: mapDelaysToShared(att.delays, att),
      absences: mapAbsencesToShared(att.absences, att),
      punishments: mapPunishmentsToShared(att.punishments),
      observations: mapObservationsToShared(att.observations),
      fromCache: true
    };
  } catch (err) {
    error("Failed to fetch attendance from cache: " + String(err));
  }
}
