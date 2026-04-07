import React, { useCallback, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';

import TasksHeader from './components/TasksHeader';
import type { SortMethod } from './components/TasksHeader';
import TasksWeekPage from './components/TasksWeekPage';
import WeekPicker from './components/WeekPicker';
import { useWeekSelection } from './hooks/useWeekSelection';

import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TasksView: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(insets.top + 118);
  const [shouldCollapseHeader, setShouldCollapseHeader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUndoneOnly, setShowUndoneOnly] = useState(false);
  const [sortMethod, setSortMethod] = useState<SortMethod>("date");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [activeWeekLoading, setActiveWeekLoading] = useState(true);

  const {
    defaultWeek,
    selectedWeek,
    flatListRef,
    getWeekFromIndex,
    showWeekPicker,
    toggleWeekPicker,
    onSelectWeek,
    onMomentumScrollEnd,
    onScroll,
    INITIAL_INDEX,
    windowWidth,
    setShowWeekPicker,
  } = useWeekSelection();

  const toggleGroup = useCallback((headerId: string) => {
    setCollapsedGroups(prev => {
      if (prev.includes(headerId)) {
        return prev.filter(id => id !== headerId);
      }
      return [...prev, headerId];
    });
  }, []);

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
      <View style={[styles.container]}>
        <TasksHeader
          defaultWeek={defaultWeek}
          selectedWeek={selectedWeek}
          isLoading={activeWeekLoading}
          onToggleWeekPicker={toggleWeekPicker}
          setHeaderHeight={setHeaderHeight}
          setShowUndoneOnly={setShowUndoneOnly}
          setSortMethod={setSortMethod}
          setSearchTerm={setSearchTerm}
          sortMethod={sortMethod}
          shouldCollapseHeader={shouldCollapseHeader}
        />

        <FlatList<number>
          ref={flatListRef}
          data={Array.from({ length: 20001 }, (_, index) => index)}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={INITIAL_INDEX}
          getItemLayout={(_, index) => ({
            length: windowWidth,
            offset: windowWidth * index,
            index,
          })}
          renderItem={({ item: index }) => {
            const weekNumber = getWeekFromIndex(index);
            return (
              <TasksWeekPage
                weekNumber={weekNumber}
                width={windowWidth}
                headerHeight={headerHeight}
                searchTerm={searchTerm}
                showUndoneOnly={showUndoneOnly}
                sortMethod={sortMethod}
                collapsedGroups={collapsedGroups}
                toggleGroup={toggleGroup}
                isActive={weekNumber === selectedWeek}
                onActiveStateChange={({ isLoading }) => {
                  if (weekNumber === selectedWeek) {
                    setActiveWeekLoading(isLoading);
                  }
                }}
              />
            );
          }}
          keyExtractor={(item) => `tasks-week:${item}`}
          onScroll={onScroll}
          decelerationRate={Platform.OS === 'ios' ? 0.98 : undefined}
          disableIntervalMomentum
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
          snapToInterval={windowWidth}
          bounces={false}
          windowSize={4}
          maxToRenderPerBatch={3}
          initialNumToRender={3}
          removeClippedSubviews
          extraData={{
            headerHeight,
            selectedWeek,
            searchTerm,
            showUndoneOnly,
            sortMethod,
            collapsedGroups,
          }}
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