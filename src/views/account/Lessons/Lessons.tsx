import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, View, Dimensions, ViewToken } from "react-native";
import { StyleSheet } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import { Page } from "./Atoms/Page";
import { LessonsDateModal } from "./LessonsHeader";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";

import * as StoreReview from "expo-store-review";


import Reanimated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ZoomIn,
} from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { CalendarPlus, MoreVertical } from "lucide-react-native";
import {
  PapillonHeaderAction,
  PapillonHeaderSelector,
  PapillonHeaderSeparator,
  PapillonModernHeader,
} from "@/components/Global/PapillonModernHeader";
import PapillonPicker from "@/components/Global/PapillonPicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Lessons: Screen<"Lessons"> = ({ route, navigation }) => {
  const account = useCurrentAccount((store) => store.account!);
  const timetables = useTimetableStore((store) => store.timetables);

  const outsideNav = route.params?.outsideNav;
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const loadedWeeks = useRef<Set<number>>(new Set());
  const currentlyLoadingWeeks = useRef<Set<number>>(new Set());

  useEffect(() => {
    // add all week numbers in timetables to loadedWeeks
    for (const week in timetables) {
      loadedWeeks.current.add(parseInt(week));
    }
  }, [timetables]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pickerDate, setPickerDate] = useState(new Date(today));

  const getWeekFromDate = (date: Date) => {
    const epochWeekNumber = dateToEpochWeekNumber(date);
    return epochWeekNumber;
  };

  const [updatedWeeks, setUpdatedWeeks] = useState(new Set<number>());

  useEffect(() => {
    void (async () => {
      const weekNumber = getWeekFromDate(pickerDate);
      await loadTimetableWeek(weekNumber, false);
    })();
  }, [pickerDate, account.instance]);

  useEffect(() => {
    loadTimetableWeek(getWeekFromDate(new Date()), true);
  }, [account.personalization.icalURLs]);

  const [loadingWeeks, setLoadingWeeks] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadTimetableWeek = async (weekNumber: number, force = false) => {
    if (
      (currentlyLoadingWeeks.current.has(weekNumber) ||
				loadedWeeks.current.has(weekNumber)) &&
			!force
    ) {
      return;
    }

    setLoading(true);

    if (force) {
      setLoadingWeeks([...loadingWeeks, weekNumber]);
    }

    try {
      await updateTimetableForWeekInCache(account, weekNumber, force);
      currentlyLoadingWeeks.current.add(weekNumber);
    } finally {
      currentlyLoadingWeeks.current.delete(weekNumber);
      loadedWeeks.current.add(weekNumber);
      setUpdatedWeeks(new Set(updatedWeeks).add(weekNumber));
      setLoadingWeeks(loadingWeeks.filter((w) => w !== weekNumber));
      setLoading(false);
    }
  };

  const getAllLessonsForDay = (date: Date) => {
    const week = getWeekFromDate(date);
    const timetable = timetables[week] || [];

    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);

    const day = timetable.filter((lesson) => {
      const lessonDate = new Date(lesson.startTimestamp);
      lessonDate.setHours(0, 0, 0, 0);

      return lessonDate.getTime() === newDate.getTime();
    });

    return day;
  };

  const flatListRef = useRef<FlatList | null>(null);
  const [data, setData] = useState(() => {
    const today = new Date();
    return Array.from({ length: 100 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - 50 + i);
      date.setHours(0, 0, 0, 0);
      return date;
    });
  });
  const renderItem = useCallback(({ item: date }: { item: Date }) => {
    const weekNumber = getWeekFromDate(date);
    return (
      <View style={{ width: Dimensions.get("window").width }}>
        <Page
          paddingTop={outsideNav ? 80 : insets.top + 56}
          current={date.getTime() === pickerDate.getTime()}
          date={date}
          day={getAllLessonsForDay(date)}
          weekExists={
            timetables[weekNumber] && timetables[weekNumber].length > 0
          }
          refreshAction={() => loadTimetableWeek(weekNumber, true)}
          loading={loadingWeeks.includes(weekNumber)}
        />
      </View>
    );
  },
  [
    pickerDate,
    timetables,
    loadingWeeks,
    outsideNav,
    insets,
    getAllLessonsForDay,
    loadTimetableWeek,
  ],
  );

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken<Date>[] }) => {
    if (viewableItems.length > 0) {
      const newDate = viewableItems[0].item;
      setPickerDate(newDate);
      loadTimetableWeek(getWeekFromDate(newDate), false);
    }
  },
  [loadTimetableWeek],
  );

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: Dimensions.get("window").width,
    offset: Dimensions.get("window").width * index,
    index,
  }),
  [],
  );

  const askForReview = async () => {
    StoreReview.isAvailableAsync().then((available) => {
      if (available) {
        StoreReview.requestReview();
      }
    });
  };

  useEffect(() => {
    // on focus
    const unsubscribe = navigation.addListener("focus", () => {
      AsyncStorage.getItem("review_coursesOpen").then((value) => {
        if (value) {
          if (parseInt(value) >= 7) {
            AsyncStorage.setItem("review_coursesOpen", "0");

            setTimeout(() => {
              AsyncStorage.getItem("review_given").then((value) => {
                if(!value) {
                  console.log("Asking for review");
                  askForReview();
                  AsyncStorage.setItem("review_given", "true");
                }
              });
            }, 1000);
          }
          else {
            AsyncStorage.setItem("review_coursesOpen", (parseInt(value) + 1).toString());
          }
        } else {
          AsyncStorage.setItem("review_coursesOpen", "1");
        }
      });
    });

    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <PapillonModernHeader outsideNav={outsideNav}>
        <PapillonHeaderSelector
          loading={loading}
          onPress={() => setShowDatePicker(true)}
        >
          <Reanimated.View layout={animPapillon(LinearTransition)}>
            <Reanimated.View
              key={pickerDate.toLocaleDateString("fr-FR", { weekday: "short" })}
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(150)}
            >
              <Reanimated.Text
                style={[
                  styles.weekPickerText,
                  styles.weekPickerTextIntl,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                {pickerDate.toLocaleDateString("fr-FR", { weekday: "long" })}
              </Reanimated.Text>
            </Reanimated.View>
          </Reanimated.View>

          <AnimatedNumber
            value={pickerDate.getDate().toString()}
            style={[
              styles.weekPickerText,
              styles.weekPickerTextNbr,
              {
                color: theme.colors.text,
              },
            ]}
          />

          <Reanimated.Text
            style={[
              styles.weekPickerText,
              styles.weekPickerTextIntl,
              {
                color: theme.colors.text,
              },
            ]}
            layout={animPapillon(LinearTransition)}
          >
            {pickerDate.toLocaleDateString("fr-FR", { month: "long" })}
          </Reanimated.Text>
        </PapillonHeaderSelector>

        <PapillonHeaderSeparator />

        <PapillonPicker
          animated
          direction="right"
          delay={0}
          data={[
            {
              icon: <CalendarPlus />,
              label: "Importer un iCal",
              onPress: () => {
                navigation.navigate("LessonsImportIcal", {});
              }
            }
          ]}
        >
          <PapillonHeaderAction
            icon={<MoreVertical />}
            entering={animPapillon(ZoomIn)}
            exiting={FadeOut.duration(130)}
          />
        </PapillonPicker>
      </PapillonModernHeader>

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.toISOString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={getItemLayout}
        initialScrollIndex={50}
        onEndReached={() => {
          // Charger plus de dates si nécessaire
          const lastDate = data[data.length - 1];
          const newDates = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(lastDate);
            date.setDate(lastDate.getDate() + i + 1);
            return date;
          });
          setData((prevData) => [...prevData, ...newDates]);
        }}
        onEndReachedThreshold={0.5}
      />

      <LessonsDateModal
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        currentDate={pickerDate}
        onDateSelect={(date) => {
          const newDate = new Date(date || 0);
          newDate.setHours(0, 0, 0, 0);
          setPickerDate(newDate);
          const index = data.findIndex(
            (d) => d.getTime() === newDate.getTime(),
          );
          if (index !== -1) {
            flatListRef.current?.scrollToIndex({ index, animated: false });
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "absolute",
    top: 0,
    left: 0,
  },

  weekPicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 80,
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignSelf: "flex-start",
    overflow: "hidden",
  },

  weekPickerText: {
    zIndex: 10000,
  },

  weekPickerTextIntl: {
    fontSize: 14.5,
    fontFamily: "medium",
    opacity: 0.7,
  },

  weekPickerTextNbr: {
    fontSize: 16.5,
    fontFamily: "semibold",
    marginTop: -1.5,
  },

  weekButton: {
    overflow: "hidden",
    borderRadius: 80,
    height: 38,
    width: 38,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Lessons;
