import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography, { Variant } from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { t } from "i18next";
import React from "react";
import { Platform, Text, View, ViewStyle } from "react-native";

const ModalOverhead = ({ style, overhead, overtitle, color, emoji, subject, subjectVariant = "title", custom = false, title, date, dateFormat }: { style?: ViewStyle, overhead?: React.ReactNode, overtitle?: string, color: string, emoji: string, subject: string, subjectVariant?: Variant, title?: string, custom?: boolean, date?: Date, dateFormat?: Intl.DateTimeFormatOptions }) => {
  const theme = useTheme();

  return (
    <Stack
      vAlign="center"
      hAlign="center"
      gap={4}
      padding={[20, 0]}
      style={style}
    >
      <View
        style={{
          backgroundColor: Platform.OS === 'ios' ? color + "22" : "transparent",
          width: 48,
          height: 48,
          borderRadius: 120,
          alignItems: "center",
          justifyContent: "center",
          borderColor: color + "22",
          borderWidth: Platform.OS === 'ios' ? 1 : 0,
        }}
      >
        <Text
          style={{
            fontSize: Platform.OS === 'ios' ? 28 : 36,
          }}
        >
          {emoji}
        </Text>
      </View>

      {overhead}

      {overtitle && (
        <Typography
          variant="body1"
          color='secondary'
        >
          {overtitle}
        </Typography>
      )}
      <Stack direction="horizontal" hAlign="center">
        {subject && (
          <Typography
            variant={subjectVariant}
            align="center"
            color={adjust(color, theme.dark ? 0.3 : -0.3)}
          >
            {subject}
          </Typography>
        )}
        {custom && (
          <Icon size={18} fill={adjust(color, theme.dark ? 0.3 : -0.3)}>
            <Papicons name="PenAlt" />
          </Icon>
        )}
      </Stack>
      {title && (
        <Typography
          variant="body1"
        >
          {title}
        </Typography>
      )}
      {date && (
        <Typography
          variant="body1"
          color='secondary'
        >
          {new Date(date).toLocaleDateString(undefined, dateFormat ? dateFormat : {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Typography>
      )}
    </Stack>
  )
}

const ModalOverHeadScore = ({ color, score, outOf }: { color: string, score: string, outOf: number | string }) => {
  const theme = useTheme();

  return (
    <Stack
      direction='horizontal'
      vAlign="end"
      hAlign="end"
      gap={2}
      style={{ marginBottom: -4 }}
    >
      <Typography variant='h0' weight='medium' inline color={adjust(color, theme.dark ? 0.3 : -0.3)}>
        {score}
      </Typography>
      <Typography variant='h3' weight='semibold' color={adjust(color, theme.dark ? 0.3 : -0.3)} style={{ marginBottom: 7, opacity: 0.5 }}>
        {typeof outOf === "string" && outOf.startsWith("%") ? outOf : `/${outOf}`}
      </Typography>
    </Stack>
  )
}

export default ModalOverhead;
export { ModalOverHeadScore };
