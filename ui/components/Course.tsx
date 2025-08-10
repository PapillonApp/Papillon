import { LucideIcon, Trash2Icon } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { LinearTransition, useAnimatedStyle } from 'react-native-reanimated';
import { Path, Svg } from "react-native-svg";
import * as Papicons from "@getpapillon/papicons"
import { database } from "@/database";
import { truncatenateString } from "@/ui/utils/Truncatenate";

import { Animation } from "../utils/Animation";
import { formatDuration } from "../utils/Duration";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";
import Icon from "./Icon";
import Stack from "./Stack";
import Typography from "./Typography";

type Variant = 'primary' | 'separator';

interface CourseProps {
  id: string;
  name: string;
  teacher?: string;
  room?: string;
  color?: string;
  status?: {
    canceled?: boolean;
    label: string;
  }
  variant?: Variant;
  start: number;
  end: number;
  onPress?: () => void;
  readonly?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  leading?: LucideIcon;
  showTimes?: boolean;
  magicInfo?: {
    label: string;
    icon: React.FC<{ color?: string }>;
  }
}

const Course = React.memo(({
  id,
  name,
  teacher,
  room,
  color,
  status,
  variant = 'primary',
  start,
  end,
  readonly = false,
  leading: Leading,
  showTimes = true,
  magicInfo,
  onPress,
  containerStyle,
}: CourseProps) => {
  const duration = end - start;
  const { t } = useTranslation();

  // Right swipe action for delete
  const renderRightActions = (progress: any, dragX: any) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: dragX.value + 72 }],
    }));

    return (
      <Reanimated.View style={[{ height: '100%', width: 72, justifyContent: 'center', alignItems: 'flex-end' }, animatedStyle]}>
        <Pressable
          style={{
            backgroundColor: '#FF3B30',
            justifyContent: 'center',
            alignItems: 'center',
            width: 64,
            height: "100%",
            borderRadius: 18,
            borderCurve: 'continuous',
          }}
          onPress={async () => {
            try {
              await database.write(async () => {
                const event = await database.get('events').find(id);
                if (readonly) {
                  Alert.alert(t('Alert_TechnicalDetails'), 'This event is read-only and cannot be deleted.');
                  return;
                }
                await event.markAsDeleted();
              });
            } catch (error) {
              console.error('Failed to delete event:', error);
            }
          }}
          accessibilityLabel={t('Context_Delete')}
        >
          <Trash2Icon color="white" size={32} strokeWidth={2} />
        </Pressable>
      </Reanimated.View>
    );
  };

  return (
    <Reanimated.View
      layout={Animation(LinearTransition, "list")}
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
      style={{
        width: "100%",
      }}
    >
      <ReanimatedSwipeable
        containerStyle={{ borderRadius: 18, borderCurve: 'continuous', marginVertical: 2, minWidth: '100%', overflow: 'visible' }}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={!readonly ? renderRightActions : undefined}
        overshootRight={false}
      >
        <Stack direction="horizontal" gap={12} style={{ width: "100%" }}>
          {showTimes && (
            <Stack style={{ width: 60, alignSelf: "center" }} hAlign="center" vAlign="center" gap={3}>
              <Typography variant="h5" style={{ lineHeight: 20 }}>
                {new Date(start * 1000).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
              <Typography variant="body2" color="secondary">
                {new Date(end * 1000).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Stack>
          )}
          <View style={[
            status?.canceled || variant === "separator" ? {
              borderWidth: 1,
              borderColor: "rgba(0, 0, 0, 0.12)",
              borderStyle: "solid",
              backgroundColor: "#F9E5E5",
            } : {},
            magicInfo || variant === "separator" ? {
              borderWidth: 1,
              borderColor: "rgba(0, 0, 0, 0.12)",
              borderStyle: "solid",
              backgroundColor: (color ?? "#FFFFF") + 10,
            } : {},
            {
              flex: 1, display: "flex",
              borderRadius: 25,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 2.5,
              elevation: 4
            }]}>
            {(status?.canceled) && variant !== "separator" && (
              <Stack direction="horizontal" hAlign="center" style={{ paddingHorizontal: 15 }} gap={6}>
                <Icon papicon size={20} fill={"#DC1400"}>
                  <Papicons.Ghost />
                </Icon>
                <Typography color="danger" variant="h4" style={[styles.room, { paddingBottom: 6, paddingTop: 8 }]}>
                  {status.label}
                </Typography>
              </Stack>
            )}
            {(magicInfo?.label) && variant !== "separator" && (
              <Stack direction="horizontal" hAlign="center" style={{ paddingHorizontal: 15 }} gap={6}>
                {magicInfo.icon && <magicInfo.icon color={color} />}
                <Typography color="primary" variant="h4" style={[styles.room, { paddingVertical: 6, color: color }]}>
                  {magicInfo.label}
                </Typography>
              </Stack>
            )}

            <Pressable style={{ flex: 1 }} onPress={() => {
              if (onPress) {
                onPress();
              }
            }}>
              <Stack
                gap={2}
                direction="vertical"
                radius={25}
                style={[
                  styles.container,
                  { backgroundColor: color },
                  status?.canceled || variant === "separator" ? styles.canceled : {},
                  ...(containerStyle ? [StyleSheet.flatten(containerStyle)] : []),
                  {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3.3,
                    elevation: 3
                  }
                ]}
              >
                <Stack direction="horizontal" hAlign="center" gap={10} style={{ justifyContent: "space-between" }}>
                  <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                    {variant === "separator" && Leading && (
                      <Icon>
                        <Leading stroke={"#606060"} />
                      </Icon>
                    )}
                    <Typography
                      color="light"
                      variant="h5"
                      style={[
                        styles.label,
                        (status?.canceled || variant === "separator") ? styles.canceled : {},
                      ]}
                    >
                      {truncatenateString(name, 30, "...")}
                    </Typography>
                  </View>
                  {variant === "separator" && Leading && (
                    <Typography color="light" variant="h5" style={[{ color: "#60606080" }, styles.label]}>
                      {formatDuration(duration)}
                    </Typography>
                  )}
                </Stack>
                {variant !== "separator" && (
                  <Stack direction="horizontal" hAlign="center" gap={12}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Icon papicon size={20} fill={status?.canceled ? "#555555" : "white"}>
                        <Papicons.MapPin />
                      </Icon>                      <Typography color="light" variant="body1" style={[styles.room, ...(status?.canceled ? [styles.canceled] : [])]}>
                        {room || t("No_Course_Room")}
                      </Typography>
                    </View>
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: status?.canceled ? "#606060" : "#FFFFFF" }
                      ]}
                    />
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap", width: "100%" }}>
                      <Icon papicon size={20} fill={status?.canceled ? "#555555" : "white"}>
                        <Papicons.User />
                      </Icon>
                      <Typography color="light" variant="body1" style={[styles.teacher, showTimes ? { maxWidth: "50%" } : { maxWidth: "50%" }, ...(status?.canceled ? [styles.canceled] : [])]}>
                        {truncatenateString(teacher || t("Form_Organizer"), 20, "...")}
                      </Typography>
                    </View>
                  </Stack>
                )}
                {status && !status.canceled && variant !== "separator" && (
                  <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, marginTop: status.label && status.label !== "" ? 2 : 0 }}>
                    {!!(status.label && status.label !== "") &&
                      <Stack radius={300} backgroundColor="#FFFFFF" style={styles.statusLabelContainer}>
                        <Typography color="light" variant="h4" style={[styles.statusLabel, { color: color }]}>
                          {status.label}
                        </Typography>
                      </Stack>
                    }
                    <Typography color="light" variant="h4" style={[styles.statusDuration]}>
                      {formatDuration(duration)}
                    </Typography>
                  </View>
                )}
              </Stack>
            </Pressable>
          </View>
        </Stack>
      </ReanimatedSwipeable>
    </Reanimated.View >
  );
});

const styles = StyleSheet.create({
  importantBox: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6
  },
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignSelf: "stretch"
  },
  label: {
    fontSize: 18,
    lineHeight: 22,
    color: "#FFFFFF",
    fontFamily: "bold",
    flexShrink: 1
  },
  canceled: {
    backgroundColor: "#FFFFFF",
    color: "#606060"
  },
  importantContainer: {
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6
  },
  room: {
    fontSize: 16,
    fontFamily: "semibold",
  },
  statusLabel: {
    fontSize: 15
  },
  separator: {
    width: 2,
    height: 20,
    alignSelf: "center",
    borderRadius: 50,
    opacity: 0.5,
    backgroundColor: "#FFFFFF",
  },
  teacher: {
    fontSize: 16,
    flexShrink: 1,
    maxWidth: "80%",
    fontFamily: "semibold",
  },
  statusLabelContainer: {
    width: "auto",
    paddingHorizontal: 8,
    paddingVertical: 0
  },
  statusDuration: {
    fontSize: 15,
    color: "#FFFFFF80"
  }
});

Course.displayName = "Course";

export default Course;