import React, { useEffect } from "react";
import { View } from "react-native";

import { useAlert } from "@/ui/components/AlertProvider";

import { SortMethod } from "../components/TasksHeader";
import { useHomeworkData } from "../hooks/useHomeworkData";
import { useTaskSections } from "../hooks/useTaskFilters";
import TasksList from "./TasksList";

interface ActiveWeekState {
  isLoading: boolean;
}

interface TasksWeekPageProps {
  weekNumber: number;
  width: number;
  headerHeight: number;
  searchTerm: string;
  showUndoneOnly: boolean;
  sortMethod: SortMethod;
  collapsedGroups: string[];
  toggleGroup: (headerId: string) => void;
  isActive: boolean;
  onActiveStateChange?: (state: ActiveWeekState) => void;
}

const TasksWeekPage: React.FC<TasksWeekPageProps> = ({
  weekNumber,
  width,
  headerHeight,
  searchTerm,
  showUndoneOnly,
  sortMethod,
  collapsedGroups,
  toggleGroup,
  isActive,
  onActiveStateChange,
}) => {
  const alert = useAlert();
  const {
    homework,
    homeworksFromCache,
    isLoading,
    isRefreshing,
    handleRefresh,
    setAsDone,
  } = useHomeworkData(weekNumber, alert, { enabled: isActive });

  const sections = useTaskSections(homeworksFromCache, homework, {
    searchTerm,
    showUndoneOnly,
    sortMethod,
  });

  useEffect(() => {
    if (isActive) {
      onActiveStateChange?.({ isLoading });
    }
  }, [isActive, isLoading, onActiveStateChange]);

  return (
    <View style={{ width, flex: 1 }}>
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
  );
};

export default React.memo(TasksWeekPage);
