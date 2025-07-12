import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useHomeworkStore } from "@/stores/homework";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import {
  View,
  FlatList,
  Dimensions,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ListRenderItem,
  Pressable,
  TouchableOpacity,
  TextInput
} from "react-native";
import { calculateWeekNumber, dateToEpochWeekNumber, epochWNToDate, weekNumberToMiddleDate } from "@/utils/epochWeekNumber";

import * as StoreReview from "expo-store-review";

import { PressableScale } from "react-native-pressable-scale";
import { CheckSquare, Plus, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import Reanimated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutLeft,
  LinearTransition,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import MissingItem from "@/components/Global/MissingItem";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { Homework } from "@/services/shared/Homework";
import { AccountService } from "@/stores/account/types";
import { Screen } from "@/router/helpers/types";
import { NativeSyntheticEvent } from "react-native/Libraries/Types/CoreEventTypes";
import { NativeScrollEvent, ScrollViewProps } from "react-native/Libraries/Components/ScrollView/ScrollView";
import { hasFeatureAccountSetup } from "@/utils/multiservice";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
import HomeworkItem from "./Atoms/Item";
import DateModal from "@/components/Global/DateModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";

const MemoizedHomeworkItem = React.memo(HomeworkItem);
const MemoizedNativeList = React.memo(NativeList);

const formatDate = (date: string | number | Date): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long"
  });
};

