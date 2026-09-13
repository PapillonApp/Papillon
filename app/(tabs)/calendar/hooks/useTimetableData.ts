import { useCallback, useEffect, useMemo,useRef, useState } from 'react';
import { Platform } from 'react-native';

import { useTimetable } from '@/database/useTimetable';
import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { useAccountStore } from '@/stores/account';
import { useSettingsStore } from '@/stores/settings';
import { useSyncStore } from '@/stores/sync';
import { useAlert } from '@/ui/components/AlertProvider';
import { log, warn } from "@/utils/logger/logger";

export function useTimetableData(weekNumber: number, currentDate: Date = new Date()) {
  const safeDateMs = currentDate?.getTime() ?? Date.now();
  const safeDate = useMemo(() => new Date(safeDateMs), [safeDateMs]);
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [fetchedWeeks, setFetchedWeeks] = useState<string[]>([]);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchedWeeksRef = useRef<string[]>([]);
  const fetchIdRef = useRef(0);

  const storeAccounts = useAccountStore(s => s.accounts);
  const lastUsedAccount = useAccountStore(s => s.lastUsedAccount);
  const account = storeAccounts.find(a => a.id === lastUsedAccount);
  const servicesKey = (account?.services?.map((service: { id: string }) => service.id) ?? []).join(',');
  const services: string[] = useMemo(() => (servicesKey ? servicesKey.split(',') : []), [servicesKey]);
  
  const rawTimetable = useTimetable(refresh, [weekNumber - 1, weekNumber, weekNumber + 1], safeDate);
  
  const selectedChild = account?.selectedChild;
  const accountIds = useMemo(() => new Set((storeAccounts ?? []).map((a: any) => a.id)), [storeAccounts]);
  const timetable = useMemo(() => {
    const hasSelectedKid =
      !!selectedChild &&
      rawTimetable.some(d => (d.courses ?? []).some(c => (c as any)?.kidName === selectedChild));
    const seen = new Set<string>();
    return rawTimetable.map(day => ({
      ...day,
      courses: day.courses.filter(course => {
        if (!course) return false;
        const owner = course.createdByAccount ?? "";
        const allowed =
          services.includes(owner) ||
          accountIds.has(owner) ||
          owner.startsWith('ical_') ||
          owner === 'android_calendar' ||
          owner.startsWith('calendar_');
        if (!allowed) return false;
        // Miroir Aether : jamais affiché (marqueur "Aether ·" posé dans notes).
        // Couvre android_calendar ET calendar_* (même créneau, vrai matière/salle).
        const mirrorMark = `${String((course as any)?.subject ?? "")} ${(course as any)?.teacher ?? ""} ${(course as any)?.room ?? ""}`;
        if ((owner === 'android_calendar' || owner.startsWith('calendar_')) && mirrorMark.includes("Aether")) {
          return false;
        }
        // Parent : ne filtrer que si l'enfant sélectionné existe dans les données.
        if (hasSelectedKid) {
          const kid = (course as any)?.kidName;
          if (typeof kid === "string" && kid.length > 0 && kid !== selectedChild) {
            return false;
          }
        }
        // Clé SANS owner (+teacher) : EDT + miroir résiduel fusionnent.
        const courseKid = (course as any)?.kidName ?? "";
        const key = `${courseKid}::${course.from?.getTime?.() ?? course.from}::${course.to?.getTime?.() ?? course.to}::${course.subject}::${course.room}::${course.teacher ?? ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
    })).filter(day => day.courses.length > 0);
  }, [rawTimetable, servicesKey, selectedChild, accountIds]);

  const fetchWeeklyTimetable = useCallback(async (targetWeekNumber: number, forceRefresh = false) => {
    const myId = ++fetchIdRef.current;
    setIsLoading(true);
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      if (fetchIdRef.current !== myId) return;
      if (forceRefresh) {
        setManualRefreshing(true);
      }
      try {
        let manager: ReturnType<typeof getManager> | null;
        try {
          manager = getManager();
        } catch {
          warn('Manager not initialized, iCal events will still work');
          manager = null;
        }
        if (!manager) {
          warn('Manager is null, skipping timetable fetch');
          return;
        }

        const baseDate = new Date(safeDateMs);
        const { getISOWeekYear } = await import("@/utils/services/periods");
        const candidates = [targetWeekNumber - 1, targetWeekNumber, targetWeekNumber + 1]
          .map(week => {
            const targetDate = new Date(baseDate);
            targetDate.setDate(targetDate.getDate() + (week - targetWeekNumber) * 7);
            // Clé ISO de la date cible (pas du numéro arithmétique) :
            // semaine 0/54 -> année voisine, jamais filtrée (sinon préfetch
            // manquant aux frontières d'année -> EDT vide en swipe).
            let key: string;
            try {
              const iso = getISOWeekYear(targetDate);
              key = `${iso.year}-${iso.week}`;
            } catch {
              const year = targetDate.getFullYear();
              key = `${year}-${week}`;
            }
            return { week, targetDate, key };
          });

        // forceRefresh (pull-to-refresh) doit réellement refetcher, pas être
        // filtré par fetchedWeeksRef (sinon refresh = no-op -> EDT vide figé).
        const toFetch = forceRefresh
          ? candidates
          : candidates.filter(c => !fetchedWeeksRef.current.includes(c.key));

        if (toFetch.length > 0) {
          if (fetchIdRef.current !== myId) return;
          // Séquentiel (pas de Promise.all) : évite les writes concurrents
          // qui se ressuscitent mutuellement dans addCourseDayToDatabase.
          // Enfant snapshoté avant la boucle : pas de mélange si switch entre 2 semaines.
          const fetchKid = selectedChild;
          const succeededKeys: string[] = [];
          for (const c of toFetch) {
            if (fetchIdRef.current !== myId) return;
            try {
              const days = await (manager as NonNullable<typeof manager>).getWeeklyTimetable(c.week, c.targetDate, fetchKid);
              // Ne marque comme fetchée que si le réseau a répondu (même vide
              // légitime : ex. vacances). En cas d'exception, on laisse la clé
              // hors du cache pour permettre un retry au prochain swipe/refresh.
              // getWeeklyTimetable a un fallback cache : un retour tableau
              // (même vide) = pas d'exception -> on marque.
              if (Array.isArray(days)) succeededKeys.push(c.key);
            } catch {
              // Échec réseau/auth : pas de marquage -> retry possible.
              continue;
            }
          }

          if (fetchIdRef.current !== myId) return;
          if (succeededKeys.length > 0) {
            const merged = Array.from(new Set([...fetchedWeeksRef.current, ...succeededKeys]));
            fetchedWeeksRef.current = merged;
            setFetchedWeeks(merged);
          }
          setRefresh(prev => prev + 1);
        }
      } catch (error) {
        if (fetchIdRef.current !== myId) return;
        log('Error fetching weekly timetable: ' + error);
      } finally {
        if (fetchIdRef.current !== myId) return;
        setIsLoading(false);
        setManualRefreshing(false);
        fetchTimeoutRef.current = null;
      }
    }, 100);
  }, [safeDateMs, selectedChild]);

  useEffect(() => {
    fetchWeeklyTimetable(weekNumber);
  }, [weekNumber, fetchWeeklyTimetable]);

  // Switch compte/enfant : oublie les semaines déjà fetchées (clés sans
  // compte) et refetch — sinon toFetch vide et DB mélangée.
  const accountEpochCal = useSyncStore(s => s.accountEpoch);
  const epochRefCal = useRef(accountEpochCal);
  useEffect(() => {
    if (accountEpochCal === epochRefCal.current) return;
    epochRefCal.current = accountEpochCal;
    fetchedWeeksRef.current = [];
    setFetchedWeeks([]);
    setRefresh(prev => prev + 1);
    fetchWeeklyTimetable(weekNumber, true);
  }, [accountEpochCal, weekNumber, fetchWeeklyTimetable]);

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      if (updatedManager) {
        fetchWeeklyTimetable(weekNumber);
      }
    });
    return () => unsubscribe();
  }, [weekNumber, fetchWeeklyTimetable]);

  useEffect(() => {
    return () => {
      fetchIdRef.current += 1;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, []);

  const handleRefresh = useCallback(() => {
    setRefresh(prev => prev + 1);
    fetchWeeklyTimetable(weekNumber, true);
  }, [weekNumber, fetchWeeklyTimetable]);

  // Miroir auto vers le calendrier appareil "Aether" (7 j, futurs uniquement).
  // Déclenché quand l'EDT change et que l'export est activé.
  const syncEnabled = useSettingsStore(s => s.personalization.androidCalendarSyncEnabled ?? false);
  const { showAlert } = useAlert();
  useEffect(() => {
    if (!syncEnabled) return;
    if (Platform.OS !== 'android') return;
    const allCourses = timetable.flatMap(d => d.courses ?? []);
    if (allCourses.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const m = await import("@/services/local/android-calendar-sync");
        if (cancelled) return;
        await m.syncCoursesToDeviceCalendar(allCourses);
      } catch (e) {
        if (cancelled) return;
        warn('Auto device calendar sync failed: ' + String(e));
        try {
          showAlert({
            title: "Échec de l'export calendrier",
            message: e instanceof Error ? e.message : "Impossible d'écrire tes cours dans le calendrier « Aether ».",
            icon: "Calendar",
          });
        } catch {
          // best-effort
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [timetable, syncEnabled, showAlert]);

  return {
    timetable,
    refresh,
    manualRefreshing,
    handleRefresh,
    isLoading
  };
}
