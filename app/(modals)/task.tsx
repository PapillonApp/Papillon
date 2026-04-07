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
import { formatHTML } from "@/utils/format/html";
import { generateId } from "@/utils/generateId";
import { getAttachmentIcon } from "@/utils/news/getAttachmentIcon";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

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

  const insets = useSafeAreaInsets();
  const finalHeaderHeight = Platform.select({
    android: insets.top + 32,
    default: 0
  });

  return (
    <>
      {Platform.OS !== "android" && (
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
      )}

      <List
        ListHeaderComponent={
          <ModalOverhead
            emoji={subjectInfo.emoji}
            subject={subjectInfo.name}
            subjectVariant="header"
            color={Platform.OS === "ios" ? subjectInfo.color : colors.primary}
            date={new Date(task.dueDate)}
            style={{
              marginVertical: 24,
              paddingTop: finalHeaderHeight,
            }}
          />
        }
        style={{
          backgroundColor: "transparent"
        }}
        contentContainerStyle={{
          padding: 16
        }}
      >
        {task.canComplete ?? (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Modal_Task_Status")}</List.Label>
            </List.SectionTitle>

            <List.Item>
              <List.Leading>
                <AnimatedPressable onPress={() => setAsDone(!isDone)}>
                  <Stack
                    backgroundColor={isDone ? (Platform.OS === "ios" ? subjectInfo.color : theme.colors.primary) : theme.colors.card}
                    card
                    radius={100}
                    width={28}
                    height={28}
                    vAlign="center"
                    hAlign="center"
                  >
                    {isDone &&
                        <Papicons name="check" size={22} color="white"/>
                    }
                  </Stack>
                </AnimatedPressable>
              </List.Leading>
              <Typography variant="title">
                {isDone ? t("Task_Done") : t("Task_Undone")}
              </Typography>
            </List.Item>
          </List.Section>
        )}

        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Modal_Task_Description")}</List.Label>
          </List.SectionTitle>

          <List.Item>
            <Typography>
              {formatHTML(task.content)}
            </Typography>
          </List.Item>
        </List.Section>

        {task.attachments.length > 0 && (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Modal_Task_Attachments")}</List.Label>
            </List.SectionTitle>

            {task.attachments.map((attachment) => (
              <List.Item onPress={() => WebBrowser.openBrowserAsync(attachment.url, {
                presentationStyle: "formSheet"
              })}>
                <List.Leading>
                  <Icon>
                    <Papicons name={getAttachmentIcon(attachment)}/>
                  </Icon>
                </List.Leading>
                <Typography variant="title" numberOfLines={1}>
                  {attachment.name || attachment.url}
                </Typography>
                <Typography variant="body1" color="textSecondary" numberOfLines={1}>
                  {attachment.url}
                </Typography>
              </List.Item>
            ))}
          </List.Section>
        )}
      </List>
    </>
  );
};

export default Task;
