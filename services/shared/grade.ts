import { GenericInterface } from "@/services/shared/types";
import { Attachment } from "@/services/shared/attachment";

export interface PeriodGrades extends GenericInterface {
  studentOverall: GradeScore;
  classAverage: GradeScore;
  subjects: Array<Subject>;
}

export interface Subject extends GenericInterface {
  id: string;
  name: string;
  studentAverage: GradeScore;
  classAverage: GradeScore;
  maximum: GradeScore;
  minimum: GradeScore;
  outOf: GradeScore;
  grades: Array<Grade>;
}

export interface Grade extends GenericInterface {
  id: string;
  description: string;
  givenAt: Date;
  subjectFile?: Attachment;
  correctionFile?: Attachment;
  bonus?: boolean;
  optional?: boolean;
  outOf: GradeScore;
  studentScore: GradeScore;
  averageScore: GradeScore;
  minScore: GradeScore;
  maxScore: GradeScore;
}

export interface GradeScore extends GenericInterface {
  value?: number;
  status?: string;
  disabled?: boolean;
}