import { IntentDef } from "papillon-intents";
import { intents as TimetableIntents } from "@/intents/timetable/intents";
import { intents as GradeIntents } from "@/intents/grades/intents";
import { intents as HomeworkIntents } from "@/intents/homework/intents";

export const intents: IntentDef[] = [
  ...TimetableIntents,
  ...GradeIntents,
  ...HomeworkIntents,
];
