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

  const weeksToFetch = new Set<number>();
  




  let iterDate = new Date(startDate);
  
  while (iterDate <= endDate) {
    const weekNb = getWeekNumberFromDate(iterDate);
    weeksToFetch.add(weekNb);
    
    iterDate.setDate(iterDate.getDate() + 7);
  }

  weeksToFetch.add(getWeekNumberFromDate(endDate));
  
  const uniqueWeeks = Array.from(weeksToFetch);

  console.log(`[Wrapped] Fetchiing history for weeks: ${uniqueWeeks.join(', ')}`);
  
  const BATCH_SIZE = 3;
  for (let i = 0; i < uniqueWeeks.length; i += BATCH_SIZE) {
    const batch = uniqueWeeks.slice(i, i + BATCH_SIZE);
    
    await Promise.allSettled(batch.map(week => 
      manager.getWeeklyTimetable(week)
        .then(() => console.log(`[Wrapped] Fetched week ${week}`))
        .catch(e => console.error(`[Wrapped] Failed fetch week ${week}`, e))
    ));
  }
  
  console.log("[Wrapped] History fetch complete");
};
