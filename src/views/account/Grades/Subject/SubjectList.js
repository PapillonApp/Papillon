import { NativeItem, NativeList, NativeText, } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import React, { useEffect, useState, useCallback, memo } from "react";
import { FlatList, View } from "react-native";
import Reanimated, { FadeIn, FadeInDown, FadeOut, FadeOutUp } from "react-native-reanimated";
import SubjectTitle from "./SubjectTitle";
import { anim2Papillon } from "@/utils/ui/animations";
var SubjectItem = function (_a) {
    var subject = _a.subject, allGrades = _a.allGrades, navigation = _a.navigation, _b = _a.index, index = _b === void 0 ? 0 : _b;
    var _c = useState({
        color: "#888888",
        pretty: "Matière inconnue",
        emoji: "❓",
    }), subjectData = _c[0], setSubjectData = _c[1];
    useEffect(function () {
        var data = getSubjectData(subject.average.subjectName);
        setSubjectData(data);
    }, [subject.average.subjectName]);
    if (!subjectData) {
        return null;
    }
    var renderGradeItem = useCallback(function (_a) {
        var item = _a.item, index = _a.index;
        return (<SubjectGradeItem subject={subject} grade={item} index={index} onPress={function () { return navigation.navigate("GradeDocument", { grade: item, allGrades: allGrades }); }}/>);
    }, [subject, allGrades, navigation]);
    var keyExtractor = useCallback(function (item) { return item.id; }, []);
    return (<NativeList animated key={subject.average.subjectName + "subjectItem"} entering={index < 3 && anim2Papillon(FadeInDown).duration(300).delay(80 * index)} exiting={index < 3 && anim2Papillon(FadeOutUp).duration(100).delay(80 * index)}>
      <SubjectTitle navigation={navigation} subject={subject} subjectData={subjectData} allGrades={allGrades}/>

      <FlatList data={subject.grades} renderItem={renderGradeItem} keyExtractor={keyExtractor} removeClippedSubviews={true} maxToRenderPerBatch={10} initialNumToRender={8} windowSize={5}/>
    </NativeList>);
};
var SubjectGradeItem = memo(function (_a) {
    var _b, _c, _d;
    var subject = _a.subject, grade = _a.grade, index = _a.index, onPress = _a.onPress;
    return (<Reanimated.View entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)} key={grade.id + index + "subjectlistname"}>
      <NativeItem separator={index < subject.grades.length - 1} chevron={false} onPress={onPress}>
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
          <View style={{
            flexDirection: "row",
            alignItems: "flex-end",
        }}>
            <NativeText style={{
            fontSize: 17,
            lineHeight: 20,
            fontFamily: "medium",
        }}>
              {grade.student.disabled ? (grade.student.status === null ? "N. Not" : grade.student.status) : (_b = grade.student.value) === null || _b === void 0 ? void 0 : _b.toFixed(2)}
            </NativeText>
            <NativeText style={{
            fontSize: 15,
            lineHeight: 15,
            opacity: 0.6,
        }}>
              /{(_d = (_c = grade.outOf.value) === null || _c === void 0 ? void 0 : _c.toFixed(0)) !== null && _d !== void 0 ? _d : "??"}
            </NativeText>
          </View>
        </View>
      </NativeItem>
    </Reanimated.View>);
});
export default memo(SubjectItem);
