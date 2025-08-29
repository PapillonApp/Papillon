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
    console.log("Trying to add subject", item.name)
    const id = generateId(item.name);
    const existingForAccount = await db.get('subjects').query(Q.where('subjectId', id)).fetch();

    if (existingForAccount.length === 0) {
      await db.write(async () => {
        await db.get('subjects').create((record: Model) => {
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
        });
      });
    }
  }
}
