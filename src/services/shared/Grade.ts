import { Attachment } from "./Attachment";

export enum GradeInformation {
  Absent,
  Exempted,
  NotGraded,
  Unfit,
  Unreturned
}

export interface GradeValue {
  /**
   * Metadata, if any, about the grade.
   * Whether the student was absent, exempted, etc.
   */
  information?: GradeInformation;

  /**
   * When not graded, the value could be `null`.
   * (or 0 depending on the services)
   */
  value: number | null;

  /**
   * Whether the "value" should be counted
   * in the average or not.
   */
  disabled?: boolean
};

export interface Grade {
  id: string;
  subjectId?: string;
  subjectName: string;
  description: string;
  timestamp: number;

  subjectFile?: Attachment;
  correctionFile?: Attachment;

  isBonus?: boolean;
  isOptional?: boolean;

  outOf: GradeValue;
  coefficient: number;

  student: GradeValue;
  average: GradeValue;
  max: GradeValue;
  min: GradeValue;
}

export interface SubjectAverage {
  subjectName: string;
  id?: string;
  average?: GradeValue;
  classAverage: GradeValue;
  max: GradeValue;
  min: GradeValue;
  outOf?: GradeValue;
  color: string;
}

export interface AverageOverview {
  subjects: SubjectAverage[];
  overall: GradeValue;
  classOverall: GradeValue;
}

export interface GradesPerSubject {
  average: SubjectAverage
  grades: Array<Grade>
}
