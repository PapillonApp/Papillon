import { Pressable, Text, View } from "react-native";
import Typography from "./Typography";
import { useTheme } from "@react-navigation/native";
import { t } from "i18next";
import AnimatedPressable from "./AnimatedPressable";
import SkeletonView from "@/ui/components/SkeletonView";

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
  variant,
  color = "#888888",
  skeleton = false,
}: CompactGradeProps) => {
  const { colors } = useTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
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
        backgroundColor: skeleton ? colors.text + "10" : (variant === "home" ? colors.card : color + "33"),
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: variant === "home" ? "space-between" : "flex-start",
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <View
          style={[
            variant === "home" && {
              backgroundColor: color + 40,
              padding: 7,
              paddingTop: 10,
              borderRadius: 80,
            },
          ]}
        >
          {skeleton ? (
            <SkeletonView style={{ width: 25, height: 25, borderRadius: 100 }} />
          ):(
            <Text>{emoji}</Text>
          )}

        </View>
        {title &&
          <Typography variant="body1" color={variant === "home" ? colors.text : color} style={{ flex: 1 }} nowrap weight="semibold" skeleton={skeleton} skeletonWidth={80}>
            {capitalizeWords(title)}
          </Typography>
        }
        {date &&
          <Typography variant="body1" color={variant === "home" ? "secondary" : color} nowrap skeleton={skeleton}>
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
          paddingVertical: variant === "home" ? 0 : 12,
          paddingBottom: 12,
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
        <Typography variant="body1" color="text" style={{ lineHeight: 20 }} numberOfLines={2} skeleton={skeleton} skeletonWidth={150} skeletonLines={2}>
          {description ? description : t('Grade_NoDescription', { subject: title })}
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
          backgroundColor: skeleton ? colors.text + "10" : color + "33",
        }}>
          {skeleton ? (
            <Typography skeleton variant={"h4"} skeletonWidth={20} style={{borderRadius: 100, overflow: "hidden"}}/>
            ):(
            <>
              <Typography variant="h4" color={color}>
                {disabled ? status : (score ?? 0).toFixed(2)}
              </Typography>
              <Typography variant="body1" inline color={color} style={{ marginBottom: 2 }}>
                / {outOf ?? 20}
              </Typography>
            </>
          )}
        </View>
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