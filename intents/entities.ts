import { EntityDef } from "papillon-intents";
import { entities as TimetableEntities } from "@/intents/timetable/entities";
import { entities as GradeEntities } from "@/intents/grades/entities";
import { entities as HomeworkEntities } from "@/intents/homework/entities";

export const entities: Record<string, EntityDef> = {
  ...TimetableEntities,
  ...GradeEntities,
  ...HomeworkEntities,
};
