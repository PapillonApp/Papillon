import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import TasksHeader from '../../tasks/components/TasksHeader';
import TasksList from '../../tasks/components/TasksList';
import WeekPicker from '../../tasks/components/WeekPicker';
import { useHomeworkData } from '../../tasks/hooks/useHomeworkData';
import { useTaskFilters } from '../../tasks/hooks/useTaskFilters';
import { useWeekSelection } from '../../tasks/hooks/useWeekSelection';

import { useAlert } from "@/ui/components/AlertProvider";

const HomeTasksWidget = React.memo(() => {
    const alert = useAlert();

    const {
        selectedWeek,
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
        sortMethod,
        collapsedGroups,
        toggleGroup,
        sections,
    } = useTaskFilters(homeworksFromCache, homework);

    return (
        <>
            <View style={styles.container}>
                <TasksList
                    sections={sections}
                    headerHeight={0}
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
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default HomeTasksWidget;