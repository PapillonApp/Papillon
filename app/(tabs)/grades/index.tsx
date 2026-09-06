import React, { useCallback, useMemo, useState } from 'react';
import { Link, Stack, useTheme } from 'expo-router';
import { t } from 'i18next';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useFont } from '@/utils/theme/fonts';
import { FlatList, Platform, Pressable, RefreshControl, ScrollView, View } from 'react-native';
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
import List from '@/ui/new/List';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useResizable from '@/ui/utils/Resizable';
import CompactGrade from '@/ui/new/CompactGrade';
import { LinearGradient } from 'expo-linear-gradient';
import { Papicons } from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';

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
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const resize = useResizable();

  const { periods, currentPeriod, setCurrentPeriod, refresh: refreshPeriods, loading: loadingPeriods } = usePeriodsData();
  const { subjects, history, averages, isAverageServiceProvided, refresh: refreshGrades, loading: loadingGrades } = useGradesData(currentPeriod);

  const loading = loadingPeriods || loadingGrades;

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
    return sortedSubjects.reduce<Subject[]>((acc, subject) => {
      const subjectMatches = getSubjectName(subject.name).toLowerCase().includes(query);

      if (subjectMatches) {
        acc.push(subject);
        return acc;
      }

      const matchingGrades = (subject.grades ?? []).filter(grade => grade.description?.toLowerCase().includes(query));
      if (matchingGrades.length > 0) {
        acc.push({ ...subject, grades: matchingGrades });
      }

      return acc;
    }, []);
  }, [sortedSubjects, searchText]);

  const sortings = useMemo(() => getSortings(), [i18n.language]);

  // 10 last grades (with subject in them (without grades))
  const recentGrades = useMemo(() => {
    const allGrades = subjects.flatMap(subject => (subject.grades ?? []).map(grade => ({ ...grade, subject })));
    allGrades.sort((a, b) => (b.givenAt?.getTime() ?? 0) - (a.givenAt?.getTime() ?? 0));
    return allGrades.slice(0, 10);
  }, [subjects]);

  const [isSearchbarFocused, setIsSearchbarFocused] = useState(false);

  return (
    <>
      <Stack.SearchBar
        onChangeText={(e) => setSearchText(e.nativeEvent.text)}
        placeholder={"Rechercher une matière ou une note..."}
        onFocus={() => setIsSearchbarFocused(true)}
        onBlur={() => setIsSearchbarFocused(false)}
        autoCapitalize="none"
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Menu>
          <Stack.Toolbar.Icon sf="calendar" />
          <Stack.Toolbar.Label>
            {currentPeriod ? periodTitle(currentPeriod) : t('Grades_Periods_None')}
          </Stack.Toolbar.Label>
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
        style={{ fontFamily: papillonFont('semibold') }}
      >
        {t('Tab_Grades')}
      </Stack.Title>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu>
          <Stack.Toolbar.Icon sf="line.3.horizontal.decrease" />
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
      </Stack.Toolbar>

      <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: Platform.OS === 'ios' ? theme.colors.overground : theme.colors.background }}>
        <List
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} />}
          numColumns={resize.isLarge ? 2 : 1}
          ListHeaderComponent={() => (
            isSearchbarFocused ? <></> : (
              <View
                style={{
                  paddingVertical: 16,
                  gap: 12,
                  marginHorizontal: -16,
                }}>
                <View style={{ paddingHorizontal: 16 }}>
                  <Averages history={history} realAverage={isAverageServiceProvided ? averages.student?.value : undefined} color={theme.colors.primary} displayScale={displayScale} />
                </View>

                <FlatList
                  data={recentGrades}
                  renderItem={({ item: grade }) => (
                    <Link href={{ pathname: "/(tabs)/grades/[id]", params: { id: grade.id } }} asChild>
                      <Link.Preview />
                      <Link.Trigger>
                      <Link.AppleZoom>
                      <Pressable style={{ overflow: 'visible', margin: -24, padding: 24 }}>
                          <CompactGrade
                            grade={grade}
                            subject={grade.subject}
                          />
                      </Pressable>
                      </Link.AppleZoom>
                      </Link.Trigger>
                    </Link>
                  )}
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                  horizontal
                  contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, overflow: 'visible' }}
                  style={{ overflow: 'visible', marginVertical: -24 }}
                />
              </View>
            )
          )}
        >
          {filteredSubjects.map(subject => (
            <List.Section key={subject.id} id={subject.id}>
              <List.SectionTitle id={`${subject.id}-title`}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 }}>
                  <Typography variant="h4" style={{ marginTop: 0 }} inset>{getSubjectEmoji(subject.name)}</Typography>

                  <Typography style={{ flex: 1 }} variant="title" numberOfLines={1} weight='semibold' color="textPrimary">
                    {getSubjectName(subject.name)}
                  </Typography>

                  <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 1 }}>
                    <Typography variant="h5" weight='semibold' color="textSecondary">
                      {subject.studentAverage?.value.toFixed(2) ?? 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      /{subject.studentAverage?.outOf ?? 'N/A'}
                    </Typography>
                  </View>
                </View>
              </List.SectionTitle>

              {(subject.grades ?? []).map((grade: Grade) => {
                const score = grade.studentScore;
                const isUsable = score && !score.disabled && typeof score.value === 'number';
                const formattedScore = isUsable
                  ? formatScoreForDisplay(score!.value, grade.outOf?.value ?? 20, displayScale)
                  : undefined;

                return (
                  <List.Item
                    key={grade.id}
                    id={grade.id}
                    href={{ pathname: "/(tabs)/grades/[id]", params: { id: grade.id } }}
                  >
                    <View style={{ flex: 1, flexDirection: 'column', gap: 1 }}>
                      <Typography numberOfLines={1} weight='semibold' variant="title">{grade.description ?? 'No description'}</Typography>
                      {grade.givenAt && (
                        <Typography numberOfLines={1} variant="subtitle" color="textSecondary">
                          {grade.givenAt.toLocaleDateString(i18n.language, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Typography>
                      )}
                    </View>

                    <List.Trailing>
                      <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 1 }}>
                        <Typography weight='semibold' variant="h4">
                          {formattedScore ? formattedScore.value.toFixed(2) : (score?.status ?? 'N/A')}
                        </Typography>
                        {formattedScore && formattedScore.denominator && (
                          <Typography variant="subtitle" color="textSecondary">
                            {formattedScore.denominator}
                          </Typography>
                        )}
                      </View>
                    </List.Trailing>
                  </List.Item>
                );
              })}
            </List.Section>
          ))}
        </List>
      </SafeAreaView>
    </>
  );
};

export default GradesView;
