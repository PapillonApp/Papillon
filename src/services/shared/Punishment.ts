import type { Attachment } from "./Attachment";

export interface Punishment {
  id: string;

  schedulable: boolean;
  schedule: Array<{
    startTimestamp: number;
    /** In minutes. */
    duration: number;
  }>;

  timestamp: number;
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

  /** In minutes. */
  duration: number;
}
