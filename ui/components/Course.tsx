import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { LucideIcon } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import adjust from "@/utils/adjustColor";
import i18n from "@/utils/i18n";

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
 * Composant Course - Affiche une carte de cours
 * 
 * @param id - Identifiant unique du cours
 * @param name - Nom du cours
 * @param teacher - Nom du professeur
 * @param room - Salle du cours
 * @param variant - "primary" pour un cours normal, "separator" pour une pause
 * @param color - Couleur principale du cours
 * @param status - Statut du cours (annulé, modifié, etc.)
 * @param start - Timestamp de début du cours
 * @param end - Timestamp de fin du cours
 * @param skeleton - Mode chargement avec animation
 * @param start - Timestamp de début du cours
 * @param end - Timestamp de fin du cours
 * @param skeleton - Mode chargement avec animation
 * @param compact - Version compacte avec moins de padding
 * @param showTimes - Affiche les horaires à gauche
 * @param timesRendered - Réserve l'espace des horaires même si non affichés
 * @param magicInfo - Affiche une info spéciale (ex: "Examens", "Réunion", etc.)
 * @param onPress - Fonction appelée au clic sur le cours
 * @param readonly - Désactive l'interaction au clic
 * @param leading - Icône personnalisée à gauche du nom du cours
 * @param containerStyle - Style personnalisé pour le conteneur principal
 */
