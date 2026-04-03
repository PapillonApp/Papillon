import { Papicons } from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { Grade } from '@/database/models/Grades';
import Subject from '@/database/models/Subject';
import Item, { Trailing } from '@/ui/components/Item';
import LegacyList from '@/ui/components/List';
import Stack from '@/ui/components/Stack';
import LegacyTypography from '@/ui/components/Typography';
import adjust from '@/utils/adjustColor';
import { getSubjectColor } from '@/utils/subjects/colors';
import { getSubjectEmoji } from '@/utils/subjects/emoji';
import { getSubjectName } from '@/utils/subjects/name';
import List from '@/ui/new/List';
import Typography from '@/ui/new/Typography';

const GradeItem = React.memo(({ grade, subjectName, subjectColor, onPress, getAvgInfluence, getAvgClassInfluence }: { grade: Grade, subjectName: string, subjectColor: string, onPress: (grade: Grade) => void, getAvgInfluence: (grade: Grade) => number, getAvgClassInfluence: (grade: Grade) => number }) => {
  const dateString = useMemo(() => {
    // @ts-expect-error date type
    return grade.givenAt.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
  }, [grade.givenAt]);

  const handlePress = useCallback(() => {
    requestAnimationFrame(() => onPress(grade));
  }, [grade, onPress]);

  const theme = useTheme();

  const hasMaxScore = grade.studentScore?.value === grade.maxScore?.value && !grade.studentScore.disabled;
  const trailingBackground = hasMaxScore ? adjust(subjectColor, theme.dark ? -0.2 : 0) : subjectColor + "15";
  const trailingForeground = hasMaxScore ? "#FFFFFF" : subjectColor;

  return (
    <Item isLast disablePadding onPress={handlePress}>
      <LegacyTypography variant='title'>
        {grade.description ? grade.description : t('Grade_NoDescription', { subject: subjectName })}
      </LegacyTypography>
      <LegacyTypography variant='body2' color='secondary'>
        {dateString}
      </LegacyTypography>

      <Trailing>
        <Stack pointerEvents='none' noShadow direction='horizontal' gap={2} card hAlign='end' vAlign='end' padding={[9, 3]} radius={32} backgroundColor={trailingBackground} >
          {grade.studentScore.disabled ? (
            <>
              <LegacyTypography color={trailingForeground} variant='navigation'>
                {grade.studentScore.status}
              </LegacyTypography>
            </>
          ) : (
            <>
              <LegacyTypography color={trailingForeground} variant='navigation'>
                {grade.studentScore.value.toFixed(2)}
              </LegacyTypography>
            </>
          )}
          <LegacyTypography color={trailingForeground + "99"} variant='body2'>
            /{grade.outOf.value}
          </LegacyTypography>

          {hasMaxScore && (
            <Papicons style={{ marginBottom: 3.5, marginLeft: 2 }} name="crown" color={trailingForeground} size={18} />
          )}
        </Stack>
      </Trailing >
    </Item >
  );
});

export const SubjectItem: React.FC<{ subject: Subject, grades: Grade[], getAvgInfluence: (grade: Grade) => number, getAvgClassInfluence: (grade: Grade) => number }> = React.memo(({ subject, grades, getAvgInfluence, getAvgClassInfluence }) => {
  const theme = useTheme();
  const navigation = useNavigation()

  // Memoize derived values
  const subjectAdjustedColor = useMemo(
    () => adjust(getSubjectColor(subject.name), theme.dark ? 0.2 : -0.4),
    [subject.name, theme.dark]
  );

  const subjectName = useMemo(() => getSubjectName(subject.name), [subject.name]);
  const subjectEmoji = useMemo(() => getSubjectEmoji(subject.name), [subject.name]);

  const handlePressSubject = useCallback(() => {
    // @ts-expect-error navigation types
    navigation.navigate('modals/SubjectInfo', {
      subject: subject
    });
  }, [navigation, subject]);

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
        avgInfluence: getAvgInfluence(grade),
        avgClass: getAvgClassInfluence(grade),
      });
    },
    [navigation, subjectName, subjectAdjustedColor, subjectEmoji, subject.name, grades]
  );

  return (
    <List.Item>
      <Typography>
         {subjectName}
      </Typography>
    </List.Item>
  );
});

GradeItem.displayName = "GradeItem"
SubjectItem.displayName = "SubjectItem"