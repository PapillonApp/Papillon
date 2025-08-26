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
import { useTheme } from "@react-navigation/native";
import adjust from "@/utils/adjustColor";
import AnimatedPressable from "./AnimatedPressable";

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
  compact?: boolean;
  onPress?: () => void;
  readonly?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  leading?: LucideIcon;
  showTimes?: boolean;
  timesRendered?: boolean;
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
  compact,
  readonly = false,
  leading: Leading,
  showTimes = true,
  timesRendered = true,
  magicInfo,
  onPress,
  containerStyle,
}: CourseProps) => {
  const duration = end - start;
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;

  const fStart = new Date(start * 1000);
  const fEnd = new Date(end * 1000);

  const hStart = fStart.getHours();
  const hEnd = fEnd.getHours();

  return (
    <Stack direction="horizontal" gap={12} style={{ width: "100%", marginBottom: 6 }}>
      {timesRendered &&
        <Stack style={{ width: 60, alignSelf: "center", paddingRight: 2, opacity: showTimes ? 1 : 0 }} hAlign="center" vAlign="center" gap={3}>
          <Typography nowrap variant="h5" align="center" style={{ lineHeight: 20, width: 60 }}>
            {fStart.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
          <Typography nowrap variant="body2" color="secondary" align="center" style={{ width: 60 }}>
            {fEnd.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Stack>
      }
      {variant === "separator" ? (
        <Stack
          card
          direction="horizontal"
          padding={[14, 8]}
          radius={300}
          vAlign="start"
          gap={8}
          hAlign="center"
          style={{
            flex: 1,
            marginVertical: 0
          }}
        >
          <Icon papicon size={24} opacity={0.6}>
            {
              hStart < 11 ? <Papicons.Sunrise /> :
                hStart < 14 ? <Papicons.Cutlery /> :
                  <Papicons.Sun />
            }
          </Icon>
          <Typography variant="h6" style={{ flex: 1, opacity: 0.6 }} nowrap color="text">
            {
              hStart < 11 ? "Pause matinale" :
                hStart < 14 ? "Pause méridienne" :
                  hStart < 18 ? "Pause d'après-midi" : "Pause du soir"
            }
          </Typography>
          <Typography variant="body1" color="secondary">
            {formatDuration(duration)}
          </Typography>
        </Stack>
      ) : (
        <View style={[
          status?.canceled ? {
            backgroundColor: adjust("#DC1400", theme.dark ? -0.7 : 0.8)
          } : {},
          magicInfo || variant === "separator" ? {
            borderWidth: 1,
            borderColor: "rgba(0, 0, 0, 0.12)",
            borderStyle: "solid",
            backgroundColor: (color ?? "#FFFFF") + (theme.dark ? 60 : 10),
          } : {},
          {
            flex: 1, display: "flex",
            borderRadius: compact ? 18 : 25,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 2.5,
            elevation: 4
          }]}>
          {(status?.canceled) && (
            <Stack direction="horizontal" hAlign="center" style={{ paddingHorizontal: 15 }} gap={6}>
              <Icon papicon size={20} fill={adjust("#DC1400", theme.dark ? 0.4 : -0.2)}>
                <Papicons.Ghost />
              </Icon>
              <Typography nowrap color={adjust("#DC1400", theme.dark ? 0.4 : -0.2)} variant="h4" style={[styles.room, { paddingBottom: 6, paddingTop: 8 }]}>
                {status.label}
              </Typography>
            </Stack>
          )}
          {(magicInfo?.label) && (
            <Stack direction="horizontal" hAlign="center" style={{ paddingHorizontal: 15 }} gap={6}>
              {magicInfo.icon && <magicInfo.icon color={color} />}
              <Typography color="primary" variant="h4" style={[styles.room, { paddingVertical: 6, color: color }]} nowrap>
                {magicInfo.label}
              </Typography>
            </Stack>
          )}

          <AnimatedPressable style={{ flex: 1 }} onPress={() => {
            if (onPress) {
              onPress();
            }
          }}>
            <Stack
              gap={2}
              direction="vertical"
              radius={compact ? 18 : 25}
              style={[
                styles.container,
                compact ? styles.compactContainer : {},
                { backgroundColor: color },
                status?.canceled ? {
                  backgroundColor: colors.card
                } : {},
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
              <Stack direction="horizontal" hAlign="center" vAlign="center" gap={10} style={{ justifyContent: "space-between" }}>
                <Typography
                  color="light"
                  variant="h5"
                  nowrap
                  style={[
                    styles.label,
                    (status?.canceled) ? styles.canceled : {},
                  ]}
                >
                  {name}
                </Typography>
              </Stack>
              {variant !== "separator" && (
                <Stack direction="horizontal" hAlign="center" gap={10} style={{ marginTop: -2, overflow: "hidden" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" }}>
                    <Icon papicon size={20} fill={status?.canceled ? "#555555" : "white"}>
                      <Papicons.MapPin />
                    </Icon>
                    <Typography nowrap color="light" variant="body1" style={[styles.room, ...(status?.canceled ? [styles.canceled] : [])]}>
                      {room || t("No_Course_Room")}
                    </Typography>
                  </View>
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: status?.canceled ? "#606060" : "#FFFFFF" }
                    ]}
                  />
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" }}>
                    <Icon papicon size={20} fill={status?.canceled ? "#555555" : "white"}>
                      <Papicons.User />
                    </Icon>
                    <Typography nowrap color="light" variant="body1" style={[styles.teacher, { flex: 1 }, ...(status?.canceled ? [styles.canceled] : [])]}>
                      {teacher}
                    </Typography>
                  </View>
                </Stack>
              )}
              {status && !status.canceled && variant !== "separator" && (
                <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, marginTop: status.label && status.label !== "" ? 6 : 0 }}>
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
          </AnimatedPressable>
        </View>
      )}
    </Stack>
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
  compactContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  label: {
    flex: 1,
    fontFamily: "bold",
    flexShrink: 1,
    marginTop: -5
  },
  canceled: {
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
    fontSize: 15,
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