import { PrimaryAccount } from "@/stores/account/types";
import { useHomeworkStore } from "@/stores/homework";
import { updateHomeworkForWeekInCache } from "@/services/homework";
import { epochWNToDate } from "@/utils/epochWeekNumber";

const getCurrentWeekNumber = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(1970, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek);
};

export const getHomeworks = () => {
  return useHomeworkStore.getState().homeworks;
};

export const updateHomeworksState = async (account: PrimaryAccount) => {
  await updateHomeworkForWeekInCache(
    account,
    epochWNToDate(getCurrentWeekNumber())
  );
  await updateHomeworkForWeekInCache(
    account,
    epochWNToDate(getCurrentWeekNumber() + 1)
  );
};
