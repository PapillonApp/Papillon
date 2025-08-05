import React, { useCallback, useMemo, useState, useRef } from "react";
import TabFlatList from "@/ui/components/TabFlatList";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { FlatList, View, Text, Pressable, Platform, useWindowDimensions } from "react-native";
import { CircularProgress } from "@/ui/components/CircularProgress";
import Stack from "@/ui/components/Stack";
import { useTheme } from "@react-navigation/native";
import { AlignCenter, CheckCheck, Search, SquareDashed } from "lucide-react-native";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { Dynamic } from "@/ui/components/Dynamic";
import { PapillonAppearIn, PapillonAppearOut, PapillonZoomIn } from "@/ui/utils/Transition";
import Reanimated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { Animation } from "@/ui/utils/Animation";
import Task from "@/ui/components/Task";
import { t } from "i18next";
import { useHeaderHeight } from "@react-navigation/elements";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";

const mockHomework = [
  {
    homeworkId: 'hw-001',
    subjectId: 'math',
    subjectName: 'Mathématiques',
    subjectEmoji: '📚',
    title: 'Exercices de mathématiques',
    content: 'Faire les exercices 1, 2 et 3 de la page 200 et voir les infos sur beaucoup d’infos il faut resumer',
    dueDate: 1721606400000, // timestamp
    isDone: false,
    returnFormat: 1,
    attachments: 'math_exercices.pdf',
    evaluation: false,
    custom: false,
    color: '#558000',
    progress: 0, // 0% completed
  },
  {
    homeworkId: 'hw-002',
    subjectId: 'eng',
    subjectEmoji: '🇬🇧',
    subjectName: 'Anglais',
    title: 'Essay: "The impact of technology on youth"',
    content: 'Write a 500-word essay discussing the impact of technology on youth culture and education.',
    dueDate: 1721692800000,
    isDone: true,
    returnFormat: 2,
    attachments: '',
    evaluation: true,
    custom: false,
    color: '#1869b5',
    progress: 0.85, // 85% completed
  },
  {
    homeworkId: 'hw-003',
    subjectId: 'cs',
    subjectEmoji: '💻',
    subjectName: 'Informatique',
    title: 'Build a to-do app with React',
    content: 'Create a simple to-do application using React. Include features like adding, deleting, and marking tasks as complete.',
    dueDate: 1721865600000,
    isDone: false,
    returnFormat: 0,
    evaluation: true,
    custom: true,
    color: '#804f00',
    progress: 1, // 100% completed
  },
  {
    homeworkId: 'hw-004',
    subjectId: 'history',
    subjectName: 'Histoire',
    subjectEmoji: '📜',
    title: 'Read chapter 4 + summary',
    content: 'Read chapter 4 of the textbook and write a summary of the key points discussed.',
    dueDate: 1721952000000,
    isDone: false,
    returnFormat: 1,
    attachments: 'chapter4.pdf',
    evaluation: false,
    custom: false,
    color: '#800060',
    progress: 0.5, // 50% completed
  },
  {
    homeworkId: 'hw-005',
    subjectId: 'science',
    subjectName: 'Sciences',
    subjectEmoji: '🔬',
    title: 'Group project: Ecosystem poster',
    content: 'Work in groups to create a poster about a specific ecosystem. Include information about flora, fauna, and environmental issues.',
    dueDate: 1722124800000,
    isDone: true,
    returnFormat: 2,
    evaluation: true,
    custom: true,
    color: '#008042',
    progress: 0.75, // 75% completed
  },
];


