import { Model, Q } from "@nozbe/watermelondb";

import { Subject as SharedSubject } from "@/services/shared/grade";
import { generateId } from "@/utils/generateId";
import { info } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import Subject from "./models/Subject";
import { safeWrite } from "./utils/safeTransaction";

export async function addSubjectsToDatabase(
  subjects: SharedSubject[],
  periodGradeId?: string
) {
  const db = getDatabaseInstance();

  const subjectsToCreate: Array<{
    id: string;
    item: SharedSubject;
  }> = [];

  for (const item of subjects) {
    const id = generateId(item.name);
    const existingForAccount = await db.get('subjects').query(Q.where('subjectId', id)).fetch();

    if (existingForAccount.length === 0) {
      subjectsToCreate.push({ id, item });
    }
  }

  if (subjectsToCreate.length > 0) {
    await safeWrite(
      db,
      async () => {
        const promises = subjectsToCreate.map(({ id, item }) =>
          db.get('subjects').create((record: Model) => {
            const subject = record as Subject;
            Object.assign(subject, {
              subjectId: id,
              name: item.name,
              studentAverage: JSON.stringify(item.studentAverage),
              classAverage: JSON.stringify(item.classAverage),
              maximum: JSON.stringify(item.maximum),
              minimum: JSON.stringify(item.minimum),
              outOf: JSON.stringify(item.outOf),
              periodGradeId: periodGradeId ?? null
            });
          })
        );
        await Promise.all(promises);
      },
      10000,
      `add_subjects_${subjectsToCreate.length}_items`
    );
  } else {
    info(`🍉 No new subjects to add (all ${subjects.length} already exist)`);
  }
}
