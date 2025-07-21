import { getHomeworksFromCache } from "@/database/useHomework";
import { Homework } from "@/services/shared/homework";

export async function getHomeworksFromWatermelon(date: Date): Promise<Homework[]> {
  return getHomeworksFromCache(getWeekNumberFromDate(date));
}

export function getWeekNumberFromDate(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}