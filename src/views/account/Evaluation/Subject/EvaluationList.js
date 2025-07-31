import { NativeItem, NativeList, NativeText, } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { animPapillon } from "@/utils/ui/animations";
import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import Reanimated, { FadeInDown, FadeInUp, FadeOutUp, } from "react-native-reanimated";
import SubjectTitle from "./SubjectTitle";
import { SkillLevelBadge } from "@/views/account/Evaluation/Atoms/SkillLevelBadge";
var SubjectItem = function (_a) {
    var subject = _a.subject, allEvaluations = _a.allEvaluations, navigation = _a.navigation;
    var _b = useState({
        color: "#888888",
        pretty: "Matière inconnue",
        emoji: "❓",
    }), subjectData = _b[0], setSubjectData = _b[1];
    var fetchSubjectData = function () {
        var data = getSubjectData(subject.subjectName);
        setSubjectData(data);
    };
    useEffect(function () {
        fetchSubjectData();
    }, [subject.subjectName]);
    return (<NativeList animated entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutUp)}>
      <SubjectTitle subjectData={subjectData}/>

      <FlatList data={subject.evaluations} renderItem={function (_a) {
            var item = _a.item, index = _a.index;
            return (<SubjectEvaluationItem subject={subject} evaluation={item} index={index} onPress={function () {
                    navigation.navigate("EvaluationDocument", { evaluation: item, allEvaluations: allEvaluations });
                }}/>);
        }} keyExtractor={function (item) { return item.id; }} removeClippedSubviews={true} maxToRenderPerBatch={10} initialNumToRender={8} windowSize={5}/>
    </NativeList>);
};
var SubjectEvaluationItem = function (_a) {
    var subject = _a.subject, evaluation = _a.evaluation, index = _a.index, onPress = _a.onPress;
    var _b = useState([]), skillLevelsList = _b[0], setSkillLevelsList = _b[1];
    var _c = useState(0), skillLevelsMoreNumber = _c[0], setSkillLevelsMoreNumber = _c[1];
    useEffect(function () {
        var skillLevels = evaluation.skills
            .slice()
            .slice(0, 4);
        var skillLevelsMoreNumber = evaluation.skills.length - 4;
        console.log("skillLevelsMoreNumber", skillLevelsMoreNumber);
        setSkillLevelsList(skillLevels);
        setSkillLevelsMoreNumber(skillLevelsMoreNumber);
    }, [evaluation.skills]);
    return (<Reanimated.View key={evaluation.id + index} entering={animPapillon(FadeInDown).delay(50 * index + 100)} exiting={animPapillon(FadeOutUp).delay(50 * index)}>
      <NativeItem separator={index < subject.evaluations.length - 1} chevron={false} onPress={function () { return onPress(); }}>
        <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
        }}>
          <View style={{
            flex: 1,
        }}>
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
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
        }}>
            {skillLevelsList.map(function (skill, index) { return (<SkillLevelBadge skillLevel={skill.level} key={index}/>); })}
            {skillLevelsMoreNumber > 0 && (<NativeText variant={"subtitle"} style={{ fontSize: 16 }}>
                {"+".concat(skillLevelsMoreNumber)}
              </NativeText>)}
          </View>
        </View>
      </NativeItem>
    </Reanimated.View>);
};
export default SubjectItem;
