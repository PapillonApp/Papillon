import { Papicons } from '@getpapillon/papicons';
import { LegendList } from '@legendapp/list';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, RefreshControl, View } from 'react-native';
import Reanimated, { LinearTransition, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getManager, subscribeManagerUpdate } from '@/services/shared';
import { GradeDisplaySettings, GradeScore, Period, Subject } from "@/services/shared/grade";
import { useSettingsStore } from "@/stores/settings";
import ChipButton from '@/ui/components/ChipButton';
import { CompactGrade } from '@/ui/components/CompactGrade';
import { Dynamic } from '@/ui/components/Dynamic';
import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import Icon from '@/ui/components/Icon';
import Item, { Trailing } from '@/ui/components/Item';
import LegacyList from '@/ui/components/List';
import Search from '@/ui/components/Search';
import Stack from '@/ui/components/Stack';
import TabHeader from '@/ui/components/TabHeader';
import TabHeaderTitle from '@/ui/components/TabHeaderTitle';
import LegacyTypography from '@/ui/components/Typography';
import { useKeyboardHeight } from '@/ui/hooks/useKeyboardHeight';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { getCurrentPeriod } from '@/utils/grades/helper/period';
import { getGradeScoreDenominator, isNumericGradeScore, isSameNumericScore } from '@/utils/grades/score';
import i18n from '@/utils/i18n';
import { getPeriodName, getPeriodNumber, isPeriodWithNumber } from "@/utils/services/periods";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

import Averages from './atoms/Averages';
import FeaturesMap from './atoms/FeaturesMap';
import { SubjectItem } from './atoms/Subject';
import { useGradeInfluence } from './hooks/useGradeInfluence';
import List from '@/ui/new/List';
import Typography from '@/ui/new/Typography';
import ActionMenu from '@/ui/components/ActionMenu';

function getSafeTimestamp(date: Date | undefined, fallback: number): number {
  if (!(date instanceof Date)) {
    return fallback;
  }

  const timestamp = date.getTime();
  return Number.isFinite(timestamp) ? timestamp : fallback;
}

function comparePeriodsForDisplay(a: Period, b: Period): number {
  const aEnd = getSafeTimestamp(a.end, Number.POSITIVE_INFINITY);
  const bEnd = getSafeTimestamp(b.end, Number.POSITIVE_INFINITY);
  const endDifference = aEnd - bEnd;
  if (endDifference !== 0) {
    return endDifference;
  }

  const aStart = getSafeTimestamp(a.start, Number.NEGATIVE_INFINITY);
  const bStart = getSafeTimestamp(b.start, Number.NEGATIVE_INFINITY);
  const startDifference = bStart - aStart;
  if (startDifference !== 0) {
    return startDifference;
  }

  const aDuration = aEnd - aStart;
  const bDuration = bEnd - bStart;
  if (Number.isFinite(aDuration) && Number.isFinite(bDuration)) {
    const durationDifference = aDuration - bDuration;
    if (durationDifference !== 0) {
      return durationDifference;
    }
  }

  return (a.name || "").localeCompare(b.name || "", i18n.language);
}

