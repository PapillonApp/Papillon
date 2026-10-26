import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useGradesData } from "@/app/(tabs)/grades/hooks/useGradesData";
import { usePeriodsData } from "@/app/(tabs)/grades/hooks/usePeriodsData";
import { useTimetableWidgetData } from "@/app/(tabs)/index/hooks/useTimetableWidgetData";
import { getBalancesFromCache } from "@/database/useBalance";
import {
  getHomeworkById,
  getWeekNumberFromDate,
  updateHomeworkIsDone,
  useHomeworkForWeeks,
} from "@/database/useHomework";
import { useManagerSubscription } from "@/hooks/useManagerSubscription";
import {
  addWatchSyncRequestListener,
  addWatchToggleHomeworkListener,
  syncWatchData,
  wearIsSupported,
} from "@/modules/papillon-wear";
import type { AccountManager } from "@/services/shared";
import { getManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import { useSettingsStore } from "@/stores/settings";
import { getGradeDisplayScale } from "@/utils/grades/scale";
import { warn } from "@/utils/logger/logger";

import { buildWearSyncPayload, WalletWithCode } from "./buildWearPayload";

let manualSyncCallback: (() => Promise<boolean>) | null = null;

export async function triggerManualWearSync(): Promise<boolean> {
  if (!manualSyncCallback) {
    return false;
  }
  return manualSyncCallback();
}

const useSync = () => {
  const wearOsEnabled = useSettingsStore(
    state => state.personalization.wearOsEnabled ?? true
  );
  const colorSelected = useSettingsStore(
    state => state.personalization.colorSelected
  );
  const gradesDisplayScale = getGradeDisplayScale(
    useSettingsStore(state => state.personalization.gradesDisplayScale)
  );

  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const account = useMemo(
    () => accounts.find(a => a.id === lastUsedAccount),
    [accounts, lastUsedAccount]
  );

  const { upcomingDays, loading: loadingTimetable } = useTimetableWidgetData({
    showCancelled: true,
  });

  const { currentPeriod } = usePeriodsData();
  const { subjects, averages } = useGradesData(currentPeriod);

  const [homeworkRefresh, setHomeworkRefresh] = useState(0);
  const upcomingWeeks = useMemo(() => {
    const currentWeek = getWeekNumberFromDate(new Date());
    return [currentWeek, currentWeek + 1];
  }, []);
  const homeworksByWeek = useHomeworkForWeeks(upcomingWeeks, homeworkRefresh);

  const [walletsWithCodes, setWalletsWithCodes] = useState<WalletWithCode[]>(
    []
  );

  const loadWallets = useCallback(
    async (managerToUse?: AccountManager | null) => {
      try {
        const balances = managerToUse
          ? await managerToUse.getCanteenBalances()
          : await getBalancesFromCache();

        const enriched = await Promise.all(
          balances.map(async wallet => {
            const serviceId =
              account?.services.find(
                service => service.id === wallet.createdByAccount
              )?.serviceId ?? Services.TURBOSELF;
            let qrData: string | null = null;
            if (managerToUse) {
              try {
                const qrResponse = await managerToUse.getCanteenQRCodes(
                  wallet.createdByAccount
                );
                qrData = qrResponse?.data ?? null;
              } catch {
                qrData = null;
              }
            }
            return {
              wallet,
              serviceId,
              qrData,
            };
          })
        );
        setWalletsWithCodes(enriched);
      } catch (e) {
        warn(`Wear OS wallet sync failed: ${String(e)}`);
      }
    },
    [account?.services]
  );

  useManagerSubscription(loadWallets);

  useEffect(() => {
    loadWallets(getManager(true));
  }, [loadWallets]);

  const courses = useMemo(
    () => upcomingDays.slice(0, 2).flatMap(day => day.courses),
    [upcomingDays]
  );

  const homeworks = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return Object.values(homeworksByWeek)
      .flat()
      .filter(hw => hw.dueDate.getTime() >= startOfToday.getTime());
  }, [homeworksByWeek]);

  const accountName = useMemo(() => {
    if (!account) {
      return "Papillon";
    }
    const full = `${account.firstName ?? ""} ${account.lastName ?? ""}`.trim();
    return full || "Papillon";
  }, [account]);

  const buildCurrentPayload = useCallback(
    () =>
      buildWearSyncPayload({
        accountName,
        className: account?.className ?? null,
        schoolName: account?.schoolName ?? null,
        colorSelected,
        courses,
        periodName: currentPeriod?.name ?? "Période actuelle",
        subjects,
        studentOverall: averages.student,
        classOverall: averages.class,
        scale: gradesDisplayScale,
        homeworks,
        wallets: walletsWithCodes,
      }),
    [
      account?.className,
      account?.schoolName,
      accountName,
      averages.class,
      averages.student,
      colorSelected,
      courses,
      currentPeriod?.name,
      gradesDisplayScale,
      homeworks,
      subjects,
      walletsWithCodes,
    ]
  );

  const pushToWatch = useCallback(async (): Promise<boolean> => {
    if (!wearOsEnabled) {
      return false;
    }
    try {
      const payload = buildCurrentPayload();
      return await syncWatchData(payload);
    } catch (e) {
      warn(`Wear OS sync failed: ${String(e)}`);
      return false;
    }
  }, [buildCurrentPayload, wearOsEnabled]);

  const pushRef = useRef(pushToWatch);
  pushRef.current = pushToWatch;

  useEffect(() => {
    manualSyncCallback = () => pushRef.current();
    return () => {
      manualSyncCallback = null;
    };
  }, []);

  useEffect(() => {
    if (loadingTimetable || !wearOsEnabled) {
      return;
    }
    pushToWatch();
  }, [loadingTimetable, pushToWatch, wearOsEnabled]);

  useEffect(() => {
    const syncSub = addWatchSyncRequestListener(() => {
      pushRef.current();
    });

    const toggleSub = addWatchToggleHomeworkListener(
      async ({ homeworkId, isDone }) => {
        try {
          const item = await getHomeworkById(homeworkId);
          if (item && !item.custom) {
            const manager = getManager(true);
            await manager?.setHomeworkCompletion(item, isDone);
          }
          await updateHomeworkIsDone(homeworkId, isDone);
          setHomeworkRefresh(prev => prev + 1);
        } catch (e) {
          warn(`Failed to toggle homework from Wear OS: ${String(e)}`);
        }
      }
    );

    return () => {
      syncSub.remove();
      toggleSub.remove();
    };
  }, []);
};

export const useWearSync = wearIsSupported ? useSync : () => {};
