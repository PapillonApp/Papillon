import { router } from 'expo-router';
import { t } from 'i18next';
import { instance } from 'pawnote';
import { useCallback, useEffect } from 'react';

import { getWeekNumberFromDate } from '@/database/useHomework';
import { AuthenticationError } from '@/services/errors/AuthenticationError';
import { ServiceUnavailableError } from '@/services/errors/ServiceUnavailableError';
import { getManager, initializeAccountManager } from "@/services/shared";
import { Services } from '@/stores/account/types';
import { useSettingsStore } from '@/stores/settings';
import { useAlert } from '@/ui/components/AlertProvider';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { log, warn } from '@/utils/logger/logger';
import { getServiceName } from '@/utils/services/helper';
import { useAccountStore } from '@/stores/account';

const REMOVED_SERVICE_ID = 9;

const HOME_SYNC_TTL_MS = 5 * 60 * 1000;
const homeSyncState = new Map<
  string,
  { lastSyncedAt: number; inFlight: Promise<void> | null }
>();

export const useHomeData = () => {
  const alert = useAlert();
  const settingsstore = useSettingsStore(state => state.personalization);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const accounts = useAccountStore(state => state.accounts);
  const removeAccount = useAccountStore(state => state.removeAccount);

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
      return;
    }

    const currentAccount = accounts.find(acc => acc.id === lastUsedAccount);
    const usesRemovedService = currentAccount?.services.some(
      service => (service.serviceId as number) === REMOVED_SERVICE_ID
    );
    if (currentAccount && usesRemovedService) {
      warn(`Account ${currentAccount.id} uses a removed service, disconnecting.`);

      alert.showAlert({
        title: t("SERVICE_REMOVED_TITLE"),
        description: t("SERVICE_REMOVED_DESCRIPTION"),
        icon: "Trash",
        color: "#D60046",
        delay: 8000,
      });

      const remainingAccounts = accounts.filter(acc => acc.id !== currentAccount.id);
      if (!(await removeAccount(currentAccount))) return;

      if (remainingAccounts.length === 0) {
        router.replace("/(onboarding)/welcome");
      }

      return;
    }

    const state =
      homeSyncState.get(lastUsedAccount) ?? {
        lastSyncedAt: 0,
        inFlight: null,
      };
    homeSyncState.set(lastUsedAccount, state);

    if (state.inFlight) {
      await state.inFlight;
      return;
    }

    if (Date.now() - state.lastSyncedAt < HOME_SYNC_TTL_MS) {
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
        const isMyCpe = error.service.serviceId === Services.MYCPE;
        const canReconnect = Boolean(instanceURL) || isMyCpe;

        alert.showAlert({
          title: t("HOME_SESSION_EXPIRED_TITLE"),
          message: canReconnect
            ? t("HOME_SESSION_EXPIRED_MORE_AND_RECONNECT")
            : t("HOME_SESSION_EXPIRED_MORE"),
          description: isMyCpe
            ? t("HOME_SESSION_EXPIRED_MYCPE_DESCRIPTION")
            : t("HOME_SESSION_EXPIRED_DESCRIPTION"),
          icon: "UserCross",
          color: "#D60046",
          customButton: canReconnect ? {
            label: t("HOME_SESSION_EXPIRED_RECONNECT"),
            showCancelButton: error.service.serviceId === Services.PRONOTE,
            onPress: async () => {
              const ownerAccount = accounts.find(acc =>
                acc.services.some(s => s.id === error.service.id)
              );

              if (isMyCpe && ownerAccount) {
                const username = error.service.auth.additionals?.["username"];
                router.navigate({
                  pathname: "/(onboarding)/services/mycpe/credentials",
                  params: {
                    accountId: ownerAccount.id,
                    serviceId: error.service.id,
                    username: typeof username === "string" ? username : undefined,
                  },
                });
                return;
              }

              if (ownerAccount) {
                if (!(await removeAccount(ownerAccount))) return;
              }

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
      } else if (error instanceof ServiceUnavailableError) {
        const serviceName = getServiceName(error.service.serviceId);
        alert.showAlert({
          title: t("HOME_SERVICE_UNAVAILABLE_TITLE", { service: serviceName }),
          description: t("HOME_SERVICE_UNAVAILABLE_DESCRIPTION", { service: serviceName }),
          icon: "WifiOff",
          color: "#FF8C00",
          withoutNavbar: true,
        });
      }
    }
    })();

    try {
      await state.inFlight;
    } finally {
      state.inFlight = null;
    }
  }, [alert, fetchEDT, fetchGrades, settingsstore.showAlertAtLogin, lastUsedAccount, accounts, removeAccount]);

  useEffect(() => {
    initialize();
  }, [initialize]);
};
