import { Papicons } from '@getpapillon/papicons';
import { formatDistanceStrict, startOfDay } from 'date-fns';
import * as DateLocale from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from "expo-router/react-navigation";
import { t } from 'i18next';
import React, { useMemo } from 'react';
import { Platform, Text, View } from 'react-native';
import Reanimated, { LinearTransition } from 'react-native-reanimated';

import adjust from '@/utils/adjustColor';
import { formatHTML } from '@/utils/format/html';
import i18n from '@/utils/i18n';

import { ListTouchable } from '../new/List';
import { Animation } from '../utils/Animation';
import { Dynamic } from './Dynamic';
import Icon from './Icon';
import Stack from './Stack';
import Typography from './Typography';

interface TaskProps {
  subject: string;
  emoji: string;
  title: string;
  color: string;
  description: string;
  date: Date;
  completed: boolean;
  hasAttachments: boolean;
  isCustom?: boolean;
  magic?: string;
  onToggle: () => void;
  onPress?: () => void;
}

export function formatDistanceDay(date: Date): string {
  // if yesterday, today or tomorrow
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return i18n.t("Yesterday").toLowerCase();
  } else if (date.toDateString() === today.toDateString()) {
    return i18n.t("Today").toLowerCase();
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return i18n.t("Tomorrow").toLowerCase();
  }

  return formatDistanceStrict(startOfDay(date), startOfDay(new Date()), { addSuffix: true, unit: "day", locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS })
}

const Task: React.FC<TaskProps> = React.memo(({
  subject,
  emoji,
  title,
  color,
  description,
  date,
  completed,
  hasAttachments,
  isCustom = false,
  magic,
  onToggle,
  onPress
}) => {
  const theme = useTheme();
  const tintedColor = useMemo(() => adjust(color, theme.dark ? 0.3 : -0.3), [color, theme.dark]);
  const formattedDescription = useMemo(() => formatHTML(description), [description]);

  return (
    <ListTouchable onPress={onPress}>
      <Stack card radius={20} style={{ borderColor: theme.colors.text + "32", borderWidth: Platform.OS === "android" ? 0 : 1, backgroundColor: (Platform.OS === 'android' && !theme.dark) ? "#FFF" : theme.colors.item, elevation: 2, overflow: "hidden" }}>
        {/* The card above already clips to its corners: a second rounded clip
            here would cost another offscreen pass per row, on every row the
            week pager moves across the screen. */}
        <Stack padding={[16, 14]} gap={12}>
          {Platform.OS !== "android" && (
            <LinearGradient
              colors={[color, theme.colors.card]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
              right: 0,
              height: 100,
              zIndex: -1,
              opacity: 0.1
            }}
          /> )}

          {/* Subejct */}
          <Stack direction="horizontal" gap={8} hAlign='center'>
            {/* Emoji container */}
            <Text style={{ fontSize: 22 }}>
              {emoji}
            </Text>
            {/* Name */}
            <Stack inline flex direction="horizontal" gap={4} hAlign='center'>
              <Typography nowrap variant='body1' weight='semibold' color={tintedColor} style={{ flexShrink: 1 }}>
                {subject}
              </Typography>

              {/* Attachments */}
              {hasAttachments && (
                <Icon size={18} fill={tintedColor}>
                  <Papicons name="link" />
                </Icon>
              )}

              {isCustom && (
                <Icon size={18} fill={tintedColor}>
                  <Papicons name="PenAlt" />
                </Icon>
              )}
            </Stack>
            {/* Date */}
            <Typography nowrap variant='body2' weight='medium' color={"secondary"}>
              {formatDistanceDay(date)}
            </Typography>
          </Stack>

          {/* Content */}
          <Stack>
            <Typography numberOfLines={3} variant='title' weight='medium'>
              {formattedDescription}
            </Typography>
          </Stack>

          {/* Bottom */}
          <Stack direction="horizontal" gap={8} hAlign='center'>
            <Stack inline flex hAlign='start' vAlign='center'>
              {/* Magic */}
              {magic && (
                <Dynamic animated>
                  <Stack
                    animated
                    direction="horizontal"
                    gap={6}
                    hAlign='center'
                    vAlign='center'
                    padding={[12, 6]}
                    radius={12}
                    backgroundColor={tintedColor + "20"}
                  >
                    <Papicons name='sparkles' size={22} color={tintedColor} style={{ marginLeft: -2 }} />
                    <Typography color={tintedColor} variant='body1' weight='semibold'>
                      {magic}
                    </Typography>
                  </Stack>
                </Dynamic>
              )}
            </Stack>
            <View style={{ borderRadius: 100, overflow: "hidden" }}>
              <ListTouchable onPress={onToggle}>
                <Reanimated.View
                  layout={Platform.OS === "ios" ? Animation(LinearTransition, "list") : undefined}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: completed ? 12 : 8,
                    paddingVertical: 8,
                    borderRadius: 100,
                    backgroundColor: completed ? tintedColor : theme.colors.card,
                    borderWidth: Platform.OS === "android" ? 0 : 0.5,
                    borderColor:
                      typeof theme.colors.text === "string"
                        ? theme.colors.text + "25"
                        : undefined,
                  }}
                >
                  <Icon
                    size={24}
                    opacity={completed ? 1 : 0.5}
                    fill={completed ? "#FFF" : undefined}
                  >
                    <Papicons name="check" />
                  </Icon>
                  {completed && (
                    <Typography nowrap variant="body2" weight="semibold" color="#FFF">
                      {t("Task_Done")}
                    </Typography>
                  )}
                </Reanimated.View>
              </ListTouchable>
            </View>
          </Stack>
        </Stack>
      </Stack>
    </ListTouchable >
  );
});

Task.displayName = "Task";

export default Task;
