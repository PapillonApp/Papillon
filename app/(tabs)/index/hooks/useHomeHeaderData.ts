import { useEffect, useMemo, useRef, useState } from 'react';

import { useNews } from '@/database/useNews';
import { AccountManager, getManager, subscribeManagerUpdate } from '@/services/shared';
import { Attendance } from '@/services/shared/attendance';
import { Period } from '@/services/shared/grade';
import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { isSelfModuleEnabledED } from '@/utils/services/helper';

export const useHomeHeaderData = () => {
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);

  const availableCanteenCards = useMemo(
    () =>
      account?.services.filter(service => {
        if (service.serviceId === Services.ECOLEDIRECTE) {
          return (
            Array.isArray(service.auth?.additionals?.["modules"]) &&
            isSelfModuleEnabledED(service.auth?.additionals)
          );
        }
        return [
          Services.TURBOSELF,
          Services.ALISE,
          Services.ARD,
          Services.IZLY,
        ].includes(service.serviceId);
      }) ?? [],
    [account]
  );

  const attendancesPeriodsRef = useRef<Period[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const news = useNews();

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
    const updateAttendance = async (manager: AccountManager) => {
      const periods = await manager.getAttendancePeriods();
      attendancesPeriodsRef.current = periods;

      const currentPeriod = getCurrentPeriod(periods);
      if (!currentPeriod) {
        setAttendances([]);
        return;
      }

      const fetchedAttendances = await manager.getAttendanceForPeriod(currentPeriod.name);

      setAttendances(fetchedAttendances);
    };

    const unsubscribe = subscribeManagerUpdate((_) => {
      const manager = getManager();
      updateAttendance(manager);
    });

    return () => unsubscribe();
  }, []);

  return {
    availableCanteenCards,
    attendancesPeriods: attendancesPeriodsRef.current,
    attendances,
    absencesCount,
    news
  };
};
