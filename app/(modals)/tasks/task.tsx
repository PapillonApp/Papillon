import { Papicons } from "@getpapillon/papicons";
import { useRoute, useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { t } from "i18next";
import React, { useState } from "react";

import ModalOverhead from "@/components/ModalOverhead";
import { Homework, Homework as SharedHomework } from "@/services/shared/homework";
import { getManager } from "@/services/shared";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import TableFlatList from "@/ui/components/TableFlatList";
import { formatHTML } from "@/utils/format/html";
import { generateId } from "@/utils/generateId";
import { getAttachmentIcon } from "@/utils/news/getAttachmentIcon";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import adjust from "@/utils/adjustColor";
import { router } from "expo-router";
import { MenuView } from "@react-native-menu/menu";
import { useHomeworkActionsStore } from "@/app/(tabs)/tasks/hooks/useHomeworkData";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Task = () => {
  const { params } = useRoute();
  const theme = useTheme();
  const colors = theme.colors;

  const { task } = params as { task: Homework };

  const subjectInfo = {
    color: getSubjectColor(task.subject),
    emoji: getSubjectEmoji(task.subject),
    name: getSubjectName(task.subject)
  }

  const [isDone, setIsDone] = useState(task.isDone);

  const deleteHomework = useHomeworkActionsStore(s => s.onDelete);

  const setAsDone = async (done: boolean) => {
    const manager = getManager();
    if (!task.custom) {
      await manager.setHomeworkCompletion((task as unknown as SharedHomework), done);
    }

    const id = generateId(
      task.subject +
      task.content +
      task.createdByAccount +
      new Date(task.dueDate).toDateString()
    );

    updateHomeworkIsDone(id, done);
    setIsDone(done);
  }

  const insets = useSafeAreaInsets();
  const finalHeaderHeight = Platform.select({
    android: insets.top + 32,
    default: 0
  });

  return (
    <>
      <LinearGradient
        colors={[subjectInfo.color, colors.background]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          width: "100%",
          zIndex: -9,
          opacity: 0.4
        }}
      />
      <TableFlatList
        ListHeaderComponent={
          <ModalOverhead
            emoji={subjectInfo.emoji}
            subject={subjectInfo.name}
            subjectVariant="header"
            color={subjectInfo.color}
            custom={task.custom}
            date={new Date(task.dueDate)}
            style={{
              marginVertical: 24,
              paddingTop: finalHeaderHeight,
            }}
          />
        }
        sections={[
          {
            title: t("Modal_Task_Status"),
            icon: <Papicons name="Check" />,
            items: [
              {
                title: isDone ? t("Task_Done") : t("Task_Undone"),
                leading:
                  <AnimatedPressable onPress={() => setAsDone(!isDone)}>
                    <Stack
                      backgroundColor={isDone ? subjectInfo.color : undefined}
                      card
                      radius={100}
                      width={28}
                      height={28}
                      vAlign="center"
                      hAlign="center"
                    >
                      {isDone &&
                        <Papicons name="check" size={22} color="white" />
                      }
                    </Stack>
                  </AnimatedPressable>
              }
            ]
          },
          {
            title: t("Modal_Task_Description"),
            icon: <Papicons name="List" />,
            items: [
              {
                title: formatHTML(task.content),
                titleProps: {
                  variant: "title",
                  weight: "medium"
                }
              }
            ]
          },
          task.attachments.length > 0 ? {
            title: t("Modal_Task_Attachments"),
            icon: <Papicons name="Link" />,
            items: task.attachments.map((attachment) => ({
              title: attachment.name || attachment.url,
              titleProps: {
                nowrap: true
              },
              description: attachment.url,
              descriptionProps: {
                nowrap: true
              },
              leading: <Icon><Papicons name={getAttachmentIcon(attachment)} /></Icon>,
              onPress: () => WebBrowser.openBrowserAsync(attachment.url, {
                presentationStyle: "formSheet"
              })
            }))
          } : null
        ]}
        style={{
          backgroundColor: "transparent"
        }}
      />
      <MenuView
        onPressAction={async ({ nativeEvent }) => {
          const actionId = nativeEvent.event;
          if (actionId === "homework-delete") {
            deleteHomework!(task)
            router.back();
          } else if (actionId === "homework-edit") {
            router.push({
              pathname: "/(modals)/tasks/custom",
              params: {
                action: "edit",
                id: generateId(task.subject + task.content + task.createdByAccount + task.dueDate.toDateString()),
                subject: task.subject,
                done: task.isDone ? 1 : 0,
                description: task.content,
                date: task.dueDate.getTime()
              }
            })
          }
        }}
        style={{
          position: "absolute",
          right: 20,
          top: 20
        }}
        actions={[
          {
            id: "homework-edit",
            title: "Modifier ce devoir",
            imageColor: "#000000",
            image: Platform.select({
              ios: "paintbrush.fill"
            }),
          },
          {
            id: "homework-delete",
            title: "Supprimer ce devoir",
            imageColor: "#FF0000",
            image: Platform.select({
              ios: "trash.fill"
            }),
            attributes: { "destructive": true }
          }
        ]}>
      <AnimatedPressable
        >
          <Stack
            card
            style={{
              width: 42,
              height: 42,
              borderRadius: 30,
            }}
            hAlign='center'
            vAlign='center'
            noShadow
            backgroundColor='#FFFFFF50'
          >
            <Icon size={26} fill={adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)}>
              <Papicons name="Gears" />
            </Icon>
          </Stack>
        </AnimatedPressable>
        </MenuView>
    </>
  );
};

export default Task;
