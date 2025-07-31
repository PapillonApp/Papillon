export enum ObservationType {
  LogBookIssue = "LogBookIssue",
  Observation = "Observation",
  Encouragement = "Encouragement",
  Other = "Other"
}

export interface Observation {
  id: string;
  timestamp: number;
  sectionName: string;
  sectionType: ObservationType;
  subjectName?: string;
  shouldParentsJustify: boolean;
  reasons?: string;
}
