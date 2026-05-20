import { WebUntisClient } from "webuntis-client";
import { Period } from "@/services/shared/grade";

export async function fetchWebUntisPeriods(client: WebUntisClient, accountId: string): Promise<Period[]> {
  const data = await client.data.get();
  const currentSchoolYear = data.currentSchoolYear;

  const start = new Date(currentSchoolYear.dateRange.start);
  const end = new Date(currentSchoolYear.dateRange.end);

  return [{
    id: currentSchoolYear.id.toString(),
    name: currentSchoolYear.name,
    start: start,
    end: end,
    createdByAccount: accountId
  }];
}