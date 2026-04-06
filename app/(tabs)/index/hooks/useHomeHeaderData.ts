import { useState, useEffect, useMemo, useRef } from 'react';
import { getChatsFromCache } from '@/database/useChat';
import { AccountManager, getManager, subscribeManagerUpdate } from '@/services/shared';
import { Attendance } from '@/services/shared/attendance';
import { Chat } from '@/services/shared/chat';
import { Period } from '@/services/shared/grade';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';

export interface HomeHeaderData {
  availableCanteenCards: NonNullable<ReturnType<typeof useAccountStore.getState>["accounts"][number]>["services"];
  attendancesPeriods: Period[];
  attendances: Attendance[];
  absencesCount: number;
  chats: Chat[];
  loadingAttendance: boolean;
}

export const useHomeHeaderData = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);

  const availableCanteenCards = useMemo(
    () =>
      account?.services.filter(service =>
        [
          Services.TURBOSELF,
          Services.ALISE,
          Services.ARD,
          Services.ECOLEDIRECTE,
          Services.IZLY,
        ].includes(service.serviceId)
      ) ?? [],
    [account]
  );

  const attendancesPeriodsRef = useRef<Period[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  const absencesCount = useMemo(() => {
    if (!attendances) return 0;
    let count = 0;
    attendances.forEach(att => {
      if(att && "absences" in att) {
        if (att.absences) count += att.absences.length;
      }
    });
    return count;
  }, [attendances]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const cachedChats = await getChatsFromCache();
      if (!isMounted) {
        return;
      }

      setChats(cachedChats ?? []);
    };

    init();

    const updateAttendance = async (manager: AccountManager) => {
      if (isMounted) {
        setLoadingAttendance(true);
      }

      try {
        const periods = await manager.getAttendancePeriods();
        const currentPeriod = getCurrentPeriod(periods);
        const fetchedAttendances = currentPeriod
          ? await manager.getAttendanceForPeriod(currentPeriod.name)
          : [];

        if (!isMounted) {
          return;
        }

        attendancesPeriodsRef.current = periods;
        setAttendances(fetchedAttendances);
      } finally {
        if (isMounted) {
          setLoadingAttendance(false);
        }
      }
    };

    const updateDiscussions = async (manager: AccountManager) => {
      try {
        const fetchedChats = await manager.getChats();
        if (!isMounted) {
          return;
        }

        setChats(fetchedChats);
      } catch {
        if (isMounted) {
          setChats([]);
        }
      }
    };

    const unsubscribe = subscribeManagerUpdate((_) => {
      const manager = getManager();
      void updateAttendance(manager);
      void updateDiscussions(manager);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    availableCanteenCards,
    attendancesPeriods: attendancesPeriodsRef.current,
    attendances,
    absencesCount,
    chats,
    loadingAttendance,
  };
};