const WeekView: Screen<"Homeworks"> = ({ route, navigation }) => {
  const flatListRef: React.MutableRefObject<FlatList> = useRef(null) as any as React.MutableRefObject<FlatList>;
  const { width } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const { isOnline } = useOnlineStatus();

  const outsideNav = route.params?.outsideNav;

  const theme = useTheme();
  const account = useCurrentAccount(store => store.account!);
  const hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.Homeworks, account.localID) : true;
  const homeworks = useHomeworkStore(store => store.homeworks);

  // @ts-expect-error
  let firstDate = account?.instance?.instance?.firstDate || null;
  if (!firstDate) {
    firstDate = new Date(Date.UTC(new Date().getFullYear(), 8, 1));
  }
  const firstDateEpoch = dateToEpochWeekNumber(firstDate);

  const currentWeek = new Date().getUTCDay() >= 5 || new Date().getUTCDay() === 0
    ? dateToEpochWeekNumber(new Date()) + 1
    : dateToEpochWeekNumber(new Date());
  const [data, setData] = useState(Array.from({ length: 100 }, (_, i) => currentWeek - 50 + i));

  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  const [showDatePickerWeek, setShowDatePickerWeek] = useState(false);
  const [hideDone, setHideDone] = useState(false);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  }), [width]);

  const keyExtractor = useCallback((item: any) => item.toString(), []);

  const getDayName = (date: string | number | Date): string => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    return days[new Date(date).getDay()];
  };

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isOnline && loading) {
      setLoading(false);
    }
  }, [isOnline, loading]);

  const [loadedWeeks, setLoadedWeeks] = useState<number[]>([]);

  const updateHomeworks = useCallback(async (force = false, showRefreshing = true, showLoading = true) => {
    if (!account) return;

    if (!force && loadedWeeks.includes(selectedWeek)) {
      return;
    }

    if (showRefreshing) {
      setRefreshing(true);
    }
    if (showLoading) {
      setLoading(true);
    }
    updateHomeworkForWeekInCache(account, epochWNToDate(selectedWeek))
      .then(() => {
        setLoading(false);
        setRefreshing(false);
        setLoadedWeeks(prev => [...prev, selectedWeek]);
      });
  }, [account, selectedWeek, loadedWeeks]);

  const [searchTerms, setSearchTerms] = useState("");

  const renderWeek: ListRenderItem<number> = useCallback(({ item }) => {
    const homeworksInWeek = [...(homeworks[item] ?? [])];

    const sortedHomework = homeworksInWeek.sort(
      (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()
    );

    let groupedHomework = sortedHomework.reduce((acc, curr) => {
      const dayName = getDayName(curr.personalizate
        ? curr.due - 86400
        : curr.due
      );
      const formattedDate = formatDate(curr.due);
      const day = `${dayName} ${formattedDate}`;

      if (!acc[day]) {
        acc[day] = [curr];
      } else {
        acc[day].push(curr);
      }

      // filter homeworks by search terms
      if (searchTerms.length > 0) {
        acc[day] = acc[day].filter((homework) => {
          const content = homework.content
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          const subject = homework.subject
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          return (
            content.includes(
              searchTerms
                .toLowerCase()
                .trim()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            ) ||
            subject.includes(
              searchTerms
                .toLowerCase()
                .trim()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            )
          );
        });
      }

      // if hideDone is enabled, filter out the done homeworks
      if (hideDone) {
        acc[day] = acc[day].filter(homework => !homework.done);
      }

      // homework completed downstairs
      acc[day] = acc[day].sort((a, b) => {
        if (a.done === b.done) {
          return 0; // if both have the same status, keep the original order
        }
        return a.done ? 1 : -1; // completed go after
      });

      // remove all empty days
      if (acc[day].length === 0) {
        delete acc[day];
      }

      return acc;
    }, {} as Record<string, Homework[]>);

    const isCurrentWeek = item === currentWeek;
    if (isCurrentWeek) {
      const today = new Date().getUTCDay();
      const daysOfWeek = [
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
        "Dimanche",
      ];

      const reorderedDays = [
        ...daysOfWeek.slice(today),
        ...daysOfWeek.slice(0, today),
      ];

      const reorderedGroupedHomework: Record<string, Homework[]> = {};
      const completedDays: string[] = [];

      Object.keys(groupedHomework).forEach((day) => {
        const allDone = groupedHomework[day].every(
          (homework) => homework.done
        );
        if (allDone) {
          completedDays.push(day);
        }
      });

      reorderedDays.forEach((dayName) => {
        const dayKey = Object.keys(groupedHomework).find((day) =>
          day.startsWith(dayName)
        );
        if (dayKey && !completedDays.includes(dayKey)) {
          reorderedGroupedHomework[dayKey] = groupedHomework[dayKey];
        }
      });

      completedDays.forEach((dayKey) => {
        reorderedGroupedHomework[dayKey] = groupedHomework[dayKey];
      });

      groupedHomework = reorderedGroupedHomework;
    }

    const askForReview = async () => {
      StoreReview.isAvailableAsync().then((available) => {
        if (available) {
          StoreReview.requestReview();
        }
      });
    };

    const countCheckForReview = async () => {
      AsyncStorage.getItem("review_checkedHomeworkCount").then((value) => {
        if (value) {
          if (parseInt(value) >= 5) {
            AsyncStorage.setItem("review_checkedHomeworkCount", "0");

            setTimeout(() => {
              AsyncStorage.getItem("review_given").then((value) => {
                if(!value) {
                  askForReview();
                  AsyncStorage.setItem("review_given", "true");
                }
              });
            }, 1000);
          }
          else {
            AsyncStorage.setItem("review_checkedHomeworkCount", (parseInt(value) + 1).toString());
          }
        } else {
          AsyncStorage.setItem("review_checkedHomeworkCount", "1");
        }
      });
    };

    return (
      <ScrollView
        style={{ width, height: "100%" }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: outsideNav ? 72 : insets.top + 56,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => updateHomeworks(true)}
            progressViewOffset={outsideNav ? 72 : insets.top + 56}
          />
        }
      >
        {!isOnline && <OfflineWarning cache={true} />}

        {groupedHomework && Object.keys(groupedHomework).map((day) => (
          <Reanimated.View
            key={day}
            entering={animPapillon(FadeInUp)}
            exiting={animPapillon(FadeOutDown)}
            layout={animPapillon(LinearTransition)}
          >
            <NativeListHeader animated label={day} />

            <MemoizedNativeList animated>
              {groupedHomework[day].map((homework, idx) => (
                <MemoizedHomeworkItem
                  key={homework.id}
                  index={idx}
                  navigation={navigation}
                  total={groupedHomework[day].length}
                  homework={homework}
                  onDonePressHandler={async () => {
                    if (homework.personalizate) {
                      useHomeworkStore
                        .getState()
                        .updateHomework(item, homework.id,
                          {... homework, done: !homework.done }
                        );
                    } else {
                      if (account.service !== AccountService.Skolengo) {
                        await toggleHomeworkState(account, homework);
                      }
                      await updateHomeworks(true, false, false);
                      await countCheckForReview();
                    }
                  }}
                />
              ))}
            </MemoizedNativeList>
          </Reanimated.View>
        ))}

        {groupedHomework && Object.keys(groupedHomework).length === 0 &&
          <Reanimated.View
            style={{
              marginTop: 24,
              width: "100%",
            }}
            layout={animPapillon(LinearTransition)}
            key={searchTerms + hideDone}
          >
            {searchTerms.length > 0 ? (
              <MissingItem
                emoji="🔍"
                title="Aucun résultat"
                description="Aucun devoir ne correspond à ta recherche."
              />
            ) : hideDone ? (
              <MissingItem
                emoji="👏"
                title="Il ne te reste rien à faire !"
                description="Il n'y a aucun devoir non terminé pour cette semaine."
              />
            ) : hasServiceSetup ? (
              <MissingItem
                emoji="📚"
                title="Aucun devoir"
                description="Il n'y a aucun devoir pour cette semaine."
              />
            ) : (
              <MissingItem
                title="Aucun service connecté"
                description="Tu n'as pas encore paramétré de service pour cette fonctionnalité."
                emoji="🤷"
              />
            )}
          </Reanimated.View>
        }

        <View style={{ height: 82 }} />
      </ScrollView>
    );
  }, [
    homeworks,
    searchTerms,
    hideDone,
    updateHomeworks,
    navigation,
    getDayName,
    formatDate,
    insets,
    outsideNav,
    isOnline,
  ]);

  const onEndReached = () => {
    const lastWeek = data[data.length - 1];
    const newWeeks = Array.from({ length: 50 }, (_, i) => lastWeek + i + 1);
    setData(prevData => [...prevData, ...newWeeks]);
  };

  const onStartReached = () => {
    const firstWeek = data[0];
    const newWeeks = Array.from({ length: 50 }, (_, i) => firstWeek - 50 + i);
    setData(prevData => [...newWeeks, ...prevData]);
    flatListRef.current?.scrollToIndex({ index: 50, animated: false });
  };

  const onScroll: ScrollViewProps["onScroll"] = useCallback(({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (nativeEvent.contentOffset.x < width) {
      onStartReached();
    }

    // Update selected week based on scroll position
    const index = Math.round(nativeEvent.contentOffset.x / width);
    setSelectedWeek(data[index]);
  }, [width, data]);

  const onMomentumScrollEnd: ScrollViewProps["onMomentumScrollEnd"] = useCallback(({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(nativeEvent.contentOffset.x / width);
    setSelectedWeek(data[index]);
  }, [width, data]);

  const SearchRef: React.MutableRefObject<TextInput> = useRef(null) as any as React.MutableRefObject<TextInput>;

  return (
    <View>
      <PapillonModernHeader outsideNav={outsideNav}>
        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          entering={animPapillon(FadeIn).delay(100)}
          exiting={animPapillon(FadeOutLeft)}
        >
          <PressableScale
            style={[styles.weekPickerContainer]}
            onPress={() => setShowDatePickerWeek(true)}
          >
            <Reanimated.View
              layout={animPapillon(LinearTransition)}
              style={[{
                backgroundColor: theme.colors.text + 16,
                overflow: "hidden",
                borderRadius: 80,
              }]}
            >
              <BlurView
                style={[styles.weekPicker, {
                  backgroundColor: "transparent",
                }]}
                tint={theme.dark ? "dark" : "light"}
              >
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
                  {width > 370 ? "Semaine" : "sem."}
                </Reanimated.Text>

                <Reanimated.View layout={animPapillon(LinearTransition)}>
                  <AnimatedNumber
                    value={calculateWeekNumber(epochWNToDate(selectedWeek))}
                    style={[
                      styles.weekPickerText,
                      styles.weekPickerTextNbr,
                      {
                        color: theme.colors.text,
                      },
                    ]}
                  />
                </Reanimated.View>

                {loading &&
                  <PapillonSpinner
                    size={18}
                    color={theme.colors.text}
                    strokeWidth={2.8}
                    entering={animPapillon(ZoomIn)}
                    exiting={animPapillon(ZoomOut)}
                    style={{
                      marginLeft: 5,
                    }}
                  />
                }
              </BlurView>
            </Reanimated.View>
          </PressableScale>
        </Reanimated.View>

        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          style={{
            flex: 1
          }}
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: hideDone ? theme.colors.primary : theme.colors.background + "ff",
              borderColor: theme.colors.border + "dd",
              borderWidth: 1,
              borderRadius: 800,
              height: 40,
              width: 40,
              gap: 4,
              shadowColor: "#00000022",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.6,
              shadowRadius: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setHideDone(!hideDone);
              }}
            >
              <CheckSquare
                size={20}
                color={hideDone ? "#fff" : theme.colors.text}
                strokeWidth={2.5}
                opacity={hideDone ? 1 : 0.7}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              backgroundColor: theme.colors.background + "ff",
              borderColor: theme.colors.border + "dd",
              borderWidth: 1,
              borderRadius: 800,
              paddingHorizontal: 14,
              height: 40,
              width: 40,
              gap: 4,
              shadowColor: "#00000022",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.6,
              shadowRadius: 4,
              maxWidth: "60%",
            }}
          >
            <TouchableOpacity onPress={() => SearchRef.current?.focus()}>
              <Search
                size={20}
                color={theme.colors.text}
                strokeWidth={2.5}
                opacity={0.7}
              />
            </TouchableOpacity>

            <Reanimated.View
              layout={animPapillon(LinearTransition)}
              style={{
                flex: 1,
                overflow: "hidden",
                borderRadius: 80,
              }}
              entering={FadeIn.duration(250).delay(20)}
              exiting={FadeOut.duration(100)}
            >
              <ResponsiveTextInput
                placeholder={hideDone ? "Non terminés" : "Rechercher"}
                value={searchTerms}
                onChangeText={setSearchTerms}
                placeholderTextColor={theme.colors.text + "80"}
                style={{
                  color: theme.colors.text,
                  padding: 7,
                  borderRadius: 80,
                  fontFamily: "medium",
                  fontSize: 16.5,
                }}
                ref={SearchRef}
              />
            </Reanimated.View>

            {searchTerms.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerms("")}>
                <Reanimated.View
                  layout={animPapillon(LinearTransition)}
                  entering={FadeIn.duration(100)}
                  exiting={FadeOut.duration(100)}
                >
                  <X
                    size={20}
                    color={theme.colors.text}
                    strokeWidth={2.5}
                    opacity={0.7}
                  />
                </Reanimated.View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {showDatePickerWeek && (
          <DateModal
            currentDate={weekNumberToMiddleDate(selectedWeek)}
            onDateSelect={(selectedDate) => {
              if (selectedDate) {
                selectedDate.setUTCHours(1, 0, 0, 0);

                const weekNumber = dateToEpochWeekNumber(selectedDate);
                const index = data.findIndex((week) => week === weekNumber);
                if (index !== -1) {
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                  setSelectedWeek(weekNumber);

                  setTimeout(async () => {
                    await updateHomeworks(true, false, true);
                  }, 500);
                }
              }
            }}
            showDatePicker={showDatePickerWeek}
            setShowDatePicker={setShowDatePickerWeek}
            isHomework
          />
        )}
      </PapillonModernHeader>

      <AddHomeworkButton
        onPress={() => navigation.navigate("AddHomework", {})}
        outsideNav={route.params?.outsideNav ?? false}
      />

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderWeek}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        getItemLayout={getItemLayout}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        initialScrollIndex={50}
        style={{
          height: "100%",
        }}
      />
    </View>
  );
};

const AddHomeworkButton: React.FC<{ onPress: () => void, outsideNav: boolean }> = ({ onPress, outsideNav }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => onPress()}
      style={({ pressed }) => [
        {
          position: "absolute",
          zIndex: 999999,
          bottom: 16 + (outsideNav ? insets.bottom : 0),
          right: 16,
          transform: [{ scale: pressed ? 0.95 : 1 }],
          opacity: pressed ? 0.8 : 1,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
          overflow: "visible",
        }
      ]}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 30,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Plus
          color={"#fff"}
          size={28}
          strokeWidth={2.5}
        />
      </View>
    </Pressable>
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

  weekPickerContainer: {},

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

export default WeekView;