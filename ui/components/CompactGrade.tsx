import { Pressable, Text, View } from "react-native";
import Typography from "./Typography";
import { useTheme } from "@react-navigation/native";
import { t } from "i18next";
import AnimatedPressable from "./AnimatedPressable";
import SkeletonView from "@/ui/components/SkeletonView";
import i18n from "@/utils/i18n";
import adjust from "@/utils/adjustColor";
import { LinearGradient } from "expo-linear-gradient";
import Stack from "./Stack";
import { Papicons } from "@getpapillon/papicons";

interface CompactGradeProps {
  emoji: string;
  title: string;
  description: string;
  score: number;
  outOf: number;
  date: Date;
  disabled?: boolean;
  status?: string;
  onPress?: () => void,
  hasMaxScore?: boolean,
  color?: string;
  variant?: "normal" | "home";
  skeleton?: boolean;
}

export const CompactGrade = ({
  emoji,
  title,
  description,
  score,
  outOf,
  date,
  disabled,
  status,
  onPress,
  hasMaxScore,
  variant,
  color = "#888888",
  skeleton = false,
}: CompactGradeProps) => {
  const theme = useTheme();
  const { colors } = theme;

  const trailingBase = adjust(color, theme.dark ? 0.2 : -0.4);
  const trailingBackground = hasMaxScore ? trailingBase : trailingBase + "15";
  const trailingForeground = hasMaxScore ? "#FFFFFF" : trailingBase;

  return (
    <AnimatedPressable
      onPress={onPress}
      style={{
        width: 210,
        height: 140,
        borderRadius: 24,
        borderCurve: "continuous",
        borderColor: colors.border,
        backgroundColor: colors.card,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
    >
      <LinearGradient
        colors={[color + "16", color + "00"]}
        locations={[0, 0.5]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 24,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: variant === "home" ? "space-between" : "flex-start",
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <View
          style={[
            variant === "home" && {
              padding: 7,
              paddingTop: 10,
              borderRadius: 80,
            },
          ]}
        >
          {skeleton ? (
            <SkeletonView style={{ width: 25, height: 25, borderRadius: 100 }} />
          ) : (
            <Stack width={28} height={28} card hAlign='center' vAlign='center' radius={32} backgroundColor={color + "22"}>
              <Text style={{ fontSize: 15 }}>
                {emoji}
              </Text>
            </Stack>
          )}

        </View>
        {title &&
          <Typography variant="body1" color={variant === "home" ? colors.text : adjust(color, theme.dark ? 0.2 : -0.4)} style={{ flex: 1 }} nowrap weight="semibold" skeleton={skeleton} skeletonWidth={80}>
            {capitalizeWords(title)}
          </Typography>
        }
        {date &&
          <Typography variant="body1" color={variant === "home" ? "secondary" : adjust(color, theme.dark ? 0.2 : -0.4)} nowrap skeleton={skeleton}>
            {date.toLocaleDateString(i18n.language, {
              day: "2-digit",
              month: "short",
            })}
          </Typography>
        }
      </View>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 2,
          paddingBottom: 12,
          flexDirection: "column",
          gap: 8,
          flex: 1,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Typography variant="navigation" color="text" style={{ lineHeight: 20 }} numberOfLines={2} skeleton={skeleton} skeletonWidth={150} skeletonLines={2}>
          {description ? description : t('Grade_NoDescription', { subject: title })}
        </Typography>

        <Stack noShadow direction='horizontal' gap={2} card hAlign='end' vAlign='end' padding={[9, 3]} radius={32} backgroundColor={trailingBackground} >
          {disabled ? (
            <>
              <Typography color={trailingForeground} variant='navigation'>
                {status}
              </Typography>
            </>
          ) : (
            <>
              <Typography color={trailingForeground} variant='navigation'>
                {score.toFixed(2)}
              </Typography>
            </>
          )}
          <Typography color={trailingForeground + "99"} variant='body2'>
            /{outOf}
          </Typography>

          {hasMaxScore && (
            <Papicons style={{ marginBottom: 3.5, marginLeft: 2 }} name="crown" color={trailingForeground} size={18} />
          )}
        </Stack>
      </View>
    </AnimatedPressable>
  );
};

const capitalizeWords = (str: string) => {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};