const Course = React.memo((props: CourseProps) => {
  const {
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
  } = props;

  const duration = end - start;
  const { t } = useTranslation();
  const { colors, dark } = useTheme();

  const fStart = new Date(start * 1000);
  const fEnd = new Date(end * 1000);
  const hStart = fStart.getHours();

  let textColor = adjust(color ?? "#FFFFFF", dark ? 0.1 : -0.15);
  if (status?.canceled) { textColor = colors.text + "80"; }

  /** Horaire */
  const renderTimes = useCallback(() => (
    timesRendered && (
      <Stack
        style={{
          width: 60,
          alignSelf: "center",
          paddingRight: 2,
          opacity: showTimes ? 1 : 0,
        }}
        hAlign="center"
        vAlign="center"
        gap={3}
      >
        <Typography nowrap variant="h5" align="center" style={{ lineHeight: 20, width: 60 }} skeleton={skeleton}>
          {fStart.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" })}
        </Typography>
        <Typography nowrap variant="body2" color="secondary" align="center" style={{ width: 60 }} skeleton={skeleton}>
          {fEnd.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" })}
        </Typography>
      </Stack>
    )
  ), [fEnd, fStart, showTimes, skeleton, timesRendered]);

  /** Séparateur */
  const renderSeparator = useCallback(() => {
    const [taps, setTaps] = useState(0);

    const messageKeys = {
      morning: [
        "Course_Separator_Morning_Default",
        "Course_Separator_Morning_Alt_1",
        "Course_Separator_Morning_Alt_2"
      ],
      lunch: [
        "Course_Separator_Lunch_Default",
        "Course_Separator_Lunch_Alt_1",
        "Course_Separator_Lunch_Alt_2"
      ],
      evening: [
        "Course_Separator_Evening_Default",
        "Course_Separator_Evening_Alt_1",
        "Course_Separator_Evening_Alt_2"
      ],
      night: [
        "Course_Separator_Night_Default",
        "Course_Separator_Night_Alt_1",
        "Course_Separator_Night_Alt_2"
      ]
    };

    const increaseTaps = () => {
      setTaps((prevTaps) => (prevTaps + 1) % 3);
    };

    let timeKey;
    if (hStart < 11) {
      timeKey = 'morning';
    } else if (hStart < 14) {
      timeKey = 'lunch';
    } else if (hStart < 18) {
      timeKey = 'evening';
    } else {
      timeKey = 'night';
    }

    const message = t(messageKeys[timeKey][taps]);

    return (
      <AnimatedPressable
        onPress={() => increaseTaps()}
        style={{
          flex: 1,
        }}
      >
        <Stack
          card
          direction="horizontal"
          padding={[14, 8]}
          radius={300}
          vAlign="start"
          gap={8}
          hAlign="center"
          style={{ flex: 1, backgroundColor: colors.card }}
        >
          <Icon papicon size={24} opacity={skeleton ? 0.1 : 0.6}>
            {hStart < 11 ? <Papicons name="Sunrise" /> : hStart < 14 ? <Papicons name="Cutlery" /> : <Papicons name="Sun" />}
          </Icon>
          <Typography variant="h6" style={{ flex: 1, opacity: 0.6, color: colors.text }} nowrap skeleton={skeleton}>
            {message}
          </Typography>
          <Typography variant="body1" style={{ color: colors.text + "80" }} skeleton={skeleton}>
            {formatDuration(duration)}
          </Typography>
        </Stack>
      </AnimatedPressable>
    )
  }, [colors.card, colors.text, duration, hStart, skeleton]);

  /** statut (cours annulé ou magicInfo) */
  const renderStatus = useCallback(() => {
    if (status?.canceled) {
      return (
        <Stack direction="horizontal" hAlign="center" style={{ paddingHorizontal: 15, paddingBottom: 5, paddingTop: 6 }} gap={6}>
          <Icon papicon size={20} fill={skeleton ? colors.text + "10" : adjust("#DC1400", dark ? 0.4 : -0.2)}>
            <Papicons name="Ghost" />
          </Icon>
          <Typography
            nowrap
            color={adjust("#DC1400", dark ? 0.4 : -0.2)}
            variant="h4"
            style={[styles.room, { flex: 1, paddingVertical: 0, opacity: skeleton ? 0.5 : 1 }]}
            skeleton={skeleton}
            numberOfLines={1}
          >
            {status.label}
          </Typography>
        </Stack>
      );
    }
    if (magicInfo?.label) {
      return (
        <Stack direction="horizontal" hAlign="center" style={{ paddingHorizontal: 15, paddingBottom: 5, paddingTop: 6 }} gap={6}>
          {magicInfo.icon && <magicInfo.icon color={skeleton ? colors.text + "10" : color} />}
          <Typography
            color="primary"
            variant="h4"
            style={[styles.room, { flex: 1, paddingVertical: 0, color, opacity: skeleton ? 0.5 : 1 }]}
            nowrap
            skeleton={skeleton}
            numberOfLines={1}
          >
            {magicInfo.label}
          </Typography>
        </Stack>
      );
    }
    return null;
  }, [colors.text, dark, magicInfo, skeleton, status]);

  /** Bloc contenu principal */
  const renderContent = useCallback(() => (
    <Stack
      gap={2}
      direction="vertical"
      radius={compact ? 18 : 25}
      style={[
        styles.container,
        compact && styles.compactContainer,
        {
          backgroundColor: adjust(color ?? "#FFFFFF", dark ? -0.85 : 0.85),
          borderWidth: 1,
          borderColor: colors.border,
        },
        status?.canceled && { backgroundColor: colors.card },
        skeleton && { backgroundColor: colors.text + "05" },
        containerStyle && StyleSheet.flatten(containerStyle),
      ]}
    >
      <Stack direction="horizontal" gap={10}>
        {/* Barre colorée */}
        <View style={{ width: 6, height: "100%", backgroundColor: textColor, borderRadius: 300 }} />
        <Stack style={{ flex: 1, marginTop: -2, marginBottom: -3 }}>
          {/* Nom du cours */}
          <Typography
            variant="h5"
            numberOfLines={compact ? 1 : 2}
            style={[styles.label, { color: textColor, opacity: skeleton ? 0.5 : 1, width: '100%' }]}
            skeleton={skeleton}
          >
            {name}
          </Typography>

          {/* Salle + Prof */}
          {variant === "primary" && (
            <Stack direction="horizontal" style={{ marginTop: 1, opacity: skeleton ? 0.5 : 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, minWidth: 0 }}>
                <Icon papicon size={20} fill={skeleton ? colors.text + "20" : textColor}>
                  <Papicons name="MapPin" />
                </Icon>
                <Typography numberOfLines={1} variant="body1" style={[styles.room, { color: textColor }]} skeleton={skeleton}>
                  {room || t("No_Course_Room")}
                </Typography>
              </View>
              <View style={[styles.separator, { backgroundColor: skeleton ? colors.text + "20" : textColor, marginHorizontal: 8 }]} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flex: 1, minWidth: 0 }}>
                <Icon papicon size={20} fill={skeleton ? colors.text + "20" : textColor}>
                  <Papicons name="User" />
                </Icon>
                <Typography
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  variant="body1"
                  style={[styles.teacher, { color: textColor }]}
                  skeleton={skeleton}
                >
                  {teacher}
                </Typography>
              </View>
            </Stack>
          )}

          {/* Statut du cours */}
          {status && !status.canceled && variant === "primary" && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginTop: status.label ? 4 : 0, opacity: skeleton ? 0.5 : 1 }}>
              {status.label && (
                <Stack
                  radius={300}
                  backgroundColor={skeleton ? colors.text + "09" : colors.background}
                  style={[styles.statusLabelContainer, { flexShrink: 1, maxWidth: "70%" }]}
                >
                  <Typography
                    variant="h4"
                    style={[styles.statusLabel, { color: textColor, padding: 0 }]}
                    skeleton={skeleton}
                    numberOfLines={1}
                  >
                    {status.label}
                  </Typography>
                </Stack>
              )}
              <Typography variant="h4" style={[styles.statusDuration, { color: textColor + "95" }]} skeleton={skeleton}>
                {formatDuration(duration)}
              </Typography>
            </View>
          )}
        </Stack>
      </Stack>
    </Stack>
  ), [colors.border, colors.card, colors.text, compact, containerStyle, dark, duration, name, room, skeleton, status, textColor, t, teacher, variant, color]);

  /** Cours principale */
  const renderCourseCard = useCallback(() => (
    <View style={{ flex: 1 }}>
      <AnimatedPressable onPress={onPress} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            borderRadius: compact ? 18 : 25,
            shadowColor: colors.border,
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <View
            style={[
              { flex: 1, borderRadius: compact ? 18 : 25, overflow: "hidden" },
              status?.canceled && { backgroundColor: adjust("#DC1400", dark ? -0.7 : 0.8), borderWidth: 0.2, borderColor: colors.border },
              magicInfo && { borderWidth: 1, borderColor: colors.border, backgroundColor: adjust(color ?? "#FFFFFF", 0.8) },
              skeleton && { backgroundColor: "#00000005" },
            ]}
          >
            {renderStatus()}
            {renderContent()}
          </View>
        </View>
      </AnimatedPressable>
    </View>
  ), [color, compact, dark, onPress, renderContent, renderStatus, skeleton, status, colors.border]);

  return (
    <View style={{ flexDirection: "row", gap: 12, width: "100%", marginBottom: 6 }}>
      {renderTimes()}
      {variant === "separator" ? renderSeparator() : renderCourseCard()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  compactContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  label: {
    flex: 1,
    fontFamily: "bold",
    lineHeight: 24,
  },
  room: {
    fontSize: 16,
    fontFamily: "semibold",
  },
  teacher: {
    fontSize: 15,
    fontFamily: "semibold",
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
  },
  separator: {
    width: 2,
    height: 20,
    alignSelf: "center",
    borderRadius: 50,
    opacity: 0.5,
    backgroundColor: "#000",
  },
  statusLabel: {
    fontSize: 15,
  },
  statusLabelContainer: {
    paddingHorizontal: 8,
    flexShrink: 1,
    width: "auto",
  },
  statusDuration: {
    fontSize: 15,
    color: "#FFFFFF80",
  },
});

Course.displayName = "Course";
export default Course;
