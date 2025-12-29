import { Papicons } from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { Grade } from '@/database/models/Grades';
import Subject from '@/database/models/Subject';
import Item, { Trailing } from '@/ui/components/Item';
import List from '@/ui/components/List';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import adjust from '@/utils/adjustColor';
import { getSubjectColor } from '@/utils/subjects/colors';
import { getSubjectEmoji } from '@/utils/subjects/emoji';
import { getSubjectName } from '@/utils/subjects/name';

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
      <Typography variant='title'>
        {grade.description ? grade.description : t('Grade_NoDescription', { subject: subjectName })}
      </Typography>
      <Typography variant='body2' color='secondary'>
        {dateString}
      </Typography>

      <Trailing>
        <Stack pointerEvents='none' noShadow direction='horizontal' gap={2} card hAlign='end' vAlign='end' padding={[9, 3]} radius={32} backgroundColor={trailingBackground} >
          {grade.studentScore.disabled ? (
            <>
              <Typography color={trailingForeground} variant='navigation'>
                {grade.studentScore.status}
              </Typography>
            </>
          ) : (
            <>
              <Typography color={trailingForeground} variant='navigation'>
                {grade.studentScore.value.toFixed(2)}
              </Typography>
            </>
          )}
          <Typography color={trailingForeground + "99"} variant='body2'>
            /{grade.outOf.value}
          </Typography>

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
    <Stack style={{ width: "100%" }} key={subject.id}>
      <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.5} onPress={handlePressSubject}>
        <Stack direction='horizontal' hAlign='center' gap={10} padding={[4, 0]}>
          <Stack width={28} height={28} card hAlign='center' vAlign='center' radius={32} backgroundColor={subjectAdjustedColor + "22"}>
            <Text style={{ fontSize: 15 }}>
              {subjectEmoji}
            </Text>
          </Stack>

          <Stack flex inline>
            <Typography nowrap variant='title' color={subjectAdjustedColor}>
              {subjectName}
            </Typography>
          </Stack>

          <Stack inline direction='horizontal' gap={1} hAlign='end' vAlign='end'>
            {subject.studentAverage.disabled ? (
              <Typography variant='h5' inline style={{ marginTop: 0 }}>
                {subject.studentAverage.status}
              </Typography>
            ) : (
              <Typography
                variant='h5'
                inline
                style={{ marginTop: 0, fontSize: 19 }}
                color={
                  subject.studentAverage.value === subject.maximum.value
                    ? subjectAdjustedColor
                    : undefined
                }
              >
                {subject.studentAverage.value.toFixed(2)}
              </Typography>
            )}
            <Typography inline variant='body2' color={theme.colors.text + "99"} style={{ marginBottom: 4 }}>
              /{subject.outOf.value}
            </Typography>
            {subject.studentAverage.value === subject.maximum.value && !subject.studentAverage.disabled && (
              <Papicons style={{ alignSelf: 'center', marginLeft: 4 }} name="crown" color={subjectAdjustedColor} size={20} />
            )}
          </Stack>
        </Stack>
      </TouchableOpacity>

      <List style={{ marginTop: 6 }}>
        {subject.grades.map((grade) => (
          <GradeItem
            key={grade.id}
            grade={grade}
            subjectName={subjectName}
            subjectColor={subjectAdjustedColor}
            onPress={handlePressGrade}
            getAvgInfluence={getAvgInfluence}
            getAvgClassInfluence={getAvgClassInfluence}
          />
        ))}
      </List>
    </Stack>
  );
});

GradeItem.displayName = "GradeItem"
SubjectItem.displayName = "SubjectItem"