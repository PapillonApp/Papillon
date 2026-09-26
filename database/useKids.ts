import { Model, Q } from "@nozbe/watermelondb";

import { Kid as SharedKid } from "@/services/shared/kid";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { mapKidsToShared } from "./mappers/kids";
import Kid from "./models/Kid";
import { safeWrite } from "./utils/safeTransaction";

export async function addKidToDatabase(kids: SharedKid[]) {
  const db = getDatabaseInstance()
  for (const kid of kids) {
    const existing = await db.get('kids').query(Q.where('kidId', kid.id)).fetch();

    if (existing.length === 0) {
      await safeWrite(db, async () => {
        await db.get('kids').create((record: Model) => {
          const kidsModel = record as Kid
          Object.assign(kidsModel, {
            createByAccount: kid.createdByAccount,
            kidId: kid.id,
            firstName: kid.firstName,
            lastName: kid.lastName,
            class: kid.class,
            dateOfBirth: kid.dateOfBirth.getTime()
          })
        })
      }, 10000, 'addKidToDatabase')
    }
  }
}

export async function getKidsFromCache(): Promise<SharedKid[]> {
  try {
    const db = getDatabaseInstance();
    const kids = await db
      .get<Kid>('kids')
      .query()
      .fetch()

    return kids.map(mapKidsToShared)
  } catch (error) {
    warn(String(error))
    return[]
  }
}