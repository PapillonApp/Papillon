import React, { useCallback } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';

import Reanimated from 'react-native-reanimated';
import { useHomeworkData } from '../../tasks/hooks/useHomeworkData';
import { HomeworkSection, useTaskFilters } from '../../tasks/hooks/useTaskFilters';
import { useWeekSelection } from '../../tasks/hooks/useWeekSelection';

import { useAlert } from "@/ui/components/AlertProvider";
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { generateId } from '@/utils/generateId';
import { Homework } from "@/services/shared/homework";
import { LinearTransition } from 'react-native-reanimated';
import TaskItem from '../../tasks/components/TaskItem';
import Typography from '@/ui/components/Typography';
import { t } from 'i18next';
import Stack from '@/ui/components/Stack';

const HomeTasksWidget = React.memo(() => {
    const alert = useAlert();

    const { selectedWeek } = useWeekSelection();

    const {
        homework,
        homeworksFromCache,
        setAsDone,
    } = useHomeworkData(selectedWeek, alert);

    const {
        sortMethod,
        collapsedGroups,
        sections,
    } = useTaskFilters(homeworksFromCache, homework);

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

    const limitedSections = sections.slice(0, 1).map(section => ({
        ...section,
        data: section.data.slice(0, 2)
    }));

    const keyExtractor = useCallback((item: Homework) => {
        return "hw:" + item.subject + item.content + item.createdByAccount + new Date(item.dueDate).toDateString();
    }, []);

    if (limitedSections.length == 0) {
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
                    {t("Tasks_NoTasks_Title")}
                </Typography>
                <Typography align="center" variant="body1" color="secondary">
                    {t("Tasks_NoTasks_Description")}
                </Typography>
            </Stack>
        );
    }

    return (
        <SectionList
            scrollEnabled={false}
            sections={limitedSections}
            style={styles.list}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            stickySectionHeadersEnabled={false}
        />
    );
});

const styles = StyleSheet.create({
    list: {
        flex: 1,
        height: '100%',
    },
});

export default HomeTasksWidget;