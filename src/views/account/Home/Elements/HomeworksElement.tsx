import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHomeworkStore } from "@/stores/homework";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import HomeworkItem from "../../Homeworks/Atoms/Item";
import { Homework } from "@/services/shared/Homework";
import { debounce } from "lodash";
import { PapillonNavigation } from "@/router/refs";
import RedirectButton from "@/components/Home/RedirectButton";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { View, TouchableOpacity, Text } from "react-native";
import { getSubjectData } from "@/services/shared/Subject";
import { ChevronDown } from "lucide-react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";

const HomeworksElement = () => {
  const account = useCurrentAccount(store => store.account!);
  const homeworks = useHomeworkStore(store => store.homeworks);
  const theme = useTheme();

  const actualDay = useMemo(() => new Date(), []);

  const updateHomeworks = useCallback(async () => {
    await updateHomeworkForWeekInCache(account, actualDay);
  }, [account, actualDay]);

  const debouncedUpdateHomeworks = useMemo(() => debounce(updateHomeworks, 500), [updateHomeworks]);

  useEffect(() => {
    debouncedUpdateHomeworks();
  }, [account.instance, actualDay]);

  const handleDonePress = useCallback(
    async (homework: Homework) => {
      await toggleHomeworkState(account, homework);
      await updateHomeworks();
    },
    [account, updateHomeworks]
  );

  const [collapsedSubjects, setCollapsedSubjects] = useState<Record<string, boolean>>({});

  const toggleSubject = useCallback((subject: string) => {
    setCollapsedSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  }, []);

  const groupedHomeworks = useMemo(() => {
    const todayHomeworks = homeworks[dateToEpochWeekNumber(actualDay)]?.filter(hw => new Date(hw.due).getDate() === actualDay.getDate()) || [];
    return todayHomeworks.reduce((acc, hw) => {
      if (!acc[hw.subject]) {
        acc[hw.subject] = [];
      }
      acc[hw.subject].push(hw);
      return acc;
    }, {} as Record<string, Homework[]>);
  }, [homeworks, actualDay]);

  if (Object.keys(groupedHomeworks).length === 0) {
    return null;
  }

  return (
    <>
      <NativeListHeader
        animated
        label="Travail à faire"
        trailing={(
          <RedirectButton navigation={PapillonNavigation.current} redirect="Homeworks" />
        )}
      />
      <NativeList>
        {Object.entries(groupedHomeworks).map(([subject, homeworks], subjectIndex, subjectsArray) => {
          const isCollapsed = collapsedSubjects[subject];
          const isLastSubject = subjectIndex === subjectsArray.length - 1;
          const rotateStyle = useAnimatedStyle(() => {
            return {
              transform: [{ rotate: withTiming(isCollapsed ? "0deg" : "180deg") }],
            };
          });

          return (
            <View key={subject}>
              <TouchableOpacity
                onPress={() => toggleSubject(subject)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: isLastSubject ? 0 : 1,
                  borderBottomColor: theme.colors.border,
                  backgroundColor: theme.colors.card,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: getSubjectData(subject).color,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}>
                    <Text style={{ fontSize: 20 }}>{getSubjectData(subject).emoji}</Text>
                  </View>
                  <View>
                    <Text style={{
                      color: theme.colors.text,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}>
                      {getSubjectData(subject).pretty}
                    </Text>
                    <Text style={{
                      color: theme.colors.text,
                      fontSize: 14,
                      opacity: 0.7,
                    }}>
                      {homeworks.length} devoir{homeworks.length > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <Animated.View style={rotateStyle}>
                  <ChevronDown size={24} color={theme.colors.text} />
                </Animated.View>
              </TouchableOpacity>
              {!isCollapsed && homeworks.map((homework, idx) => (
                <HomeworkItem
                  key={homework.id}
                  index={idx}
                  total={homeworks.length}
                  homework={homework}
                  onDonePressHandler={async () => handleDonePress(homework)}
                />
              ))}
            </View>
          );
        })}
      </NativeList>
    </>
  );
};

export default HomeworksElement;
