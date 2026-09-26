import { Attachment } from "@/services/shared/attachment";
import { GenericInterface } from "@/services/shared/types";

export interface Attendance extends GenericInterface {
  delays: Delay[];
  absences: Absence[];
  punishments: Punishment[];
  observations: Observation[];
}

export interface Delay extends GenericInterface {
  id: string;
  givenAt: Date;
  reason?: string;
  justified: boolean;
  duration: number;
}

export enum ObservationType {
  LogBookIssue,
  Observation,
  Encouragement,
  Other
}

export interface Observation {
  id: string;
  givenAt: Date;
  sectionName: string;
  sectionType: ObservationType;
  subjectName?: string;
  shouldParentsJustify: boolean;
  reason?: string;
}

export interface Absence extends GenericInterface {
  id: string;
  from: Date;
  to: Date;
  reason?: string;
  timeMissed: number;
  justified: boolean;
}

export interface Punishment {
  id: string;
  givenAt: Date;
  givenBy: string;
  exclusion: boolean;
  duringLesson: boolean;
  homework: {
    text: string;
    documents: Attachment[];
  };

  reason: {
    text: string;
    circumstances: string;
    documents: Attachment[];
  };
  nature: string;
  duration: number;
}
