import { mapGradeToShared } from "@/database/mappers/grade";
import Subject from "@/database/models/Subject";
import { Subject as SharedSubject } from "@/services/shared/grade";

export function mapSubjectToShared(subject: Subject): SharedSubject {
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
