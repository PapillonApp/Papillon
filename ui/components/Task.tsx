import React from 'react';
import Stack from './Stack';
import Typography from './Typography';
import { formatHTML } from '@/utils/format/html';
import { useTheme } from '@react-navigation/native';
import adjust from '@/utils/adjustColor';
import { Text } from 'react-native';

import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
import * as DateLocale from 'date-fns/locale';
import i18n from '@/utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { Papicons } from '@getpapillon/papicons';
import Icon from './Icon';
import AnimatedPressable from './AnimatedPressable';
import { Dynamic } from './Dynamic';
import { Animation } from '../utils/Animation';
import { LinearTransition } from 'react-native-reanimated';
import { PapillonAppearIn, PapillonAppearOut } from '../utils/Transition';
import { t } from 'i18next';

interface TaskProps {
  subject: string;
  emoji: string;
  title: string;
  color: string;
  description: string;
  date: Date;
  completed: boolean;
  hasAttachments: boolean;
  magic?: string;
  onToggle: () => void;
  onPress: () => void;
}

const Task: React.FC<TaskProps> = ({
  subject,
  emoji,
  title,
  color,
  description,
  date,
  completed,
  hasAttachments,
  magic,
  onToggle,
  onPress
}) => {
  const theme = useTheme();
  const tintedColor = adjust(color, theme.dark ? 0.3 : -0.3);

  function formatDistanceDay(date: Date): string {
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

    return formatDistanceToNow(date, { addSuffix: true, locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS })
  }

  return (
    <AnimatedPressable onPress={onPress}>
      <Stack animated layout={Animation(LinearTransition, "list")} card radius={20} style={{ borderColor: theme.colors.text + "32" }}>
        <Stack animated layout={Animation(LinearTransition, "list")} padding={[16, 14]} gap={12} radius={20} style={{ overflow: "hidden" }}>
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
          />

          {/* Subejct */}
          <Stack direction="horizontal" gap={8} hAlign='center'>
            {/* Emoji container */}
            <Text style={{ fontSize: 22 }}>
              {emoji}
            </Text>
            {/* Name */}
            <Stack inline flex direction="horizontal" gap={4} hAlign='center'>
              <Typography nowrap variant='body1' weight='semibold' color={tintedColor}>
                {subject}
              </Typography>

              {/* Attachments */}
              {hasAttachments && (
                <Icon size={18} fill={tintedColor}>
                  <Papicons name="link" />
                </Icon>
              )}
            </Stack>
            {/* Date */}
            <Typography nowrap variant='body2' weight='medium' color={"secondary"}>
              {formatDistanceDay(date)}
            </Typography>
          </Stack>

          {/* Content */}
          <Stack animated layout={Animation(LinearTransition, "list")}>
            <Typography numberOfLines={3} variant='title' weight='medium'>
              {formatHTML(description)}
            </Typography>
          </Stack>

          {/* Bottom */}
          <Stack animated layout={Animation(LinearTransition, "list")} direction="horizontal" gap={8} hAlign='center'>
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
            <Stack animated layout={Animation(LinearTransition, "list")} inline hAlign='end' vAlign='center'>
              <AnimatedPressable scaleTo={0.8} animated layout={Animation(LinearTransition, "list")} onPress={onToggle}>
                <Stack
                  animated
                  layout={Animation(LinearTransition, "list")}
                  card
                  backgroundColor={completed ? tintedColor : undefined}>
                  <Stack
                    animated
                    layout={Animation(LinearTransition, "list")}
                    padding={[completed ? 12 : 8, 8]}
                    direction='horizontal'
                    gap={6}
                    radius={100}
                    hAlign='center'
                    style={{ overflow: "hidden" }}
                  >
                    <Icon size={24} opacity={completed ? 1 : 0.5} fill={completed ? "#FFF" : undefined}>
                      <Papicons name='check' />
                    </Icon>
                    {completed &&
                      <Dynamic animated>
                        <Typography color='#FFF'>
                          Terminé
                        </Typography>
                      </Dynamic>
                    }
                  </Stack>
                </Stack>
              </AnimatedPressable>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </AnimatedPressable >
  );
};

export default Task;
