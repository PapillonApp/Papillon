import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { router } from "expo-router";
import { Papicons } from "@getpapillon/papicons";
import Typography from "@/ui/components/Typography";
import Stack from "@/ui/components/Stack";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView, Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { MenuView } from "@react-native-menu/menu";
import Reanimated, { useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import List from "@/ui/components/List";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import { LinearGradient } from "expo-linear-gradient";
import adjust from "@/utils/adjustColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAccountStore } from "@/stores/account";
import { formatDistanceToNow } from "date-fns";
import * as DateLocale from "date-fns/locale";
import i18n from "i18next";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const SubjectSelector = (props: {
  subjects: { id: string; name: string; emoji: string; color: string }[],
  selectedIndex: number,
  onSelect: (index: number) => void
}) => {
  const { colors } = useTheme();

  return (
    <MenuView
      actions={[
        ...props.subjects.map((subject, index) => ({
          id: index.toString(),
          title: `${subject.emoji} ${subject.name}`,
        })),
      ]}
      onPressAction={(action) => {
        const index = parseInt(action.nativeEvent.event);
        if (!isNaN(index)) {
          props.onSelect(index);
        }
      }}
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
      <Stack
        backgroundColor={props.subjects[props.selectedIndex].color + "20"}
        inline
        radius={80}
        vAlign="center"
        hAlign="center"
        style={{ width: 32, height: 32 }}
      >
        <Text style={{ fontSize: 20 }}>{props.subjects[props.selectedIndex].emoji}</Text>
      </Stack>
      <Typography
        style={{ flex: 1 }}
        nowrap
      >
        {props.subjects[props.selectedIndex].name}
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

const DateSelector = (props: { date: Date, onSelectDate: (date: Date) => {} }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const pickerHeight = useSharedValue(50);
  const calendarScale = useSharedValue(0.8);
  const calendarOpacity = useSharedValue(0);
  const editButtonScale = useSharedValue(1);
  const editButtonOpacity = useSharedValue(1);

  const updateDate = (newDate: Date) => {
    props.onSelectDate(newDate);
  };

  const showPicker = () => {
    if (Platform.OS !== "ios") {
      DateTimePickerAndroid.open({
        value: props.date,
        mode: "date",
        onChange: (event, selectedDate) => {
          if (event.type !== "dismissed") {
            (selectedDate) && updateDate(selectedDate);
          }
        },
      });
      return;
    }

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

  const formatDate = (date: Date) => {
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return t("Task_New_DueDate_Today");
    }
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return t("Task_New_DueDate_Tomorrow");
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return t("Task_New_DueDate_Yesterday");
    }
    return formatDistanceToNow(date, {
      locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
      addSuffix: true,
    });
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
        >
          {formatDate(props.date)}
        </Typography>
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
          }}
        >
          <DateTimePicker
            value={props.date}
            mode={"date"}
            display={"inline"}
            style={{
              width: "100%",
              height: 300,
            }}
            accentColor={"#C54CB3"}
            onChange={(event, date) => {
              if (event.type !== "dismissed") {
                (date) && updateDate(date);
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

  const [selectedSubjectIndex, setSelectedSubjectIndex] = React.useState(0);
  const [dueDate, setDueDate] = React.useState<Date>(new Date(Date.now() + 86400000)); // Default to tomorrow
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [taskAttachments, setTaskAttachments] = React.useState<Array<{
    type: "document" | "link" | "photo";
    name: string;
    url: string
  }>>([]);

  const [showLinkModal, setShowLinkModal] = React.useState(false);
  const [linkName, setLinkName] = React.useState("");
  const [linkURL, setLinkURL] = React.useState("");

  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);

  const account = accounts.find((a) => a.id === lastUsedAccount);
  const subjects = Object.entries(account?.customisation?.subjects ?? {}).map(([key, value]) => ({
    id: key,
    ...value,
  })).filter(item => item.name && item.emoji && item.color);

  const importPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsMultipleSelection: true,
      base64: true,
    });

    if (!result.canceled) {
      const newAttachments = result.assets.map((asset) => {
        return ({
          type: "photo" as const,
          name: asset.fileName?.split(".")[0] || `Photo_${new Date().toISOString()}`,
          url: asset.base64 ?? "",
        });
      });
      setTaskAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const importDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      base64: true,
    });

    if (!result.canceled) {
      let newAttachments: Array<{ type: "document"; name: string; url: string }> = [];
      for (const asset of result.assets) {
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        newAttachments.push({
          type: "document" as const,
          name: asset.name?.split(".")[0] || `Document_${new Date().toISOString()}`,
          url: base64,
        });
      }
      setTaskAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const importLink = () => {
    setLinkName("");
    setLinkURL("");
    setShowLinkModal(true);
  };

  const sizeFromBase64 = (base64: string): string => {
    const buffer = Buffer.from(base64.substring(base64.indexOf(',') + 1));
    if (buffer.length / 1e+9 > 1)
      return (buffer.length / 1e+9).toFixed(2) + " GB";
    if (buffer.length / 1e+6 > 1)
      return (buffer.length / 1e+6).toFixed(2) + " MB";
    return (buffer.length / 1e+3).toFixed(2) + " KB";
  }

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
            Alert.alert(
              "Ajout de la tâche",
              `Titre : ${taskTitle}\nMatière : ${subjects[selectedSubjectIndex].name}\nDate : ${dueDate.toDateString()}\nDescription : ${taskDescription}\nPièces jointes : ${taskAttachments.length}`,
            );
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
            <SubjectSelector
              subjects={subjects}
              selectedIndex={selectedSubjectIndex}
              onSelect={setSelectedSubjectIndex}
            />
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
            <DateSelector
              date={dueDate}
              onSelectDate={setDueDate}
            />
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
                value={taskTitle}
                onChangeText={setTaskTitle}
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
              value={taskDescription}
              onChangeText={setTaskDescription}
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
              {taskAttachments.map((attachment, index) => (
                <Item>

                  <Leading>
                    <Papicons name={attachment.type === "link" ? "Link" : (attachment.type === "photo" ? "Gallery" : "Paper")}
                              size={28}
                              color={"#C54CB3"}
                    />
                  </Leading>
                  <Typography nowrap
                              variant={"title"}
                  >{attachment.name}</Typography>
                  <Typography nowrap
                              color={"secondary"}
                              style={{ flex: 1, marginTop: -5 }}
                  >
                    {attachment.type === "link" ? t("Task_New_TaskAttachments_Link") : (attachment.type === "photo" ? t("Task_New_TaskAttachments_Photo") : t("Task_New_TaskAttachments_Document"))} · {attachment.type === "link" ? attachment.url : sizeFromBase64(attachment.url)}
                  </Typography>
                  <Trailing>
                    <AnimatedPressable
                      onPress={() => {
                        setTaskAttachments((prev) => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <Papicons name={"Cross"} color={colors.text + "7F"} size={24}/>
                    </AnimatedPressable>
                  </Trailing>
                </Item>
              ))}
              <Item>
                <MenuView
                  actions={[
                    {
                      id: "add_photo",
                      title: t("Task_New_TaskAttachments_AddPhoto"),
                      image: Platform.OS === "ios" ? "photo.fill" : "ic_menu_camera",
                      imageColor: colors.text + "7F",
                    },
                    {
                      id: "add_document",
                      title: t("Task_New_TaskAttachments_AddDocument"),
                      image: Platform.OS === "ios" ? "doc.fill" : "ic_menu_agenda",
                      imageColor: colors.text + "7F",
                    },
                    {
                      id: "add_link",
                      title: t("Task_New_TaskAttachments_AddLink"),
                      image: Platform.OS === "ios" ? "link" : "ic_menu_share",
                      imageColor: colors.text + "7F",
                    },
                  ]}
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    gap: 10,
                  }}
                  onPressAction={(action) => {
                    switch (action.nativeEvent.event) {
                      case "add_photo":
                        importPhoto();
                        break;
                      case "add_document":
                        importDocument();
                        break;
                      case "add_link":
                        importLink();
                        break;
                    }
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
        <Modal
          presentationStyle={"formSheet"}
          visible={showLinkModal}
          onDismiss={() => setShowLinkModal(false)}
          animationType="slide"
        >
          <Stack
            padding={15}
            style={{
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
                setShowLinkModal(false);
              }}
            >
              <Papicons name={Platform.OS === "ios" ? "Cross" : "ChevronLeft"}
                        size={25}
                        color={adjust(colors.text, 0.5 * (dark ? -1 : 1))}
              />
            </AnimatedPressable>
            <Typography variant={"title"}>{t("Task_New_TaskAttachments_AddLink")}</Typography>
            <AnimatedPressable
              style={{
                padding: 10,
                backgroundColor: "#C54CB3",
                borderRadius: 100,
              }}
              onPress={() => {
                if (linkName.trim() === "" || linkURL.trim() === "") {
                  Alert.alert(t("Task_New_TaskAttachments_AddLink_Error_Title"), t("Task_New_TaskAttachments_AddLink_Error_Message"));
                  return;
                }
                let formattedURL = linkURL.trim();
                if (!/^https?:\/\//i.test(formattedURL)) {
                  formattedURL = "http://" + formattedURL;
                }
                setTaskAttachments((prev) => [...prev, {
                  type: "link",
                  name: linkName.trim(),
                  url: formattedURL,
                }]);
                setShowLinkModal(false);
              }}
            >
              <Papicons name={"Check"}
                        size={25}
                        color={"#FFF"}
              />
            </AnimatedPressable>
          </Stack>
          <Stack gap={10}>
            <Stack gap={10} style={{ paddingHorizontal: 16, width: "100%" }}>
              <Stack gap={5}
                     direction={"horizontal"}
                     hAlign={"center"}
              >
                <Papicons name={"Font"}
                          color={colors.text + "7F"}
                          size={18}
                />
                <Typography color="secondary">{t("Task_New_TaskAttachments_AddLink_Title")}</Typography>
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
                  placeholder={t("Task_New_TaskAttachments_AddLink_Placeholder") || ""}
                  placeholderTextColor={colors.text + "7F"}
                  style={{
                    fontFamily: "medium",
                    fontSize: 16,
                    height: "100%",
                  }}
                  selectionColor={"#C54CB3"}
                  cursorColor={"#C54CB3"}
                  value={linkName}
                  onChangeText={setLinkName}
                />
              </Stack>
            </Stack>
            <Stack gap={10} style={{ paddingHorizontal: 16, width: "100%" }}>
              <Stack gap={5}
                     direction={"horizontal"}
                     hAlign={"center"}
              >
                <Papicons name={"Link"}
                          color={colors.text + "7F"}
                          size={18}
                />
                <Typography color="secondary">{t("Task_New_TaskAttachments_AddLink_URL")}</Typography>
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
                <Papicons name={"Link"}
                          size={24}
                          color={colors.text + "7F"}
                />
                <TextInput
                  placeholder={t("Task_New_TaskAttachments_AddLink_URL_Placeholder") || ""}
                  placeholderTextColor={colors.text + "7F"}
                  style={{
                    fontFamily: "medium",
                    fontSize: 16,
                    height: "100%",
                  }}
                  selectionColor={"#C54CB3"}
                  cursorColor={"#C54CB3"}
                  value={linkURL}
                  onChangeText={setLinkURL}
                />
              </Stack>
            </Stack>
          </Stack>
        </Modal>
      </KeyboardAvoidingView>
    </>
  );
};

export default NewTaskModal;