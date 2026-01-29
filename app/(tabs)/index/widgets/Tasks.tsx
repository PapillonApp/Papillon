import { LegendList } from '@legendapp/list';
import { t } from 'i18next';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Reanimated from 'react-native-reanimated';
import { LinearTransition } from 'react-native-reanimated';

import { Homework } from "@/services/shared/homework";
import { useAlert } from "@/ui/components/AlertProvider";
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { generateId } from '@/utils/generateId';

import TaskItem from '../../tasks/components/TaskItem';
import { useHomeworkData } from '../../tasks/hooks/useHomeworkData';
import { useTaskFilters } from '../../tasks/hooks/useTaskFilters';
import { useWeekSelection } from '../../tasks/hooks/useWeekSelection';

const HomeTasksWidget = React.memo(() => {
  const alert = useAlert();

  const { selectedWeek } = useWeekSelection();

  const {
    homework,
    homeworksFromCache,
    setAsDone,
  } = useHomeworkData(selectedWeek, alert);

  const {
    sections,
  } = useTaskFilters(homeworksFromCache, homework);

  const renderItem = useCallback(
    ({ item, index }: { item: Homework, index: number }) => {
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
          style={{
            width: 320
          }}
        >
          <TaskItem
            item={source}
            index={index}
            fromCache={fromCache}
            showCompletedButton={false}
            setAsDone={setAsDone}
          />
        </Reanimated.View>
      );
    },
    [homework, setAsDone]
  );

  const data = React.useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowSection = sections.find(section => {
      if (!section.data.length) { return false; }

      const sectionDate = new Date(section.data[0].dueDate);
      sectionDate.setHours(0, 0, 0, 0);

      return sectionDate.getTime() === tomorrow.getTime();
    });

    return tomorrowSection ? tomorrowSection.data : [];
  }, [sections]);

  const keyExtractor = useCallback((item: Homework) => {
    return "hw:" + item.subject + item.content + item.createdByAccount + new Date(item.dueDate).toDateString();
  }, []);

  if (data.length === 0) {
    return (
      <Stack
        inline flex
        hAlign="center"
        vAlign="center"
        padding={[22, 16]}
        gap={2}
        style={{ paddingTop: 12 }}
      >
        <Typography align="center" variant="title" color="text">
          {t("Home_Widget_NoTasks")}
        </Typography>
        <Typography align="center" variant="body1" color="secondary">
          {t("Home_Widget_NoTasks_Description")}
        </Typography>
      </Stack>
    );
  }

  return (
    <LegendList
      horizontal
      data={data}

      style={styles.list}
      contentContainerStyle={{ paddingLeft: 12, gap: 12 }}

      keyExtractor={keyExtractor}
      renderItem={renderItem}

      recycleItems={true}
      decelerationRate="normal"
      disableIntervalMomentum={false}
      estimatedItemSize={320}

      showsHorizontalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({
  list: {
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    flex: 1,
    height: "100%"
  },
});

export default HomeTasksWidget;