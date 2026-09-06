import React, { useMemo, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import Icon from "@/ui/components/Icon";
import GlassContainer from "@/ui/new/GlassContainer";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";

import { formatDate, formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";
import * as DateLocale from 'date-fns/locale';

import { Grade, Period, Subject } from '@/services/shared/grade';

import Reanimated, { useAnimatedStyle, withSpring, ZoomIn, ZoomOut } from "react-native-reanimated";
import Typography from "./Typography";

import { getSubjectName } from '@/utils/subjects/name';
import { getSubjectEmoji } from '@/utils/subjects/emoji';
import { getSubjectColor } from '@/utils/subjects/colors';
import { LinearGradient } from "expo-linear-gradient";
import adjust from "@/utils/adjustColor";
import i18n from "@/utils/i18n";
import { Link } from "expo-router";

const CompactGrade = ({
  grade,
  subject
}: {
  grade: Grade;
  subject: Subject;
}) => {
  const theme = useTheme();

  const subjectName = useMemo(() => {
    if (subject?.name) {
      return getSubjectName(subject.name);
    }
    return 'Unknown Subject';
  }, [subject?.name]);

  const subjectEmoji = useMemo(() => {
    if (subject?.name) {
      return getSubjectEmoji(subject.name);
    }
    return '❓';
  }, [subject?.name]);

  const subjectColor = useMemo(() => {
    if (subject?.name) {
      return getSubjectColor(subject.name);
    }
    return theme.colors.primary;
  }, [subject?.name, theme.colors.primary]);

  const tintedTextColor = useMemo(() => {
    return adjust(subjectColor, theme.dark ? 0.5 : -0.5);
  }, [subjectColor, theme.dark]);

  const tintedTextColorSecondary = useMemo(() => {
    return adjust(subjectColor, theme.dark ? 0.5 : -0.5) + '99';
  }, [subjectColor, theme.dark]);

  return (
    <GlassContainer
      isInteractive={true}
      glassType="regular" glassOpacity={0}
      style={{
        borderRadius: 24
      }}
    >
      <View style={{
        width: 200,
        gap: 8,
        paddingVertical: 12,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: Platform.OS === 'ios' ? undefined : subjectColor + '15'
      }}>
        {Platform.OS === 'ios' &&
          <LinearGradient
            colors={[subjectColor, subjectColor + '30']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.2,
            }}
          />
        }

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 14,
          gap: 8
        }}>
          <Typography style={{ fontSize: 18, lineHeight: 25 }}>
            {subjectEmoji}
          </Typography>
          <Typography variant="body1" color={tintedTextColorSecondary} numberOfLines={1} style={{ flex: 1 }}>
            {subjectName}
          </Typography>
        </View>

        <View style={{
          paddingHorizontal: 14,
        }}>
          <Typography color={tintedTextColor} variant="title" numberOfLines={1}>
            {grade.description || 'No description'}
          </Typography>
          <Typography variant="body1" color={tintedTextColorSecondary} numberOfLines={1}>
            {grade.givenAt ? formatDistanceToNowStrict(new Date(grade.givenAt), { addSuffix: true, locale: DateLocale[i18n.language as keyof typeof DateLocale] }) : 'No date'}
          </Typography>
        </View>

        <View style={{
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'flex-end',
        }}>
          <Typography variant="h3" numberOfLines={2} color={tintedTextColor}>
            {grade.studentScore?.disabled ? grade.studentScore.status || 'N/A' : grade.studentScore?.value.toFixed(2) || 'N/A'}
          </Typography>
          <Typography variant="body1" color={tintedTextColorSecondary} numberOfLines={1}>
            /{grade.studentScore?.outOf || 'N/A'}
          </Typography>
        </View> 
      </View>
    </GlassContainer>
  );
}

export default CompactGrade;