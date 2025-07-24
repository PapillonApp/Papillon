import { Model, Q } from "@nozbe/watermelondb";

import { Subject as SharedSubject } from "@/services/shared/grade";
import { generateId } from "@/utils/generateId";

import { getDatabaseInstance } from "./DatabaseProvider";
import Subject from "./models/Subject";

export async function addSubjectsToDatabase(
  subjects: SharedSubject[],
  periodGradeId?: string
) {
  const db = getDatabaseInstance();

  for (const item of subjects) {
    const id = generateId(item.name);
    const existing = await db.get('subjects').query(
      Q.where('subjectId', id)
    ).fetch();

    if (existing.length > 0) {continue;}

    await db.write(async () => {
      await db.get('subjects').create((record: Model) => {
        const subject = record as Subject;
        Object.assign(subject, {
          subjectId: id,
          name: item.name,
          studentAverage: item.studentAverage,
          classAverage: item.classAverage,
          maximum: item.maximum,
          minimum: item.minimum,
          outOf: item.outOf,
          periodGradeId: periodGradeId ?? null
        });
      });
    });
  }
}
