import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import React, { useEffect, useState, useCallback, memo } from "react";
import { FlatList, View } from "react-native";
import Reanimated, { FadeIn, FadeInDown, FadeOut, FadeOutUp } from "react-native-reanimated";
import SubjectTitle from "./SubjectTitle";
import { type Grade, type GradesPerSubject } from "@/services/shared/Grade";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteParameters } from "@/router/helpers/types";
import { anim2Papillon } from "@/utils/ui/animations";

interface SubjectItemProps {
  subject: GradesPerSubject;
  allGrades: Grade[];
  navigation: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>;
  index?: number;
}

const SubjectItem: React.FC<SubjectItemProps> = ({
  subject,
  allGrades,
  navigation,
  index = 0,
}) => {
  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  useEffect(() => {
    const data = getSubjectData(subject.average.subjectName);
    setSubjectData(data);
  }, [subject.average.subjectName]);

  if (!subjectData) {
    return null;
  }

  const renderGradeItem = useCallback(({ item, index }) => (
    <SubjectGradeItem
      subject={subject}
      grade={item}
      index={index}
      onPress={() => navigation.navigate("GradeDocument", { grade: item, allGrades })}
    />
  ), [subject, allGrades, navigation]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <NativeList
      animated
      key={subject.average.subjectName + "subjectItem"}
      entering={index < 3 && anim2Papillon(FadeInDown).duration(300).delay(80 * index)}
      exiting={index < 3 && anim2Papillon(FadeOutUp).duration(100).delay(80 * index)}
    >
      <SubjectTitle
        navigation={navigation}
        subject={subject}
        subjectData={subjectData}
        allGrades={allGrades}
      />

      <FlatList
        data={subject.grades}
        renderItem={renderGradeItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={8}
        windowSize={5}
      />
    </NativeList>
  );
};

interface SubjectGradeItemProps {
  subject: GradesPerSubject;
  grade: Grade;
  index: number;
  onPress: () => void;
}

const SubjectGradeItem: React.FC<SubjectGradeItemProps> = memo(({ subject, grade, index, onPress }) => {
  return (
    <Reanimated.View
      entering={FadeIn.duration(100)}
      exiting={FadeOut.duration(100)}
      key={grade.id + index + "subjectlistname"}
    >
      <NativeItem
        separator={index < subject.grades.length - 1}
        chevron={false}
        onPress={onPress}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <NativeText variant="default" numberOfLines={1}>
              {grade.description || "Note sans titre"}
            </NativeText>
            <NativeText variant="subtitle" numberOfLines={1}>
              {new Date(grade.timestamp).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </NativeText>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
            }}
          >
            <NativeText
              style={{
                fontSize: 17,
                lineHeight: 20,
                fontFamily: "medium",
              }}
            >
              {grade.student.disabled ? (grade.student.status === null ? "N. Not" : grade.student.status) : grade.student.value?.toFixed(2)}
            </NativeText>
            <NativeText
              style={{
                fontSize: 15,
                lineHeight: 15,
                opacity: 0.6,
              }}
            >
              /{grade.outOf.value?.toFixed(0) ?? "??"}
            </NativeText>
          </View>
        </View>
      </NativeItem>
    </Reanimated.View>
  );
});

export default memo(SubjectItem);