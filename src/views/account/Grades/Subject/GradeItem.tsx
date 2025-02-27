import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeItem, NativeText } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import type { Grade } from "@/services/shared/Grade";
import type { RouteParameters } from "@/router/helpers/types";
import { NavigationContainerRef } from "@react-navigation/native";

interface GradeItemProps {
  subject: { average: { subjectName: string }; grades: any[] };
  grade: Grade;
  navigation: NavigationContainerRef<RouteParameters> | null;
  index: number;
  totalItems: number;
  allGrades: Grade[];
}

const GradeItem: React.FC<GradeItemProps> = ({
  subject,
  grade,
  navigation,
  index,
  totalItems,
  allGrades,
}) => {
  const subjectData = useMemo(
    () => getSubjectData(subject.average.subjectName),
    [subject.average.subjectName]
  );

  const formattedDate = new Date(grade.timestamp).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const gradeValue =
		(typeof grade.student.value === "number" && !isNaN(grade.student.value))
		  ? grade.student.value.toFixed(2)
		  : "N. not";

  return (
    <NativeItem
      separator={index < totalItems - 1}
      onPress={() => navigation?.navigate("GradeDocument", { grade, allGrades })}
      chevron={false}
      animated
      leading={
        <View
          style={{
            backgroundColor: subjectData.color + "22",
            padding: 10,
            borderRadius: 100,
            height: 40,
            width: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
              lineHeight: 23,
              width: 40,
              fontFamily: "medium",
              textAlignVertical: "center",
            }}
          >
            {subjectData.emoji}
          </Text>
        </View>
      }
    >
      <View style={styles.container}>
        <View style={styles.leftContent}>
          <NativeText variant="default" numberOfLines={1}>
            {subjectData.pretty}
          </NativeText>
          <NativeText variant="subtitle" numberOfLines={1}>
            {formattedDate}
          </NativeText>
        </View>
        <View style={styles.rightContent}>
          <NativeText style={styles.gradeValue}>{gradeValue}</NativeText>
          <NativeText style={styles.maxGrade}>
            /{grade.outOf.value ?? "??"}
          </NativeText>
        </View>
      </View>
    </NativeItem>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  gradeValue: {
    fontSize: 19,
    lineHeight: 20,
    fontFamily: "medium",
  },
  maxGrade: {
    fontSize: 15,
    lineHeight: 15,
    opacity: 0.6,
  },
});

export default GradeItem;
