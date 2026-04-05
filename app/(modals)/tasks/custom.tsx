import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { router } from "expo-router";
import { Papicons } from "@getpapillon/papicons";
import Typography from "@/ui/components/Typography";
import Stack from "@/ui/components/Stack";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { MenuView } from "@react-native-menu/menu";
import Reanimated, { useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import adjust from "@/utils/adjustColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAccountStore } from "@/stores/account";
import { formatRelative } from "date-fns/formatRelative";
import { FormatRelativeFn, fr } from "date-fns/locale";
import Task from "@/ui/components/Task";
import { CustomisableSubject } from "@/stores/account/types";
import { Homework } from "@/services/shared/homework";
import { addHomeworkToDatabase } from "@/database/useHomework";

const SubjectSelector = ({ subjects, selectedSubject, setSelectedSubject }: {
  subjects: CustomisableSubject[];
  selectedSubject: CustomisableSubject;
  setSelectedSubject: (s: CustomisableSubject) => void;
}) => {
  const { colors } = useTheme();

  return (
    <MenuView
      onPressAction={({ nativeEvent }) => {
        const selected = subjects.find(s => s.id === nativeEvent.event);
        if (selected) {
          setSelectedSubject(selected);
        }
      }}
      actions={subjects.map(subject => ({ id: subject.id, title: [subject.emoji, subject.name].join(" ") }))}
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
        color={colors.text + "7F"}
        style={{ marginRight: 2 }}
      />
    </MenuView>
  );
};


const customFormatRelative: FormatRelativeFn = (token) => {
  const formatMap = {
    lastWeek: "eeee 'dernier'",
    yesterday: "'hier'",
    today: "'aujourd’hui'",
    tomorrow: "'demain'",
    nextWeek: "eeee",
    other: "P",
  }

  return formatMap[token]
}

export const customFr = {
  ...fr,
  formatRelative: customFormatRelative
}

const DateSelector = ({ selectedDate, setDate }: {
  selectedDate: Date;
  setDate: (s: Date) => void;
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const pickerHeight = useSharedValue(50);
  const calendarScale = useSharedValue(0.8);
  const calendarOpacity = useSharedValue(0);
  const editButtonScale = useSharedValue(1);
  const editButtonOpacity = useSharedValue(1);

  const showPicker = () => {
    pickerHeight.value = withSpring(370);
    calendarScale.value = withSpring(1);
    calendarOpacity.value = withTiming(1);
    editButtonScale.value = withTiming(0.8);
    editButtonOpacity.value = withTiming(0);
  };

  const hidePicker = () => {
    pickerHeight.value = withSpring(50);
    calendarScale.value = withTiming(0.8);
    calendarOpacity.value = withTiming(0);
    editButtonScale.value = withTiming(1);
    editButtonOpacity.value = withTiming(1);
  };

  const togglePicker = () => {
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
        }}
      >
        <Papicons name={"Calendar"}
                  size={24}
                  color={colors.text + "7F"}
        />
        <Typography style={{ flex: 1 }}
                    nowrap
                    color={"secondary"}
        >{formatRelative(selectedDate, new Date(), { locale: customFr })}</Typography>
        <AnimatedPressable
          style={{
            height: 30,
            backgroundColor: "#C54CB3",
            borderRadius: 80,
            paddingHorizontal: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={togglePicker}
        >
          <Typography color={"light"}>{t("Task_New_DueDate_Edit")}</Typography>
        </AnimatedPressable>
      </View>
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
          accentColor={"#C54CB3"}
          onChange={(event, date) => {
            setDate(date ?? new Date())
            hidePicker();
          }}
        />
      </Reanimated.View>
    </Reanimated.View>
  );
};

const NewTaskModal = () => {
  const { colors, dark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);
  const account = accounts.find((a) => a.id === lastUsedAccount);
  const subjects = useMemo(() => 
    Object.entries(account?.customisation?.subjects ?? {})
      .map(([key, value]) => ({ ...value, id: key }))
      .filter(item => item.name && item.emoji && item.color),
    [account?.customisation?.subjects]
  );

  const [selectedSubject, setSelectedSubject] = useState<CustomisableSubject | null>(subjects[0]);
  const [selectedDate, setDate] = useState<Date>(new Date());
  const [taskDescription, setDescription] = useState<string>();
  const [taskDone, setTaskDone] = useState<boolean>(false);

  const disabled = taskDescription?.trim() === "" || !taskDescription

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
          style={{
            padding: 10,
            backgroundColor: adjust(colors.text, dark ? -0.9 : 0.95),
            borderRadius: 100,
          }}
          onPress={() => {
            router.back();
          }}
        >
          <Papicons name={Platform.OS === "ios" ? "Cross" : "ChevronLeft"}
                    size={25}
                    color={adjust(colors.text, 0.5 * (dark ? -1 : 1))}
          />
        </AnimatedPressable>
        <Typography variant={"title"}>{t("Task_New_Title")}</Typography>
        <AnimatedPressable
          disabled={disabled}
          style={{
            padding: 10,
            backgroundColor: (disabled) ? adjust(colors.text, dark ? -0.9 : 0.95) : "#C54CB3",
            borderRadius: 100,
          }}
          onPress={() => {
            if (selectedSubject && taskDescription && account?.id) {
              const homework: Homework = {
                id: "homework-custom",
                subject: selectedSubject?.name,
                content: taskDescription,
                dueDate: selectedDate,
                isDone: taskDone,
                attachments: [],
                evaluation: false,
                custom: true,
                createdByAccount: account.id
              }
              console.log(homework)
              console.log("HOMEWORK ADDED")
              addHomeworkToDatabase([homework])
            }
            router.back();
          }}
        >
          <Papicons name={"Check"}
                    size={25}
                    color={(disabled) ? adjust(colors.text, 0.5 * (dark ? -1 : 1)) : "#FFF"}
          />
        </AnimatedPressable>
      </Stack>

      {/* Gradient */}
      <LinearGradient
        colors={[colors.background, colors.background + "00"]}
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
          <View style={{ paddingHorizontal: 16}}>
            <Task
              subject={selectedSubject?.name ?? "Inconnu"}
              emoji={selectedSubject?.emoji ?? "🦋"}
              title="Titre"
              description={taskDescription ?? "Contenu du devoir"}
              color={selectedSubject?.color ?? colors.primary}
              date={selectedDate}
              completed={taskDone}
              hasAttachments={false}
              onPress={() => {}}
              onToggle={() => { setTaskDone(!taskDone)}}
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
                        color={colors.text + "7F"}
                        size={18}
              />
              <Typography color="secondary">{t("Task_New_Subject")}</Typography>
            </Stack>
            { selectedSubject && (
              <SubjectSelector subjects={subjects} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />
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
                        color={colors.text + "7F"}
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
                        color={colors.text + "7F"}
                        size={18}
              />
              <Typography color="secondary">{t("Task_New_TaskDescription")}</Typography>
            </Stack>
            <TextInput
              placeholder={t("Task_New_TaskDescription_Placeholder") || ""}
              placeholderTextColor={colors.text + "7F"}
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
                fontSize: 16
              }}
              multiline
              selectionColor={"#C54CB3"}
              cursorColor={"#C54CB3"}
              verticalAlign={"top"}
              onChangeText={setDescription}
            />
          </Stack>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default NewTaskModal;