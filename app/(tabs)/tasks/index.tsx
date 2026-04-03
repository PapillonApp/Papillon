import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import TasksHeader from './components/TasksHeader';
import TasksList from './components/TasksList';
import WeekPicker from './components/WeekPicker';
import { useHomeworkData } from './hooks/useHomeworkData';
import { useTaskFilters } from './hooks/useTaskFilters';
import { useWeekSelection } from './hooks/useWeekSelection';

import { useAlert } from "@/ui/components/AlertProvider";
import { useTheme } from '@react-navigation/native';

const TasksView: React.FC = () => {
  const alert = useAlert();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [shouldCollapseHeader, setShouldCollapseHeader] = useState(false);

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
    showUndoneOnly,
    setShowUndoneOnly,
    sortMethod,
    setSortMethod,
    collapsedGroups,
    toggleGroup,
    sections,
  } = useTaskFilters(homeworksFromCache, homework);

  const theme = useTheme();

  return (
    <>
      {showWeekPicker && (
        <WeekPicker
          selectedWeek={selectedWeek}
          onSelectWeek={onSelectWeek}
          onClose={() => setShowWeekPicker(false)}
        />
      )}
      <View style={[styles.container, Platform.OS === "android" && { backgroundColor: theme.colors.item }]}>
        <TasksHeader
          defaultWeek={defaultWeek}
          selectedWeek={selectedWeek}
          onToggleWeekPicker={toggleWeekPicker}
          setHeaderHeight={setHeaderHeight}
          setShowUndoneOnly={setShowUndoneOnly}
          setSortMethod={setSortMethod}
          setSearchTerm={setSearchTerm}
          sortMethod={sortMethod}
          shouldCollapseHeader={shouldCollapseHeader}
        />

        <TasksList
          sections={sections}
          headerHeight={headerHeight}
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

export default TasksView;