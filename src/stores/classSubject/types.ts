import type { ClassSubject } from "pawdirecte";

export interface ClassSubjectStore {
  subjects: ClassSubject[],
  pushSubjects: (subjects: ClassSubject[]) => void,
}

