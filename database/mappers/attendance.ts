import { Absence, Delay, Observation, Punishment } from "@/database/models/Attendance";
import { Absence as SharedAbsence, Delay as SharedDelay, Observation as SharedObservation,Punishment as SharedPunishment } from "@/services/shared/attendance";

export function mapDelaysToShared(delays: Delay[]): SharedDelay[] {
  return delays.map(delay => ({
    id: delay.id,
    givenAt: new Date(delay.givenAt),
    reason: delay.reason,
    justified: delay.justified,
    duration: delay.duration
  }));
}

export function mapAbsencesToShared(absences: Absence[]): SharedAbsence[] {
  return absences.map(absence => ({
    id: absence.id,
    from: new Date(absence.from),
    to: new Date(absence.to),
    reason: absence.reason,
    justified: absence.justified
  }));
}

export function mapPunishmentsToShared(punishments: Punishment[]): SharedPunishment[] {
  return punishments.map(punishment => ({
    id: punishment.id,
    givenAt: new Date(punishment.givenAt),
    givenBy: punishment.givenBy,
    exclusion: punishment.exclusion,
    duringLesson: punishment.duringLesson,
    homework: {
      text: punishment.homeworkText,
      documents: punishment.homeworkDocuments
    },
    reason: {
      text: punishment.reasonText,
      circumstances: punishment.reasonCircumstances,
      documents: punishment.reasonDocuments
    },
    nature: punishment.nature,
    duration: punishment.duration
  }));
}

export function mapObservationsToShared(observations: Observation[]): SharedObservation[] {
  return observations.map(observation => ({
    id: observation.id,
    givenAt: new Date(observation.givenAt),
    sectionName: observation.sectionName,
    sectionType: observation.sectionType,
    subjectName: observation.subjectName,
    shouldParentsJustify: observation.shouldParentsJustify,
    reason: observation.reason
  }))
}
