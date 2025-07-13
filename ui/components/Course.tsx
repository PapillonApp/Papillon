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
                <CanceledIcon color="#DC1400" />
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
                      {name}
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
                      <FilledMapIcon color={status?.canceled ? "#555555" : "white"} />
                      <Typography color="light" variant="body1" style={[styles.room, ...(status?.canceled ? [styles.canceled] : [])]}>
                        {room}
                      </Typography>
                    </View>
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: status?.canceled ? "#606060" : "#FFFFFF" }
                      ]}
                    />
                    <Stack direction="horizontal" hAlign="center" gap={5}>
                      <FilledCircleUser color={status?.canceled ? "#555555" : "white"} />
                      <Typography color="light" variant="body1" style={[styles.teacher, ...(status?.canceled ? [styles.canceled] : [])]}>
                        {teacher || t("Form_Organizer")}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {status && !status.canceled && variant !== "separator" && (
                  <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, marginTop: status.label && status.label !== "" ? 2 : 0 }}>
                    {status.label && status.label !== "" &&
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

const CanceledIcon: React.FC<{ color?: string }> = ({ color = "white" }) => {
  return (
    <Svg width="14" height="15" viewBox="0 0 14 15" fill={color}>
      <Path d="M10.0333 9.73842C10.5992 9.17261 11.4984 8.89298 12.0378 9.48405C12.086 9.53691 12.1319 9.59231 12.1753 9.65015L13.3003 11.1501C14.4124 12.6334 13.354 14.7499 11.5 14.75H7.00004C6.15027 14.75 6.06274 13.709 6.66361 13.1081L10.0333 9.73842Z" fill={color} />
      <Path d="M10.0333 9.73842C10.5992 9.17261 11.4984 8.89298 12.0378 9.48405C12.086 9.53691 12.1319 9.59231 12.1753 9.65015L13.3003 11.1501C14.4124 12.6334 13.354 14.7499 11.5 14.75H7.00004C6.15027 14.75 6.06274 13.709 6.66361 13.1081L10.0333 9.73842Z" fill={color} fill-opacity="0.2" />
      <Path d="M11.4546 1.95459C11.894 1.5153 12.6061 1.51527 13.0454 1.95459C13.4847 2.39392 13.4847 3.10608 13.0454 3.54541L2.54545 14.0454C2.10612 14.4847 1.39397 14.4847 0.954627 14.0454C0.515287 13.6061 0.515287 12.8939 0.954627 12.4546L11.4546 1.95459Z" fill={color} />
      <Path d="M11.4546 1.95459C11.894 1.5153 12.6061 1.51527 13.0454 1.95459C13.4847 2.39392 13.4847 3.10608 13.0454 3.54541L2.54545 14.0454C2.10612 14.4847 1.39397 14.4847 0.954627 14.0454C0.515287 13.6061 0.515287 12.8939 0.954627 12.4546L11.4546 1.95459Z" fill={color} fill-opacity="0.2" />
      <Path d="M4.75004 0.5C5.55591 0.500021 6.26105 0.766887 6.81585 1.19994C7.5661 1.78554 7.34823 2.87869 6.67531 3.55173L4.38661 5.84085C3.96464 6.26289 3.39228 6.5 2.79548 6.5H2.66703C2.56221 6.5 2.46339 6.45049 2.40043 6.3667L2.05033 5.90015C0.381645 3.67523 1.9689 0.500024 4.75004 0.5Z" fill={color} />
      <Path d="M4.75004 0.5C5.55591 0.500021 6.26105 0.766887 6.81585 1.19994C7.5661 1.78554 7.34823 2.87869 6.67531 3.55173L4.38661 5.84085C3.96464 6.26289 3.39228 6.5 2.79548 6.5H2.66703C2.56221 6.5 2.46339 6.45049 2.40043 6.3667L2.05033 5.90015C0.381645 3.67523 1.9689 0.500024 4.75004 0.5Z" fill={color} fill-opacity="0.2" />
    </Svg>
  );
};

const ClockIcon: React.FC<{ color?: string }> = ({ color = "white" }) => {
  return (
    <Svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Path d="M9.00012 1.5C13.1422 1.5001 16.5001 4.85793 16.5001 9C16.5001 13.1421 13.1422 16.4999 9.00012 16.5C4.85799 16.5 1.50012 13.1421 1.50012 9C1.50012 4.85787 4.85799 1.5 9.00012 1.5ZM9.00012 3.54883C8.37887 3.54883 7.87524 4.05261 7.87512 4.67383V8.00098L5.40344 9.5459L5.30969 9.61133C4.859 9.96066 4.73761 10.6017 5.04602 11.0957C5.35484 11.5897 5.98457 11.7619 6.49622 11.5098L6.5968 11.4541L9.5968 9.5791C9.92544 9.3735 10.1251 9.01267 10.1251 8.625V4.67383C10.125 4.05267 9.62129 3.54893 9.00012 3.54883Z" fill={color} />
      <Path d="M9.00012 1.5C13.1422 1.5001 16.5001 4.85793 16.5001 9C16.5001 13.1421 13.1422 16.4999 9.00012 16.5C4.85799 16.5 1.50012 13.1421 1.50012 9C1.50012 4.85787 4.85799 1.5 9.00012 1.5ZM9.00012 3.54883C8.37887 3.54883 7.87524 4.05261 7.87512 4.67383V8.00098L5.40344 9.5459L5.30969 9.61133C4.859 9.96066 4.73761 10.6017 5.04602 11.0957C5.35484 11.5897 5.98457 11.7619 6.49622 11.5098L6.5968 11.4541L9.5968 9.5791C9.92544 9.3735 10.1251 9.01267 10.1251 8.625V4.67383C10.125 4.05267 9.62129 3.54893 9.00012 3.54883Z" fill={color} fill-opacity="0.2" />
    </Svg>
  );
};

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
export { ClockIcon };