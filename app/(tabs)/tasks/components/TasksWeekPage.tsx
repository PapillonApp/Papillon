import React, { useCallback, useMemo } from "react";

import { Homework } from "@/services/shared/homework";

import { buildHomeworkSections, type SortMethod } from "../hooks/useTaskFilters";
import TasksList from "./TasksList";

interface TasksWeekPageProps {
  week: number;
  /** `undefined` while the week has never been read from the cache. */
  homeworks?: Homework[];
  searchTerm: string;
  sortMethod: SortMethod;
  collapsedGroups: string[];
  toggleGroup: (headerId: string) => void;
  isRefreshing: boolean;
  onRefresh: (week: number) => void;
  setAsDone: (item: Homework, done: boolean) => void;
  /** Only the page the screen opens on animates its rows in — see TasksList. */
  animateItems?: boolean;
  /** The homework could not be loaded. */
  hasError?: boolean;
}

// One page of the week pager. Sections are derived here rather than on the
// screen so a page only recomputes when its own week changes.
const TasksWeekPage: React.FC<TasksWeekPageProps> = ({
  week,
  homeworks,
  searchTerm,
  sortMethod,
  collapsedGroups,
  toggleGroup,
  isRefreshing,
  onRefresh,
  setAsDone,
  animateItems,
  hasError,
}) => {
  const sections = useMemo(
    () => buildHomeworkSections(homeworks ?? [], { searchTerm, sortMethod }),
    [homeworks, searchTerm, sortMethod]
  );

  const handleRefresh = useCallback(() => onRefresh(week), [onRefresh, week]);

  return (
    <TasksList
      sections={sections}
      searchTerm={searchTerm}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      collapsedGroups={collapsedGroups}
      toggleGroup={toggleGroup}
      sortMethod={sortMethod}
      setAsDone={setAsDone}
      animateItems={animateItems}
      hasError={hasError}
      // Until the week has been read once, an empty page means "not loaded
      // yet", not "nothing to do".
      isLoaded={homeworks !== undefined}
    />
  );
};

export default React.memo(TasksWeekPage);
