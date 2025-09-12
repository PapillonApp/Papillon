import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { t } from "i18next";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Platform, Pressable, RefreshControl, Text, useWindowDimensions, View } from "react-native";
import Reanimated, { FadeInUp, FadeOutUp, LayoutAnimationConfig, LinearTransition } from "react-native-reanimated";

import { getManager, subscribeManagerUpdate } from "@/services/shared";
import { Homework } from "@/services/shared/homework";
import { useAlert } from "@/ui/components/AlertProvider";
import { CircularProgress } from "@/ui/components/CircularProgress";
import { Dynamic } from "@/ui/components/Dynamic";
import {
  NativeHeaderHighlight,
  NativeHeaderPressable,
  NativeHeaderSide,
  NativeHeaderTitle,
} from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import Stack from "@/ui/components/Stack";
import TabFlatList from "@/ui/components/TabFlatList";
import Task from "@/ui/components/Task";
import Typography from "@/ui/components/Typography";
import { Animation } from "@/ui/utils/Animation";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { PapillonAppearIn, PapillonAppearOut, PapillonZoomIn } from "@/ui/utils/Transition";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

import { Papicons } from "@getpapillon/papicons";
import Icon from "@/ui/components/Icon";
import AnimatedNumber from "@/ui/components/AnimatedNumber";
import { predictHomework } from "@/utils/magic/prediction";
import { useSettingsStore } from "@/stores/settings";
import { getWeekNumberFromDate, updateHomeworkIsDone, useHomeworkForWeek } from "@/database/useHomework";
import { generateId } from "@/utils/generateId";
import { useAccountStore } from "@/stores/account";
import { MenuView } from "@react-native-menu/menu";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { useBottomTabBarHeight } from "react-native-bottom-tabs";
import { ImpactFeedbackStyle } from "expo-haptics";
import { router } from "expo-router";

export const useMagicPrediction = (content: string) => {
  const [magic, setMagic] = useState<any>(undefined);
  const magicEnabled = useSettingsStore(state => state.personalization.magicEnabled);

  useEffect(() => {
    let isCancelled = false;

    const loadMagic = async () => {
      try {
        const prediction = await predictHomework(content, magicEnabled);
        if (!isCancelled) {
          setMagic(prediction);
        }
      } catch (error) {
        console.error("Error predicting homework:", error);
        if (!isCancelled) {
          setMagic(undefined);
        }
      }
    };

    if (content) {
      loadMagic();
    }

    return () => {
      isCancelled = true;
    };
  }, [content, magicEnabled]);

  return magic;
};

const TaskItem = memo(({ item, fromCache = false, index, onProgressChange }: {
  item: Homework;
  fromCache: boolean;
  index: number;
  onProgressChange: (item: Homework, newProgress: number) => void;
}) => {
  try {
    const cleanContent = item.content.replace(/<[^>]*>/g, "");
    const magic = useMagicPrediction(cleanContent);

    return (
      <Task
        subject={getSubjectName(item.subject)}
        emoji={getSubjectEmoji(item.subject)}
        title={""}
        color={getSubjectColor(item.subject)}
        description={item.content}
        date={new Date(item.dueDate)}
        progress={item.isDone ? 1 : 0}
        index={index}
        magic={magic}
        fromCache={fromCache ?? false}
        onProgressChange={(newProgress: number) => onProgressChange(item, newProgress)}
      />
    );
  } catch (error) {
    return null;
  }
});

const EmptyListComponent = memo(() => (
  <LayoutAnimationConfig skipEntering>
    <Dynamic animated key={'empty-list:warn'}>
      <Stack
        hAlign="center"
        vAlign="center"
        margin={16}
      >
        <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
          <Papicons name={"Check"} />
        </Icon>
        <Typography variant="h4" color="text" align="center">
          {t('Tasks_NoTasks_Title')}
        </Typography>
        <Typography variant="body2" color="secondary" align="center">
          {t('Tasks_NoTasks_Description')}
        </Typography>
      </Stack>
    </Dynamic>
  </LayoutAnimationConfig>
));

