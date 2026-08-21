import React, { useCallback, useMemo, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { t } from 'i18next';
import type { SFSymbol } from 'sf-symbols-typescript';

import { Button, Host, List, Text, Section, HStack, VStack, Spacer, RNHostView } from '@expo/ui/swift-ui';
import { buttonStyle, lineLimit, font, foregroundStyle, refreshable, padding, listRowInsets, shadow } from '@expo/ui/swift-ui/modifiers';
import { useFont } from '@/utils/theme/fonts';
import i18n from '@/utils/i18n';
import { useSettingsStore } from '@/stores/settings';
import { getGradeDisplayScale, formatScoreForDisplay } from '@/utils/grades/scale';
import { getPeriodName, getPeriodNumber, isPeriodWithNumber } from '@/utils/services/periods';
import { getSubjectName } from '@/utils/subjects/name';
import { getSubjectEmoji } from '@/utils/subjects/emoji';
import { Grade, Period, Subject } from '@/services/shared/grade';

import { usePeriodsData } from './hooks/usePeriodsData';
import { useGradesData } from './hooks/useGradesData';
import Typography from '@/ui/new/Typography';
import Averages from './atoms/Averages';

type SortMethod = 'date' | 'alphabetical' | 'averages';

const getSortings = (): { value: SortMethod; label: string; sf: SFSymbol }[] => [
  { value: 'date', label: t('Grades_Sorting_Date'), sf: 'calendar' },
  { value: 'averages', label: t('Grades_Sorting_Averages'), sf: 'chart.xyaxis.line' },
  { value: 'alphabetical', label: t('Grades_Sorting_Alphabetical'), sf: 'character' },
];

const periodTitle = (period: Period) => {
  const name = getPeriodName(period.name || '');
  return isPeriodWithNumber(period.name || '') ? `${name} ${getPeriodNumber(period.name || '')}` : name;
};

const periodSubtitle = (period: Period) =>
  `${period.start.toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' })} - ${period.end.toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' })}`;

const sortSubjects = (subjects: Subject[], method: SortMethod): Subject[] => {
  const copy = [...subjects];

  switch (method) {
    case 'alphabetical':
      copy.sort((a, b) => getSubjectName(a.name).localeCompare(getSubjectName(b.name)));
      break;
    case 'averages':
      copy.sort((a, b) => (b.studentAverage?.value ?? -1) - (a.studentAverage?.value ?? -1));
      break;
    default:
      copy.sort((a, b) => {
        const aDate = a.grades?.[0]?.givenAt?.getTime() ?? 0;
        const bDate = b.grades?.[0]?.givenAt?.getTime() ?? 0;
        return bDate - aDate;
      });
  }

  return copy;
};

const GradesView = () => {
  const papillonFont = useFont();
  const displayScale = getGradeDisplayScale(useSettingsStore(state => state.personalization.gradesDisplayScale));
  const router = useRouter();

  const { periods, currentPeriod, setCurrentPeriod, refresh: refreshPeriods } = usePeriodsData();
  const { subjects, history, averages, refresh: refreshGrades } = useGradesData(currentPeriod);

  const [sortMethod, setSortMethod] = useState<SortMethod>('date');
  const [searchText, setSearchText] = useState('');

  const handleRefresh = useCallback(async () => {
    // Refresh periods first (a new one may have appeared), then the current period's grades.
    await refreshPeriods();
    await refreshGrades();
  }, [refreshPeriods, refreshGrades]);

  const sortedSubjects = useMemo(() => sortSubjects(subjects, sortMethod), [subjects, sortMethod]);

  const filteredSubjects = useMemo(() => {
    if (searchText.trim() === '') { return sortedSubjects; }

    const query = searchText.toLowerCase();
    return sortedSubjects.filter(subject => {
      if (getSubjectName(subject.name).toLowerCase().includes(query)) { return true; }
      return (subject.grades ?? []).some(grade => grade.description?.toLowerCase().includes(query));
    });
  }, [sortedSubjects, searchText]);

  const sortings = useMemo(() => getSortings(), [i18n.language]);

  return (
    <>
      <Stack.SearchBar
        placeholder={t('Grades_Search_Placeholder')}
        onChangeText={event => setSearchText(event.nativeEvent.text)}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Menu>
          <Stack.Toolbar.Icon sf="calendar" />
          <Stack.Toolbar.Label>Options</Stack.Toolbar.Label>
          {periods.map(period => (
            <Stack.Toolbar.MenuAction
              key={period.id}
              isOn={currentPeriod?.id === period.id}
              icon={(isPeriodWithNumber(period.name || '') ? `${getPeriodNumber(period.name || '')}.calendar` : 'calendar') as SFSymbol}
              subtitle={periodSubtitle(period)}
              onPress={() => setCurrentPeriod(period)}
            >
              {periodTitle(period)}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <Stack.Title
        large
        largeStyle={{ fontFamily: papillonFont('bold') }}
        style={{ fontFamily: papillonFont('semibold') }}
      >
        {currentPeriod ? periodTitle(currentPeriod) : t('Tab_Grades')}
      </Stack.Title>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu>
          <Stack.Toolbar.Icon sf="ellipsis" />
          <Stack.Toolbar.Label>Options</Stack.Toolbar.Label>
          <Stack.Toolbar.Menu>
            <Stack.Toolbar.Icon sf="arrow.up.arrow.down" />
            <Stack.Toolbar.Label>Sort by</Stack.Toolbar.Label>
            {sortings.map(sorting => (
              <Stack.Toolbar.MenuAction
                key={sorting.value}
                isOn={sortMethod === sorting.value}
                icon={sorting.sf}
                onPress={() => setSortMethod(sorting.value)}
              >
                {sorting.label}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <Host style={{ flex: 1 }}>
        <List modifiers={[refreshable(handleRefresh)]}>
          {(Object.values(history).some(points => (points?.length ?? 0) > 0) || averages.student) && (
            <Section modifiers={[ listRowInsets({ leading: 0, trailing: 0 }) ]}>
              <RNHostView matchContents>
                <Averages
                  history={history}
                  realAverage={averages.student?.value}
                  displayScale={displayScale}
                />
              </RNHostView>
            </Section>
          )}

          {filteredSubjects.length === 0 ? (
            <Section>
              <VStack alignment="leading" spacing={4}>
                <Text modifiers={[font({ family: papillonFont('semibold'), size: 17 })]}>
                  {t('Grades_Empty_Title')}
                </Text>
                <Text modifiers={[font({ family: papillonFont('medium'), size: 15 }), foregroundStyle('secondary')]}>
                  {t('Grades_Empty_Description')}
                </Text>
              </VStack>
            </Section>
          ) : (
            filteredSubjects.map(subject => {
              const average = subject.studentAverage;
              const formattedAverage = average && !average.disabled && typeof average.value === 'number'
                ? formatScoreForDisplay(average.value, average.outOf ?? subject.outOf?.value ?? 20, displayScale)
                : undefined;

              return (
                <Section
                  key={subject.id}
                  header={
                    <HStack>
                      <Text modifiers={[font({ size: 17 })]}>{getSubjectEmoji(subject.name)}</Text>
                      <Text modifiers={[font({ family: papillonFont('semibold'), size: 17 }), lineLimit(1), foregroundStyle('primary')]}>
                        {getSubjectName(subject.name)}
                      </Text>
                      <Spacer />
                      {formattedAverage && (
                        <HStack spacing={1} alignment="firstTextBaseline">
                          <Text modifiers={[font({ family: papillonFont('semibold'), size: 18 })]}>
                            {formattedAverage.value.toFixed(2)}
                          </Text>
                          <Text
                            modifiers={[
                              font({ family: papillonFont('semibold'), size: 14 }),
                              foregroundStyle('secondary'),
                            ]}
                          >
                            {formattedAverage.denominator}
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                  }
                >
                  {(subject.grades ?? []).map((grade: Grade) => {
                    const score = grade.studentScore;
                    const isUsable = score && !score.disabled && typeof score.value === 'number';
                    const formattedScore = isUsable
                      ? formatScoreForDisplay(score!.value, grade.outOf?.value ?? 20, displayScale)
                      : undefined;

                    return (
                      <Button
                        key={grade.id}
                        onPress={() => router.push({ pathname: '/(tabs)/grades/[id]', params: { id: grade.id } })}
                        modifiers={[buttonStyle('automatic')]}
                      >
                        <HStack>
                          <VStack alignment="leading" spacing={4}>
                            <Text modifiers={[font({ family: papillonFont('semibold'), size: 17 }), foregroundStyle('primary')]}>
                              {grade.description || getSubjectName(subject.name)}
                            </Text>
                            {grade.givenAt && (
                              <Text
                                modifiers={[
                                  font({ family: papillonFont('medium'), size: 15 }),
                                  foregroundStyle('secondary'),
                                ]}
                              >
                                {grade.givenAt.toLocaleDateString(i18n.language, {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </Text>
                            )}
                          </VStack>

                          <Spacer />

                          <HStack spacing={1} alignment="firstTextBaseline">
                            <Text modifiers={[font({ family: papillonFont('semibold'), size: 20 }), foregroundStyle('primary')]}>
                              {formattedScore ? formattedScore.value.toFixed(2) : (score?.status ?? '—')}
                            </Text>
                            {formattedScore && (
                              <Text
                                modifiers={[
                                  font({ family: papillonFont('semibold'), size: 14 }),
                                  foregroundStyle('secondary'),
                                ]}
                              >
                                {formattedScore.denominator}
                              </Text>
                            )}
                          </HStack>
                        </HStack>
                      </Button>
                    );
                  })}
                </Section>
              );
            })
          )}
        </List>
      </Host>
    </>
  );
};

export default GradesView;
