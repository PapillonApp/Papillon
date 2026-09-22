import { useMemo } from "react";
import { Platform, View } from "react-native";
import GlassContainer from "@/ui/new/GlassContainer";
import { useTheme } from "expo-router/react-navigation";

import { formatDistanceToNowStrict } from "date-fns";
import * as DateLocale from 'date-fns/locale';

import { Grade, Period, Subject } from '@/services/shared/grade';
import { t } from 'i18next';
import Typography from "./Typography";

import { getSubjectName } from '@/utils/subjects/name';
import { getSubjectEmoji } from '@/utils/subjects/emoji';
import { getSubjectColor } from '@/utils/subjects/colors';
import { LinearGradient } from "expo-linear-gradient";
import adjust from "@/utils/adjustColor";
import i18n from "@/utils/i18n";
import { useSettingsStore } from "@/stores/settings";
import { formatGradeScoreForDisplay, getGradeDisplayScale } from "@/utils/grades/scale";

const CompactGrade = ({
  grade,
  subject
}: {
  grade: Grade;
  subject: Subject;
}) => {
  const theme = useTheme();

  const displayScale = getGradeDisplayScale(useSettingsStore(state => state.personalization.gradesDisplayScale));
  const score = useMemo(
    () => formatGradeScoreForDisplay(grade.studentScore, grade.outOf, displayScale),
    [grade.studentScore, grade.outOf, displayScale]
  );

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
            {grade.description || t("Grade_NoDescription", { subject: getSubjectName(subject.name) })}  
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
            {score.value}
          </Typography>
          {score.denominator !== '' && (
            <Typography variant="body1" color={tintedTextColorSecondary} numberOfLines={1}>
              {score.denominator}
            </Typography>
          )}
        </View> 
      </View>
    </GlassContainer>
  );
}

export default CompactGrade;