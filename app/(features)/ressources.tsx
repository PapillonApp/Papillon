import { useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import { Papicons } from "@getpapillon/papicons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getDateRangeOfWeek, getHomeworksFromCache, getWeekNumberFromDate } from "@/database/useHomework";
import { getCoursesFromCache } from "@/database/useTimetable";
import { getManager } from "@/services/shared";
import { Course, CourseResource, WeekLessonContent } from "@/services/shared/timetable";
import { matchContentForCourse } from "@/services/pronote/timetable";
import { openAttachment, resolvePronoteFileAuth } from "@/services/pronote/files";
import { getAttachmentIcon } from "@/utils/news/getAttachmentIcon";
import { inferYearForWeek } from "@/utils/services/periods";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { useAlert } from "@/ui/components/AlertProvider";
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import TabHeader from "@/ui/components/TabHeader";
import TabHeaderTitle from "@/ui/components/TabHeaderTitle";
import Typography from "@/ui/components/Typography";
import MainTabErrorBoundary from "@/ui/components/MainTabErrorBoundary";

interface DaySection {
  key: string;
  date: Date;
  lessons: Array<{
    course: Course;
    contents: CourseResource[];
    matched: CourseResource[];
  }>;
  homeworks: Array<{
    subject: string;
    content: string;
    attachments: { name?: string; url?: string; createdByAccount: string }[];
  }>;
}

const fmtDay = (d: Date) => {
  try {
    return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  } catch {
    return "";
  }
};

const fmtTime = (d: Date) => {
  try {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" });
  } catch {
    return "";
  }
};

function RessourcesView() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const alert = useAlert();
  const defaultWeek = useMemo(() => {
    try {
      return getWeekNumberFromDate(new Date());
    } catch {
      return 0;
    }
  }, []);
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<DaySection[]>([]);
  const [totalResources, setTotalResources] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const year = inferYearForWeek(selectedWeek, new Date());
      const { getWeekRangeForWeekNumber } = await import("@/utils/services/periods");
      const range = getWeekRangeForWeekNumber(selectedWeek, new Date());
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(range.start);
        d.setDate(range.start.getDate() + i);
        days.push(d);
      }

      const [cachedDays, homeworks] = await Promise.all([
        getCoursesFromCache([selectedWeek], year).catch(() => []),
        getHomeworksFromCache(selectedWeek).catch(() => []),
      ]);

      let contents: WeekLessonContent[] = [];
      try {
        const manager = getManager();
        if (manager) contents = (await manager.getWeekContents(range.start, range.end)) ?? [];
      } catch {
        contents = [];
      }

      const flatCourses: Course[] = [];
      for (const day of cachedDays ?? []) {
        for (const c of day.courses ?? []) flatCourses.push(c);
      }

      const built: DaySection[] = days.map((date) => {
        const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const dayCourses = flatCourses.filter((c) => {
          try {
            const f = c.from instanceof Date ? c.from : new Date(c.from as any);
            return `${f.getFullYear()}-${f.getMonth()}-${f.getDate()}` === dayKey;
          } catch {
            return false;
          }
        });
        const lessons = dayCourses.map((course) => {
          let extra: CourseResource[] = [];
          try {
            extra = matchContentForCourse(contents, course) ?? [];
          } catch {
            extra = [];
          }
          const fromCache = Array.isArray(course.content) ? course.content : [];
          return { course, contents: [...fromCache, ...extra], matched: extra };
        });
        const dayHomeworks = (homeworks ?? [])
          .filter((h) => {
            try {
              const d = h.dueDate instanceof Date ? h.dueDate : new Date(h.dueDate as any);
              return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === dayKey;
            } catch {
              return false;
            }
          })
          .map((h) => ({
            subject: (h as { subject?: string }).subject ?? "",
            content: (h as { content?: string }).content ?? "",
            attachments: Array.isArray((h as { attachments?: unknown[] }).attachments)
              ? ((h as { attachments: { name?: string; url?: string; createdByAccount: string }[] }).attachments ?? [])
              : [],
          }));
        return {
          key: dayKey,
          date,
          lessons: lessons.sort((a, b) => {
            try {
              const fa = a.course.from instanceof Date ? a.course.from.getTime() : new Date(a.course.from as any).getTime();
              const fb = b.course.from instanceof Date ? b.course.from.getTime() : new Date(b.course.from as any).getTime();
              return fa - fb;
            } catch {
              return 0;
            }
          }),
          homeworks: dayHomeworks,
        };
      });

      let count = 0;
      for (const s of built) {
        for (const l of s.lessons) {
          count += l.contents.length;
          for (const c of l.contents) count += c.attachments?.length ?? 0;
        }
        for (const h of s.homeworks) count += h.attachments.length;
      }
      setSections(built);
      setTotalResources(count);
    } catch {
      setSections([]);
      setTotalResources(0);
    } finally {
      setLoading(false);
    }
  }, [selectedWeek]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const manager = getManager();
      const { getWeekRangeForWeekNumber } = await import("@/utils/services/periods");
      const range = getWeekRangeForWeekNumber(selectedWeek, new Date());
      // Refresh réseau (contenus + devoirs), le cache EDT suit via les hooks calendrier.
      await Promise.all([
        (async () => {
          try {
            await manager?.getWeekContents(range.start, range.end);
          } catch { /* best-effort */ }
        })(),
        (async () => {
          try {
            await manager?.getHomeworks(selectedWeek);
          } catch { /* best-effort */ }
        })(),
      ]);
    } finally {
      await load();
      setRefreshing(false);
    }
  }, [load, selectedWeek]);

  const openFile = useCallback(
    (attachment: { name?: string; url?: string; createdByAccount: string }, dueDate?: Date) => {
      const key = `${attachment.name ?? ""}-${attachment.url ?? ""}`;
      if (downloading) return;
      setDownloading(key);
      void openAttachment(
        attachment as never,
        resolvePronoteFileAuth(attachment.createdByAccount),
        alert,
        dueDate
      ).finally(() => setDownloading(null));
    },
    [alert, downloading]
  );

  const weekLabel = useMemo(() => {
    try {
      const { start } = getDateRangeOfWeek(selectedWeek, new Date().getFullYear());
      return getWeekNumberFromDate(start).toString();
    } catch {
      return selectedWeek.toString();
    }
  }, [selectedWeek]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TabHeader
        title={
          <TabHeaderTitle
            leading={t("Ressources_Week", "Semaine")}
            subtitle={selectedWeek === defaultWeek ? t("Tasks_ThisWeek") : undefined}
            number={weekLabel}
            color="#29947A"
            height={56}
          />
        }
        trailing={
          <Stack direction="horizontal" gap={8}>
            <Pressable
              onPress={() => setSelectedWeek((w) => Math.max(0, w - 1))}
              style={{ padding: 10, borderRadius: 12, backgroundColor: colors.card }}
              accessibilityLabel={t("Ressources_PrevWeek", "Semaine précédente")}
            >
              <Papicons name="chevronleft" size={20} color={String(colors.text)} />
            </Pressable>
            <Pressable
              onPress={() => setSelectedWeek(defaultWeek)}
              style={{ padding: 10, borderRadius: 12, backgroundColor: colors.card }}
              accessibilityLabel={t("Ressources_ThisWeek", "Cette semaine")}
            >
              <Papicons name="calendar" size={20} color={String(colors.text)} />
            </Pressable>
            <Pressable
              onPress={() => setSelectedWeek((w) => w + 1)}
              style={{ padding: 10, borderRadius: 12, backgroundColor: colors.card }}
              accessibilityLabel={t("Ressources_NextWeek", "Semaine suivante")}
            >
              <Papicons name="chevronright" size={20} color={String(colors.text)} />
            </Pressable>
          </Stack>
        }
      />
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Typography variant="body1" color="secondary">
            {t("Ressources_Count", "{{count}} ressources cette semaine", { count: totalResources })}
          </Typography>
          {sections.every((s) => s.lessons.length === 0 && s.homeworks.length === 0) ? (
            <Stack gap={8} vAlign="center" hAlign="center" padding={32}>
              <Typography variant="h4" align="center">
                {t("Ressources_Empty_Title", "Aucune ressource cette semaine")}
              </Typography>
              <Typography variant="body1" color="secondary" align="center">
                {t("Ressources_Empty_Details", "Les contenus de cours et pièces jointes apparaîtront ici.")}
              </Typography>
            </Stack>
          ) : (
            sections.map((section) => {
              if (section.lessons.length === 0 && section.homeworks.length === 0) return null;
              return (
                <View key={section.key} style={{ gap: 10 }}>
                  <Typography variant="h4">{fmtDay(section.date)}</Typography>
                  {section.lessons.map((lesson, idx) => {
                    const c = lesson.course;
                    const from = c.from instanceof Date ? c.from : new Date(c.from as never);
                    const to = c.to instanceof Date ? c.to : new Date(c.to as never);
                    const color = getSubjectColor(c.subject ?? "");
                    return (
                      <View
                        key={`${section.key}-${idx}`}
                        style={{ backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 8 }}
                      >
                        <Stack direction="horizontal" gap={8} vAlign="center">
                          <Typography variant="title">
                            {getSubjectEmoji(c.subject ?? "")} {getSubjectName(c.subject ?? "")}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="secondary">
                          {fmtTime(from)} – {fmtTime(to)}
                          {c.room ? ` · ${c.room}` : ""}
                          {c.teacher ? ` · ${c.teacher}` : ""}
                        </Typography>
                        {lesson.contents.length === 0 ? (
                          <Typography variant="body1" color="secondary">
                            {t("Ressources_Lesson_Empty", "Pas de contenu pour ce cours.")}
                          </Typography>
                        ) : (
                          lesson.contents.map((content, cIdx) => (
                            <View key={cIdx} style={{ gap: 4 }}>
                              {(content.title || content.description) && (
                                <Typography variant="body1">
                                  {[content.title, content.description].filter(Boolean).join(" — ")}
                                </Typography>
                              )}
                              {(content.attachments ?? []).map((a, aIdx) => {
                                const key = `${a.name ?? ""}-${a.url ?? ""}`;
                                return (
                                  <Pressable
                                    key={aIdx}
                                    onPress={() => openFile(a as never, from)}
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      gap: 8,
                                      paddingVertical: 6,
                                    }}
                                  >
                                    <Icon>
                                      <Papicons name={getAttachmentIcon(a as never)} />
                                    </Icon>
                                    <Typography variant="body1" numberOfLines={1} style={{ flex: 1 }}>
                                      {a.name || a.url}
                                    </Typography>
                                    {downloading === key && <ActivityIndicator size={18} />}
                                  </Pressable>
                                );
                              })}
                            </View>
                          ))
                        )}
                        <View style={{ height: 4, borderRadius: 2, backgroundColor: color + "33" }} />
                      </View>
                    );
                  })}
                  {section.homeworks.map((h, hIdx) => (
                    <View
                      key={`${section.key}-hw-${hIdx}`}
                      style={{ backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 8 }}
                    >
                      <Typography variant="title">
                        {t("Ressources_Homework", "Devoir")} · {getSubjectName(h.subject)}
                      </Typography>
                      {h.attachments.map((a, aIdx) => (
                        <Pressable
                          key={aIdx}
                          onPress={() => openFile(a, section.date)}
                          style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 }}
                        >
                          <Icon>
                            <Papicons name={getAttachmentIcon(a as never)} />
                          </Icon>
                          <Typography variant="body1" numberOfLines={1} style={{ flex: 1 }}>
                            {a.name || a.url}
                          </Typography>
                        </Pressable>
                      ))}
                    </View>
                  ))}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const RessourcesWithBoundary = () => (
  <MainTabErrorBoundary>
    <RessourcesView />
  </MainTabErrorBoundary>
);

export default RessourcesWithBoundary;
