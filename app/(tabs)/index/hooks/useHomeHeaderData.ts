import { useState, useEffect, useMemo, useRef } from 'react';
import { AccountManager, getManager, subscribeManagerUpdate } from '@/services/shared';
import { Attendance } from '@/services/shared/attendance';
import { Period } from '@/services/shared/grade';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';
import { useNews } from '@/database/useNews';
import { useSettingsStore } from '@/stores/settings';
import { showSystemNotification } from '@/utils/notifications';

const EMPTY_NOTIFICATION_IDS: string[] = [];

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
  const news = useNews();
  const notificationPreferences = useSettingsStore(state => state.personalization.notificationPreferences);
  const seenNewsIds = useSettingsStore(state => state.personalization.notificationSeenNewsIds ?? EMPTY_NOTIFICATION_IDS);
  const mutateSettings = useSettingsStore(state => state.mutateProperty);

  useEffect(() => {
    if (news.length === 0) return;
    const ids = news.map(item => item.id);
    if (seenNewsIds.length === 0) {
      mutateSettings('personalization', { notificationSeenNewsIds: ids.slice(-500) });
      return;
    }
    const known = new Set(seenNewsIds);
    const unseen = news.filter(item => !known.has(item.id));
    if (notificationPreferences?.enabled && notificationPreferences.news) {
      for (const item of unseen.slice(-3)) {
        void showSystemNotification('news', {
          id: `news-${item.id}`,
          title: item.title || 'Nouvelle actualité',
          body: item.author ? `Par ${item.author}` : 'Une nouvelle actualité est disponible.',
        });
      }
    }
    if (unseen.length > 0) {
      mutateSettings('personalization', { notificationSeenNewsIds: [...seenNewsIds, ...unseen.map(item => item.id)].slice(-500) });
    }
  }, [news, seenNewsIds, notificationPreferences?.enabled, notificationPreferences?.news, mutateSettings]);

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
