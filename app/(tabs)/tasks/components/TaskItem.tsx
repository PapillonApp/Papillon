import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { Homework } from "@/services/shared/homework";
import Task from "@/ui/components/Task";
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';
import { getSubjectName } from "@/utils/subjects/name";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectColor } from "@/utils/subjects/colors";
import { useMagicPrediction } from '../hooks/useMagicPrediction';

interface TaskItemProps {
    item: Homework;
    index: number;
    fromCache?: boolean;
    onProgressChange: (item: Homework, newProgress: number) => void;
}

const TaskItem = memo(
    ({
        item,
        fromCache = false,
        onProgressChange
    }: TaskItemProps) => {
        const cleanContent = useMemo(() => item.content.replace(/<[^>]*>/g, ""), [item.content]);
        const magic = useMagicPrediction(cleanContent);

        return (
            <Reanimated.View style={styles.taskContainer}
                entering={PapillonAppearIn}
                exiting={PapillonAppearOut}
            >
                <Task
                    subject={getSubjectName(item.subject)}
                    emoji={getSubjectEmoji(item.subject)}
                    title={""}
                    color={getSubjectColor(item.subject)}
                    description={item.content}
                    date={new Date(item.dueDate)}
                    progress={item.isDone ? 1 : 0}
                    fromCache={fromCache ?? false}
                    attachments={item.attachments}
                    onProgressChange={(newProgress: number) => onProgressChange(item, newProgress)}
                />
            </Reanimated.View>
        );
    }
);
TaskItem.displayName = "TaskItem";

const styles = StyleSheet.create({
    taskContainer: {
        marginBottom: 16,
    },
});

export default TaskItem;
