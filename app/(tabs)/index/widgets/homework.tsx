import React from "react";
import { FlatList } from "react-native";
import { Homework } from "@/services/shared/homework";
import TaskItem from "../../tasks/components/TaskItem";

export default function HomeHomeworkWidget({
  homeworks,
  setAsDone,
}: {
  homeworks: Homework[];
  setAsDone: (item: Homework, done: boolean) => void;
}) {
  return (
    <FlatList
      scrollEnabled={false}
      data={homeworks.slice(0, 4)}
      style={{ width: "100%", paddingHorizontal: 10, paddingBottom: 4 }}
      keyExtractor={(item) => item.id ?? `${item.subject}-${item.dueDate.toISOString()}`}
      renderItem={({ item, index }) => (
        <TaskItem item={item} index={index} animated={false} setAsDone={setAsDone} />
      )}
    />
  );
}
