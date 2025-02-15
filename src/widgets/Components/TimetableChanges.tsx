import React, { forwardRef, useEffect, useImperativeHandle, useState, useCallback, useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import {Clock, CalendarClock} from "lucide-react-native";

import { WidgetProps } from "@/components/Home/Widget";
import WidgetHeader from "@/components/Home/WidgetHeader";
import ColorIndicator from "@/components/Lessons/ColorIndicator";
import { getSubjectData } from "@/services/shared/Subject";
import { TimetableClass, TimetableClassStatus } from "@/services/shared/Timetable";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import {NativeText} from "@/components/Global/NativeComponents";

const TimetableChanges = forwardRef(({ hidden, setHidden, loading, setLoading }: WidgetProps, ref) => {
  const account = useCurrentAccount(store => store.account!);
  const timetables = useTimetableStore(store => store.timetables);
  const [changedCourse, setChangedCourse] = useState<TimetableClass | null>(null);

  const currentWeekNumber = useMemo(() => dateToEpochWeekNumber(new Date()), []);

  useImperativeHandle(ref, () => ({
    handlePress: () => "Lessons"
  }));

  const fetchTimetable = useCallback(async () => {
    if (!timetables[currentWeekNumber] && account.instance) {
      setLoading(true);
      try {
        await updateTimetableForWeekInCache(account, currentWeekNumber, true);
      } finally {
        setLoading(false);
      }
    }
  }, [account, currentWeekNumber, timetables, setLoading]);

  const updateChangedCourse = useCallback(() => {
    const todayDate = new Date();
    const today = todayDate.getTime();

    if (!account.instance || !timetables[currentWeekNumber]) {
      setChangedCourse(null);
      setHidden(true);
      return;
    }

    const todayCourses = timetables[currentWeekNumber]
      .filter(c => c.endTimestamp > today)
      .sort((a, b) => a.startTimestamp - b.startTimestamp);

    todayCourses.splice(0, 1); // Deleting next course (if it starts today), because it is already showed by next course widget

    let updatedChangedCourse = todayCourses
      .find(course => course.status != undefined || course.statusText != undefined); // Status is undefined if course is "normal"

    setChangedCourse(updatedChangedCourse || null);
    setHidden(!updatedChangedCourse);
    setLoading(false);
  }, [account.instance, timetables, currentWeekNumber, setHidden, setLoading]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  useEffect(() => {
    if (account.personalization.widgets?.timetableChangements && changedCourse) {
      setChangedCourse(changedCourse);
      setHidden(false);
    }
    setLoading(false);
  }, [account, timetables]);

  useEffect(() => {
    setLoading(true);
    updateChangedCourse();
  }, [updateChangedCourse, setLoading]);

  return !hidden && (
    <View style={{ width: "100%", height: "100%" }}>
      <WidgetHeader icon={<CalendarClock />} title="Changement EDT" />
      {changedCourse ? (
        <LessonItem nextCourse={changedCourse} />
      ) : (
        <View style={{ width: "100%", height: "88%", justifyContent: "center", alignItems: "center", gap: 8 }}>
          {loading && <ActivityIndicator />}
          <NativeText variant="subtitle">
            {loading ? "Chargement..." : "Aucun cours"}
          </NativeText>
        </View>
      )}
    </View>
  );
});

const LessonItem: React.FC<{
  nextCourse: TimetableClass
}> = ({ nextCourse }) => {
  const [subjectData, setSubjectData] = useState({ color: "#888888", pretty: "Matière inconnue" });
  const colors = useTheme().colors;
  const startDate = new Date(nextCourse.startTimestamp);
  const prettyTime = `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}`;

  useEffect(() => {
    const fetchSubjectData = async () => {
      const data = await getSubjectData(nextCourse.title);
      setSubjectData(data);
    };
    fetchSubjectData();
  }, [nextCourse.title]);

  return (
    <View style={{ width: "100%", flex: 1, flexDirection: "column", gap: 8 }}>
      <View style={{
        width: "100%",
        marginTop: 9,
        flex: 1,
        flexDirection: "row",
        gap: 10
      }}>
        <ColorIndicator color={subjectData.color} style={{ flex: 0 }} />
        <View style={{ flex: 1, width: "100%", justifyContent: "center" }}>
          <Text numberOfLines={1} style={{ color: colors.text, fontSize: 17, fontFamily: "semibold" }}>
            {subjectData.pretty}
          </Text>
          <View style={{
            display: "flex",
            flexDirection: "row",
            paddingRight: 15,
            gap: 5
          }}>
            <View style={{
              marginTop: 2,
              paddingHorizontal: 7,
              paddingVertical: 3,
              backgroundColor: subjectData.color + "33",
              borderRadius: 8,
              borderCurve: "continuous",
              width: "50%",
              alignSelf: "flex-start",
            }}>
              <Text
                numberOfLines={1}
                style={{
                  color: subjectData.color,
                  fontSize: 15,
                  fontFamily: "semibold",
                }}
              >
                {/* TODO: un avis là dessus ? j'affiche la dernière salle de liste, mais est-ce que la nouvelle salle est toujours la dernière de la liste ? */}
                {nextCourse.room?.split(",").at(-1)}
              </Text>
            </View>
            {nextCourse.statusText && (
              <View style={{
                backgroundColor: nextCourse.status === TimetableClassStatus.CANCELED ? "#E8BEBF" : nextCourse.status === TimetableClassStatus.TEST ? "#f4b490" : subjectData.color,
                marginTop: 2,
                paddingHorizontal: 7,
                paddingVertical: 3,
                borderRadius: 8,
                width: "50%",
                borderCurve: "continuous",
                alignSelf: "flex-start",
              }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: nextCourse.status === TimetableClassStatus.CANCELED ? "#B42828" : nextCourse.status === TimetableClassStatus.TEST ? "#d2691e" : "#fff",
                    fontSize: 14.5,
                    fontFamily: "semibold",
                  }}>
                  {nextCourse.statusText}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, opacity: 0.5 }}>
        <Clock size={20} color={colors.text} />
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: 15, fontFamily: "medium" }}>
          à {prettyTime}
        </Text>
      </View>
    </View>
  );
};

export default TimetableChanges;
