import { Period } from "@/services/shared/grade";
import { error, warn } from "@/utils/logger/logger";

export function getCurrentPeriod(periods: Period[]): Period {
  const now = new Date().getTime()
  periods = periods.sort((a, b) => a.start.getTime() - b.start.getTime());

  let currentPeriodFound = false;
  for (const period of periods) {
    if (period.start.getTime() < now && period.end.getTime() > now) {
      return period;
    }
  }

  if (!currentPeriodFound && periods.length > 0) {
    warn("Current period not found. Falling back to the first period in the array.")
    return periods[0]
  }

  error("Unable to find the current period and unable to fallback...")
}