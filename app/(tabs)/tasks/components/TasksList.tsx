import React, { useCallback, useMemo } from "react";
import { Platform, RefreshControl, StyleSheet } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Homework } from "@/services/shared/homework";
import List from "@/ui/new/List";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import useResizable from "@/ui/utils/Resizable";
import { generateId } from "@/utils/generateId";

import DateHeader from "../atoms/DateHeader";
import EmptyState from "../atoms/EmptyState";
import TasksSummary from "../atoms/TasksSummary";
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
  headerHeight: number;
  searchTerm: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  collapsedGroups: string[];
  toggleGroup: (headerId: string) => void;
  sortMethod: string;
  homework: Record<string, Homework>;
  setAsDone: (item: Homework, done: boolean) => void;
}

const TasksList: React.FC<TasksListProps> = ({
  sections,
  headerHeight,
  searchTerm,
  isRefreshing,
  onRefresh,
  collapsedGroups,
  toggleGroup,
  sortMethod,
  homework,
  setAsDone,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isLarge } = useResizable();

  const renderTask = useCallback(
    (item: Homework, index: number) => {
      // Generate the same ID used to store homeworks in the homework object
      const generatedId = generateId(
        item.subject +
          item.content +
          item.createdByAccount +
          new Date(item.dueDate).toDateString()
      );
      const inFresh = homework[generatedId];
      const source = inFresh ?? item;
      const fromCache = !inFresh;

      return (
        <Reanimated.View
          layout={LinearTransition}
          entering={PapillonAppearIn}
          exiting={PapillonAppearOut}
        >
          <TaskItem
            item={source}
            index={index}
            fromCache={fromCache}
            setAsDone={(item, done) => {
              setAsDone(item, done);
            }}
          />
        </Reanimated.View>
      );
    },
    [homework, setAsDone]
  );

  const taskKeyExtractor = useCallback((item: Homework) => {
    return (
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
        paddingTop:
          headerHeight + (Platform.OS === "android" ? 10 : -insets.top + 10),
        paddingLeft: insets.left + 16,
      }}
      scrollIndicatorInsets={{
        top: headerHeight - insets.top,
      }}
      ListEmptyComponent={<EmptyState isSearching={searchTerm.length > 0} />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          progressViewOffset={headerHeight - insets.top}
          tintColor={colors.tint}
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
