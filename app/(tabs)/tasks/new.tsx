import React, { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { useTranslation } from "react-i18next";

import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import Typography from "@/ui/new/Typography";
import TaskDateInput from "./components/TaskDateInput";
import { requestSystemNotificationPermission } from "@/utils/notifications";
import type { NotificationPreferences } from "@/stores/settings/types";

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(23, 59, 0, 0);
  return date;
};

export default function NewTaskScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const mutateSettings = useSettingsStore(state => state.mutateProperty);
  const subjectsSetting = useSettingsStore(state => state.personalization.customHomeworkSubjects);
  const subjects = useMemo(() => subjectsSetting ?? [], [subjectsSetting]);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const [subject, setSubject] = useState(subjects[0] ?? "");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState(tomorrow);
  const [reminderTime, setReminderTime] = useState(() => {
    const date = new Date();
    date.setHours(19, 0, 0, 0);
    return date;
  });
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const save = async () => {
    const cleanSubject = subject.trim();
    const cleanContent = content.trim();
    if (!cleanSubject || !cleanContent) return;

    const id = `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    let canSetReminder = reminderEnabled;
    if (canSetReminder) {
      const granted = await requestSystemNotificationPermission();
      if (!granted) {
        canSetReminder = false;
        Alert.alert("Rappel désactivé", "Le devoir sera ajouté sans rappel. Tu peux autoriser les notifications dans les réglages.");
      } else {
        const personalization = useSettingsStore.getState().personalization;
        const currentPreferences: NotificationPreferences = {
          enabled: false,
          courses: true,
          homework: true,
          grades: false,
          news: false,
          dailyTime: "19:00",
          ...personalization.notificationPreferences,
        };
        mutateSettings("personalization", {
          notificationPreferences: {
            ...currentPreferences,
            enabled: true,
            homework: true,
            ...(currentPreferences.enabled ? {} : { courses: false }),
          },
        });
      }
    }
    const reminderAt = new Date(dueDate);
    reminderAt.setDate(reminderAt.getDate() - 1);
    reminderAt.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
    const current = useSettingsStore.getState().personalization.customHomeworks ?? [];

    mutateSettings("personalization", {
      customHomeworks: [
        ...current,
        {
          id,
          subject: cleanSubject,
          content: cleanContent,
          dueDate: dueDate.toISOString(),
          isDone: false,
          createdByAccount: lastUsedAccount ?? "local",
          reminderAt: canSetReminder ? reminderAt.toISOString() : undefined,
        },
      ],
    });
    router.back();
  };

  const fieldStyle = {
    color: colors.text,
    backgroundColor: colors.item,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  } as const;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.overground }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, maxWidth: 760, width: "100%", alignSelf: "center" }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 8 }}>
          <Typography variant="title">{t("Tasks_Custom_Subject", "Matière")}</Typography>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder={t("Tasks_Custom_Subject_Placeholder", "Ex. Mathématiques")}
            placeholderTextColor={colors.text + "80"}
            style={fieldStyle}
          />
          {subjects.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {subjects.map(item => (
                <Pressable key={item} onPress={() => setSubject(item)} style={{ backgroundColor: subject === item ? colors.primary : colors.item, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 }}>
                  <Typography color={subject === item ? "white" : "textPrimary"}>{item}</Typography>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <Pressable onPress={() => router.push("/(settings)/homework_subjects")}>
            <Typography color="primary">{t("Tasks_Custom_Manage_Subjects", "Ajouter ou modifier mes matières")}</Typography>
          </Pressable>
        </View>

        <View style={{ gap: 8 }}>
          <Typography variant="title">{t("Tasks_Custom_Description", "Devoir")}</Typography>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder={t("Tasks_Custom_Description_Placeholder", "Décris ce que tu dois faire…")}
            placeholderTextColor={colors.text + "80"}
            multiline
            textAlignVertical="top"
            style={[fieldStyle, { minHeight: 120 }]}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Typography variant="title">{t("Tasks_Custom_DueDate", "À rendre le")}</Typography>
          <TaskDateInput value={dueDate} mode="date" onChange={setDueDate} />
        </View>

        <View style={{ gap: 10, backgroundColor: colors.item, borderRadius: 16, padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Typography variant="title">{t("Tasks_Custom_Reminder", "Me rappeler la veille")}</Typography>
              <Typography variant="body2" color="textSecondary">{t("Tasks_Custom_Reminder_Description", "Le rappel utilise les notifications système.")}</Typography>
            </View>
            <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
          </View>
          {reminderEnabled && <TaskDateInput value={reminderTime} mode="time" onChange={setReminderTime} />}
        </View>

        <Pressable
          onPress={save}
          disabled={!subject.trim() || !content.trim()}
          style={{ alignItems: "center", backgroundColor: colors.primary, opacity: subject.trim() && content.trim() ? 1 : 0.5, padding: 15, borderRadius: 18 }}
        >
          <Typography variant="title" color="white">{t("Tasks_Custom_Save", "Ajouter le devoir")}</Typography>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
