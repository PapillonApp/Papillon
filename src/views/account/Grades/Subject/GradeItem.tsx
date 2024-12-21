import { useMemo, useCallback, memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeItem, NativeText } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import type { Grade } from "@/services/shared/Grade";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteParameters } from "@/router/helpers/types";

interface GradeItemProps {
  subject: {
    average: { subjectName: string };
    grades: any[];
  };
  grade: Grade;
  navigation: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>;
  index: number;
  totalItems: number;
  allGrades: Grade[];
}

// Extracted styles outside component to prevent recreation
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
  emojiContainer: {
    padding: 10,
    borderRadius: 100,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiText: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 23,
    width: 40,
    fontFamily: "medium",
    textAlignVertical: "center",
  },
});

// Extracted date formatting options
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
};

// Extracted Leading component for better separation of concerns
const LeadingEmoji = memo(({ color, emoji }: { color: string; emoji: string }) => (
  <View style={[styles.emojiContainer, { backgroundColor: color + "22" }]}>
    <Text style={styles.emojiText}>{emoji}</Text>
  </View>
));

const GradeItem: React.FC<GradeItemProps> = memo(({
  subject,
  grade,
  navigation,
  index,
  totalItems,
  allGrades,
}) => {
  // Memoized subject data
  const subjectData = useMemo(
    () => getSubjectData(subject.average.subjectName),
    [subject.average.subjectName]
  );

  // Memoized formatted date
  const formattedDate = useMemo(() =>
    new Date(grade.timestamp).toLocaleDateString("fr-FR", DATE_FORMAT_OPTIONS),
  [grade.timestamp]
  );

  // Memoized grade value
  const gradeValue = useMemo(() =>
    typeof grade.student.value === "number"
      ? grade.student.value.toFixed(2)
      : "N. not",
  [grade.student.value]
  );

  // Memoized max grade
  const maxGrade = useMemo(() =>
    `/${grade.outOf.value ?? "??"}`,
  [grade.outOf.value]
  );

  // Memoized navigation handler
  const handlePress = useCallback(() => {
    navigation.navigate("GradeDocument", { grade, allGrades });
  }, [navigation, grade, allGrades]);

  if(!subjectData) return null;

  return (
    <NativeItem
      separator={index < totalItems - 1}
      onPress={handlePress}
      chevron={false}
      animated
      leading={
        <LeadingEmoji
          color={subjectData.color}
          emoji={subjectData.emoji}
        />
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
          <NativeText style={styles.maxGrade}>{maxGrade}</NativeText>
        </View>
      </View>
    </NativeItem>
  );
});

// Add display name for better debugging
GradeItem.displayName = "GradeItem";

export default GradeItem;