import { router } from 'expo-router';
import { t } from 'i18next';
import { instance } from "@blockshub/pawnote-lts";
import { useCallback, useEffect } from 'react';

import { getWeekNumberFromDate } from '@/database/useHomework';
import { AuthenticationError } from '@/services/errors/AuthenticationError';
import { SecurityChallengeError } from '@/services/errors/SecurityChallengeError';
import { ServiceUnavailableError } from '@/services/errors/ServiceUnavailableError';
import { getManager, initializeAccountManager } from "@/services/shared";
import { Services } from '@/stores/account/types';
import { useSettingsStore } from '@/stores/settings';
import { useAlert } from '@/ui/components/AlertProvider';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { debug, warn } from '@/utils/logger/logger';
import { setPendingPronoteChallenge } from '@/utils/pronote/challenge';
import { useAccountStore } from '@/stores/account';

const REMOVED_SERVICE_ID = 9;

const HOME_SYNC_TTL_MS = 5 * 60 * 1000;
const lastHomeSync = new Map<string, number>();

export const useHomeData = () => {
  const alert = useAlert();
  const settingsstore = useSettingsStore(state => state.personalization);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
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

    const accounts = useAccountStore.getState().accounts;
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
      removeAccount(currentAccount);

      if (remainingAccounts.length === 0) {
        router.replace("/(onboarding)/welcome");
      }

      return;
    }

    if (Date.now() - (lastHomeSync.get(lastUsedAccount) ?? 0) < HOME_SYNC_TTL_MS) {
      return;
    }

    try {
      await initializeAccountManager(lastUsedAccount);
      debug("Refreshed Manager received");

      await Promise.all([fetchEDT(), fetchGrades()]);
      lastHomeSync.set(lastUsedAccount, Date.now());

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

      if (error instanceof SecurityChallengeError) {
        const handle = error.securityError.handle;

        if (!handle.shouldCustomPassword && !handle.shouldCustomDoubleAuth) {
          const ownerAccount = useAccountStore.getState().accounts.find(acc =>
            acc.services.some(s => s.id === error.service?.id)
          );

          setPendingPronoteChallenge({
            session: error.session,
            error: error.securityError,
            deviceUUID: error.deviceUUID,
            relinkAccountId: ownerAccount?.id,
            relinkServiceId: error.service?.id,
          });

          return router.navigate("/(onboarding)/services/pronote/challenge");
        }

        const instanceURL = error.service?.auth?.additionals?.["instanceURL"] ?? "";
        const ownerAccount = useAccountStore.getState().accounts.find(acc =>
          acc.services.some(s => s.id === error.service?.id)
        );

        return alert.showAlert({
          title: "Vérification de sécurité requise",
          description: "Pronote demande de reconfigurer la sécurité de ton compte. Reconnecte-toi pour continuer.",
          icon: "UserCross",
          color: "#D60046",
          customButton: instanceURL ? {
            label: "Me reconnecter",
            showCancelButton: true,
            onPress: () => {
              router.navigate({
                pathname: "/(onboarding)/services/pronote/browser",
                params: {
                  url: instanceURL,
                  school: "N/A",
                  relinkAccountId: ownerAccount?.id,
                  relinkServiceId: error.service?.id,
                  relinkDeviceUUID: error.deviceUUID,
                }
              });
            }
          } : undefined,
          technical: error.message
        });
      }

      if (error instanceof AuthenticationError) {
        const instanceURL = error?.service?.auth?.additionals?.["instanceURL"] ?? "";

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
              const ownerAccount = useAccountStore.getState().accounts.find(acc =>
                acc.services.some(s => s.id === error.service.id)
              );

              const authUrl = instanceURL;
              const relinkParams = {
                url: authUrl,
                relinkAccountId: ownerAccount?.id,
                relinkServiceId: error.service.id,
                relinkDeviceUUID: String(error.service.auth?.additionals?.["deviceUUID"] ?? ""),
              };

              const instanceInfo = await instance(authUrl as string).catch(() => null);

              return setTimeout(() => {
                router.navigate({
                  pathname: "/(onboarding)/services/pronote/browser",
                  params: { ...relinkParams, school: instanceInfo?.name ?? "N/A" }
                })
              }, 200)
            }
          } : undefined,
          technical: error.message
        })
      } else if (error instanceof ServiceUnavailableError) {
        alert.showAlert({
          title: t("home.unavailable.title", "Pronote temporairement indisponible"),
          description: t("home.unavailable.description", "Impossible de contacter Pronote pour le moment. Les données affichées correspondent à la dernière synchronisation."),
          icon: "GlobeCross",
          color: "#FF8C00",
          withoutNavbar: true,
        });
      }
    }
  }, [alert, fetchEDT, fetchGrades, settingsstore.showAlertAtLogin, lastUsedAccount, removeAccount]);

  useEffect(() => {
    initialize();
  }, [initialize]);
};
