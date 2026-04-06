import { router } from 'expo-router';
import { instance } from 'pawnote';
import { useCallback, useEffect } from 'react';

import { getWeekNumberFromDate } from '@/database/useHomework';
import { AuthenticationError } from '@/services/errors/AuthenticationError';
import { getManager, initializeAccountManager } from "@/services/shared";
import { Services } from '@/stores/account/types';
import { useSettingsStore } from '@/stores/settings';
import { useAlert } from '@/ui/components/AlertProvider';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { log, warn } from '@/utils/logger/logger';
import { useAccountStore } from '@/stores/account';
import { useState } from 'react';

const HOME_SYNC_TTL_MS = 5 * 60 * 1000;
const homeSyncState = new Map<
  string,
  { lastSyncedAt: number; inFlight: Promise<void> | null }
>();

export const useHomeData = () => {
  const alert = useAlert();
  const settingsstore = useSettingsStore(state => state.personalization);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEDT = useCallback(async () => {
    const manager = getManager();
    const date = new Date();
    const weekNumber = getWeekNumberFromDate(date);
    await manager.getWeeklyTimetable(weekNumber, date);
  }, []);

  const fetchGrades = useCallback(async () => {
    const manager = getManager();
    if (!manager) {
      warn('Manager is null, skipping grades fetch');
      return;
    }
    const gradePeriods = await manager.getGradesPeriods();
    const currentPeriod = getCurrentPeriod(gradePeriods);

    if (currentPeriod) {
      await manager.getGradesForPeriod(currentPeriod, currentPeriod.createdByAccount);
    }
  }, []);

  const initialize = useCallback(async () => {
    if (!lastUsedAccount) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const state =
      homeSyncState.get(lastUsedAccount) ?? {
        lastSyncedAt: 0,
        inFlight: null,
      };
    homeSyncState.set(lastUsedAccount, state);

    if (state.inFlight) {
      try {
        await state.inFlight;
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (Date.now() - state.lastSyncedAt < HOME_SYNC_TTL_MS) {
      setIsLoading(false);
      return;
    }

    state.inFlight = (async () => {
    try {
      await initializeAccountManager(lastUsedAccount);
      log("Refreshed Manager received");

      await Promise.all([fetchEDT(), fetchGrades()]);
      state.lastSyncedAt = Date.now();

      if (settingsstore.showAlertAtLogin) {
        alert.showAlert({
          title: "Synchronisation réussie",
          description: "Toutes vos données ont été mises à jour avec succès.",
          icon: "CheckCircle",
          color: "#00C851",
          withoutNavbar: true,
          delay: 1000
        });
      }

    } catch (error) {
      if (String(error).includes("Unable to find")) { return; }
      if (error instanceof AuthenticationError) {
        const instanceURL = error?.service?.auth?.additionals?.["instanceURL"] ?? "";
        const serviceId = error?.service?.id ?? undefined;

        alert.showAlert({
          title: "Vous avez été déconnecté",
          message: instanceURL ? `En savoir plus et se reconnecter` : "En savoir plus",
          description: "Il semblerait que ta session a expiré. Tu pourras renouveler ta session dans les paramètres en liant à nouveau ton compte.",
          icon: "UserCross",
          color: "#D60046",
          customButton: instanceURL ? {
            label: "Me reconnecter",
            showCancelButton: error.service.serviceId === Services.PRONOTE,
            onPress: async () => {
              const authUrl = instanceURL;
              const instanceInfo = await instance(authUrl as string);

              if (instanceInfo && instanceInfo.name) {
                return setTimeout(() => {
                  router.navigate("/(onboarding)/ageSelection");
                  setTimeout(() => {
                  router.navigate({ pathname: "/(onboarding)/services/pronote/browser", params: { url: authUrl, school: instanceInfo.name } })
                }, 400)
                }, 100)
              }

              setTimeout(() => {
                router.navigate({ pathname: "/(onboarding)/services/pronote/browser", params: { url: authUrl, school: "N/A" } })
              }, 200)
            }
          } : undefined,
          technical: error.message
        })
      }
    }
    })();

    try {
      await state.inFlight;
    } finally {
      state.inFlight = null;
      setIsLoading(false);
    }
  }, [alert, fetchEDT, fetchGrades, settingsstore.showAlertAtLogin, lastUsedAccount]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return {
    isLoading,
  };
};