export default function TabOneScreen() {
  const theme = useTheme();
  const colors = theme.colors;
  const headerHeight = useHeaderHeight();
  const windowDimensions = useWindowDimensions();

  const [fullyScrolled, setFullyScrolled] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(16);

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);

  const [homework, setHomework] = useState({
    16: mockHomework,
  });

  const currentHomework = React.useMemo(() => {
    return homework[selectedWeek] || [];
  }, [homework, selectedWeek]);

  const onProgressChange = useCallback((index: number, newProgress: number) => {
    setHomework((prev) => {
      if (prev[selectedWeek][index].progress === newProgress) { return prev; }
      const updated = [...prev[selectedWeek]];
      updated[index] = { ...updated[index], progress: newProgress };
      return { ...prev, [selectedWeek]: updated };
    });
  }, [selectedWeek]);

  const lengthHomeworks = React.useMemo(() => {
    return currentHomework.length;
  }, [currentHomework]);

  const leftHomeworks = React.useMemo(() => {
    return (currentHomework.filter((h) => h.progress < 1).length);
  }, [currentHomework]);

  const percentageComplete = React.useMemo(() => {
    return ((lengthHomeworks - leftHomeworks) / lengthHomeworks * 100);
  }, [lengthHomeworks, leftHomeworks]);

  type HomeworkItem = typeof mockHomework[number];

  const renderItem = useCallback(({ item, index }: { item: HomeworkItem; index: number }) => (
    <Task
      subject={item.subjectName}
      emoji={item.subjectEmoji}
      color={item.color}
      title={item.title}
      description={item.content}
      date={new Date(item.dueDate)}
      progress={item.progress}
      index={index}
      onProgressChange={(newProgress: number) => onProgressChange(index, newProgress)}
    />
  ), [onProgressChange]);

  const keyExtractor = useCallback((item: HomeworkItem) => item.homeworkId, []);

  const memoizedData = useMemo(() => currentHomework, [currentHomework]);

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

  return (
    <>
      <TabFlatList
        radius={36}
        waitForInitialLayout
        backgroundColor={theme.dark ? "#2e0928" : "#F7E8F5"}
        foregroundColor="#9E0086"
        pattern="checks"
        data={memoizedData}
        initialNumToRender={2}
        recycleItems={true}
        estimatedItemSize={212}
        numColumns={windowDimensions.width > 1050 ? 3 : windowDimensions.width < 800 ? 1 : 2}
        onFullyScrolled={handleFullyScrolled}
        itemLayoutAnimation={LinearTransition}
        gap={16}
        header={(
          <Stack direction={"horizontal"} hAlign={"end"} style={{ padding: 20 }}>
            <Dynamic animated style={{ flex: 1 }} key={`left-homeworks:${leftHomeworks > 0 ? "undone" : "done"}`}>
              {lengthHomeworks === 0 ? (
                <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
                  <SquareDashed color={"#C54CB3"} size={36} strokeWidth={2.5} style={{ marginBottom: 4 }} />
                  <Typography inline variant={"title"} color={"secondary"} style={{ lineHeight: 19 }}>
                    {t('Tasks_NoTasks_Title')} {"\n"}{t('Tasks_NoTasks_ForWeek', { week: selectedWeek })}
                  </Typography>
                </Stack>
              ) : (leftHomeworks > 0 ? (
                <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
                  <Dynamic animated key={`left-homeworks-count:${leftHomeworks}`} entering={PapillonZoomIn} exiting={PapillonAppearOut}>
                    <Typography inline variant={"h1"} style={{ fontSize: 36, marginBottom: 4 }} color={"#C54CB3"}>
                      {leftHomeworks}
                    </Typography>
                  </Dynamic>
                  <Typography inline variant={"title"} color={"secondary"} style={{ lineHeight: 19 }}>
                    {t('Tasks_LeftHomeworks_Title')} {"\n"}{t('Tasks_LeftHomeworks_Time')}
                  </Typography>
                </Stack>
              ) : (
                <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
                  <CheckCheck color={"#C54CB3"} size={36} strokeWidth={2.5} style={{ marginBottom: 4 }} />
                  <Typography inline variant={"title"} color={"secondary"} style={{ lineHeight: 19 }}>
                    {t('Tasks_Done_AllTasks')} {"\n"}{t('Tasks_Done_CompletedTasks')}
                  </Typography>
                </Stack>
              ))}
            </Dynamic>
            <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }} key={`circular-progress-week-ct:${selectedWeek}`}>
              <CircularProgress
                backgroundColor={colors.text + "22"}
                percentageComplete={lengthHomeworks === 0 ? 0 : percentageComplete}
                radius={35}
                strokeWidth={7}
                fill={"#C54CB3"}
              />
            </View>
          </Stack>
        )}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />

      {!runsIOS26() && fullyScrolled && (
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

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable
          onPress={() => {
            console.log("Add new grade pressed");
          }}
        >
          <AlignCenter color={colors.text} />
        </NativeHeaderPressable>
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
              marginTop: runsIOS26() ? fullyScrolled ? 6 : 0 : Platform.OS === 'ios' ? -4 : -2,
            }}
          >
            <Dynamic animated style={{ flexDirection: "row", alignItems: "center", gap: (!runsIOS26() && fullyScrolled) ? 0 : 4, height: 30, marginBottom: -3 }}>
              <Dynamic animated>
                <Typography inline variant="navigation">{t('Tasks_Week')}</Typography>
              </Dynamic>
              <Dynamic animated style={{ marginTop: -3 }}>
                <NativeHeaderHighlight color="#C54CB3" light={!runsIOS26() && fullyScrolled}>
                  {selectedWeek.toString()}
                </NativeHeaderHighlight>
              </Dynamic>
            </Dynamic>
            {fullyScrolled && (
              <Reanimated.View
                style={{
                  width: 200,
                  alignItems: Platform.OS === 'android' ? "left" : 'center',
                  marginTop: !runsIOS26() ? -4 : 0,
                }}
                key="tasks-visible" entering={PapillonAppearIn} exiting={PapillonAppearOut}>
                <Dynamic animated key={`tasks-visible:${leftHomeworks}`}>
                  <Typography inline variant={"body2"} style={{ color: "#C54CB3" }} align="center">
                    {lengthHomeworks === 0 ?
                      t('Tasks_NoTasks_Nav') :
                      leftHomeworks > 1 ?
                        t('Tasks_Nav_Left', { count: leftHomeworks }) :
                        leftHomeworks === 1 ?
                          t('Tasks_Nav_One') :
                          t('Tasks_Nav_Completed')
                    }
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
            console.log("Add new grade pressed");
          }}
        >
          <Search color={colors.text} />
        </NativeHeaderPressable>
      </NativeHeaderSide>
    </>
  );
}