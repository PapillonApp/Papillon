import React, { useCallback, useState } from "react";
import TabFlatList from "@/ui/components/TabFlatList";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { View } from "react-native";
import { CircularProgress } from "@/ui/components/CircularProgress";
import Stack from "@/ui/components/Stack";
import { useTheme } from "@react-navigation/native";
import { AlignCenter, CheckCheck, Search } from "lucide-react-native";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { Dynamic } from "@/ui/components/Dynamic";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { Animation } from "@/ui/utils/Animation";
import List from "@/ui/components/List";
import Item from "@/ui/components/Item";
import Task from "@/ui/components/Task";
import { t } from "i18next";

const mockHomework = [
  {
    homeworkId: 'hw-001',
    subjectId: 'math',
    subjectName: 'Mathématiques',
    title: 'Exercices 12 à 18 p.76',
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

  const [fullyScrolled, setFullyScrolled] = useState(false);

  const handleFullyScrolled = useCallback((isFullyScrolled: boolean) => {
    setFullyScrolled(isFullyScrolled);
  }, []);

  const [homework, setHomework] = useState(mockHomework);

  const onProgressChange = useCallback((index: number, newProgress: number) => {
    setHomework((prev) => {
      if (prev[index].progress === newProgress) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], progress: newProgress };
      return updated;
    });
  }, []);

  const leftHomeworks = React.useMemo(() => {
    return (homework.filter((h) => h.progress < 1).length);
  }, [homework]);

  const percentageComplete = React.useMemo(() => {
    return ((homework.length - leftHomeworks) / homework.length * 100);
  }, [homework]);

  const renderItem = useCallback(({ item, index }) => (
    <Task
      subject={item.subjectName}
      emoji={item.subjectEmoji}
      color={item.color}
      title={item.title}
      description={item.content}
      date={item.dueDate}
      progress={item.progress}
      onProgressChange={(newProgress) => onProgressChange(index, newProgress)}
    />
  ), [onProgressChange]);

  return (
    <>
      <TabFlatList
        backgroundColor={theme.dark ? "#2e0928" : "#F7E8F5"}
        foregroundColor="#9E0086"
        data={homework}
        onFullyScrolled={handleFullyScrolled}
        gap={16}
        header={(
          <Stack direction={"horizontal"} hAlign={"end"} style={{ padding: 20 }}>
            <Dynamic animated style={{ flex: 1 }} key={`left-homeworks:${leftHomeworks > 0 ? "undone" : "done"}`}>
              {leftHomeworks > 0 ? (
                <Stack direction={"vertical"} gap={2} style={{ flex: 1 }}>
                  <Dynamic animated key={`left-homeworks-count:${leftHomeworks}`}>
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
              )}
            </Dynamic>
            <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}>
              <CircularProgress
                backgroundColor={colors.text + "22"}
                percentageComplete={percentageComplete}
                radius={35}
                strokeWidth={7}
                fill={"#C54CB3"}
              />
            </View>
          </Stack>
        )}
        renderItem={renderItem}
        keyExtractor={(item) => item.homeworkId}
      />

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable
          onPress={() => {
            console.log("Add new grade pressed");
          }}
        >
          <AlignCenter color={colors.text} />
        </NativeHeaderPressable>
      </NativeHeaderSide>
      <NativeHeaderTitle ignoreTouch key={`header-title:` + fullyScrolled + ":" + leftHomeworks}>
        <NativeHeaderTopPressable layout={Animation(LinearTransition)}>
          <Dynamic
            animated={true}
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              width: 200,
              height: 60,
              marginTop: fullyScrolled ? 6 : 0,
            }}
          >
            <Dynamic animated style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 30, marginBottom: -3 }}>
              <Dynamic animated>
                <Typography inline variant="navigation">Semaine</Typography>
              </Dynamic>
              <Dynamic animated style={{ marginTop: -3 }}>
                <NativeHeaderHighlight color="#C54CB3">
                  16
                </NativeHeaderHighlight>
              </Dynamic>
            </Dynamic>
            {fullyScrolled && (
              <Reanimated.View
                style={{
                  width: 200,
                  alignItems: 'center',
                }}
                key="tasks-visible" entering={PapillonAppearIn} exiting={PapillonAppearOut}>
                <Dynamic animated key={`tasks-visible:${leftHomeworks}`}>
                  <Typography inline variant={"body2"} style={{ color: "#C54CB3" }} align="center">
                    {leftHomeworks > 1 ?
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