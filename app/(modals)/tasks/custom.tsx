import { Papicons } from "@getpapillon/papicons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Reanimated, { useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { saveCustomHomework } from "@/database/useHomework";
import { Homework } from "@/services/shared/homework";
import { useAccountStore } from "@/stores/account";
import { CustomisableSubject } from "@/stores/account/types";
import ActionMenu from "@/ui/components/ActionMenu";
import { useAlert } from "@/ui/components/AlertProvider";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Stack from "@/ui/components/Stack";
import Task, { formatDistanceDay } from "@/ui/components/Task";
import Typography from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";

const SubjectSelector = ({ subjects, selectedSubject, setSelectedSubject }: {
  subjects: CustomisableSubject[];
  selectedSubject: CustomisableSubject;
  setSelectedSubject: (s: CustomisableSubject) => void;
}) => {
  const { colors } = useTheme();

  return (
    <ActionMenu
      onPressAction={({ nativeEvent }) => {
        const selected = subjects.find(s => s.id === nativeEvent.event);
        if (selected) {
          setSelectedSubject(selected);
        }
      }}
      actions={subjects.map(subject => ({
        id: subject.id,
        title: [subject.emoji, subject.name].join(" "),
        state: subject.id === selectedSubject.id ? "on" : "off",
      }))}
    >
      <View
        style={{
          width: "100%",
          backgroundColor: colors.card,
          flexDirection: "row",
          gap: 10,
          padding: 10,
          alignItems: "center",
          borderRadius: 30,
          borderWidth: 1,
          borderColor: colors.border,
          shadowRadius: 3,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <Stack backgroundColor={selectedSubject.color + 40}
          inline
          radius={80}
          vAlign="center"
          hAlign="center"
          style={{ width: 32, height: 32 }}
        >
          <Text style={{ fontSize: 20 }}>{selectedSubject.emoji}</Text>
        </Stack>
        <Typography
          style={{ flex: 1 }}
          nowrap
        >
          {selectedSubject.name}
        </Typography>
        <Papicons
          name={"ChevronDown"}
          size={24}
          color={String(colors.text) + "7F"}
          style={{ marginRight: 2 }}
        />
      </View>
    </ActionMenu>
  );
};

const DateSelector = ({ selectedDate, setDate }: {
  selectedDate: Date;
  setDate: (s: Date) => void;
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const pickerHeight = useSharedValue(50);
  const calendarScale = useSharedValue(0.8);
  const calendarOpacity = useSharedValue(0);

  const showPicker = () => {
    pickerHeight.value = withSpring(370);
    calendarScale.value = withSpring(1);
    calendarOpacity.value = withTiming(1);
  };

  const hidePicker = () => {
    pickerHeight.value = withSpring(50);
    calendarScale.value = withTiming(0.8);
    calendarOpacity.value = withTiming(0);
  };

  const togglePicker = () => {
    // Android has no inline calendar: its picker is a system dialog.
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: "date",
        design: "material",
        onChange: (event, date) => {
          if (event.type === "set" && date) {
            setDate(date);
          }
        },
      });
      return;
    }

    if (pickerHeight.value > 50) {
      hidePicker();
    } else {
      showPicker();
    }
  };

  return (
    <Reanimated.View
      style={{
        width: "100%",
        height: pickerHeight,
        backgroundColor: colors.card,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: colors.border,
        shadowRadius: 3,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 0 },
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: 50,
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          padding: 10,
          paddingLeft: 15,
          gap: 10,
          marginTop: -1,
        }}
      >
        <Papicons name={"Calendar"}
          size={24}
          color={String(colors.text) + "7F"}
        />
        <Typography style={{ flex: 1 }}
          nowrap
          color={"secondary"}
        >{formatDistanceDay(selectedDate)}</Typography>
        <AnimatedPressable
          accessibilityRole="button"
          onPress={togglePicker}
        >
          <View
            style={{
              height: 30,
              backgroundColor: colors.primary,
              borderRadius: 80,
              paddingHorizontal: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography color={"light"}>{t("Task_New_DueDate_Edit")}</Typography>
          </View>
        </AnimatedPressable>
      </View>
      {Platform.OS === "ios" && (
        <Reanimated.View
          style={{
            height: 320,
            overflow: "hidden",
            width: "100%",
            padding: 10,
            paddingTop: 0,
            marginTop: -10,
            transformOrigin: "top center",
            transform: [{ scale: calendarScale }],
            opacity: calendarOpacity,
            alignItems: "center",
          }}
        >
          <DateTimePicker
            value={selectedDate}
            mode={"date"}
            display={"inline"}
            style={{
              width: "100%",
              height: 300,
            }}
            accentColor={String(colors.primary)}
            onChange={(event, date) => {
              if (date) {
                setDate(date);
              }
              hidePicker();
            }}
          />
        </Reanimated.View>
      )}
    </Reanimated.View>
  );
};

const NewTaskModal = () => {
  const { colors, dark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const alert = useAlert();

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);
  const subjects = useMemo(() =>
    Object.entries(account?.customisation?.subjects ?? {})
      .map(([key, value]) => ({ ...value, id: key }))
      .filter(item => item.name && item.emoji && item.color),
  [account?.customisation?.subjects]
  );

  // Set when editing: `subject` is the subject's customisation key, the same
  // string the task stores, and `replacedId` the id the task is saved under.
  const local = useLocalSearchParams<{ replacedId?: string, subject?: string, date?: string, description?: string, done?: string }>();
  const isEditing = Boolean(local.replacedId);
  const [selectedSubject, setSelectedSubject] = useState<CustomisableSubject | undefined>(
    local.subject ? subjects.find(s => s.id === local.subject) ?? subjects[0] : subjects[0]
  );
  const [selectedDate, setDate] = useState<Date>(local.date ? new Date(parseInt(local.date)) : new Date());
  const [taskDescription, setDescription] = useState<string>(local.description ?? "");
  const [taskDone, setTaskDone] = useState<boolean>(local.done === "1");
  const [saving, setSaving] = useState(false);

  const disabled = !selectedSubject || taskDescription.trim() === "" || !account || saving;

  const save = async () => {
    if (disabled || !selectedSubject || !account) {return;}

    const homework: Homework = {
      id: "",
      subject: selectedSubject.id,
      content: taskDescription.trim(),
      dueDate: selectedDate,
      isDone: taskDone,
      attachments: [],
      evaluation: false,
      custom: true,
      createdByAccount: account.id,
    };

    setSaving(true);
    try {
      await saveCustomHomework(homework, local.replacedId);
      router.back();
    } catch (err) {
      setSaving(false);
      alert.showAlert({
        title: t("Task_New_Error_Title"),
        message: t("Task_New_Error_Message"),
        icon: "AlertTriangle",
        color: "#D60046",
        technical: String(err),
      });
    }
  };

  return (
    <>
      {/* Header */}
      <Stack
        padding={15}
        style={{
          position: "absolute",
          top: Platform.OS === "ios" ? 0 : insets.top,
          left: 0,
          right: 0,
          zIndex: 10,
          justifyContent: "space-between",
          alignItems: "center",
        }}
        direction={"horizontal"}
      >
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={t("CANCEL_BTN")}
          style={{
            padding: 10,
            backgroundColor: adjust(String(colors.text), dark ? -0.9 : 0.95),
            borderRadius: 100,
          }}
          onPress={() => {
            router.back();
          }}
        >
          <Papicons name={Platform.OS === "ios" ? "Cross" : "ChevronLeft"}
            size={25}
            color={adjust(String(colors.text), 0.5 * (dark ? -1 : 1))}
          />
        </AnimatedPressable>
        <Typography variant={"title"}>{isEditing ? t("Task_Edit_Title") : t("Task_New_Title")}</Typography>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={t("Task_New_Save")}
          accessibilityState={{ disabled }}
          disabled={disabled}
          style={{
            padding: 10,
            backgroundColor: disabled ? adjust(String(colors.text), dark ? -0.9 : 0.95) : colors.primary,
            borderRadius: 100,
          }}
          onPress={save}
        >
          <Papicons name={"Check"}
            size={25}
            color={disabled ? adjust(String(colors.text), 0.5 * (dark ? -1 : 1)) : "#FFF"}
          />
        </AnimatedPressable>
      </Stack>

      {/* Gradient */}
      <LinearGradient
        colors={[String(colors.background), String(colors.background) + "00"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? 80 : 80 + insets.top,
          zIndex: 9,
        }}
      />

      {/* Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <ScrollView
          style={{ flex: 1 }}
          automaticallyAdjustKeyboardInsets={true}
          contentContainerStyle={{
            gap: 20,
            paddingTop: 80 + (Platform.OS === "ios" ? 0 : insets.top),
            paddingBottom: 20 + insets.bottom
          }}
          contentInsetAdjustmentBehavior={"automatic"}
        >
          <View style={{ paddingHorizontal: 16 }}>
            <Task
              subject={selectedSubject?.name ?? t("Task_New_Subject")}
              emoji={selectedSubject?.emoji ?? "🦋"}
              title=""
              description={taskDescription || t("Task_New_TaskDescription_Placeholder")}
              color={selectedSubject?.color ?? String(colors.primary)}
              date={selectedDate}
              completed={taskDone}
              hasAttachments={false}
              isCustom
              onToggle={() => { setTaskDone(!taskDone); }}
            />
          </View>
          <Stack gap={10}
            style={{ paddingHorizontal: 16 }}
          >
            <Stack gap={5}
              direction={"horizontal"}
              hAlign={"center"}
            >
              <Papicons name={"Chair"}
                color={String(colors.text) + "7F"}
                size={18}
              />
              <Typography color="secondary">{t("Task_New_Subject")}</Typography>
            </Stack>
            {selectedSubject ? (
              <SubjectSelector subjects={subjects} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />
            ) : (
              <Typography color="secondary">{t("Task_New_NoSubject")}</Typography>
            )}
          </Stack>
          <Stack gap={10}
            style={{ paddingHorizontal: 16 }}
          >
            <Stack gap={5}
              direction={"horizontal"}
              hAlign={"center"}
            >
              <Papicons name={"Calendar"}
                color={String(colors.text) + "7F"}
                size={18}
              />
              <Typography color="secondary">{t("Task_New_DueDate")}</Typography>
            </Stack>
            <DateSelector selectedDate={selectedDate} setDate={setDate} />
          </Stack>
          <Stack gap={10}
            style={{ paddingHorizontal: 16 }}
          >
            <Stack gap={5}
              direction={"horizontal"}
              hAlign={"center"}
            >
              <Papicons name={"Menu"}
                color={String(colors.text) + "7F"}
                size={18}
              />
              <Typography color="secondary">{t("Task_New_TaskDescription")}</Typography>
            </Stack>
            <TextInput
              placeholder={t("Task_New_TaskDescription_Placeholder")}
              placeholderTextColor={String(colors.text) + "7F"}
              accessibilityLabel={t("Task_New_TaskDescription")}
              style={{
                width: "100%",
                backgroundColor: colors.card,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: colors.border,
                shadowRadius: 3,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 0 },
                padding: 15,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                height: 100,
                fontFamily: "medium",
                fontSize: 16,
                color: colors.text,
              }}
              multiline
              selectionColor={colors.primary}
              cursorColor={colors.primary}
              textAlignVertical="top"
              value={taskDescription}
              onChangeText={setDescription}
            />
          </Stack>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default NewTaskModal;
