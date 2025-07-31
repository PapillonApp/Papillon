import { NativeList, NativeText } from "@/components/Global/NativeComponents";
import { getCourseSpeciality } from "@/utils/format/format_cours_name";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React from "react";
import { View } from "react-native";
export var GradeTitle = function (_a) {
    var _b, _c;
    var grade = _a.grade, subjectData = _a.subjectData;
    var theme = useTheme();
    return (<NativeList>
      <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: subjectData.color + "35",
        }}>
        <NativeText style={{
            fontSize: 24,
            lineHeight: 32,
        }}>
          {subjectData.emoji}
        </NativeText>

        <NativeText variant="overtitle" style={{
            flex: 1,
        }} numberOfLines={1}>
          {subjectData.pretty}
        </NativeText>

        {getCourseSpeciality(grade.subjectName) && (<NativeText variant="subtitle" style={{
                textAlign: "right",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderColor: theme.colors.text + "55",
                borderWidth: 1,
                borderRadius: 8,
                borderCurve: "continuous",
                maxWidth: 120,
            }} numberOfLines={1}>
            {getCourseSpeciality(grade.subjectName)}
          </NativeText>)}

        <NativeText variant="subtitle">
          {new Date(grade.timestamp).toLocaleDateString("fr-FR", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })}
        </NativeText>
      </View>

      <View style={{
            width: "100%",
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
        }}>
        <View style={{
            flex: 1,
            alignItems: "flex-start",
            justifyContent: "center",
        }}>
          <NativeText numberOfLines={2} variant={!grade.description ? "subtitle" : "default"} style={grade.description ? {
            lineHeight: 20,
            fontSize: 16,
            textAlignVertical: "center",
        } : undefined}>
            {grade.description || "Note renseign\u00E9e le ".concat(new Date(grade.timestamp).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }))}
          </NativeText>
        </View>

        <View style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 2,
        }}>
          <NativeText style={{
            fontSize: 22,
            lineHeight: 26,
            fontFamily: "semibold",
        }}>
            {!grade.student.disabled ? parseFloat(((_b = grade.student.value) === null || _b === void 0 ? void 0 : _b.toString()) || "0").toFixed(2) : "N. not"}
          </NativeText>

          <NativeText style={{
            fontSize: 16,
            lineHeight: 16,
            opacity: 0.6,
            marginBottom: 1,
        }}>
            /{parseFloat(((_c = grade.outOf.value) === null || _c === void 0 ? void 0 : _c.toString()) || "20")}
          </NativeText>
        </View>
      </View>
    </NativeList>);
};
