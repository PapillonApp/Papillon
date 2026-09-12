import { useRouter } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useCallback, useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { getCourseRouteId } from "@/database/useTimetable";
import { Course, CourseStatus } from "@/services/shared/timetable";
import adjust from "@/utils/adjustColor";
import i18n from "@/utils/i18n";
import { Colors, getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectName } from "@/utils/subjects/name";
import { useFont } from "@/utils/theme/fonts";

export interface WeekEventBlockProps {
  course: Course;
  /** Vertical frame as a share of the grid, so a zoom needs no re-render. */
  topRatio: number;
  heightRatio: number;
  /** Horizontal frame inside the day column, in pixels. */
  left: number;
  width: number;
  /** How tall the block currently is, to pick how much detail to show. */
  renderedHeight: number;
  minHeight: number;
}

// Heights at which another line of detail still fits inside the block.
const ROOM_MIN_HEIGHT = 42;
const TIME_MIN_HEIGHT = 62;
// Below this the block is too narrow for anything but the subject name.
const DETAIL_MIN_WIDTH = 76;

function formatTime(date: Date) {
  return date.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" });
}

/**
 * One course drawn in the weekly grid, positioned by the caller. Blocks are
 * absolutely placed rather than laid out in a flow, so only their own frame
 * changes when the grid is re-measured.
 */
export const WeekEventBlock = React.memo(({
  course,
  topRatio,
  heightRatio,
  left,
  width,
  renderedHeight,
  minHeight,
}: WeekEventBlockProps) => {
  const { colors, dark } = useTheme();
  const font = useFont();
  const router = useRouter();

  const themeText = String(colors.text);

  const canceled = course.status === CourseStatus.CANCELED;
  const color = getSubjectColor(course.subject) || Colors[0];

  const palette = useMemo(() => ({
    background: canceled ? colors.card : adjust(color, dark ? -0.72 : 0.8),
    border: adjust(color, dark ? 0.7 : -0.7) + (canceled ? "20" : "36"),
    accent: adjust(color, dark ? 0.1 : -0.15),
  }), [color, canceled, dark, colors.card]);

  const textColor = canceled ? themeText + "80" : adjust(color, dark ? 0.3 : -0.3);

  const showRoom = renderedHeight >= ROOM_MIN_HEIGHT && width >= DETAIL_MIN_WIDTH;
  const showTime = renderedHeight >= TIME_MIN_HEIGHT && width >= DETAIL_MIN_WIDTH;
  const compact = renderedHeight < ROOM_MIN_HEIGHT;

  const onPress = useCallback(() => {
    router.push({
      pathname: "/(modals)/course/[id]",
      params: { id: getCourseRouteId(course) },
    });
  }, [router, course]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.block,
        {
          top: `${topRatio * 100}%`,
          height: `${heightRatio * 100}%`,
          minHeight,
          left,
          width,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.surface,
          {
            backgroundColor: palette.background
          },
        ]}
      >
        <View style={[styles.accent, { backgroundColor: canceled ? themeText + "40" : textColor, margin: 2 }]} />
        <View style={styles.content}>
          <Text
            numberOfLines={renderedHeight >= TIME_MIN_HEIGHT ? 2 : 1}
            style={[
              styles.name,
              {
                color: textColor,
                fontFamily: font("bold"),
                fontSize: compact ? 11 : 13,
                lineHeight: compact ? 13 : 15,
                textDecorationLine: canceled ? "line-through" : "none",
              },
            ]}
          >
            {getSubjectName(course.subject)}
          </Text>
          {showRoom && (
            <Text
              numberOfLines={1}
              style={[styles.detail, { color: textColor, fontFamily: font("semibold") }]}
            >
              {course.room || course.teacher || ""}
            </Text>
          )}
          {showTime && (
            <Text
              numberOfLines={1}
              style={[styles.detail, { color: textColor, opacity: 0.8, fontFamily: font("medium") }]}
            >
              {formatTime(course.from)} – {formatTime(course.to)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
});

WeekEventBlock.displayName = "WeekEventBlock";

const styles = StyleSheet.create({
  block: {
    position: "absolute",
    paddingRight: 2,
    paddingBottom: 2,
  },
  surface: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 8,
    margin: 0,
    overflow: "hidden",
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 4,
  },
  accent: {
    width: 3,
    borderRadius: 300,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    letterSpacing: -0.1,
  },
  detail: {
    fontSize: 11,
    lineHeight: 14,
  },
});
