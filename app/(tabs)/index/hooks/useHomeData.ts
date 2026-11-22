import { router } from 'expo-router';
import { t } from 'i18next';
import { instance } from "@blockshub/pawnote-lts";
import { useCallback, useEffect, useState } from 'react';

import { getWeekNumberFromDate } from '@/database/useHomework';
import { AuthFailureReason } from '@/services/auth/types';
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
import { getServiceName } from '@/utils/services/helper';

const REMOVED_SERVICE_ID = 9;

const HOME_SYNC_TTL_MS = 5 * 60 * 1000;
const lastHomeSync = new Map<string, number>();

const DISCONNECTED_DESCRIPTIONS: Partial<Record<AuthFailureReason, string>> = {
  credential_lost: "Home_Sync_Disconnected_CredentialLost",
  account_disabled: "Home_Sync_Disconnected_AccountDisabled",
  security_challenge: "Home_Sync_Disconnected_SecurityChallenge",
};

export const useHomeData = () => {
  const alert = useAlert();
  const settingsstore = useSettingsStore(state => state.personalization);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const removeAccount = useAccountStore(state => state.removeAccount);
  const [syncing, setSyncing] = useState(false);

  const fetchEDT = useCallback(async () => {
    const manager = getManager();
    if (!manager) {
      warn('Manager is null, skipping timetable fetch');
      return;
    }
    const date = new Date();
    await manager.getWeeklyTimetable(getWeekNumberFromDate(date), date);
    // Next week too, so upcoming courses (e.g. Monday's, seen on a Friday) are
    // already cached on the next launch. Sequential: Pronote numbers its requests.
    const nextWeek = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    await manager.getWeeklyTimetable(getWeekNumberFromDate(nextWeek), nextWeek);
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

  const initialize = useCallback(async (force = false) => {
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

    if (!force && Date.now() - (lastHomeSync.get(lastUsedAccount) ?? 0) < HOME_SYNC_TTL_MS) {
      return;
    }

    setSyncing(true);
    try {
      await initializeAccountManager(lastUsedAccount, { force });
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
          title: t("Home_Sync_Disconnected_Title"),
          message: t(instanceURL ? "Home_Sync_LearnMoreRelink" : "Home_Sync_LearnMore"),
          description: t(DISCONNECTED_DESCRIPTIONS[error.reason] ?? "Home_Sync_Disconnected_Expired"),
          icon: "UserCross",
          color: "#D60046",
          customButton: instanceURL ? {
            label: t("Home_Sync_Relink"),
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
        const suspended = error.reason === "suspended";
        const service = getServiceName(error.service.serviceId);
        alert.showAlert({
          title: t(suspended ? "Home_Sync_Suspended_Title" : "Home_Sync_Unavailable_Title", { service }),
          description: t(suspended ? "Home_Sync_Suspended_Description" : "Home_Sync_Unavailable_Description", { service }),
          icon: "GlobeCross",
          color: "#FF8C00",
          withoutNavbar: true,
        });
      } else if (!(error instanceof SecurityChallengeError)) {
        // Anything left is unexpected. Saying so beats a home screen that
        // silently keeps showing the last synchronisation.
        warn(String(error), "useHomeData");
        alert.showAlert({
          title: "Synchronisation impossible",
          description: "Nous n'avons pas réussi à mettre à jour tes données. Vérifie ta connexion, puis tire la page vers le bas pour réessayer.",
          icon: "GlobeCross",
          color: "#D60046",
          withoutNavbar: true,
          technical: String(error),
        });
      }
    } finally {
      setSyncing(false);
    }
  }, [alert, fetchEDT, fetchGrades, settingsstore.showAlertAtLogin, lastUsedAccount, removeAccount]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const refresh = useCallback(() => initialize(true), [initialize]);

  return { syncing, refresh };
};
