import { useState, useEffect, useMemo, useRef } from 'react';
import { getChatsFromCache } from '@/database/useChat';
import { AccountManager, getManager, subscribeManagerUpdate } from '@/services/shared';
import { Attendance } from '@/services/shared/attendance';
import { Chat } from '@/services/shared/chat';
import { Period } from '@/services/shared/grade';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';

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
    const init = async () => {
      const cachedChats = await getChatsFromCache();
      setChats(cachedChats);
    };

    init();

    const updateAttendance = async (manager: AccountManager) => {
      const periods = await manager.getAttendancePeriods();
      const currentPeriod = getCurrentPeriod(periods);
      const fetchedAttendances = await manager.getAttendanceForPeriod(currentPeriod.name);

      attendancesPeriodsRef.current = periods;
      setAttendances(fetchedAttendances);
    };

    const updateDiscussions = async (manager: AccountManager) => {
      const fetchedChats = await manager.getChats();
      setChats(fetchedChats);
    };

    const unsubscribe = subscribeManagerUpdate((_) => {
      const manager = getManager();
      updateAttendance(manager);
      updateDiscussions(manager);
    });

    return () => unsubscribe();
  }, []);

  return {
    availableCanteenCards,
    attendancesPeriods: attendancesPeriodsRef.current,
    attendances,
    absencesCount,
    chats
  };
};