const GradesView: React.FC = () => {
  // Layout du header
  const [headerHeight, setHeaderHeight] = useState(0);

  // Thème
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomTabBarHeight = 0;
  const navigation = useNavigation();

  // Chargement
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [gradesLoading, setGradesLoading] = useState(true);
  const loading = periodsLoading || gradesLoading;

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sortings
  const settings = useSettingsStore(state => state.personalization);
  const mutateSettings = useSettingsStore(state => state.mutateProperty);

  const [sortMethod, setSortMethod] = useState<string>(settings.gradesSortMethod || "date");

  useEffect(() => {
    if (settings.gradesSortMethod) {
      setSortMethod(settings.gradesSortMethod);
    }
  }, [settings.gradesSortMethod]);

  const updateSortMethod = (method: string) => {
    setSortMethod(method);
    mutateSettings('personalization', { gradesSortMethod: method });
  };
  const sortings = [
    {
      label: t("Grades_Sorting_Alphabetical"),
      value: "alphabetical",
      papicon: "letter",
      icon: {
        ios: "character",
        android: "ic_alphabetical",
        papicon: "font",
      }
    },
    {
      label: t("Grades_Sorting_Date"),
      value: "date",
      papicon: "calendar",
      icon: {
        ios: "calendar",
        android: "ic_date",
        papicon: "calendar",
      }
    },
    {
      label: t("Grades_Sorting_Averages"),
      value: "averages",
      papicon: "grades",
      icon: {
        ios: "chart.xyaxis.line",
        android: "ic_averages",
        papicon: "grades",
      }
    },
  ];

  // Gestion du scroll
  const [shouldCollapseHeader, setShouldCollapseHeader] = useState(false);

  // Manager
  const manager = getManager();

  // Obtention des périodes
  const [periods, setPeriods] = useState<Period[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period>();

  const fetchPeriods = async (managerToUse = manager) => {
    if (currentPeriod || !managerToUse) { return; }
    setPeriodsLoading(true);

    const result = await managerToUse.getGradesPeriods();
    let currentPeriodFound = getCurrentPeriod(result);

    if (settings.gradesPeriodId) {
      const savedPeriod = result.find(p => p.id === settings.gradesPeriodId);
      if (savedPeriod) {
        currentPeriodFound = savedPeriod;
      }
    }

    const sortedResult = [...result].sort(comparePeriodsForDisplay);

    setPeriods(sortedResult);
    setCurrentPeriod(currentPeriodFound);
    setPeriodsLoading(false);
  };

  const sortedPeriods = useMemo(() => {
    return [...periods].sort(comparePeriodsForDisplay);
  }, [periods]);

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((updatedManager) => {
      fetchPeriods(updatedManager);
    });

    return () => unsubscribe();
  }, []);

  // Obtention des notes
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [features, setFeatures] = useState<GradeFeatures | null>(null);
  const [gradeDisplay, setGradeDisplay] = useState<GradeDisplaySettings | null>(null);
  const [serviceAverage, setServiceAverage] = useState<number | null>(null);
  const [serviceRank, setServiceRank] = useState<GradeScore | null>(null);

  const fetchGradesForPeriod = async (period: Period | undefined, managerToUse = manager) => {
    setGradesLoading(true);
    if (period && managerToUse) {
      const grades = await managerToUse.getGradesForPeriod(period, period.createdByAccount);

      setFeatures(grades?.features ?? null);
      setGradeDisplay(grades?.display ?? null);
      if (!grades || !grades.subjects) {
        setGradesLoading(false);
        return;
      }
      setSubjects(grades.subjects);
      if (isNumericGradeScore(grades.studentOverall)) {
        setServiceAverage(grades.studentOverall.value)
      } else {
        setServiceAverage(null);
      }

      if (isNumericGradeScore(grades.rank)) {
        setServiceRank(grades.rank)
      } else {
        setServiceRank(null);
      }

      requestAnimationFrame(() => {
        setTimeout(() => {
          setGradesLoading(false);
          setIsRefreshing(false);
        }, 200);
      });
    } else {
      setGradesLoading(false);
    }
  };

  // Fetch grades when current period changes
  useEffect(() => {
    fetchGradesForPeriod(currentPeriod);
  }, [currentPeriod]);

  const grades = useMemo(() => {
    return subjects.flatMap((subject) => subject.grades || []);
  }, [subjects]);

  const getSubjectById = useCallback((id: string) => {
    return subjects.find((subject) => subject.id === id);
  }, [subjects]);

  // Sort
  // Sort grades in subjects by date descending then sort subjects by latest grade descending
  const sortedSubjects = useMemo(() => {
    const subjectsCopy = subjects.map(subject => ({
      ...subject,
      grades: [...(subject.grades ?? [])].sort((a, b) => b.givenAt.getTime() - a.givenAt.getTime()),
    }));

    switch (sortMethod) {
      case "alphabetical":
        subjectsCopy.sort((a, b) => {
          const nameA = getSubjectName(a.name).toLowerCase();
          const nameB = getSubjectName(b.name).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;

      case "averages":
        subjectsCopy.sort((a, b) => {
          const aAvg = isNumericGradeScore(a.studentAverage) ? a.studentAverage.value : -1;
          const bAvg = isNumericGradeScore(b.studentAverage) ? b.studentAverage.value : -1;
          return bAvg - aAvg;
        });
        break;

      default:
        subjectsCopy.sort((a, b) => {
          const aLatestGrade = a.grades?.[0];
          const bLatestGrade = b.grades?.[0];

          if (!aLatestGrade && !bLatestGrade) { return 0; }
          if (!aLatestGrade) { return 1; }
          if (!bLatestGrade) { return -1; }

          return bLatestGrade.givenAt.getTime() - aLatestGrade.givenAt.getTime();
        });
        break;
    }

    return subjectsCopy;
  }, [subjects, sortMethod]);

  const sortedGrades = useMemo(() => {
    const gradesCopy = [...grades];
    gradesCopy.sort((a, b) => b.givenAt.getTime() - a.givenAt.getTime());
    return gradesCopy;
  }, [grades]);

  // Search
  const [searchText, setSearchText] = useState<string>("");
  const filteredSubjects = useMemo(() => {
    if (searchText.trim() === "") {
      return sortedSubjects;
    }

    const lowerSearchText = searchText.toLowerCase();

    return sortedSubjects.filter((subject) => {
      const subjectName = getSubjectName(subject.name).toLowerCase();
      if (subjectName.includes(lowerSearchText)) {
        return true;
      }

      // Also search in grades descriptions
      const matchingGrades = subject.grades?.filter((grade) => {
        return grade.description?.toLowerCase().includes(lowerSearchText);
      });

      return (matchingGrades?.length || 0) > 0;
    });
  }, [searchText, sortedSubjects]);

  // Refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    if (periods.length === 0) {
      fetchPeriods();
    }

    fetchGradesForPeriod(currentPeriod);
  }, [currentPeriod, periods]);

  const keyboardHeight = useKeyboardHeight();

  const footerStyle = useAnimatedStyle(() => ({
    height: keyboardHeight.value - bottomTabBarHeight,
  }));

  // influences
  const { getAvgInfluence, getAvgClassInfluence } = useGradeInfluence(subjects, getSubjectById);

  // header
  const ListHeader = useMemo(() => ((sortedGrades.length > 0 && searchText.length === 0) ? (
    <View style={{ marginBottom: 16 }}>
      <ErrorBoundary>
        <Averages
          grades={grades}
          color={colors.primary}
          realAverage={serviceAverage ?? undefined}
          scale={gradeDisplay?.scale ?? 20}
        />
      </ErrorBoundary>

      {serviceRank && (
        <LegacyList style={{ marginTop: 8 }}>
          <Item>
            <Icon opacity={0.5}>
              <Papicons name='crown' />
            </Icon>

            <LegacyTypography variant='title'>
              {t('Grades_Tab_Rank')}
            </LegacyTypography>
            <LegacyTypography variant='body1' color='secondary'>
              {t('Grades_Tab_Rank_Description')}
            </LegacyTypography>

            <Trailing>
              <Stack
                direction='horizontal'
                gap={4}
                vAlign='end'
                hAlign='end'
              >
                <LegacyTypography variant='h3' inline color='text'>
                  {serviceRank.value}
                </LegacyTypography>
                {typeof serviceRank.outOf === "number" && (
                  <LegacyTypography variant='body1' inline color='secondary'>
                    /{serviceRank.outOf}
                  </LegacyTypography>
                )}
              </Stack>
            </Trailing>
          </Item>
        </LegacyList>
      )}

      <View style={{ height: 16 }} />

      <Dynamic
        animated
        entering={PapillonAppearIn}
        exiting={PapillonAppearOut}
      >
        <Stack gap={8}>
          <Stack direction='horizontal' gap={8} vAlign='start' hAlign='center' style={{ opacity: 0.4 }} padding={[0, 0]}>
            <Icon size={20}>
              <Papicons name='star' />
            </Icon>
            <LegacyTypography variant='h6' color='text'>
              {t('Grades_Tab_Latest')}
            </LegacyTypography>
          </Stack>

          <LegendList
            horizontal
            data={sortedGrades.slice(0, 10)}
            style={{ overflow: 'visible', height: 140 + 24, width: Dimensions.get('window').width - 20 }}
            contentContainerStyle={{ gap: 12 }}
            estimatedItemSize={210 + 12}
            showsHorizontalScrollIndicator={false}
            recycleItems={true}
            keyExtractor={(item) => item.id}
            renderItem={({ item: grade }) =>
              <ErrorBoundary fallback={<View style={{ width: 140, height: 140 }} />}>
              <CompactGrade
                  key={grade.id + "_compactGrade_header"}
                  emoji={getSubjectEmoji(getSubjectById(grade.subjectId)?.name || "")}
                  title={getSubjectName(getSubjectById(grade.subjectId)?.name || "")}
                  description={grade.description}
                  skillLevel={grade.skills?.map((item) => item.score) ?? []}
                  score={isNumericGradeScore(grade.studentScore) ? grade.studentScore.value : undefined}
                  outOf={getGradeScoreDenominator(grade.studentScore, grade.outOf?.value ?? gradeDisplay?.scale ?? 20)}
                  disabled={grade.studentScore?.disabled}
                  status={grade.studentScore?.status}
                  showOutOf={isNumericGradeScore(grade.studentScore)}
                  color={getSubjectColor(getSubjectById(grade.subjectId)?.name || "")}
                  date={grade.givenAt}
                  hasMaxScore={isSameNumericScore(grade.studentScore, grade.maxScore)}
                  onPress={() => {
                    // @ts-expect-error navigation types
                    navigation.navigate('(modals)/grade', {
                      grade: grade,
                      subjectInfo: {
                        name: getSubjectName(getSubjectById(grade.subjectId)?.name || ""),
                        color: getSubjectColor(getSubjectById(grade.subjectId)?.name || ""),
                        emoji: getSubjectEmoji(getSubjectById(grade.subjectId)?.name || ""),
                        originalName: getSubjectById(grade.subjectId)?.name || ""
                      },
                      display: gradeDisplay,
                      avgInfluence: getAvgInfluence(grade),
                      avgClass: getAvgClassInfluence(grade),
                    })
                  }}
                />
              </ErrorBoundary>
            }
          />
        </Stack>
      </Dynamic>

      <ErrorBoundary>
        <FeaturesMap features={features} />
      </ErrorBoundary>

      <Dynamic animated>
        <Stack direction='horizontal' gap={8} vAlign='start' hAlign='center' style={{ opacity: 0.4 }} padding={[0, 0]}>
          <Icon size={20}>
            <Papicons name='grades' />
          </Icon>
          <LegacyTypography variant='h6' color='text'>
            {t('Grades_Tab_Subjects')}
          </LegacyTypography>
        </Stack>
      </Dynamic>
    </View>
  ) : null), [sortedGrades, searchText, grades, colors.primary, serviceAverage, serviceRank, features, gradeDisplay, navigation, getSubjectById, getAvgInfluence, getAvgClassInfluence]);

  return (
    <View
      style={{
        flex: 1,
        /* @ts-expect-error colors
        backgroundColor: colors.overground */
      }}
    >
      {/* Header */}
      <TabHeader
        onHeightChanged={setHeaderHeight}
        /* Nom de la période */
        title={
          <ActionMenu
            onPressAction={({ nativeEvent }) => {
              const actionId = nativeEvent.event;

              if (actionId.startsWith("period:")) {
                const selectedPeriodId = actionId.replace("period:", "");
                const newPeriod = sortedPeriods.find(period => period.id === selectedPeriodId);
                setCurrentPeriod(newPeriod);
                if (newPeriod?.id) {
                  mutateSettings('personalization', { gradesPeriodId: newPeriod.id });
                }
              }
            }}
            actions={
              sortedPeriods.map((period) => ({
                id: "period:" + period.id,
                title: (getPeriodName(period.name || "") + " " + (isPeriodWithNumber(period.name || "") ? getPeriodNumber(period.name || "0") : "")).trim(),
                subtitle: `${period.start.toLocaleDateString(i18n.language, {
                  month: "short",
                  year: "numeric",
                })
                  } - ${period.end.toLocaleDateString(i18n.language, {
                    month: "short",
                    year: "numeric",
                  })
                  } `,
                state: currentPeriod?.id === period.id ? "on" : "off",
                image: Platform.select({
                  ios: (getPeriodNumber(period.name || "0")) + ".calendar"
                }),
                imageColor: colors.text,
              }))
            }
          >
            <TabHeaderTitle
              color={colors.primary}
              leading={sortedPeriods.length > 0 ? getPeriodName(currentPeriod?.name || '') : t("Tab_Grades")}
              number={isPeriodWithNumber(currentPeriod?.name || '') ? getPeriodNumber(currentPeriod?.name || '') : undefined}
              loading={loading}
              chevron={sortedPeriods.length > 1}
            />
          </ActionMenu>
        }
        /* Filtres */
        trailing={
          <ChipButton
            onPressAction={({ nativeEvent }) => {
              const actionId = nativeEvent.event;
              if (actionId.startsWith("sort:")) {
                const selectedSorting = actionId.replace("sort:", "");
                updateSortMethod(selectedSorting);
              }
            }}
            actions={
              sortings.map((s) => ({
                id: "sort:" + s.value,
                title: s.label,
                state: sortMethod === s.value ? "on" : "off",
                papicon: s.icon.papicon,
                image: Platform.select({
                  ios: s.icon.ios,
                  android: s.icon.android,
                }),
                imageColor: colors.text,
              }))
            }
            icon={sortings.find(s => s.value === sortMethod)?.icon.papicon || 'filter'} chevron
          >
            {sortings.find(s => s.value === sortMethod)?.label || t("Grades_Sort")}
          </ChipButton>
        }
        /* Recherche */
        bottom={<Search placeholder={t('Grades_Search_Placeholder')} color='#2B7ED6' onTextChange={(text) => setSearchText(text)} />}
        shouldCollapseHeader={shouldCollapseHeader}
      />


      <List
      animated
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: (headerHeight - (Platform.OS === "ios" ? insets.top : 0)) + 12, paddingBottom: Platform.OS === "android" ? 16 : bottomTabBarHeight + 16 }}

        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: headerHeight - insets.top }}

        keyExtractor={(item: any) => item.id}
        itemLayoutAnimation={LinearTransition.springify()}

        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={headerHeight}
          />
        }

        ListHeaderComponent={ListHeader}

        ListFooterComponent={<Reanimated.View style={footerStyle} />}

        ListEmptyComponent={loading ? undefined :
          <Dynamic animated key={'empty-list:warn'} entering={PapillonAppearIn} exiting={PapillonAppearOut}>
            <Stack
              hAlign="center"
              vAlign="center"
              flex
              style={{ width: "100%" }}
            >
              <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
                <Papicons name={"Grades"} />
              </Icon>
              <LegacyTypography variant="h4" color="text" align="center">
                {t('Grades_Empty_Title')}
              </LegacyTypography>
              <LegacyTypography variant="body2" color="secondary" align="center">
                {t('Grades_Empty_Description')}
              </LegacyTypography>
            </Stack>
          </Dynamic>
        }
      >
        {filteredSubjects.map((subject) => (
          <SubjectItem
            key={subject.id}
            subject={subject}
            display={gradeDisplay ?? undefined}
            getAvgInfluence={getAvgInfluence}
            getAvgClassInfluence={getAvgClassInfluence}
          />
        ))}
      </List>
    </View>
  )
};

export default GradesView;
