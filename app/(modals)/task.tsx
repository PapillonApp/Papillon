import { Papicons } from "@getpapillon/papicons";
import { useRoute, useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "i18next";
import React, { useMemo, useRef, useState } from "react";
import HTMLView from "react-native-htmlview";
import { Alert, Platform, StyleSheet } from "react-native";

import ModalOverhead from "@/components/ModalOverhead";
import { updateHomeworkIsDone } from "@/database/useHomework";
import { isEDAttachmentRebuildError } from "@/services/ecoledirecte/attachments";
import { Attachment, AttachmentType } from "@/services/shared/attachment";
import { getManager } from "@/services/shared";
import { Homework } from "@/services/shared/homework";
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import { formatHTML } from "@/utils/format/html";
import {
  getHomeworkCacheId,
  getHomeworkSections,
} from "@/utils/homework";
import { getAttachmentIcon } from "@/utils/news/getAttachmentIcon";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { warn } from "@/utils/logger/logger";
import { openAttachment } from "@/utils/attachments/openAttachment";
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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const statusUpdateInFlight = useRef(false);
  const [showRawHTML, setShowRawHTML] = useState(false);
  const [openingAttachmentId, setOpeningAttachmentId] = useState<string | null>(null);
  const sections = useMemo(() => getHomeworkSections(task), [task]);
  const stylesheet = useMemo(
    () =>
      StyleSheet.create({
        p: {
          color: colors.text,
          fontSize: 16,
          lineHeight: 22,
        },
        div: {
          color: colors.text,
          fontSize: 16,
          lineHeight: 22,
        },
        a: {
          color: colors.primary,
          textDecorationLine: "underline",
        },
        ul: {
          color: colors.text,
          fontSize: 16,
          lineHeight: 22,
          paddingHorizontal: 4,
        },
      }),
    [colors.primary, colors.text]
  );

  const setAsDone = async (done: boolean) => {
    if (task.supportsCompletion === false || statusUpdateInFlight.current) {
      return;
    }

    statusUpdateInFlight.current = true;
    setIsUpdatingStatus(true);

    try {
      const manager = getManager();
      await manager.setHomeworkCompletion(task, done);
      await updateHomeworkIsDone(getHomeworkCacheId(task), done);
      setIsDone(done);
    } catch (error) {
      warn(String(error));
    } finally {
      statusUpdateInFlight.current = false;
      setIsUpdatingStatus(false);
    }
  }

  const openTaskAttachment = async (attachment: Attachment) => {
    const attachmentId = [
      attachment.metadata?.reference ?? attachment.url,
      attachment.metadata?.role ?? "attachment",
    ].join(":");

    if (openingAttachmentId) {
      return;
    }

    setOpeningAttachmentId(attachmentId);
    try {
      await openAttachment(attachment);
    } catch (error) {
      warn(String(error));
      if (isEDAttachmentRebuildError(error)) {
        Alert.alert(
          t("Attachment_Open_Rebuild_Title"),
          t("Attachment_Open_Rebuild_Description")
        );
        return;
      }

      Alert.alert(
        t("Attachment_Open_Error_Title"),
        t("Attachment_Open_Error_Description")
      );
    } finally {
      setOpeningAttachmentId((currentId) =>
        currentId === attachmentId ? null : currentId
      );
    }
  };

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

          <List.Item
            onPress={task.supportsCompletion !== false && !isUpdatingStatus
              ? () => {
                void setAsDone(!isDone);
              }
              : undefined}
          >
            <List.Leading>
              <Stack
                backgroundColor={isDone ? (Platform.OS === 'ios' ? subjectInfo.color : theme.colors.primary) : theme.colors.card}
                card
                radius={100}
                width={28}
                height={28}
                vAlign="center"
                hAlign="center"
                style={{ opacity: task.supportsCompletion === false ? 0.45 : 1 }}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator size={14} strokeWidth={2} color={isDone ? "#FFFFFF" : (Platform.OS === 'ios' ? subjectInfo.color : theme.colors.primary)} />
                ) : isDone ? (
                  <Papicons name="check" size={22} color="white" />
                ) : null}
              </Stack>
            </List.Leading>
            <Typography variant="title">
              {task.supportsCompletion === false
                ? "Contenu de seance"
                : isDone
                  ? t("Task_Done")
                  : t("Task_Undone")}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {task.supportsCompletion === false
                ? "Cette entree provient uniquement du contenu de seance et ne peut pas etre cochee."
                : isUpdatingStatus
                  ? "Mise a jour en cours..."
                  : "Touchez pour changer l'etat du devoir."}
            </Typography>
          </List.Item>
        </List.Section>

        {sections.map((section) => (
          <List.Section key={section.key}>
            <List.SectionTitle>
              <List.Label>
                {section.key === "work" ? "Travail a faire" : "Contenu de seance"}
              </List.Label>
            </List.SectionTitle>

            {section.content.trim().length > 0 && (
              <List.Item>
                {showRawHTML ? (
                  <HTMLView
                    value={section.content}
                    stylesheet={stylesheet}
                    style={{ gap: 12 }}
                    paragraphBreak=""
                    bullet="  •  "
                  />
                ) : (
                  <Typography>
                    {formatHTML(section.content)}
                  </Typography>
                )}
              </List.Item>
            )}

            {section.attachments.map((attachment) => {
              const attachmentId = [
                attachment.metadata?.reference ?? attachment.url,
                attachment.metadata?.role ?? "attachment",
              ].join(":");

              return (
                <List.Item
                  key={attachmentId}
                  onPress={() => openTaskAttachment(attachment)}
                >
                  <List.Leading>
                    <Icon>
                      <Papicons name={getAttachmentIcon(attachment)} />
                    </Icon>
                  </List.Leading>
                  <Typography variant="title" numberOfLines={1}>
                    {attachment.name || attachment.url}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" numberOfLines={1}>
                    {openingAttachmentId === attachmentId
                      ? "Ouverture..."
                    : getTaskAttachmentSubtitle(attachment)}
                  </Typography>
                </List.Item>
              );
            })}
          </List.Section>
        ))}

        {sections.some((section) => section.content.trim().length > 0) && (
          <List.Section>
            <List.Item onPress={() => setShowRawHTML((current) => !current)}>
              <Typography variant="body1" color="textSecondary">
                Le message ne s'affiche pas correctement ?
              </Typography>
              <Typography variant="title">
                {showRawHTML ? "Revenir au rendu normal" : "Afficher le HTML brut"}
              </Typography>
            </List.Item>
          </List.Section>
        )}
      </List>
    </>
  );
};

export default Task;

function getTaskAttachmentSubtitle(attachment: Attachment): string {
  if (attachment.metadata?.provider === "ecoledirecte") {
    return "Piece jointe EcoleDirecte";
  }

  if (attachment.type === AttachmentType.LINK) {
    return getAttachmentHostname(attachment.url) ?? "Lien";
  }

  return getAttachmentHostname(attachment.url) ?? "Piece jointe";
}

function getAttachmentHostname(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
