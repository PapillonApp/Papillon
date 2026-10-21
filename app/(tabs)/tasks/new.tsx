import { Papicons } from "@getpapillon/papicons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import * as Localization from "expo-localization";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";

import { AndroidHeaderButton } from "@/components/AndroidHeaderItems";
import {
  addHomeworkToDatabase,
  deleteHomeworkFromDatabase,
  getHomeworkById,
  getHomeworkRouteId,
} from "@/database/useHomework";
import { Homework } from "@/services/shared/homework";
import { useAccountStore } from "@/stores/account";
import ActionMenu from "@/ui/components/ActionMenu";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { useFont } from "@/utils/theme/fonts";

const locale = Localization.getLocales()[0].languageTag;
const NewTask = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const font = useFont();

  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);
  const account = accounts.find(a => a.id === lastUsedAccount);

  const subjects = Object.entries(account?.customisation?.subjects ?? {})
    .map(([key, value]) => ({ ...value, id: key }))
    .filter(item => item.name && item.emoji && item.color);

  const [subjectId, setSubjectId] = useState(subjects[0]?.id);
  const [dueDate, setDueDate] = useState(new Date());
  const [content, setContent] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    getHomeworkById(id).then(task => {
      if (!task) return;
      setSubjectId(task.subject);
      setDueDate(new Date(task.dueDate));
      setContent(task.content);
      setIsDone(task.isDone);
    });
  }, [id]);

  const subject = subjects.find(s => s.id === subjectId);
  const canSave = Boolean(account && subject && content.trim());

  const save = async () => {
    if (!account || !subject || !content.trim()) return;

    const homework: Homework = {
      id: "",
      subject: subject.id,
      content: content.trim(),
      dueDate,
      isDone,
      attachments: [],
      evaluation: false,
      custom: true,
      createdByAccount: account.id,
    };
    homework.id = getHomeworkRouteId(homework);

    await addHomeworkToDatabase([homework]);
    if (id && id !== homework.id) {
      await deleteHomeworkFromDatabase(id);
    }
    router.dismissTo("/tasks");
  };

  const openAndroidDatePicker = () =>
    DateTimePickerAndroid.open({
      value: dueDate,
      mode: "date",
      design: "material",
      onChange: (_, date) => date && setDueDate(date),
    });

  return (
    <>
      {Platform.OS === "android" ? (
        <Stack.Toolbar placement="right" asChild>
          <AndroidHeaderButton
            icon={<Papicons name="Check" size={24} color={String(canSave ? colors.primary : colors.border)} />}
            accessibilityLabel={t("Task_Save")}
            onPress={save}
          />
        </Stack.Toolbar>
      ) : (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="checkmark" disabled={!canSave} onPress={save} />
        </Stack.Toolbar>
      )}

      <List
        contentInsetAdjustmentBehavior="automatic"
        safeHorizontalPadding={16}
        contentContainerStyle={{ paddingVertical: 16 }}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <List.Section>
          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Chair" />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Task_New_Subject")}</Typography>
            <List.Trailing>
              {subjects.length > 0 ? (
                <ActionMenu
                  actions={subjects.map(s => ({
                    id: s.id,
                    title: `${s.emoji} ${s.name}`,
                    state: s.id === subjectId ? "on" : "off",
                  }))}
                  onPressAction={({ nativeEvent }) => setSubjectId(nativeEvent.event)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Typography variant="body1" color="primary" numberOfLines={1}>
                      {subject ? `${subject.emoji} ${subject.name}` : "-"}
                    </Typography>
                    <Papicons name="ChevronDown" size={18} color={String(colors.primary)} />
                  </View>
                </ActionMenu>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  {t("Task_New_NoSubject")}
                </Typography>
              )}
            </List.Trailing>
          </List.Item>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Calendar" />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Task_New_DueDate")}</Typography>
            <List.Trailing>
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="compact"
                  accentColor={String(colors.primary)}
                  locale={locale}
                  onChange={(_, date) => date && setDueDate(date)}
                />
              ) : (
                <Pressable onPress={openAndroidDatePicker}>
                  <Typography variant="body1" color="primary">
                    {dueDate.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}
                  </Typography>
                </Pressable>
              )}
            </List.Trailing>
          </List.Item>
        </List.Section>

        <List.Section>
          <List.Item>
            <TextInput
              placeholder={t("Task_New_Content_Placeholder")}
              placeholderTextColor={String(colors.text) + "80"}
              value={content}
              onChangeText={setContent}
              multiline
              style={{
                minHeight: 120,
                textAlignVertical: "top",
                color: colors.text,
                fontSize: 16,
                fontFamily: font("medium"),
              }}
            />
          </List.Item>
        </List.Section>
      </List>
    </>
  );
};

export default NewTask;
