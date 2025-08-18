import { Text, View } from "react-native";
import Typography from "./Typography";
import { useTheme } from "@react-navigation/native";
import { t } from "i18next";

interface CompactGradeProps {
  emoji: string;
  title: string;
  description: string;
  score: number;
  outOf: number;
  date: Date;
  disabled?: boolean;
  color?: string;
}

export const CompactGrade = ({
  emoji,
  title,
  description,
  score,
  outOf,
  date,
  disabled,
  color = "#888888"
}: CompactGradeProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: 220,
        height: 150,
        borderRadius: 24,
        borderCurve: "continuous",
        borderColor: colors.border,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        backgroundColor: color + "33",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Text>
          {emoji}
        </Text>
        {title &&
          <Typography variant="body1" color={color} style={{ flex: 1 }} numberOfLines={1} weight="semibold">
            {title}
          </Typography>
        }
        {date &&
          <Typography variant="body1" color={color} numberOfLines={1}>
            {date.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
            })}
          </Typography>
        }
      </View>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 12,
          flexDirection: "column",
          gap: 4,
          backgroundColor: colors.card,
          borderRadius: 24,
          borderCurve: "continuous",
          flex: 1,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Typography variant="title" color="text" style={{ lineHeight: 20 }} numberOfLines={2}>
          {description ? description : t('Grade_NoDescription')}
        </Typography>
        <View style={{
          flexDirection: "row",
          alignSelf: "flex-start",
          justifyContent: "flex-start",
          alignItems: "flex-end",
          gap: 4,
          borderRadius: 120,
          paddingHorizontal: 7,
          paddingVertical: 3,
          backgroundColor: color + "33",
        }}>
          <Typography variant="h4" color={color}>
            {disabled ? "N/A" : (score ?? 0).toFixed(2)}
          </Typography>
          <Typography variant="body1" inline color={color} style={{ marginBottom: 2 }}>
            / {outOf ?? 20}
          </Typography>
        </View>
      </View>
    </View>
  );
};