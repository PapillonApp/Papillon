import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { t } from 'i18next';
import { useAccountStore } from "@/stores/account";
import { useSyncStore } from "@/stores/sync";
import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { Homework } from "@/services/shared/homework";
import { useHomeworkForWeek, updateHomeworkIsDone, getHomeworkRouteId } from "@/database/useHomework";
import { generateId } from "@/utils/generateId";
import { error } from '@/utils/logger/logger';
import { notificationAsync, NotificationFeedbackType } from "expo-haptics";

export const useHomeworkData = (selectedWeek: number, alert: any) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [homework, setHomework] = useState<Record<string, Homework>>({});

  const hwAccounts = useAccountStore(s => s.accounts);
  const hwLastUsed = useAccountStore(s => s.lastUsedAccount);
  const hwEpoch = useSyncStore(s => s.accountEpoch);
  const account = hwAccounts.find(acc => acc.id === hwLastUsed);
  type Service = { id: string };
  const services = useMemo(() => account?.services?.map((s: Service) => s.id) ?? [], [account]);
  const selectedKid = account?.selectedChild;
  const serviceAccountIds = useMemo(
    () => new Set([...services, ...hwAccounts.map(a => a.id)]),
    [services, hwAccounts]
  );
  const manager = getManager();

  const homeworksFromCache = useHomeworkForWeek(selectedWeek, refreshTrigger, {
    createdByAccount: undefined,
    kidName: selectedKid,
  }).filter(h => {
    if (!serviceAccountIds.has(h.createdByAccount)) return false;
    // Filtre enfant gardé : seulement si le kid demandé existe dans les lignes.
    return true;
  });
  const visibleHomeworksFromCache = useMemo(() => {
    if (!selectedKid) return homeworksFromCache;
    const hasKid = homeworksFromCache.some(h => (h as { kidName?: unknown }).kidName === selectedKid);
    if (!hasKid) return homeworksFromCache;
    return homeworksFromCache.filter(h => {
      const kid = (h as { kidName?: unknown }).kidName;
      return typeof kid !== "string" || kid.length === 0 || kid === selectedKid;
    });
  }, [homeworksFromCache, selectedKid]);

  const fetchHomeworks = useCallback(
    async (managerToUse = manager) => {
      if (!managerToUse) { return; }
      try {
        const result: Homework[] = await managerToUse.getHomeworks(selectedWeek);
        result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const newHomeworks: Record<string, Homework> = {};
        for (const hw of result) {
          // Clé scopée enfant (même fonction que cache/liste) : sans kidName,
          // les devoirs du parent écrasaient/mismatchaient ceux de l'enfant.
          let id: string;
          try {
            id = getHomeworkRouteId(hw);
          } catch {
            id = generateId(
              hw.subject + hw.content + hw.createdByAccount + hw.dueDate.toDateString()
            );
          }
          newHomeworks[id] = { ...hw, id: hw.id ?? id };
        }
        setHomework(newHomeworks);
        setRefreshTrigger(p => p + 1);
      } catch (e) {
        error("Fetch error", String(e));
      }
    },
    [selectedWeek, manager]
  );

  useEffect(() => {
    fetchHomeworks();
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      fetchHomeworks(updatedManager);
    });
    return () => unsubscribe();
  }, [selectedWeek, fetchHomeworks]);

  // Switch compte/enfant : vide + refetch (pas de devoirs de l'autre enfant).
  const hwEpochRef = React.useRef(hwEpoch);
  useEffect(() => {
    if (hwEpoch === hwEpochRef.current) return;
    hwEpochRef.current = hwEpoch;
    setHomework({});
    setRefreshTrigger(p => p + 1);
    fetchHomeworks(getManager() ?? undefined);
  }, [hwEpoch, fetchHomeworks]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchHomeworks();
    setIsRefreshing(false);
  }, [fetchHomeworks]);

  const setAsDone = useCallback(
    async (item: Homework, done: boolean) => {
      // Id de route scopé par enfant (même fonction que le cache/liste).
      let id: string;
      try {
        id = getHomeworkRouteId(item);
      } catch {
        id = generateId(
          item.subject +
          item.content +
          item.createdByAccount +
          new Date(item.dueDate).toDateString()
        );
      }
      // Vrai id Pronote si connu (sinon le backend cherche ±60j + due_date).
      const serverItem = { ...item, id: item.pronoteId ?? item.id };

      // DB d'abord (await, chemin unique), puis mémoire optimiste.
      try {
        await updateHomeworkIsDone(id, done);
      } catch {
        // best-effort : le rollback ci-dessous couvre l'échec réseau aussi
      }
      setHomework(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] ?? item),
          isDone: done,
        }
      }));
      setRefreshTrigger(prev => prev + 1);

      try {
        const manager = getManager();
        await manager.setHomeworkCompletion(serverItem, done)

        if (done) {
          notificationAsync(NotificationFeedbackType.Success);
          // Tâche terminée → stoppe ses rappels (dont répétés)
          try {
            const { cancelTaskRemindersForHomework } = await import("@/services/local/reminders");
            const { getHomeworkRouteId } = await import("@/database/useHomework");
            const ids = new Set<string>();
            const rawId = (item as { id?: unknown }).id;
            if (rawId !== undefined && rawId !== null) ids.add(String(rawId));
            try {
              ids.add(getHomeworkRouteId(item));
            } catch {
              // ignore route id
            }
            for (const hid of ids) {
              await cancelTaskRemindersForHomework(hid);
            }
          } catch {
            // best-effort
          }
        }
      }
      catch (err) {
        const message = String(err);
        const lowered = message.toLowerCase();
        const outOfRange =
          message.includes("404") ||
          lowered.includes("introuvable");
        // Hors-ligne / timeout : on garde le fait local (offline-first, file
        // d'envoi via AccountManager), pas de rollback — resync au reconnect.
        const offline =
          lowered.includes("network") ||
          lowered.includes("abort") ||
          lowered.includes("timeout") ||
          lowered.includes("fetch") ||
          lowered.includes("offline") ||
          lowered.includes("net::") ||
          message.includes("TypeError");
        if (offline) {
          return;
        }
        alert.showAlert({
            title: t("Task_ToggleFailed_Title"),
            message: outOfRange ? t("Task_OutOfPeriod") : t("Task_ToggleFailed_Description"),
            description:
              outOfRange
                ? t("Task_OutOfPeriod")
                : "Nous n'avons pas réussi à mettre à jour l'état du devoir, si ce devoir est important, merci de te rendre sur l'application officielle de ton établissement afin de définir son état.",
            color: "#D60046",
            icon: "AlertTriangle",
            technical: message
          });

        try {
          await updateHomeworkIsDone(id, !done);
        } catch {
          // best-effort
        }
        setRefreshTrigger(prev => prev + 1);
        setHomework(prev => ({
          ...prev,
          [id]: {
            ...(prev[id] ?? item),
            isDone: !done,
          }
        }));
      }
    },
    []
  );

  return {
    homework,
    homeworksFromCache: visibleHomeworksFromCache,
    isRefreshing,
    handleRefresh,
    setAsDone,
  };
};
