import { Papicons } from "@getpapillon/papicons";
import { Link, useRoute, useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { t } from "i18next";
import React, { useMemo, useState } from "react";

import ModalOverhead from "@/components/ModalOverhead";
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
import { Platform, Image, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { Homework } from "@/services/shared/homework";
import Button from "@/ui/new/Button";
import { canOpenURL, openURL } from "expo-linking"

const RandomSkeleton = ({ count = 14, maxWidth = 80, minWidth = 20 }) => {
  const { colors } = useTheme();
  const items = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => ({
      id: index,
      width: Math.floor(Math.random() * (maxWidth - minWidth)) + minWidth,
    }));
  }, [count, maxWidth, minWidth]);

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View 
          key={item.id} 
          style={[styles.bar, { width: item.width, backgroundColor: colors.border }]} 
        />
      ))}
    </View>
  );
};

const CardStack = ({ count = 3, title, backgroundColor, emoji }: {count?: number, title: string, backgroundColor: string, emoji: string}) => {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.cardContainer,
        { borderColor: colors.border, backgroundColor: backgroundColor + 30 }
      ]}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.card,
            { 
              zIndex: index,
              backgroundColor: colors.background,
              borderColor: colors.text + 20,
              transform: `rotate(${4*index}deg)`,
              marginLeft: index === 0 ? 0 : -170,
              opacity: 1 - ((2 - index) * 0.2)
            }
          ]}
        >
          <Typography variant="h2" align="center">
            {emoji}
          </Typography>
          <Typography variant="body1" weight="semibold" align="center" style={{ marginTop: -6, lineHeight: 18, overflow: "visible" }}>
            {title}
          </Typography>
          <RandomSkeleton count={20} maxWidth={60} />
        </View>
      ))}
    </View>
  )
}

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
      {Platform.OS !== 'android' && (
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
            color={Platform.OS === 'ios' ? subjectInfo.color : colors.primary}
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
        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Modal_Task_Status")}</List.Label>
          </List.SectionTitle>

          <List.Item>
            <List.Leading>
              <AnimatedPressable onPress={() => setAsDone(!isDone)}>
                <Stack
                  backgroundColor={isDone ? (Platform.OS === 'ios' ? subjectInfo.color : theme.colors.primary) : theme.colors.card}
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
            </List.Leading>
            <Typography variant="title">
              {isDone ? t("Task_Done") : t("Task_Undone")}
            </Typography>
          </List.Item>
        </List.Section>

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
                    <Papicons name={getAttachmentIcon(attachment)} />
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
        <List.Section>
          <List.SectionTitle>
            <Stack direction="horizontal" hAlign="center" gap={12} style={{ marginTop: 6 }}>
              <Image
                source={require("@/assets/images/knowunity.png")}
                style={{ width: 30, height: 30 }}
              />
              <Stack gap={0}>
                <Typography variant="body1" weight="bold">Fiches de révision pour t’aider</Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginTop: -2 }}>
                  avec Knowunity
                </Typography>
              </Stack>
            </Stack>
          </List.SectionTitle>
          <List.Item>
            <Stack gap={16} style={{ marginBottom: 6 }}>
              <CardStack backgroundColor={subjectInfo.color} title={subjectInfo.name} emoji={subjectInfo.emoji} />
              <Typography variant="body1">Accède a des centaines de fiches pour t’aider en {subjectInfo.name} sur Knowunity</Typography>
              <Button
                fullWidth
                color={subjectInfo.color}
                label="Découvrir les fiches"
                onPress={async () => {
                  const URL = "https://knowunity.fr/papillon?text=" + task.content
                  const isValid = await canOpenURL(URL);

                  if (isValid) {
                    await openURL("https://knowunity.fr/papillon?text=" + task.content);
                  }
                }}
                />
            </Stack>
          </List.Item>
        </List.Section>
      </List>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    flexWrap: "wrap",
  },
  bar: {
    height: 9,
    borderRadius: 3,
  },
  cardContainer: { 
    justifyContent: "center",
    paddingTop: 35,
    alignItems: "center",
    width: "100%",
    height: 148,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  card: { 
    gap: 10, 
    padding: 15, 
    width: 200, 
    height: 150, 
    borderTopLeftRadius: 8, 
    borderTopRightRadius: 8, 
    borderWidth: 1, 
  }
});
export default Task;


