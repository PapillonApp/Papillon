import { useNavigation } from "expo-router";
import { t } from "i18next";
import React, { useMemo, useRef } from "react";
import { Dimensions,FlatList, Platform, RefreshControl, StyleSheet, View } from 'react-native';

import { Transit } from "@/components/Transit";
import { Course as SharedCourse, CourseStatus } from "@/services/shared/timetable";
import { TransportStorage } from "@/stores/account/types";
import Course from "@/ui/components/Course";
import { Colors, getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from '@/utils/subjects/name';

import { EmptyCalendar } from './EmptyCalendar';

interface CalendarDayProps {
  dayDate: Date;
  courses: SharedCourse[];
  isRefreshing: boolean;
  onRefresh: () => void;
  colors: { primary: string, background: string };
  headerHeight: number;
  insets: any;
  tabBarHeight: number;
  transportInfo?: TransportStorage;
}

export const CalendarDay = React.memo(({ dayDate, courses, isRefreshing, onRefresh, colors, headerHeight, insets, tabBarHeight, transportInfo }: CalendarDayProps) => {
  const navigation = useNavigation<any>();

  // Cache to preserve event object identity by id
  const eventCache = useRef<{ [id: string]: any }>({});

  // Shallow compare function
  function shallowEqual(objA: any, objB: any) {
    if (objA === objB) { return true; }
    if (!objA || !objB) { return false; }
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) { return false; }
    for (const key of keysA) {
      if (objA[key] !== objB[key]) { return false; }
    }
    return true;
  }

  const dayEvents = useMemo(() => {
    const cache = eventCache.current;
    const next: { [id: string]: any } = {};
    const result = (courses ?? []).map(ev => {
      if (cache[ev.id] && shallowEqual(ev, cache[ev.id])) {
        next[ev.id] = cache[ev.id];
        return cache[ev.id];
      }
      next[ev.id] = ev;
      return ev;
    });
    eventCache.current = next;
    return result;
  }, [courses]);

  const threshold = 30;

  const enrichedEvents = useMemo(() => {
    if (!dayEvents || dayEvents.length === 0) {return dayEvents;}
    const result: any[] = [];

    // Add transport departure
    if (transportInfo?.enabled ?? false) {
      result.push({
        type: "transit",
        isDeparture: true,
        targetTime: dayEvents[0].from.getTime() / 1000,
      });
    }

    // Add separator between events
    for (let i = 0; i < dayEvents.length; i++) {
      result.push(dayEvents[i]);
      if (i < dayEvents.length - 1) {
        const current = dayEvents[i];
        const next = dayEvents[i + 1];
        if (current.to && next.from) {
          const diffMinutes =
            (next.from.getTime() - current.to.getTime()) / (1000 * 60);
          if (diffMinutes > threshold) {
            result.push({
              id: `separator-${current.id}-${next.id}`,
              type: "separator" as any,
              from: new Date(current.to),
              to: new Date(next.from),
            });
          }
        }
      }
    }

    // Add transport arrival
    if (transportInfo?.enabled ?? false) {
      result.push({
        type: "transit",
        isDeparture: false,
        targetTime: result[result.length - 1].to.getTime() / 1000,
      });
    }

    return result;
  }, [dayEvents]);

  const isEmpty = enrichedEvents.length === 0;

  return (
    <View style={{ width: Dimensions.get("window").width, flex: 1 }}>
      <FlatList
        data={enrichedEvents}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 12,
          gap: 4,
          paddingTop: headerHeight - 8,
          paddingBottom: tabBarHeight + 6,
          ...(isEmpty ? { alignItems: "center" } : {}),
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
            progressViewOffset={Platform.OS === 'android' ? headerHeight : 0}
          />
        }
        keyExtractor={item => item.id || `${item.type}-${item.from || item.targetTime}`}
        ListEmptyComponent={<EmptyCalendar />}
        renderItem={({ item }: { item: SharedCourse }) => {
          if ((item as any).type === "transit") {
            return (
              <Transit
                isDeparture={item.isDeparture}
                homeAddress={transportInfo?.homeAddress}
                schoolAddress={transportInfo?.schoolAddress}
                targetTime={item.targetTime}
                service={transportInfo?.defaultApp ?? 'transit'}
              />
            );
          }

          if ((item as any).type === "separator") {
            return (
              <Course
                id={item.id}
                name="Pause"
                variant="separator"
                start={Math.floor(item.from.getTime() / 1000)}
                end={Math.floor(item.to.getTime() / 1000)}
                showTimes={false}
                onPress={() => {
                  navigation.navigate("(modals)/course", {
                    course: item,
                    subjectInfo: {
                      id: item.subject,
                      name: getSubjectName(item.subject),
                      color: getSubjectColor(item.subject) || Colors[0],
                      emoji: getSubjectEmoji(item.subject),
                    },
                  });
                }}
              />
            );
          }

          return (
            <Course
              id={item.id}
              name={getSubjectName(item.subject)}
              teacher={item.teacher}
              room={item.room}
              color={getSubjectColor(item.subject) || Colors[0]}
              status={{
                label: item.customStatus
                  ? item.customStatus
                  : getStatusText(item.status),
                canceled: item.status === CourseStatus.CANCELED,
              }}
              variant="primary"
              start={Math.floor(item.from.getTime() / 1000)}
              end={Math.floor(item.to.getTime() / 1000)}
              readonly={!!item.createdByAccount}
              onPress={() => {
                navigation.navigate("(modals)/course", {
                  course: item,
                  subjectInfo: {
                    id: item.subject,
                    name: getSubjectName(item.subject),
                    color: getSubjectColor(item.subject) || Colors[0],
                    emoji: getSubjectEmoji(item.subject),
                  },
                });
              }}
            />
          );
        }}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.dayDate.getTime() === nextProps.dayDate.getTime() &&
    prevProps.isRefreshing === nextProps.isRefreshing &&
    prevProps.onRefresh === nextProps.onRefresh &&
    prevProps.headerHeight === nextProps.headerHeight &&
    JSON.stringify(prevProps.courses) === JSON.stringify(nextProps.courses)
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export function getStatusText(status?: CourseStatus): string {
  switch (status) {
  case CourseStatus.ONLINE:
    return t("Online_Course")
  case CourseStatus.EDITED:
    return t("Edited_Course")
  case CourseStatus.CANCELED:
    return t("Canceled_Course")
  case CourseStatus.EVALUATED:
    return t("Evaluated_Course")
  default:
    return ""
  }
}
