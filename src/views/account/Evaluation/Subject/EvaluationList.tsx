import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { animPapillon } from "@/utils/ui/animations";
import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import Reanimated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
} from "react-native-reanimated";
import SubjectTitle from "./SubjectTitle";
import {Evaluation, EvaluationsPerSubject, Skill} from "@/services/shared/Evaluation";
import {SkillLevelBadge} from "@/views/account/Evaluation/Atoms/SkillLevelBadge";

interface SubjectItemProps {
  subject: EvaluationsPerSubject,
  allEvaluations: Evaluation[],
  navigation: any,
}

const SubjectItem: React.FC<SubjectItemProps> = ({
  subject,
  allEvaluations,
  navigation,
}) => {
  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const fetchSubjectData = () => {
    const data = getSubjectData(subject.subjectName);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [subject.subjectName]);

  return (
    <NativeList
      animated
      entering={animPapillon(FadeInUp)}
      exiting={animPapillon(FadeOutUp)}
    >
      <SubjectTitle
        subjectData={subjectData}
      />

      <FlatList
        data={subject.evaluations}
        renderItem={({ item, index }) => (
          <SubjectEvaluationItem
            subject={subject}
            evaluation={item}
            index={index}
            onPress={() => {
              navigation.navigate("EvaluationDocument", { evaluation:item, allEvaluations});
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={8}
        windowSize={5}
      />
    </NativeList>
  );
};

interface SubjectEvaluationItemProps {
  subject: EvaluationsPerSubject;
  evaluation: Evaluation;
  index: number;
  onPress: () => void;
}

const SubjectEvaluationItem: React.FC<SubjectEvaluationItemProps> = ({ subject, evaluation, index, onPress }) => {
  const [skillLevelsList, setSkillLevelsList] = useState<Skill[]>([]);
  const [skillLevelsMoreNumber, setSkillLevelsMoreNumber] = useState<number>(0);

  useEffect(() => {
    const skillLevels = evaluation.skills
      .slice()
      .slice(0, 4);
    const skillLevelsMoreNumber = evaluation.skills.length - 4;

    console.log("skillLevelsMoreNumber", skillLevelsMoreNumber);

    setSkillLevelsList(skillLevels);
    setSkillLevelsMoreNumber(skillLevelsMoreNumber);
  }, [evaluation.skills]);
  return (
    <Reanimated.View
      key={evaluation.id + index}
      entering={animPapillon(FadeInDown).delay(50 * index + 100)}
      exiting={animPapillon(FadeOutUp).delay(50 * index)}
    >
      <NativeItem
        separator={index < subject.evaluations.length - 1}
        chevron={false}
        onPress={() => onPress()}
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
              {evaluation.name || "Compétences sans titre"}
            </NativeText>
            <NativeText variant="subtitle" numberOfLines={1}>
              {new Date(evaluation.timestamp).toLocaleDateString("fr-FR", {
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
              alignItems: "center",
              gap: 7,
            }}
          >
            {skillLevelsList.map((skill, index) => (
              <SkillLevelBadge skillLevel={skill.level} key={index} />
            ))}
            {skillLevelsMoreNumber > 0 && (
              <NativeText variant={"subtitle"} style={{fontSize: 16}}>
                {`+${skillLevelsMoreNumber}`}
              </NativeText>
            )}
          </View>
        </View>
      </NativeItem>
    </Reanimated.View>
  );
};

export default SubjectItem;
