import { Papicons } from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { Grade, GradeDisplaySettings, Subject } from '@/services/shared/grade';
import Stack from '@/ui/components/Stack';
import LegacyTypography from '@/ui/components/Typography';
import { SkillChip } from '@/ui/components/SkillChip';
import adjust from '@/utils/adjustColor';
import { formatGradeScore, getGradeScoreDenominator, isSameNumericScore } from '@/utils/grades/score';
import { getSubjectColor } from '@/utils/subjects/colors';
import { getSubjectEmoji } from '@/utils/subjects/emoji';
import { getSubjectName } from '@/utils/subjects/name';
import List from '@/ui/new/List';
import Typography from '@/ui/new/Typography';

const GradeItem = React.memo(({ grade, subjectName, subjectColor, display, onPress }: { grade: Grade, subjectName: string, subjectColor: string, display?: GradeDisplaySettings, onPress: (grade: Grade) => void }) => {
  const dateString = useMemo(() => {
    // @ts-expect-error date type
    return grade.givenAt.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
  }, [grade.givenAt]);

  const subtitle = useMemo(() => {
    if (display?.showGradeCoefficient && grade.coefficient !== 1) {
      return `${dateString} · Coef. ${grade.coefficient.toFixed(2)}`;
    }

    return dateString;
  }, [dateString, display?.showGradeCoefficient, grade.coefficient]);

  const handlePress = useCallback(() => {
    requestAnimationFrame(() => onPress(grade));
  }, [grade, onPress]);

  const theme = useTheme();

  const hasMaxScore = isSameNumericScore(grade.studentScore, grade.maxScore);
  const trailingBackground = hasMaxScore ? adjust(subjectColor, theme.dark ? -0.2 : 0) : subjectColor + "15";
  const trailingForeground = hasMaxScore ? "#FFFFFF" : subjectColor;
  const scoreLabel = formatGradeScore(grade.studentScore);
  const scoreDenominator = getGradeScoreDenominator(grade.studentScore, grade.outOf?.value);
  const skills = grade.skills ?? [];
  const hasSkills = skills.length > 0;

  return (
    <List.Item onPress={handlePress}>
      <Typography variant='title'>
        {grade.description ? grade.description : t('Grade_NoDescription', { subject: subjectName })}
      </Typography>
      <Typography variant='body1' color='textSecondary'>
        {subtitle}
      </Typography>

      <List.Trailing>
        <Stack pointerEvents='none' inline noShadow direction='horizontal' gap={2} card hAlign='end' vAlign='end' padding={[9, 3]} radius={32} backgroundColor={trailingBackground} >
          {scoreLabel ? (
            <>
              <LegacyTypography color={trailingForeground} variant='navigation' nowrap style={{ flexShrink: 0 }}>
                {scoreLabel}
              </LegacyTypography>
              {typeof scoreDenominator === "number" && (
                <LegacyTypography color={trailingForeground + "99"} variant='body2' nowrap style={{ flexShrink: 0 }}>
                  /{scoreDenominator}
                </LegacyTypography>
              )}
            </>
          ) : hasSkills ? (
            <Stack direction='horizontal' hAlign='center'>
              <Stack direction='horizontal'>
                {skills.slice(0, 4).map((item, index) => (
                  <SkillChip
                    key={index}
                    level={item.score}
                    style={{
                      marginLeft: index > 0 ? -13 : -5,
                      marginRight:
                        skills.length <= 4 && index === Math.min(skills.length - 1, 3)
                          ? -5
                          : 0,
                    }}
                  />
                ))}
              </Stack>
              {skills.length > 4 && (
                <LegacyTypography color={trailingForeground + "99"} variant='body2'>
                  {`+${skills.length - 4}`}
                </LegacyTypography>
              )}
            </Stack>
          ) : (
            <LegacyTypography color={trailingForeground} variant='navigation' nowrap style={{ flexShrink: 0 }}>
              {t('Grade_Unavailable')}
            </LegacyTypography>
          )}

          {hasMaxScore && (
            <Papicons style={{ marginBottom: 3.5, marginLeft: 2 }} name="crown" color={trailingForeground} size={18} />
          )}
        </Stack>
      </List.Trailing>
    </List.Item>
  );
});

