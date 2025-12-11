import React, { useCallback } from 'react';
import { Platform, RefreshControl, SectionList, StyleSheet } from 'react-native';
import Reanimated, {
  createAnimatedComponent,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Homework } from "@/services/shared/homework";
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { generateId } from "@/utils/generateId";

import DateHeader from '../atoms/DateHeader';
import EmptyState from '../atoms/EmptyState';
import TasksSummary from '../atoms/TasksSummary';
import TaskItem from './TaskItem';

const AnimatedSectionList = createAnimatedComponent(SectionList<Homework, HomeworkSection>);

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
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item, index, section }: { item: Homework, index: number, section: HomeworkSection }) => {
      if (sortMethod === 'date' && collapsedGroups.includes(section.id)) {
        return null;
      }
      // Generate the same ID used to store homeworks in the homework object
      const generatedId = generateId(
        item.subject + item.content + item.createdByAccount + new Date(item.dueDate).toDateString()
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
    [homework, setAsDone, collapsedGroups, sortMethod]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: HomeworkSection }) => {
      if (!section.title || sortMethod !== 'date') {
        return null;
      }

      const isCollapsed = collapsedGroups.includes(section.id);

      return (
        <Reanimated.View layout={LinearTransition}>
          <DateHeader
            title={section.title}
            isCollapsed={isCollapsed}
            onToggle={() => toggleGroup(section.id)}
          />
        </Reanimated.View>
      );
    },
    [collapsedGroups, sortMethod, toggleGroup]
  );

  const keyExtractor = useCallback((item: Homework) => {
    return "hw:" + item.subject + item.content + item.createdByAccount + new Date(item.dueDate).toDateString();
  }, []);

  return (
    <AnimatedSectionList
      sections={sections}
      style={styles.list}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 100,
        paddingTop: headerHeight + (Platform.OS === 'android' ? 10 : 0),
      }}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      scrollIndicatorInsets={{
        top: headerHeight - insets.top
      }}
      renderSectionHeader={renderSectionHeader}
      ListEmptyComponent={<EmptyState isSearching={searchTerm.length > 0} />}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        searchTerm.trim().length === 0 ? (
          <TasksSummary sections={sections} />
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          progressViewOffset={headerHeight}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    height: '100%',
  },
});

export default TasksList;
