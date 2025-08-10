import { Attachment } from "@/services/shared/attachment";
import { GenericInterface } from "@/services/shared/types";

export interface PeriodGrades extends GenericInterface {
  studentOverall: GradeScore;
  classAverage: GradeScore;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  studentAverage: GradeScore;
  classAverage: GradeScore;
  maximum?: GradeScore;
  minimum?: GradeScore;
  outOf: GradeScore;
  grades: Grade[];
}

export interface Grade extends GenericInterface {
  id: string;
  subjectId: string;
  description: string;
  givenAt: Date;
  subjectFile?: Attachment;
  correctionFile?: Attachment;
  bonus?: boolean;
  optional?: boolean;
  outOf: GradeScore;
  coefficient: number;
  studentScore?: GradeScore;
  averageScore?: GradeScore;
  minScore?: GradeScore;
  maxScore?: GradeScore;
}

export interface GradeScore {
  value: number;
  status?: string;
  disabled?: boolean;
}

export interface Period extends GenericInterface {
  name: string
  id?: string
  start: Date
  end: Date
}