import { Papicons } from "@getpapillon/papicons";
import { useRoute, useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { t } from "i18next";
import React, { useState } from "react";

import ModalOverhead from "@/components/ModalOverhead";
import Homework from "@/database/models/Homework";
import { updateHomeworkIsDone } from "@/database/useHomework";
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

  const setAsDone = async (done: boolean) => {
    const manager = getManager();
    await manager.setHomeworkCompletion(task, done);

    const id = generateId(
      task.subject +
      task.content +
      task.createdByAccount +
      new Date(task.dueDate).toDateString()
    );

    updateHomeworkIsDone(id, done);
    setIsDone(done);
  }

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
            date={new Date(task.dueDate)}
            style={{
              marginVertical: 24
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
    </>
  );
};

export default Task;