export default function TabOneScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const bottomTabBarHeight = useBottomTabBarHeight();
  const headerHeight = useHeaderHeight();
  const alert = useAlert()
  const windowDimensions = useWindowDimensions();

  const currentDate = new Date()

  const [fullyScrolled, setFullyScrolled] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(getWeekNumberFromDate(currentDate));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const store = useAccountStore.getState()
  const account = store.accounts.find(() => store.lastUsedAccount);
  const services: string[] = account?.services?.map((service: { id: string }) => service.id) ?? [];
  const homeworksFromCache = useHomeworkForWeek(selectedWeek, refreshTrigger).filter(homework => services.includes(homework.createdByAccount));
  const [homework, setHomework] = useState<Record<string, Homework>>({});

  const manager = getManager();

  const fetchHomeworks = async (managerToUse = manager) => {
    if (!managerToUse) {
      return;
    }
    const result = await managerToUse.getHomeworks(selectedWeek);
    result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const newHomeworks: Record<string, Homework> = {};
    for (const hw of result) {
      const id = generateId(hw.subject + hw.content + hw.createdByAccount);
      newHomeworks[id] = hw;
    }
    setHomework(newHomeworks);
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      fetchHomeworks(updatedManager);
    });

    return () => unsubscribe();
  }, [selectedWeek]);

  useEffect(() => {
    fetchHomeworks();
  }, [selectedWeek]);

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);


  const onProgressChange = useCallback((item: Homework, newProgress: number) => {
    const updateHomeworkCompletion = async (homeworkItem: Homework) => {
      try {
        const manager = getManager();
        const id = generateId(item.subject + item.content + item.createdByAccount);
        await manager.setHomeworkCompletion(homeworkItem, !homeworkItem.isDone);
        updateHomeworkIsDone(id, !homeworkItem.isDone)
        setRefreshTrigger(prev => prev + 1);
        setHomework(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            isDone: !homeworkItem.isDone,
          }
        }));
      } catch (error) {
        alert.showAlert({
          title: "Une erreur est survenue",
          message: "Ce devoir n'a pas été mis à jour",
          description: "Nous n'avons pas réussi à mettre à jour l'état du devoir, si ce devoir est important, merci de vous rendre sur l'application officielle de votre établissement afin de définir son état.",
          color: "#D60046",
          icon: "TriangleAlert",
          technical: String(error)
        });
      }
    };

    updateHomeworkCompletion(item);
  }, [selectedWeek]);

  const lengthHomeworks = React.useMemo(() => {
    return homeworksFromCache.length;
  }, [homeworksFromCache]);

  const leftHomeworks = React.useMemo(() => {
    return (homeworksFromCache.filter((h) => !h.isDone).length);
  }, [homeworksFromCache]);

  const percentageComplete = React.useMemo(() => {
    return ((lengthHomeworks - leftHomeworks) / lengthHomeworks * 100);
  }, [lengthHomeworks, leftHomeworks]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    const fetchHomeworks = async () => {
      try {
        const result = await manager.getHomeworks(selectedWeek);
        const newHomeworks: Record<string, Homework> = {};
        for (const hw of result) {
          const id = generateId(hw.subject + hw.content + hw.createdByAccount);
          newHomeworks[id] = hw;
        }
        setHomework(prev => ({ ...prev, ...newHomeworks }));
      } catch (error) {
        alert.showAlert({
          title: "Erreur de chargement",
          message: "Impossible de charger les devoirs",
          description: "Veuillez vérifier votre connexion internet et réessayer.",
          color: "#D60046",
          icon: "TriangleAlert",
          technical: String(error)
        });
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchHomeworks();
  }, [selectedWeek, manager, alert]);

  const renderItem = useCallback(({ item, index }: { item: Homework; index: number }) => {
    const inFresh = homework[item.id]
    if (showUndoneOnly && item.isDone)
      return null;
    return (
      <TaskItem
        item={item}
        index={index}
        fromCache={!inFresh}
        onProgressChange={(item, newProgress) => onProgressChange(inFresh, newProgress)}
      />
    )
  }, [onProgressChange, homeworksFromCache]);

  const keyExtractor = useCallback((item: Homework) => item.id, []);

  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const WeekPickerRef = useRef<FlatList>(null);

  const layoutPicker = useCallback(() => {
    if (WeekPickerRef.current) {
      const offset = selectedWeek * 60;
      WeekPickerRef.current.scrollToOffset({
        offset,
        animated: false,
      });
    }
  }, [selectedWeek]);

  const handleWeekScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = 60; // width of each item in the picker
    const index = Math.round(contentOffsetX / itemWidth);
    if (index < 0 || index >= 56) { return; } // prevent out of bounds
    requestAnimationFrame(() => {
      setSelectedWeek(index);
    });
  }, []);

  const toggleWeekPicker = useCallback(() => {
    setShowWeekPicker((prev) => !prev);
  }, []);

  function getStatusText() {
    switch (leftHomeworks) {
      case 0:
        return t('Tasks_NoTasks_Nav');
      case 1:
        return t('Tasks_Nav_One');
      default:
        return t('Tasks_Nav_Left', { count: leftHomeworks });
    }
  }

  const statusText = useMemo(() => getStatusText(), [lengthHomeworks, leftHomeworks]);

  function marginTop(): number {
    if (runsIOS26) {
      if (fullyScrolled) {
        return 6
      }
      return 0
    }

    if (Platform.OS === 'ios') {
      return -4
    }

    return -2
  }

  const sortingMethods = [
    {
      label: t('Tasks_Sorting_Methods_DueDate'),
      method: (a: Homework, b: Homework) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      image: Platform.select({
        ios: "calendar"
      }),
    },
    {
      label: t('Tasks_Sorting_Methods_Subject'),
      method: (a: Homework, b: Homework) => a.subject.localeCompare(b.subject),
      image: Platform.select({
        ios: "character"
      }),
    },
    {
      label: t('Tasks_Sorting_Methods_Done'),
      method: (a: Homework, b: Homework) => Number(a.isDone) - Number(b.isDone),
      image: Platform.select({
        ios: "checkmark.circle"
      }),
    },
  ]

  const [selectedMethod, setSelectedMethod] = useState(0);
  const [showUndoneOnly, setShowUndoneOnly] = useState(false);

  const sortedHomeworks = useMemo(() => {
    const sortingMethod = sortingMethods[selectedMethod].method;
    return [...homeworksFromCache].sort(sortingMethod);
  }, [homeworksFromCache, selectedMethod]);

  return (
    <>
      <TabFlatList
        radius={36}
        backgroundColor={theme.dark ? "#2e0928" : "#F7E8F5"}
        foregroundColor="#9E0086"
        key={sortedHomeworks.length}
        data={sortedHomeworks}
        initialNumToRender={2}
        numColumns={windowDimensions.width > 1050 ? 3 : windowDimensions.width < 800 ? 1 : 2}
        onFullyScrolled={handleFullyScrolled}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={200}
          />
        }
        gap={16}
        header={(
          <Stack direction={"horizontal"} hAlign={"end"} style={{ padding: 20 }}>
            <LayoutAnimationConfig skipEntering>
              <Dynamic animated style={{ flex: 1 }} key={`left-homeworks:${leftHomeworks > 0 ? "undone" : "done"}`}>
                {lengthHomeworks === 0 ? (
                  <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
                    <Papicons name={"Check"} color={"#C54CB3"} size={36} style={{ marginBottom: 4 }} />
                    <Typography inline variant={"title"} color={"secondary"} style={{ lineHeight: 19 }}>
                      {t('Tasks_NoTasks_Title')} {"\n"}{t('Tasks_NoTasks_ForWeek', { week: selectedWeek })}
                    </Typography>
                  </Stack>
                ) : (leftHomeworks > 0 ? (
                  <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
                    <Dynamic animated key={`left-homeworks-count:${leftHomeworks}`} entering={PapillonZoomIn} exiting={PapillonAppearOut}>
                      <AnimatedNumber inline variant={"h1"} style={{ fontSize: 36, marginBottom: 4 }} color={"#C54CB3"}>
                        {leftHomeworks}
                      </AnimatedNumber>
                    </Dynamic>
                    <Typography inline variant={"title"} color={"secondary"} style={{ lineHeight: 19 }}>
                      {t('Tasks_LeftHomeworks_Title')} {"\n"}{t('Tasks_LeftHomeworks_Time')}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
                    <Papicons name={"Check"} color={"#C54CB3"} size={36} style={{ marginBottom: 4 }} />
                    <Typography inline variant={"title"} color={"secondary"} style={{ lineHeight: 19 }}>
                      {t('Tasks_Done_AllTasks')} {"\n"}{t('Tasks_Done_CompletedTasks')}
                    </Typography>
                  </Stack>
                ))}
              </Dynamic>
            </LayoutAnimationConfig>
            <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }} key={`circular-progress-week-ct:${selectedWeek}`}>
              <CircularProgress
                backgroundColor={colors.text + "22"}
                percentageComplete={lengthHomeworks === 0 ? 100 : percentageComplete}
                radius={35}
                strokeWidth={7}
                fill={"#C54CB3"}
              />
            </View>
          </Stack>
        )}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<EmptyListComponent />}
      />

      {/* FAB */}
      <AnimatedPressable
        opacityTo={1}
        hapticFeedback={ImpactFeedbackStyle.Rigid}
        style={{
          position: "absolute",
          bottom: Platform.OS === "ios" ? bottomTabBarHeight + 10 : 10,
          right: 10,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#C54CB3",
          zIndex: 10000,
          alignItems: "center",
          justifyContent: "center",
          shadowOpacity: 0.1,
          shadowRadius: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
        }}
        onPress={() => router.push("/(new)/task")}
      >
        <Papicons name={"Add"} size={24} color={"#FFF"} />
      </AnimatedPressable>

      {!runsIOS26 && fullyScrolled && (
        <Reanimated.View
          entering={Animation(FadeInUp, "list")}
          exiting={Animation(FadeOutUp, "default")}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: headerHeight + 1,
              backgroundColor: colors.card,
              zIndex: 1000000,
            },
            Platform.OS === 'android' && {
              elevation: 4,
            },
            Platform.OS === 'ios' && {
              borderBottomWidth: 0.5,
              borderBottomColor: colors.border,
            }
          ]}
        />
      )}

      {/* Picker */}
      {showWeekPicker && (
        <Reanimated.View
          entering={PapillonAppearIn}
          exiting={PapillonAppearOut}
          style={{
            height: 60,
            width: 300,
            backgroundColor: colors.card,
            borderRadius: 16,
            boxShadow: "0px 0px 32px rgba(0, 0, 0, 0.25)",
            position: "absolute",
            top: headerHeight - 6,
            alignSelf: "center",
            zIndex: 1000000,
            transformOrigin: "center top",
          }}
        >
          <View
            style={{
              position: "absolute",
              alignSelf: "center",
              top: 5,
              height: 50,
              width: 50,
              borderRadius: 16,
              borderCurve: "continuous",
              borderWidth: 2,
              borderColor: "#C54CB3",
            }}
          />

          <FlatList
            onLayout={() => {
              layoutPicker();
            }}
            data={Array.from({ length: 56 }, (_, i) => i)}
            initialScrollIndex={selectedWeek}
            getItemLayout={(data, index) => (
              { length: 60, offset: 60 * index, index }
            )}
            keyExtractor={(item) => "picker:" + item.toString()}
            horizontal
            removeClippedSubviews={true}
            showsHorizontalScrollIndicator={false}
            style={{
              flexGrow: 0,
              height: 100,
              width: 300,
            }}
            contentContainerStyle={{
              alignItems: "center",
              gap: 0,
              paddingLeft: 300 / 2 - 30, // center the picker
              paddingRight: 300 / 2 - 30, // center the picker
            }}
            snapToInterval={60}
            decelerationRate="fast"
            ref={WeekPickerRef}
            onScroll={handleWeekScroll}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedWeek(item);
                  setShowWeekPicker(false);
                }}
                style={[
                  {
                    width: 40,
                    height: 40,
                    margin: 10,
                    borderRadius: 12,
                    borderCurve: "continuous",
                    backgroundColor: colors.background,
                    borderColor: colors.text + "22",
                    borderWidth: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  item === selectedWeek && {
                    backgroundColor: "#C54CB3",
                    boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.15)",
                  }
                ]}
              >
                <Text
                  style={{
                    color: item === selectedWeek ? "#FFF" : colors.text,
                    fontSize: 16,
                    fontFamily: item === selectedWeek ? "bold" : "medium",
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            )}
          />
        </Reanimated.View>
      )}

      <NativeHeaderSide side="Left" key={`header-left-hw:` + selectedMethod + ":" + showUndoneOnly}>
        <MenuView
          actions={[
            {
              title: t('Task_Sorting_Title'),
              subactions: sortingMethods.map((method, index) => ({
                title: method.label,
                id: "sort_" + index.toString(),
                state: (selectedMethod === index ? 'on' : 'off'),
                image: method.image ? method.image : undefined,
                imageColor: colors.text,
              })),

            },
            {
              title: t('Task_OnlyShowUndone'),
              id: 'only-undone',
              state: (showUndoneOnly ? 'on' : 'off'),
            }
          ]}
          onPressAction={({ nativeEvent }) => {
            if (nativeEvent.event === 'only-undone') {
              console.log("Toggling only undone");
              setShowUndoneOnly((prev) => !prev);
              console.log("Only undone is now", showUndoneOnly);
            }
            else if (nativeEvent.event.startsWith("sort_")) {
              const withoutSort = nativeEvent.event.replace("sort_", "")
              const selected = sortingMethods[parseInt(withoutSort)];
              if (selected) {
                setSelectedMethod(parseInt(withoutSort));
              }
            }
          }}
        >
          <NativeHeaderPressable>
            <Papicons name={"Filter"} color={"#C54CB3"} size={28} />
          </NativeHeaderPressable>
        </MenuView>
      </NativeHeaderSide>


      <NativeHeaderTitle key={`header-title:` + fullyScrolled + ":" + leftHomeworks + ":" + selectedWeek}>
        <NativeHeaderTopPressable layout={Animation(LinearTransition)} onPress={() => {
          toggleWeekPicker();
        }}>
          <Dynamic
            animated={true}
            style={{
              flexDirection: "column",
              alignItems: Platform.OS === 'android' ? "left" : "center",
              justifyContent: "center",
              gap: 4,
              width: 200,
              height: 60,
              marginTop: marginTop(),
            }}
          >
            <Dynamic animated style={{ flexDirection: "row", alignItems: "center", gap: (!runsIOS26 && fullyScrolled) ? 0 : 4, height: 30, marginBottom: -3 }}>
              <Dynamic animated>
                <Typography inline variant="navigation">{t('Tasks_Week')}</Typography>
              </Dynamic>
              <Dynamic animated style={{ marginTop: -3 }}>
                <NativeHeaderHighlight color="#C54CB3" light={!runsIOS26 && fullyScrolled}>
                  {selectedWeek.toString()}
                </NativeHeaderHighlight>
              </Dynamic>

              <Dynamic animated>
                <Papicons style={{ marginTop: -2 }} name={"ChevronDown"} color={colors.text} size={22} opacity={0.5} />
              </Dynamic>
            </Dynamic>
            {fullyScrolled && (
              <Reanimated.View
                style={{
                  width: 200,
                  alignItems: Platform.OS === 'android' ? "flex-start" : 'center',
                  marginTop: !runsIOS26 ? -4 : 0,
                }}
                key="tasks-visible" entering={PapillonAppearIn} exiting={PapillonAppearOut}>
                <Dynamic animated key={`tasks-visible:${leftHomeworks}`}>
                  <Typography inline variant={"body2"} style={{ color: "#C54CB3" }} align="center">
                    {statusText}
                  </Typography>
                </Dynamic>
              </Reanimated.View>
            )}
          </Dynamic>
        </NativeHeaderTopPressable>
      </NativeHeaderTitle>
      <NativeHeaderSide side="Right">
        <NativeHeaderPressable
          onPress={() => {
            Alert.alert("Ça arrive... ✨", "Cette fonctionnalité n'est pas encore disponible.")
          }}
        >
          <Papicons name={"Search"} color={"#C54CB3"} size={26} />
        </NativeHeaderPressable>
      </NativeHeaderSide>
    </>
  );
}