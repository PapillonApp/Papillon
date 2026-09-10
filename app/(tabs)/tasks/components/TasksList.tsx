import React, { useCallback, useMemo } from "react";
import { RefreshControl, StyleSheet } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Homework } from "@/services/shared/homework";
import List from "@/ui/new/List";
import useResizable from "@/ui/utils/Resizable";

import DateHeader from "../atoms/DateHeader";
import EmptyState from "../atoms/EmptyState";
import TaskItem from "./TaskItem";
import { useTheme } from "expo-router/react-navigation";

export interface HomeworkSection {
  id: string;
  title: string;
  date?: Date;
  data: Homework[];
}

interface TasksListProps {
  sections: HomeworkSection[];
  searchTerm: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  collapsedGroups: string[];
  toggleGroup: (headerId: string) => void;
  sortMethod: string;
  setAsDone: (item: Homework, done: boolean) => void;
  isLoaded?: boolean;
  /**
   * Rows animate in only on the page the screen opened with. Every other page
   * is mounted off-screen by the week pager, where a couple of dozen entering
   * animations would cost frames without anyone seeing them.
   */
  animateItems?: boolean;
}

const TasksList: React.FC<TasksListProps> = ({
  sections,
  searchTerm,
  isRefreshing,
  onRefresh,
  collapsedGroups,
  toggleGroup,
  sortMethod,
  setAsDone,
  isLoaded = true,
  animateItems = true,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isLarge } = useResizable();

  // Items arrive already merged with the freshly fetched homework, so a row
  // only needs the item itself — no per-row lookup, no per-row id hashing.
  const renderTask = useCallback(
    (item: Homework, index: number) => (
      <Reanimated.View layout={LinearTransition}>
        <TaskItem
          item={item}
          index={index}
          fromCache={item.fromCache}
          animated={animateItems}
          setAsDone={setAsDone}
        />
      </Reanimated.View>
    ),
    [setAsDone, animateItems]
  );

  const taskKeyExtractor = useCallback((item: Homework) => {
    return (
      item.id ??
      "hw:" +
        item.subject +
        item.content +
        item.createdByAccount +
        new Date(item.dueDate).toDateString()
    );
  }, []);

  const visibleSections = useMemo(
    () => sections.filter(section => section.data.length > 0),
    [sections]
  );
  const showsDayGroups =
    sortMethod === "date" && searchTerm.trim().length === 0;
  const numColumns = isLarge && showsDayGroups ? 2 : 1;

  return (
    <List
      key={`tasks-list-${numColumns}`}
      animated
      numColumns={numColumns}
      maintainVisibleContentPosition={{ disabled: true }}
      style={[styles.list, { backgroundColor: colors.overground }]}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingLeft: insets.left + 16,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      ListEmptyComponent={
        isLoaded ? <EmptyState isSearching={searchTerm.length > 0} /> : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {visibleSections.map(section => {
        const isCollapsed = collapsedGroups.includes(section.id);

        return (
          <Reanimated.View key={section.id} layout={LinearTransition}>
            {section.title && sortMethod === "date" && (
              <DateHeader
                title={section.title}
                isCollapsed={isCollapsed}
                onToggle={() => toggleGroup(section.id)}
              />
            )}

            {!isCollapsed &&
              section.data.map((item, index) => (
                <React.Fragment key={taskKeyExtractor(item)}>
                  {renderTask(item, index)}
                </React.Fragment>
              ))}
          </Reanimated.View>
        );
      })}
    </List>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    height: "100%",
  },
});

export default TasksList;
