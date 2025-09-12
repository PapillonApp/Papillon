import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { router } from "expo-router";
import { Papicons } from "@getpapillon/papicons";
import Typography from "@/ui/components/Typography";
import Stack from "@/ui/components/Stack";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import React from "react";
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
import List from "@/ui/components/List";
import Item, { Leading } from "@/ui/components/Item";
import { LinearGradient } from "expo-linear-gradient";
import adjust from "@/utils/adjustColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SubjectSelector = () => {
  const { colors } = useTheme();

  return (
    <MenuView
      actions={[
        {
          id: "subject_id01",
          title: "🇫🇷 Français",
        },
        {
          id: "subject_id02",
          title: "🧮 Mathématiques",
        },
        {
          id: "subject_id03",
          title: "🌍 Histoire-Géographie",
        },
        {
          id: "subject_id04",
          title: "🧪 Physique-Chimie",
        },
        {
          id: "subject_id05",
          title: "💻 Informatique",
        },
        {
          id: "subject_id06",
          title: "🎨 Arts Plastiques",
        },
        {
          id: "subject_id07",
          title: "🎭 Théâtre",
        },
        {
          id: "subject_id08",
          title: "🎵 Musique",
        },
        {
          id: "subject_id09",
          title: "🏫 Vie Scolaire",
        },
      ]}
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
      <Stack backgroundColor={"#00A9EB32"}
             inline
             radius={80}
             vAlign="center"
             hAlign="center"
             style={{ width: 32, height: 32 }}
      >
        <Text style={{ fontSize: 20 }}>🇫🇷</Text>
      </Stack>
      <Typography
        style={{ flex: 1 }}
        nowrap
      >
        Français
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

const DateSelector = () => {
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
        >Demain</Typography>
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
          value={new Date()}
          mode={"date"}
          display={"inline"}
          style={{
            width: "100%",
            height: 300,
          }}
          accentColor={"#C54CB3"}
          onChange={() => {
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
          style={{
            padding: 10,
            backgroundColor: "#C54CB3",
            borderRadius: 100,
          }}
          onPress={() => {

            router.back();
          }}
        >
          <Papicons name={"Check"}
                    size={25}
                    color={"#FFF"}
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
        behavior={"padding"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            gap: 20,
            paddingTop: 80 + (Platform.OS === "ios" ? 0 : insets.top),
            paddingBottom: 20 + insets.bottom,
          }}
          contentInsetAdjustmentBehavior={"always"}
        >
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
            <SubjectSelector />
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
            <DateSelector />
          </Stack>
          <Stack gap={10}
                 style={{ paddingHorizontal: 16 }}
          >
            <Stack gap={5}
                   direction={"horizontal"}
                   hAlign={"center"}
            >
              <Papicons name={"Font"}
                        color={colors.text + "7F"}
                        size={18}
              />
              <Typography color="secondary">{t("Task_New_TaskTitle")}</Typography>
            </Stack>
            <Stack
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
                paddingRight: 10,
                paddingLeft: 15,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                height: 50,
              }}
            >
              <Papicons name={"PenAlt"}
                        size={24}
                        color={colors.text + "7F"}
              />
              <TextInput
                placeholder={t("Task_New_TaskTitle_Placeholder") || ""}
                placeholderTextColor={colors.text + "7F"}
                style={{
                  fontFamily: "medium",
                  fontSize: 16,
                  height: "100%",
                }}
                selectionColor={"#C54CB3"}
                cursorColor={"#C54CB3"}
              />
            </Stack>
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
                fontSize: 16,
              }}
              multiline
              selectionColor={"#C54CB3"}
              cursorColor={"#C54CB3"}
              verticalAlign={"top"}
            />
          </Stack>
          <Stack
            gap={10}
            style={{ paddingHorizontal: 16 }}
          >
            <Stack gap={5}
                   direction={"horizontal"}
                   hAlign={"center"}
            >
              <Papicons name={"Paper"}
                        color={colors.text + "7F"}
                        size={18}
              />
              <Typography color="secondary">{t("Task_New_TaskAttachments")}</Typography>
            </Stack>
            <List style={{ width: "100%" }}
                  animated={false}
            >
              <Item>
                <Leading><Papicons name={"Paper"}
                                   size={28}
                                   color={"#00A9EB"}
                /></Leading>
                <Typography nowrap
                            variant={"title"}
                >Moodle</Typography>
                <Typography nowrap
                            color={"secondary"}
                            style={{ flex: 1, marginTop: -5 }}
                >Document · diapo_tom_nook.pptx</Typography>
              </Item>
              <Item>
                <Leading><Papicons name={"Link"}
                                   size={28}
                                   color={"#00A9EB"}
                /></Leading>
                <Typography nowrap
                            variant={"title"}
                >Diaporama</Typography>
                <Typography nowrap
                            color={"secondary"}
                            style={{ flex: 1, marginTop: -5 }}
                >Lien · https://moodle.com/classroom/e87d/new</Typography>
              </Item>
              <Item>
                <MenuView
                  actions={[
                    {
                      id: "add_photo",
                      title: t("Task_New_TaskAttachments_AddPhoto"),
                      image: Platform.select({
                        ios: "photo",
                        android: "ic_menu_camera",
                      }),
                    },
                    {
                      id: "add_document",
                      title: t("Task_New_TaskAttachments_AddDocument"),
                      image: Platform.select({
                        ios: "doc",
                        android: "ic_menu_gallery",
                      }),
                    },
                    {
                      id: "add_link",
                      title: t("Task_New_TaskAttachments_AddLink"),
                      image: Platform.select({
                        ios: "link",
                        android: "ic_menu_share",
                      }),
                    },
                  ]}
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    gap: 10,
                  }}
                >
                  <Leading>
                    <Papicons
                      name={"Plus"}
                      size={24}
                      color={colors.text + "7F"}
                    />
                  </Leading>
                  <Typography color="secondary">{t("Task_New_TaskAttachments_Add")}</Typography>
                </MenuView>
              </Item>
            </List>
          </Stack>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default NewTaskModal;