export const SubjectItem: React.FC<{ subject: Subject, display?: GradeDisplaySettings, getAvgInfluence: (grade: Grade) => number, getAvgClassInfluence: (grade: Grade) => number }> = React.memo(({ subject, display, getAvgInfluence, getAvgClassInfluence }) => {
  const theme = useTheme();
  const navigation = useNavigation()

  // Memoize derived values
  const subjectAdjustedColor = useMemo(
    () => adjust(getSubjectColor(subject.name), theme.dark ? 0.2 : -0.4),
    [subject.name, theme.dark]
  );

  const subjectName = useMemo(() => getSubjectName(subject.name), [subject.name]);
  const subjectEmoji = useMemo(() => getSubjectEmoji(subject.name), [subject.name]);
  const subjectAverageLabel = useMemo(() => formatGradeScore(subject.studentAverage), [subject.studentAverage]);
  const subjectAverageDenominator = useMemo(
    () => getGradeScoreDenominator(subject.studentAverage, subject.outOf?.value),
    [subject.studentAverage, subject.outOf?.value]
  );
  const hasTopAverage = useMemo(
    () => isSameNumericScore(subject.studentAverage, subject.maximum),
    [subject.studentAverage, subject.maximum]
  );

  const handlePressSubject = useCallback(() => {
    // @ts-expect-error navigation types
    navigation.navigate('modals/SubjectInfo', {
      subject: subject,
      display,
    });
  }, [navigation, subject, display]);

  const handlePressGrade = useCallback(
    (grade: Grade) => {
      // @ts-expect-error navigation types
      navigation.navigate('(modals)/grade', {
        grade: grade,
        subjectInfo: {
          name: subjectName,
          color: subjectAdjustedColor,
          emoji: subjectEmoji,
          originalName: subject.name
        },
        display,
        avgInfluence: getAvgInfluence(grade),
        avgClass: getAvgClassInfluence(grade),
      });
    },
    [navigation, subjectName, subjectAdjustedColor, subjectEmoji, subject.name, display]
  );

  return (
    <List.Section>
      <List.View>
        <TouchableOpacity style={{ width: '100%', paddingVertical: 8 }} activeOpacity={0.5} onPress={handlePressSubject}>
          <Stack direction='horizontal' hAlign='center' gap={10} padding={[4, 0]}>
            <Stack width={28} height={28} card hAlign='center' vAlign='center' radius={32} backgroundColor={subjectAdjustedColor + "22"}>
              <Text style={{ fontSize: 15 }}>
                {subjectEmoji}
              </Text>
            </Stack>

            <Stack flex inline>
              <Typography numberOfLines={1} variant='title' weight='bold' color={subjectAdjustedColor}>
                {subjectName}
              </Typography>
              {display?.showSubjectCoefficient && subject.coefficient && subject.coefficient !== 1 && (
                <Typography variant='body2' color='textSecondary'>
                  {`Coef. ${subject.coefficient.toFixed(2)}`}
                </Typography>
              )}
            </Stack>

            <Stack inline direction='horizontal' gap={1} hAlign='end' vAlign='end'>
              <LegacyTypography
                variant='h5'
                inline
                nowrap
                style={{ marginTop: 0, fontSize: 19 }}
                color={hasTopAverage ? subjectAdjustedColor : undefined}
              >
                {subjectAverageLabel}
              </LegacyTypography>
              {typeof subjectAverageDenominator === "number" && (
                <LegacyTypography inline nowrap variant='body2' color={theme.colors.text + "99"} style={{ marginBottom: 4, flexShrink: 0 }}>
                  /{subjectAverageDenominator}
                </LegacyTypography>
              )}
              {hasTopAverage && (
                <Papicons style={{ alignSelf: 'center', marginLeft: 4 }} name="crown" color={subjectAdjustedColor} size={20} />
              )}
            </Stack>
          </Stack>
        </TouchableOpacity>
      </List.View>

      {(subject.grades ?? []).map((grade) => (
        <GradeItem
          key={grade.id}
          grade={grade}
          subjectName={subjectName}
          subjectColor={subjectAdjustedColor}
          display={display}
          onPress={handlePressGrade}
        />
      ))}
    </List.Section>
  );
});

GradeItem.displayName = "GradeItem"
SubjectItem.displayName = "SubjectItem"
