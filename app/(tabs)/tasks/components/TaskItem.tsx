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
import { useNavigation } from 'expo-router';

interface TaskItemProps {
  item: Homework;
  index: number;
  fromCache?: boolean;
  setAsDone: (item: Homework, done: boolean) => void;
}

const TaskItem = memo(
  ({
    item,
    fromCache = false,
    setAsDone
  }: TaskItemProps) => {
    const navigation = useNavigation();
    const cleanContent = useMemo(() => item.content.replace(/<[^>]*>/g, ""), [item.content]);
    const magic = useMagicPrediction(cleanContent);

    return (
      <Reanimated.View
        style={{ marginBottom: 10 }}
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
          completed={item.isDone}
          hasAttachments={item.attachments.length > 0}
          magic={magic}
          onToggle={() => setAsDone(item, !item.isDone)}
          onPress={() =>
            // @ts-ignore Modal types
            navigation.navigate("(modals)/task", {
              task: item
            })
          }
        />
      </Reanimated.View>
    );
  }
);

TaskItem.displayName = "TaskItem";
export default TaskItem;
