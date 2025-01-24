import { PrimaryAccount } from "@/stores/account/types";
import { useTimetableStore } from "@/stores/timetable";
import { updateTimetableForWeekInCache } from "@/services/timetable";

export const getLessons = () => {
  return useTimetableStore.getState().timetables;
};

export const updateLessonsState = async (
  account: PrimaryAccount,
  weekNumber: number
) => {
  await updateTimetableForWeekInCache(account, weekNumber, true);
};
