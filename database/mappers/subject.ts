import Subject from "@/database/models/Subject";
import { Subject as SharedSubject } from "@/services/shared/grade";

export function mapSubjectToShared(subject: Subject): SharedSubject {
  // Lazily required to avoid a require cycle with ./grade.ts, which imports
  // mapSubjectToShared from this file.
  const { mapGradeToShared } = require("@/database/mappers/grade") as typeof import("@/database/mappers/grade");
  return {
    id: subject.id,
    name: subject.name,
    studentAverage: subject.studentAverage,
    classAverage: subject.classAverage,
    maximum: subject.maximum,
    minimum: subject.minimum,
    outOf: subject.outOf,
    grades: subject.grades.map(mapGradeToShared)
  }
}
