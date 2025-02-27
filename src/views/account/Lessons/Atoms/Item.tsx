import { useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import ColorIndicator from "@/components/Lessons/ColorIndicator";
import { TimetableClass, TimetableClassStatus } from "@/services/shared/Timetable";

import { PapillonNavigation } from "@/router/refs";

import Reanimated, {
  FadeInDown,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";


import NativeTouchable from "@/components/Global/NativeTouchable";
import { getSubjectData } from "@/services/shared/Subject";
import { animPapillon } from "@/utils/ui/animations";
import { getDuration } from "@/utils/format/course_duration";

export const TimetableItem: React.FC<{
  item: TimetableClass
  index: number
  small?: boolean
}> = ({ item, index, small }) => {
  const { colors } = useTheme();

  const start = useMemo(() => new Date(item.startTimestamp), [item]);
  const end = useMemo(() => new Date(item.endTimestamp), [item]);
  const durationMinutes = useMemo(() => Math.round((item.endTimestamp - item.startTimestamp) / 60000), [item]);
  const subjectData = useMemo(() => getSubjectData(item.title), [item]);
  const formattedStartTime = useMemo(() => start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }), [start]);
  const formattedEndTime = useMemo(() => end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }), [end]);

  return (
    <Reanimated.View
      style={styles.itemContainer}
      entering={Platform.OS === "ios" ? FadeInDown.delay((50 * index)).springify().mass(1).damping(20).stiffness(300) : void 0}
      exiting={Platform.OS === "ios" ? FadeOut.duration(300) : void 0}
      key={item.title + item.startTimestamp}
      layout={animPapillon(LinearTransition)}
    >
      <View style={[styles.timeContainer, small && styles.timeContainerSmall]}>
        <Text style={[styles.timeText, { color: colors.text }]}>{formattedStartTime}</Text>
        <Text style={[styles.timeTextSec, { color: colors.text }]}>{formattedEndTime}</Text>
      </View>

      <NativeTouchable
        style={[styles.detailsContainer, { backgroundColor: colors.card, borderColor: colors.text + "33" }]}
        underlayColor={colors.text + "11"}
        onPress={() => {
          PapillonNavigation.current?.navigate("LessonDocument", { lesson: item });

        }}
      >
        <View style={[{ flex: 1, flexDirection: "column", overflow: "hidden", borderRadius: 10 }]}>
          {item.statusText && (
            <View style={[styles.statusContainer, {
              backgroundColor: item.status === TimetableClassStatus.CANCELED ? "#E8BEBF" : item.status === TimetableClassStatus.TEST ? "#f4b490" : subjectData.color + "33" }]}>
              <Text style={[styles.statusText, { color: item.status === TimetableClassStatus.CANCELED ? "#B42828" : item.status === TimetableClassStatus.TEST ? "#d2691e" : subjectData.color}]}>{item.statusText}</Text>
            </View>
          )}

          <View style={[{ flex: 1, flexDirection: "row", padding: 10 }]}>
            <View style={styles.colorIndicator}>
              <ColorIndicator color={subjectData.color} />
            </View>

            <View style={{ flexDirection: "column", flexShrink: 1, gap: 6, flex: 1 }}>
              <Text numberOfLines={2} style={[styles.titleText, { color: colors.text }]}>{subjectData.pretty || "Cours inconnu"}</Text>

              {item.itemType && (
                <Text numberOfLines={2} style={[styles.subtitleText, { color: colors.text }]}>
                  {item.itemType}
                </Text>
              )}

              <View style={[styles.roomTextContainer, { backgroundColor: subjectData.color + "33" }]}>
                <Text
                  numberOfLines={1}
                  style={[styles.roomText, { color: subjectData.color }]}
                >
                  {item.room
                    ? item.room.includes(",")
                      ? "Plusieurs salles dispo."
                      : item.room
                    : "Salle inconnue"}
                </Text>
              </View>

              {durationMinutes > 89 && !small && <View style={{ height: 24 }} />}

              {!small && (
                <View style={{ flexDirection: "row", flex: 1 }}>
                  <Text numberOfLines={2} style={[styles.locationText, { color: item.teacher ? colors.text : colors.text + "80" }]}>{item.teacher ?? "Professeur inconnu"}</Text>
                  <Text style={[styles.durationText, { color: colors.text }]}>{getDuration(durationMinutes)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </NativeTouchable>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    borderRadius: 5,
    marginVertical: 0,
  },
  timeContainer: {
    flex: 0,
    minWidth: 60,
    paddingHorizontal: 5,
    alignItems: "center",
    gap: 5,
  },
  timeContainerSmall: {
    minWidth: 60,
  },
  timeText: {
    fontSize: 17,
    fontFamily: "semibold",
  },
  timeTextSec: {
    fontSize: 15,
    fontFamily: "medium",
    opacity: 0.5,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  colorIndicator: {
    marginRight: 10,
  },
  titleText: {
    fontFamily: "semibold",
    fontSize: 17,
  },
  subtitleText: {
    fontFamily: "medium",
    fontSize: 15,
    opacity: 0.5,
    marginTop: -1,
    marginBottom: 2,
  },
  roomTextContainer: {
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 5,
    flexWrap: "wrap",
    overflow: "hidden",
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  roomText: {
    color: "#91003F",
    fontSize: 16,
    fontFamily: "semibold",
    letterSpacing: 0.5,
    maxWidth: "100%",
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  durationText: {
    fontSize: 14,
    opacity: 0.5,
    alignSelf: "flex-end",
  },
  statusContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusText: {
    fontSize: 14.5,
    fontFamily: "semibold",
  },
});
