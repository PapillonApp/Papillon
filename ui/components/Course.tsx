import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { LucideIcon } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import adjust from "@/utils/adjustColor";

import { formatDuration } from "../utils/Duration";
import AnimatedPressable from "./AnimatedPressable";
import Icon from "./Icon";
import Stack from "./Stack";
import Typography from "./Typography";

type Variant = "primary" | "separator";


interface CourseProps {
  id: string;
  name: string;
  teacher?: string;
  room?: string;
  color?: string;
  status?: {
    canceled?: boolean;
    label: string;
  };
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
  };
  skeleton?: boolean;
}

/**
 * Composant Course - Affiche une carte de cours avec différentes variantes
 * 
 * @param variant - "primary" pour un cours normal, "separator" pour une pause
 * @param color - Couleur principale du cours
 * @param status - Statut du cours (annulé, modifié, etc.)
 * @param start/end - Timestamps de début et fin
 * @param skeleton - Mode chargement avec animation
 */
const Course = React.memo(
  ({
    id: _id,
    name,
    teacher,
    room,
    color,
    status,
    variant = "primary",
    start,
    end,
    compact,
    readonly: _readonly = false,
    leading: _Leading,
    showTimes = true,
    timesRendered = true,
    magicInfo,
    onPress,
    containerStyle,
    skeleton = false,
  }: CourseProps) => {
    const duration = end - start;
    const { t } = useTranslation();
    const theme = useTheme();
    const { colors } = theme;

    const fStart = new Date(start * 1000);
    const fEnd = new Date(end * 1000);
    const hStart = fStart.getHours();

    let textColor = adjust(color ?? "#FFFFFF", theme.dark ? 0.1 : -0.15);
    if (status?.canceled) {
      textColor = colors.text + "80";
    }

    return (
      <>
        <View
          style={{ flexDirection: "row", gap: 12, width: "100%", marginBottom: 6, overflow: "visible" }}
        >
          {/* Section des horaires */}
          {timesRendered &&
            <Stack style={{ width: 60, alignSelf: "center", paddingRight: 2, opacity: showTimes ? 1 : 0 }}
              hAlign="center"
              vAlign="center"
              gap={3}
            >
              <Typography nowrap
                variant="h5"
                align="center"
                style={{ lineHeight: 20, width: 60 }}
                skeleton={skeleton}
              >
                {fStart.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
              <Typography nowrap
                variant="body2"
                color="secondary"
                align="center"
                style={{ width: 60 }}
                skeleton={skeleton}
              >
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
                marginVertical: 0,
                backgroundColor: colors.card,
              }}
            >
              <Icon papicon
                size={24}
                opacity={skeleton ? 0.1 : 0.6}
              >
                {
                  hStart < 11 ? <Papicons name={"Sunrise"} /> :
                    hStart < 14 ? <Papicons name={"Cutlery"} /> :
                      <Papicons name={"Sun"} />
                }
              </Icon>
              <Typography variant="h6"
                style={{ flex: 1, opacity: 0.6, color: colors.text }}
                nowrap
                skeleton={skeleton}
              >
                {
                  hStart < 11 ? "Pause matinale" :
                    hStart < 14 ? "Pause méridienne" :
                      hStart < 18 ? "Pause d'après-midi" : "Pause du soir"
                }
              </Typography>
              <Typography variant="body1"
                style={{ color: colors.text + "80" }}
                skeleton={skeleton}
              >
                {formatDuration(duration)}
              </Typography>
            </Stack>
          ) : (
            <View
              style={[
                {
                  flex: 1,
                  overflow: "visible",
                }
              ]}
            >
              <AnimatedPressable
                onPress={onPress}
                style={{
                  flex: 1,
                }}
              >
                {/* Conteneur pour l'ombre */}
                <View style={{
                  flex: 1,
                  borderRadius: compact ? 18 : 25,
                  shadowColor: colors.border,
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 5,
                }}>
                  <View style={[
                    // Style de base
                    {
                      flex: 1,
                      display: "flex",
                      borderRadius: compact ? 18 : 25,
                      overflow: "hidden",
                    },
                    // Style pour cours annulé
                    status?.canceled && {
                      backgroundColor: adjust("#DC1400", theme.dark ? -0.7 : 0.8),
                      borderRadius: compact ? 18 : 25,
                      borderWidth: 0.2,
                      borderColor: colors.border,
                      borderStyle: "solid" as const,
                    },
                    // Style pour infos magiques
                    magicInfo && {
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderStyle: "solid" as const,
                      backgroundColor: adjust(color ?? "#FFFFFF", 0.8),
                    },
                    // Style pour état skeleton
                    skeleton && {
                      backgroundColor: "#00000005",
                    },
                  ]}
                  >
                    {/* Section d'informations sur le cours annulé */}
                    {(status?.canceled) && (
                      <Stack
                        direction="horizontal"
                        hAlign="center"
                        style={{ paddingHorizontal: 15 }}
                        gap={6}
                      >
                        <Icon papicon
                          size={20}
                          fill={skeleton ? colors.text + "10" : adjust("#DC1400", theme.dark ? 0.4 : -0.2)}
                        >
                          <Papicons name={"Ghost"} />
                        </Icon>
                        <Typography
                          nowrap
                          color={adjust("#DC1400", theme.dark ? 0.4 : -0.2)}
                          variant="h4"
                          style={[styles.room, { flex: 1, paddingBottom: 6, paddingTop: 8, opacity: skeleton ? 0.5 : 1 }]}
                          skeleton={skeleton}
                          numberOfLines={1}
                        >
                          {status.label}
                        </Typography>
                      </Stack>
                    )}

                    {/* Section d'informations magic */}
                    {(magicInfo?.label) && (
                      <Stack direction="horizontal"
                        hAlign="center"
                        style={{ paddingHorizontal: 15 }}
                        gap={6}
                      >
                        {magicInfo.icon && <magicInfo.icon color={skeleton ? colors.text + "10" : color} />}
                        <Typography
                          color="primary"
                          variant="h4"
                          style={[styles.room, { flex: 1, paddingVertical: 6, color: color, opacity: skeleton ? 0.5 : 1 }]}
                          nowrap
                          skeleton={skeleton}
                          numberOfLines={1}
                        >
                          {magicInfo.label}
                        </Typography>
                      </Stack>
                    )}
                    {/* Composant principal */}
                    <Stack
                      gap={2}
                      direction="vertical"
                      radius={compact ? 18 : 25}
                      style={[
                        styles.container,
                        ...(compact ? [styles.compactContainer] : []),
                        {
                          backgroundColor: adjust(color ?? "#FFFFFF", theme.dark ? -0.8 : 0.8),
                          borderWidth: 1,
                          borderColor: colors.border,

                        },
                        // Cours annulé
                        ...(status?.canceled ? [{
                          backgroundColor: colors.card,
                        }] : []),
                        ...(containerStyle ? [StyleSheet.flatten(containerStyle)] : []),
                        // état skeleton
                        ...(skeleton ? [{
                          backgroundColor: colors.text + "05",
                        }] : []),
                      ]}
                    >
                      <Stack direction="horizontal" gap={10}>
                        {/* Barre colorée */}
                        <View
                          style={{ width: 7, height: "100%", backgroundColor: textColor, borderRadius: 300 }}
                        />

                        <Stack style={{ flex: 1 }}>
                          {/* Titre du cours */}
                          <Stack direction="horizontal"
                            hAlign="center"
                            vAlign="center"
                            gap={10}
                            style={{ justifyContent: "space-between", opacity: skeleton ? 0.5 : 1 }}
                          >
                            <Typography
                              variant="h5"
                              numberOfLines={2}
                              style={[
                                styles.label,
                                { color: textColor, maxWidth: "100%" },
                              ]}
                              skeleton={skeleton}
                            >
                              {name}
                            </Typography>
                          </Stack>

                          {/* Salle et professeur */}
                          {variant === "primary" && (
                            <Stack
                              direction="horizontal"
                              hAlign="start"
                              gap={8}
                              style={{
                                marginTop: -2,
                                overflow: "hidden",
                                opacity: skeleton ? 0.5 : 1,
                                flex: 1,
                              }}
                            >
                              {/* Section salle */}
                              <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5,
                                flexShrink: 1,
                              }}
                              >
                                <Icon
                                  papicon
                                  size={20}
                                  fill={skeleton ? colors.text + "20" : textColor}
                                >
                                  <Papicons name={"MapPin"} />
                                </Icon>
                                <Typography
                                  numberOfLines={1}
                                  variant="body1"
                                  style={[styles.room, { color: textColor, flexShrink: 1, minWidth: 0 }]}
                                  skeleton={skeleton}
                                >
                                  {room || t("No_Course_Room")}
                                </Typography>
                              </View>

                              {/* Séparateur */}
                              <View
                                style={[
                                  styles.separator,
                                  { backgroundColor: skeleton ? colors.text + "20" : textColor },
                                ]}
                              />

                              {/* Section professeur */}
                              <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5,
                                flexShrink: 1,
                              }}
                              >
                                <Icon papicon
                                  size={20}
                                  fill={skeleton ? colors.text + "20" : textColor}
                                >
                                  <Papicons name={"User"} />
                                </Icon>
                                <Typography
                                  numberOfLines={1}
                                  variant="body1"
                                  style={[styles.teacher, { color: textColor, flexShrink: 1, minWidth: 0 }]}
                                  skeleton={skeleton}
                                >
                                  {teacher}
                                </Typography>
                              </View>
                            </Stack>
                          )}

                          {/* Statut du cours */}
                          {status && !status.canceled && variant === "primary" && (
                            <View style={{
                              alignSelf: "flex-start",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 7,
                              marginTop: status.label && status.label !== "" ? 6 : 0,
                              opacity: skeleton ? 0.5 : 1,
                              flex: 1,
                            }}
                            >
                              {!!(status.label && status.label !== "") &&
                                <Stack radius={300}
                                  backgroundColor={skeleton ? colors.text + "09" : colors.background}
                                  style={[styles.statusLabelContainer, { flexShrink: 1, maxWidth: "70%" }]}
                                >
                                  <Typography
                                    variant="h4"
                                    style={[
                                      styles.statusLabel,
                                      { color: textColor, padding: 4 },
                                    ]}
                                    skeleton={skeleton}
                                    numberOfLines={1}
                                  >
                                    {status.label}
                                  </Typography>
                                </Stack>
                              }
                              <Typography
                                variant="h4"
                                style={[styles.statusDuration, { color: textColor + "95" }]}
                                skeleton={skeleton}
                              >
                                {formatDuration(duration)}
                              </Typography>
                            </View>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </View>
                </View>
              </AnimatedPressable>
            </View>
          )}
        </View>
      </>
    );
  });

const styles = StyleSheet.create({
  importantBox: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignSelf: "stretch",

  },
  compactContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    flex: 1,
    fontFamily: "bold",
    flexShrink: 1,
    marginTop: -2,
    marginBottom: 2,
    lineHeight: 24,
  },
  importantContainer: {
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
  },
  room: {
    fontSize: 16,
    fontFamily: "semibold",
  },
  statusLabel: {
    fontSize: 15,
  },
  separator: {
    width: 2,
    height: 20,
    alignSelf: "center",
    borderRadius: 50,
    opacity: 0.5,
    backgroundColor: "#000000",
  },
  teacher: {
    fontSize: 15,
    fontFamily: "semibold",
  },
  statusLabelContainer: {
    width: "auto",
    paddingHorizontal: 8,
    paddingVertical: 0,
    flexShrink: 1,
  },
  statusDuration: {
    fontSize: 15,
    color: "#FFFFFF80",
  },
});

Course.displayName = "Course";

export default Course;