import {
  updateAttendanceInCache,
  updateAttendancePeriodsInCache,
} from "@/services/attendance";
import { PrimaryAccount } from "@/stores/account/types";
import { useAttendanceStore } from "@/stores/attendance";

export const getAttendance = () => {
  return {
    defaultPeriod: useAttendanceStore.getState().defaultPeriod,
    attendances: useAttendanceStore.getState().attendances,
  };
};

export const updateAttendanceState = async (
  account: PrimaryAccount,
  period: string
) => {
  await updateAttendancePeriodsInCache(account).then(
    async () => await updateAttendanceInCache(account, period)
  );
};
