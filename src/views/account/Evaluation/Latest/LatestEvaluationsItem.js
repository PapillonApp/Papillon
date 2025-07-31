import { NativeList, NativeText } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { SkillLevelBadge } from "@/views/account/Evaluation/Atoms/SkillLevelBadge";
var EvaluationLatestItem = function (_a) {
    var evaluation = _a.evaluation, navigation = _a.navigation, allEvaluations = _a.allEvaluations;
    var _b = useState({
        color: "#888888",
        pretty: "Matière inconnue",
        emoji: "❓",
    }), subjectData = _b[0], setSubjectData = _b[1];
    var _c = useState([]), skillLevelsList = _c[0], setSkillLevelsList = _c[1];
    var _d = useState(0), skillLevelsMoreNumber = _d[0], setSkillLevelsMoreNumber = _d[1];
    useEffect(function () {
        var skillLevels = evaluation.skills
            .slice()
            .slice(0, 4);
        var skillLevelsMoreNumber = evaluation.skills.length - 4;
        setSkillLevelsList(skillLevels);
        setSkillLevelsMoreNumber(skillLevelsMoreNumber);
    }, [evaluation.skills]);
    var fetchSubjectData = function () {
        var data = getSubjectData(evaluation.subjectName);
        setSubjectData(data);
    };
    useEffect(function () {
        fetchSubjectData();
    }, [evaluation.subjectName]);
    return (<PressableScale onPress={function () { return navigation.navigate("EvaluationDocument", { evaluation: evaluation, allEvaluations: allEvaluations }); }}>
      <NativeList animated key={evaluation.id} style={{
            width: 230,
            height: 135,
        }}>
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: subjectData.color + "11",
        }}>
          <NativeText style={{
            fontSize: 16,
            lineHeight: 24,
        }}>
            {subjectData.emoji}
          </NativeText>

          <NativeText style={{
            flex: 1,
        }} numberOfLines={1} variant="overtitle">
            {subjectData.pretty}
          </NativeText>

          <NativeText numberOfLines={1} variant="subtitle">
            {new Date(evaluation.timestamp).toLocaleDateString("fr-FR", {
            month: "short",
            day: "numeric",
        })}
          </NativeText>
        </View>

        <View style={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            height: 62,
        }}>
          <NativeText numberOfLines={2} style={{
            lineHeight: 20,
        }}>
            {evaluation.name}
          </NativeText>
          {evaluation.name.length < 20 &&
            <NativeText numberOfLines={1} variant={"subtitle"}>
                  {evaluation.teacher}
                </NativeText>}
        </View>

        <View style={{
            justifyContent: "center",
            paddingHorizontal: 12,
            paddingBottom: 10,
        }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            width: "100%",
        }}>
            {skillLevelsList.map(function (skill, index) { return (<NativeText key={index} style={{
                fontSize: 14,
                lineHeight: 20,
            }}>
                <SkillLevelBadge skillLevel={skill.level}/>
              </NativeText>); })}

            {skillLevelsMoreNumber > 0 && (<NativeText style={{ marginTop: -5 }} variant={"subtitle"}>
                {"+".concat(skillLevelsMoreNumber)}
              </NativeText>)}
          </View>
        </View>
      </NativeList>
    </PressableScale>);
};
export default EvaluationLatestItem;
