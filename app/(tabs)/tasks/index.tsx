import { Stack } from 'expo-router';
import { t } from 'i18next';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { getDateRangeOfWeek, getWeekNumberFromDate } from '@/database/useHomework';
import { useAlert } from "@/ui/components/AlertProvider";
import MainTabErrorBoundary from '@/ui/components/MainTabErrorBoundary';
import i18n from '@/utils/i18n';
import { useFont } from '@/utils/theme/fonts';

import TasksList from './components/TasksList';
import WeekPicker from './components/WeekPicker';
import { useHomeworkData } from './hooks/useHomeworkData';
import { useTaskFilters } from './hooks/useTaskFilters';
import { useWeekSelection } from './hooks/useWeekSelection';
import type { SortMethod } from './hooks/useTaskFilters';

const getSortings = (): { value: SortMethod; label: string; sf: SFSymbol }[] => [
  { value: 'date', label: t('Tasks_Sorting_Methods_DueDate'), sf: 'calendar' },
  { value: 'subject', label: t('Tasks_Sorting_Methods_Subject'), sf: 'character' },
  { value: 'done', label: t('Tasks_Sorting_Methods_Done'), sf: 'checkmark.circle' },
];

const TasksView: React.FC = () => {
  const alert = useAlert();
  const papillonFont = useFont();

  const {
    defaultWeek,
    selectedWeek,
    showWeekPicker,
    toggleWeekPicker,
    onSelectWeek,
    setShowWeekPicker,
  } = useWeekSelection();

  const {
    homework,
    homeworksFromCache,
    isRefreshing,
    handleRefresh,
    setAsDone,
  } = useHomeworkData(selectedWeek, alert);

  const {
    searchTerm,
    setSearchTerm,
    sortMethod,
    setSortMethod,
    collapsedGroups,
    toggleGroup,
    sections,
  } = useTaskFilters(homeworksFromCache, homework);

  const sortings = useMemo(() => getSortings(), [i18n.language]);

  const weekNumberDisplay = getWeekNumberFromDate(getDateRangeOfWeek(selectedWeek, new Date().getFullYear()).start);

  const weekLabel = selectedWeek === defaultWeek
    ? t('Tasks_ThisWeek')
    : `${t('Tasks_Week')} ${weekNumberDisplay}`;

  return (
    <>
      {showWeekPicker && (
        <WeekPicker
          selectedWeek={selectedWeek}
          onSelectWeek={onSelectWeek}
          onClose={() => setShowWeekPicker(false)}
        />
      )}

      <Stack.SearchBar
        placeholder={t('Tasks_Search_Placeholder')}
        onChangeText={(e) => setSearchTerm(e.nativeEvent.text)}
        autoCapitalize="none"
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="calendar" onPress={toggleWeekPicker}>
          {weekLabel}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <Stack.Title style={{ fontFamily: papillonFont('semibold'), fontSize: 17 }}>
        {`${t('Tasks_Week')} ${weekNumberDisplay}`}
      </Stack.Title>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu>
          <Stack.Toolbar.Icon sf="line.3.horizontal.decrease" />
          <Stack.Toolbar.Label>{t('Task_Sorting_Title')}</Stack.Toolbar.Label>
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

      <View style={styles.container}>
        <TasksList
          sections={sections}
          searchTerm={searchTerm}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          collapsedGroups={collapsedGroups}
          toggleGroup={toggleGroup}
          sortMethod={sortMethod}
          homework={homework}
          setAsDone={setAsDone}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const TasksViewWithBoundary = () => (
  <MainTabErrorBoundary>
    <TasksView />
  </MainTabErrorBoundary>
);

export default TasksViewWithBoundary;
