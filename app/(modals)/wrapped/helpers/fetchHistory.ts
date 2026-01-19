import { getManager } from "@/services/shared";
import { getWeekNumberFromDate } from "@/database/useHomework";

export const fetchHistory = async () => {
  const manager = getManager();
  if (!manager) return;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  let startYear = currentYear;
  if (currentMonth < 8) {
    startYear = currentYear - 1;
  }
  
  const startDate = new Date(startYear, 8, 1);
  const endDate = now;

  const weeksToFetch = new Map<number, Date>();

  let iterDate = new Date(startDate);
  
  while (iterDate <= endDate) {
    const weekNb = getWeekNumberFromDate(iterDate);
    weeksToFetch.set(weekNb, new Date(iterDate));
    
    iterDate.setDate(iterDate.getDate() + 7);
  }

  weeksToFetch.set(getWeekNumberFromDate(endDate), new Date(endDate));
  
  const uniqueWeeks = Array.from(weeksToFetch.entries());

  console.log(`[Wrapped] Fetchiing history for weeks: ${uniqueWeeks.map(w => w[0]).join(', ')}`);
  
  const BATCH_SIZE = 3;
  for (let i = 0; i < uniqueWeeks.length; i += BATCH_SIZE) {
    const batch = uniqueWeeks.slice(i, i + BATCH_SIZE);
    
    await Promise.allSettled(batch.map(([week, date]) => 
      manager.getWeeklyTimetable(week, date)
        .then(() => console.log(`[Wrapped] Fetched week ${week}`))
        .catch(e => console.error(`[Wrapped] Failed fetch week ${week}`, e))
    ));
  }
  
  console.log("[Wrapped] History fetch complete");
};
