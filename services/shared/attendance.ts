import { GenericInterface } from "@/services/shared/types";
import { Attachment } from "@/services/shared/attachment";

export interface Attendance extends GenericInterface {
  delays: Array<Delay>;
  absences: Array<Absence>;
  punishments: Array<Punishment>;
  observations: Array<Observation>;
}

export interface Delay {
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

export interface Absence {
  id: string;
  from: Date;
  to: Date;
  reason?: string;
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
    text: string[];
    circumstances: string;
    documents: Attachment[];
  };
  nature: string;
  duration: number;
}
