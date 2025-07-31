import { NativeList, NativeText } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import type { Grade } from "@/services/shared/Grade";
import { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { anim2Papillon } from "@/utils/ui/animations";
import { adjustColor } from "@/utils/ui/colors";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

type GradeLatestItemProps = {
  grade: Grade;
  i: number;
  navigation: any;
  allGrades: Grade[];
};

const GradesLatestItem: React.FC<GradeLatestItemProps> = ({
  grade,
  i,
  navigation,
  allGrades,
}) => {
  const theme = useTheme();

  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const fetchSubjectData = () => {
    const data = getSubjectData(grade.subjectName);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [grade.subjectName]);

  return (
    <PressableScale
      onPress={() => navigation.navigate("GradeDocument", { grade, allGrades })}
    >
      <NativeList
        animated
        key={grade.id}
        style={{
          width: 230,
        }}
        entering={i < 3 && anim2Papillon(FadeInRight).duration(300).delay(i * 50)}
        exiting={i < 3 && anim2Papillon(FadeOutLeft).duration(100).delay(i * 50)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            borderCurve: "continuous",
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
              color: adjustColor(subjectData.color, theme.dark ? 180 : -100),
            }}
            numberOfLines={1}
            variant="overtitle"
          >
            {subjectData.pretty}
          </NativeText>

          <NativeText numberOfLines={1} variant="subtitle">
            {new Date(grade.timestamp).toLocaleDateString("fr-FR", {
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
            variant={!grade.description ? "subtitle" : "default"}
            style={grade.description ? {
              lineHeight: 20,
            }: undefined}
          >
            {grade.description ||
							`Note renseignée le ${new Date(
							  grade.timestamp
							).toLocaleDateString("fr-FR", {
							  weekday: "long",
							  month: "long",
							  day: "numeric",
							  year: "numeric",
							})}`}
          </NativeText>
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
              gap: 2,
            }}
          >
            <NativeText
              style={{
                fontSize: 22,
                lineHeight: 24,
                fontFamily: "semibold",
              }}
            >
              {!grade.student.disabled ? parseFloat(grade.student.value?.toString() || "0").toFixed(2) : "N.not"}
            </NativeText>
            <NativeText
              style={{
                fontSize: 15,
                lineHeight: 16,
                fontFamily: "medium",
                opacity: 0.6,
                marginBottom: -6,
              }}
            >
              /{parseFloat(grade.outOf.value?.toString() || "20")}
            </NativeText>
          </View>
        </View>
      </NativeList>
    </PressableScale>
  );
};

export default GradesLatestItem;
