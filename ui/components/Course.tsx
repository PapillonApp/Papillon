import { database } from "@/database";
import { LucideIcon, Trash2Icon } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Path, Svg } from "react-native-svg";
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { LinearTransition, useAnimatedStyle } from 'react-native-reanimated';

import { formatDuration } from "../utils/Duration";
import Icon from "./Icon";
import Stack from "./Stack";
import Typography from "./Typography";

import { ContextMenuView } from 'react-native-ios-context-menu';
import { useTranslation } from "react-i18next";
import { Animation } from "../utils/Animation";
import { PapillonAppearIn, PapillonAppearOut } from "../utils/Transition";

type Variant = 'primary' | 'separator';

interface CourseProps {
  id: string;
  name: string;
  teacher?: { firstName: string; lastName: string };
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
  onPress,
  containerStyle,
}: CourseProps) => {
  const duration = end - start;
  const { t } = useTranslation();

  // Right swipe action for delete
  const renderRightActions = (progress, dragX) => {
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
        containerStyle={{ borderRadius: 18, borderCurve: 'continuous', marginVertical: 2, minWidth: '100%' }}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={!readonly ? renderRightActions : undefined}
        overshootRight={false}
      >
        <Stack direction="horizontal" gap={12} style={{ width: "100%" }}>
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
          <View style={{ flex: 1, display: "flex", gap: 4 }}>
            {status?.canceled && variant !== "separator" && (
              <View style={styles.importantBox}>
                <Typography color="danger" variant="h4" style={styles.room}>
                  {status.label}
                </Typography>
              </View>
            )}

            <Pressable style={{ flex: 1 }} onPress={() => {
              if (onPress) {
                onPress();
              }
            }}>
              <Stack
                gap={4}
                direction="vertical"
                radius={18}
                style={[
                  styles.container,
                  status?.canceled && variant !== "separator" ? styles.importantContainer : {},
                  { backgroundColor: color },
                  status?.canceled || variant === "separator" ? styles.canceled : {},
                  ...(containerStyle ? [StyleSheet.flatten(containerStyle)] : []),
                ]}
              >
                <Stack direction="horizontal" hAlign="center" gap={10} style={{ justifyContent: "space-between" }}>
                  <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                    {variant === "separator" && Leading && (
                      <Icon>
                        <Leading stroke={"#606060"} />
                      </Icon>
                    )}
                    <Typography color="light" variant="h4" style={status?.canceled || variant === "separator" ? styles.canceled : undefined}>
                      {name}
                    </Typography>
                  </View>
                  {variant === "separator" && Leading && (
                    <Typography color="light" variant="h5" style={{ color: "#60606080" }}>
                      {formatDuration(duration)}
                    </Typography>
                  )}
                </Stack>
                {variant !== "separator" && (
                  <Stack direction="horizontal" hAlign="center" gap={12}>
                    <FilledMapIcon color={status?.canceled ? "#606060" : "white"} />
                    <Typography color="light" variant="h4" style={[styles.room, ...(status?.canceled ? [styles.canceled] : [])]}>
                      {room}
                    </Typography>
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: status?.canceled ? "#606060" : "#FFFFFF" }
                      ]}
                    />
                    <FilledCircleUser color={status?.canceled ? "#606060" : "white"} />
                    <Typography color="light" variant="h4" style={[styles.teacher, ...(status?.canceled ? [styles.canceled] : [])]}>
                      {teacher?.lastName.toUpperCase() ?? "Professeur inconnu"} {teacher?.firstName.split('')[0].toLocaleUpperCase() ?? ""}.
                    </Typography>
                  </Stack>
                )}
                {status && !status.canceled && variant !== "separator" && (
                  <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7 }}>
                    <Stack radius={300} backgroundColor="#FFFFFF" style={styles.statusLabelContainer}>
                      <Typography color="light" variant="h4" style={[styles.statusLabel, { color: color }]}>
                        {status.label}
                      </Typography>
                    </Stack>
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
    </Reanimated.View>
  );
});

const FilledMapIcon: React.FC<{ color?: string }> = ({ color = "white" }) => {
  return (
    <Svg width="12" height="16" viewBox="0 0 12 16" fill="">
      <Path
        d="M6 0.5C7.59128 0.5 9.11697 1.13261 10.2422 2.25781C11.3674 3.38302 12 4.90872 12 6.5C12 10.9942 6.01551 15.4884 6 15.5C5.98463 15.4885 0 10.9942 0 6.5C1.63905e-05 4.90872 0.632609 3.38302 1.75781 2.25781C2.88303 1.13261 4.40872 0.5 6 0.5ZM6 4.25C4.75738 4.25002 3.75002 5.25738 3.75 6.5C3.75 7.74263 4.75737 8.74998 6 8.75C7.24264 8.75 8.25 7.74264 8.25 6.5C8.24998 5.25737 7.24263 4.25 6 4.25Z"
        fill={color}
      />
    </Svg>
  );
};

const FilledCircleUser: React.FC<{ color?: string }> = ({ color = "white" }) => {
  return (
    <Svg width="16" height="14" viewBox="0 0 16 14" fill={color}>
      <Path
        d="M7.77838 0.5C11.9205 0.5 15.2783 3.85789 15.2784 8C15.2784 10.2685 14.2693 12.2995 12.6778 13.6748C12.4478 12.8172 12.0022 12.0263 11.3721 11.3867C10.7369 10.7421 9.94957 10.2865 9.09674 10.0537C10.3532 9.52738 11.2382 8.27353 11.2383 6.80859C11.238 4.86975 9.68908 3.29803 7.77838 3.29785C5.86772 3.29807 4.31777 4.86977 4.31744 6.80859C4.31761 8.2731 5.2022 9.52808 6.45807 10.0547C5.60642 10.2876 4.82115 10.7429 4.18658 11.3867C3.55639 12.0262 3.10796 12.8164 2.87701 13.6738C1.28643 12.2986 0.278381 10.2677 0.278381 8C0.278415 3.85789 3.63627 0.5 7.77838 0.5Z"
        fill={color}
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  importantBox: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#D6120033",
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
  canceled: {
    backgroundColor: "#E7E7E7",
    color: "#606060"
  },
  importantContainer: {
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6
  },
  room: {
    fontSize: 18,
  },
  statusLabel: {
    fontSize: 15
  },
  separator: {
    width: 2,
    alignSelf: "stretch",
    borderRadius: 50,
    opacity: 0.5,
    backgroundColor: "#FFFFFF",
  },
  teacher: {
    fontSize: 18,
  },
  statusLabelContainer: {
    width: "auto",
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  statusDuration: {
    fontSize: 15,
    color: "#FFFFFF80"
  }
});

Course.displayName = "Course";

export default Course;