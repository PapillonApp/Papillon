import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAccountStore } from "@/stores/account";
import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { Homework } from "@/services/shared/homework";
import { useHomeworkForWeek, updateHomeworkIsDone, deleteHomeworkFromDatabase, addHomeworkToDatabase } from "@/database/useHomework";
import { generateId } from "@/utils/generateId";
import { error } from '@/utils/logger/logger';
import { notificationAsync, NotificationFeedbackType } from "expo-haptics";
import { create } from 'zustand';

export const useHomeworkData = (selectedWeek: number, alert: any) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [homework, setHomework] = useState<Record<string, Homework>>({});

  const store = useAccountStore.getState();
  const account = store.accounts.find(acc => acc.id === store.lastUsedAccount);
  type Service = { id: string };
  const services = useMemo(() => account?.services?.map((s: Service) => s.id) ?? [], [account]);
  const manager = getManager();

  const homeworksFromCache = useHomeworkForWeek(selectedWeek, refreshTrigger)
    .filter(h => services.includes(h.createdByAccount));

  const fetchHomeworks = useCallback(
    async (managerToUse = manager) => {
      if (!managerToUse) { return; }
      try {
        const result: Homework[] = await managerToUse.getHomeworks(selectedWeek);
        result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const newHomeworks: Record<string, Homework> = {};
        for (const hw of result) {
          const id = generateId(
            hw.subject + hw.content + hw.createdByAccount + hw.dueDate.toDateString()
          );
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchHomeworks();
    setIsRefreshing(false);
  }, [fetchHomeworks]);

  const setAsDone = useCallback(
    async (item: Homework, done: boolean) => {
      const id = generateId(
        item.subject +
        item.content +
        item.createdByAccount +
        new Date(item.dueDate).toDateString()
      );

      try {
        const manager = getManager();
        if (!item.custom) {
          await manager.setHomeworkCompletion(item, done)
        }

        updateHomeworkIsDone(id, done);
        
        setRefreshTrigger(prev => prev + 1);
        setHomework(prev => ({
          ...prev,
          [id]: {
            ...(prev[id] ?? item),
            isDone: done,
          }
        }));
        if (done) {
          notificationAsync(NotificationFeedbackType.Success);
        }
      }
      catch (err) {
        alert.showAlert({
            title: "Une erreur est survenue",
            message: "Ce devoir n'a pas été mis à jour",
            description:
              "Nous n'avons pas réussi à mettre à jour l'état du devoir, si ce devoir est important, merci de vous rendre sur l'application officielle de ton établissement afin de définir son état.",
            color: "#D60046",
            icon: "AlertTriangle",
            technical: String(err)
          });

        updateHomeworkIsDone(id, !done);
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

  const addHomework = useCallback(
    async (item: Homework) => {
      const id = generateId(
        item.subject +
        item.content +
        item.createdByAccount +
        new Date(item.dueDate).toDateString()
      );
      try {
        setHomework(prev => ({
          ...prev,
          [id]: { ...item, id },
        }));

        await addHomeworkToDatabase([item]);

        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        setHomework(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setRefreshTrigger(prev => prev + 1);
      }
    }, [alert]
  );

  const deleteHomework = useCallback(
    async (item: Homework) => {
      const id = generateId(
        item.subject +
        item.content +
        item.createdByAccount +
        new Date(item.dueDate).toDateString()
      );
      try {
        setHomework(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });

        const id = generateId(item.subject + item.content + item.createdByAccount + item.dueDate.toDateString());
        await deleteHomeworkFromDatabase(id);

        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        setHomework(prev => ({ ...prev, [id]: item }));
        setRefreshTrigger(prev => prev + 1);
      }
    },[alert]
  );

  const setOnDelete = useHomeworkActionsStore(s => s.setOnDelete);
  const setOnAdd = useHomeworkActionsStore(s => s.setOnAdd);

  useEffect(() => {
    setOnDelete(deleteHomework);
    setOnAdd(addHomework);
  }, [deleteHomework, addHomework]);

  return {
    homework,
    homeworksFromCache,
    isRefreshing,
    handleRefresh,
    setAsDone,
    deleteHomework
  };
};

interface HomeworkActionsStore {
  onDelete: ((item: Homework) => void) | null;
  onAdd: ((item: Homework) => void) | null;
  setOnDelete: (fn: (item: Homework) => void) => void;
  setOnAdd: (fn: (item: Homework) => void) => void;
}

export const useHomeworkActionsStore = create<HomeworkActionsStore>((set) => ({
  onDelete: null,
  onAdd: null,
  setOnDelete: (fn) => set({ onDelete: fn }),
  setOnAdd: (fn) => set({ onAdd: fn }),
}));