import { Grade } from '@/database/models/Grades';
import Subject from '@/database/models/Subject';
import { Dynamic } from '@/ui/components/Dynamic';
import Item, { Trailing } from '@/ui/components/Item';
import List from '@/ui/components/List';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import adjust from '@/utils/adjustColor';
import { getSubjectColor } from '@/utils/subjects/colors';
import { getSubjectEmoji } from '@/utils/subjects/emoji';
import { getSubjectName } from '@/utils/subjects/name';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useMemo } from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';

export const SubjectItem: React.FC<{ subject: Subject, grades: Grade[] }> = React.memo(({ subject, grades }) => {
  const theme = useTheme();
  const navigation = useNavigation();

  // Memoize derived values
  const subjectAdjustedColor = useMemo(
    () => adjust(getSubjectColor(subject.name), theme.dark ? 0.2 : -0.4),
    [subject.name, theme.dark]
  );

  const handlePressSubject = useCallback(() => {
    Alert.alert(
      'Ça arrive bientôt !',
      "La vue détaillée des matières est en cours de développement et sera disponible dans une future mise à jour de Papillon. 🦋",
      [{ text: 'OK' }]
    );
  }, []);

  const handlePressGrade = useCallback(
    (grade: Grade) => {
      // @ts-expect-error navigation types
      navigation.navigate('(modals)/grade', {
        grade: grade,
        subjectInfo: {
          name: getSubjectName(subject.name),
          color: subjectAdjustedColor,
          emoji: getSubjectEmoji(subject.name),
          originalName: subject.name
        },
        allGrades: grades
      });
    },
    [navigation, subject.name, subjectAdjustedColor, grades]
  );

  return (
    <Dynamic animated style={{ width: "100%" }} entering={PapillonAppearIn} exiting={PapillonAppearOut} key={subject.id}>
      <Stack style={{ width: "100%" }}>
        <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.5} onPress={handlePressSubject}>
          <Stack direction='horizontal' hAlign='center' gap={10} padding={[4, 0]}>
            <Stack width={28} height={28} card hAlign='center' vAlign='center' radius={32} backgroundColor={subjectAdjustedColor + "22"}>
              <Text style={{ fontSize: 15 }}>
                {getSubjectEmoji(subject.name)}
              </Text>
            </Stack>

            <Stack flex inline>
              <Typography variant='title' color={subjectAdjustedColor}>
                {getSubjectName(subject.name)}
              </Typography>
            </Stack>

            <Stack inline direction='horizontal' gap={2} hAlign='end' vAlign='end'>
              <Typography variant='h5' inline style={{ marginTop: 0, fontSize: 19 }}>
                {subject.studentAverage.value.toFixed(2)}
              </Typography>
              <Typography inline variant='body2' color={theme.colors.text + "99"} style={{ marginBottom: 0 }}>
                /{subject.outOf.value}
              </Typography>
            </Stack>
          </Stack>
        </TouchableOpacity>

        <List style={{ marginTop: 6 }}>
          {subject.grades.map((grade) => (
            <Item key={grade.id} onPress={() => {
              requestAnimationFrame(() => handlePressGrade(grade));
            }}>
              <Typography variant='title'>
                {grade.description ? grade.description : t('Grade_NoDescription', { subject: getSubjectName(subject.name) })}
              </Typography>
              <Typography variant='body2' color='secondary'>
                {/* @ts-expect-error date type */}
                {grade.givenAt.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
              </Typography>

              <Trailing>
                <Stack direction='horizontal' gap={2} card hAlign='end' vAlign='end' padding={[9, 3]} radius={32} backgroundColor={subjectAdjustedColor + "15"} >
                  <Typography color={subjectAdjustedColor} variant='navigation'>
                    {grade.studentScore.value.toFixed(2)}
                  </Typography>
                  <Typography color={subjectAdjustedColor + "99"} variant='body2'>
                    /{grade.outOf.value}
                  </Typography>
                </Stack>
              </Trailing>
            </Item>
          ))}
        </List>
      </Stack>
    </Dynamic>
  );
});