import { NativeText } from "@/components/Global/NativeComponents";
import { getCourseSpeciality } from "@/utils/format/format_cours_name";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React, { useEffect } from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getSubjectAverage } from "@/utils/grades/getAverages";
import { adjustColor } from "@/utils/ui/colors";
var SubjectTitle = function (_a) {
    var _b, _c;
    var navigation = _a.navigation, subject = _a.subject, subjectData = _a.subjectData, allGrades = _a.allGrades;
    var theme = useTheme();
    var _d = React.useState(-1), calculatedAverage = _d[0], setCalculatedAverage = _d[1];
    useEffect(function () {
        setCalculatedAverage((subject.grades.length > 0 ? getSubjectAverage(subject.grades, "student") : -1));
    }, [subject.grades]);
    return (<TouchableOpacity style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: subjectData.color + "11",
        }} onPress={function () {
            navigation.navigate("GradeSubject", { subject: subject, allGrades: allGrades });
        }}>
      <View style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        }}>
        <NativeText style={{
            fontSize: 18,
            lineHeight: 24,
        }}>
          {subjectData.emoji}
        </NativeText>
        <NativeText style={{
            flex: 1,
            color: adjustColor(subjectData.color, theme.dark ? 180 : -100),
        }} numberOfLines={1} variant="overtitle">
          {subjectData.pretty}
        </NativeText>

        {getCourseSpeciality(subject.average.subjectName) && (<NativeText style={{
                textAlign: "right",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderColor: adjustColor(subjectData.color, theme.dark ? 180 : -100) + "55",
                borderWidth: 1,
                borderRadius: 8,
                borderCurve: "continuous",
                maxWidth: 120,
                color: adjustColor(subjectData.color, theme.dark ? 180 : -100),
            }} numberOfLines={1} variant="subtitle">
            {getCourseSpeciality(subject.average.subjectName)}
          </NativeText>)}
      </View>

      <View style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 2,
        }}>
        <NativeText style={{
            fontSize: 18,
            lineHeight: 20,
            fontFamily: "semibold",
            color: adjustColor(subjectData.color, theme.dark ? 180 : -100),
        }}>{typeof ((_b = subject.average.average) === null || _b === void 0 ? void 0 : _b.value) === "number" ? subject.average.average.value.toFixed(2) : calculatedAverage !== -1 ? calculatedAverage.toFixed(2) : "N/A"}</NativeText>
        <NativeText style={{
            fontSize: 15,
            lineHeight: 15,
            color: adjustColor(subjectData.color, theme.dark ? 180 : -100),
            opacity: 0.6,
        }}>
          /{(_c = subject.average.outOf) === null || _c === void 0 ? void 0 : _c.value}
        </NativeText>
      </View>
    </TouchableOpacity>);
};
export default SubjectTitle;
