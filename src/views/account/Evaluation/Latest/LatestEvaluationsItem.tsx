import { NativeList, NativeText } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import {Evaluation, Skill} from "@/services/shared/Evaluation";
import {SkillLevelBadge} from "@/views/account/Evaluation/Atoms/SkillLevelBadge";

type EvaluationLatestItemProps = {
  evaluation: Evaluation;
  navigation: any;
  allEvaluations: Evaluation[];
};

const EvaluationLatestItem: React.FC<EvaluationLatestItemProps> = ({
  evaluation,
  navigation,
  allEvaluations,
}) => {
  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });
  const [skillLevelsList, setSkillLevelsList] = useState<Skill[]>([]);
  const [skillLevelsMoreNumber, setSkillLevelsMoreNumber] = useState<number>(0);

  useEffect(() => {
    const skillLevels = evaluation.skills
      .slice()
      .slice(0, 4);
    const skillLevelsMoreNumber = evaluation.skills.length - 4;

    setSkillLevelsList(skillLevels);
    setSkillLevelsMoreNumber(skillLevelsMoreNumber);
  }, [evaluation.skills]);

  const fetchSubjectData = () => {
    const data = getSubjectData(evaluation.subjectName);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [evaluation.subjectName]);

  return (
    <PressableScale
      onPress={() => navigation.navigate("EvaluationDocument", { evaluation, allEvaluations })}
    >
      <NativeList
        animated
        key={evaluation.id}
        style={{
          width: 230,
          height: 135,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: subjectData.color + "11",
          }}
        >
          <NativeText
            style={{
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            {subjectData.emoji}
          </NativeText>

          <NativeText
            style={{
              flex: 1,
            }}
            numberOfLines={1}
            variant="overtitle"
          >
            {subjectData.pretty}
          </NativeText>

          <NativeText numberOfLines={1} variant="subtitle">
            {new Date(evaluation.timestamp).toLocaleDateString("fr-FR", {
              month: "short",
              day: "numeric",
            })}
          </NativeText>
        </View>

        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            height: 62,
          }}
        >
          <NativeText
            numberOfLines={2}
            style={{
              lineHeight: 20,
            }}
          >
            {evaluation.name}
          </NativeText>
          {evaluation.name.length < 20 &&
                <NativeText
                  numberOfLines={1}
                  variant={"subtitle"}
                >
                  {evaluation.teacher}
                </NativeText>
          }
        </View>

        <View
          style={{
            justifyContent: "center",
            paddingHorizontal: 12,
            paddingBottom: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              width: "100%",
            }}
          >
            {skillLevelsList.map((skill, index) => (
              <NativeText
                key={index}
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                <SkillLevelBadge skillLevel={skill.level} />
              </NativeText>
            ))}

            {skillLevelsMoreNumber > 0 && (
              <NativeText
                style={{marginTop: -5}}
                variant={"subtitle"}
              >
                {`+${skillLevelsMoreNumber}`}
              </NativeText>
            )}
          </View>
        </View>
      </NativeList>
    </PressableScale>
  );
};

export default EvaluationLatestItem;
