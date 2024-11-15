import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { GradeTitle } from "./Atoms/GradeTitle";
import {
  Asterisk,
  Calculator,
  Camera,
  Scale,
  School,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react-native";
import { getAverageDiffGrade } from "@/utils/grades/getAverages";
import type { AverageDiffGrade } from "@/utils/grades/getAverages";
import { Screen } from "@/router/helpers/types";
import InsetsBottomView from "@/components/Global/InsetsBottomView";

const GradeDocument: Screen<"GradeDocument"> = ({ route, navigation }) => {
  const { grade, allGrades = [] } = route.params;
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Note en " + subjectData.pretty,
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("GradeReaction", { grade })
          }>
          <Camera size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, subjectData]);

  const [gradeDiff, setGradeDiff] = useState({} as AverageDiffGrade);
  const [classDiff, setClassDiff] = useState({} as AverageDiffGrade);

  useEffect(() => {
    const gD = getAverageDiffGrade(
      [grade],
      allGrades,
      "student"
    ) as AverageDiffGrade;
    const cD = getAverageDiffGrade(
      [grade],
      allGrades,
      "average"
    ) as AverageDiffGrade;

    setGradeDiff(gD);
    setClassDiff(cD);
  }, [grade]);

  const lists = [
    {
      title: "Informations",
      items: [
        {
          icon: <Asterisk />,
          title: "Coefficient",
          description: "Coefficient de la note",
          value: "x" + grade.coefficient.toFixed(2),
        },
        grade.outOf.value !== 20 &&
					!grade.student.disabled && {
          icon: <Calculator />,
          title: "Remis sur /20",
          description: "Valeur recalculée sur 20",
          value:
							typeof grade.student.value === "number" &&
							typeof grade.outOf.value === "number"
							  ? ((grade.student.value / grade.outOf.value) * 20).toFixed(2)
							  : "??",
          bareme: "/20",
        },
      ],
    },
    {
      title: "Ma classe",
      items: [
        {
          icon: <Users />,
          title: "Note moyenne",
          description: "Moyenne de la classe",
          value: grade.average.value?.toFixed(2) ?? "??",
          bareme: "/" + grade.outOf.value,
        },
        {
          icon: <UserPlus />,
          title: "Note maximale",
          description: "Meilleure note de la classe",
          value: grade.max.value?.toFixed(2) ?? "??",
          bareme: "/" + grade.outOf.value,
        },
        {
          icon: <UserMinus />,
          title: "Note minimale",
          description: "Moins bonne note de la classe",
          value:
						grade.min.value?.toFixed(2) &&
						grade.min.value.toFixed(2) !== "-1.00"
						  ? grade.min.value?.toFixed(2)
						  : "??",
          bareme: "/" + grade.outOf.value,
        },
      ],
    },
    {
      title: "Influence",
      items: [
        !grade.student.disabled && {
          icon: <Scale />,
          title: "Moyenne générale",
          description: "Impact de la note sur la moyenne générale",
          value:
						gradeDiff.difference === undefined
						  ? "???"
						  : (gradeDiff.difference > 0
						    ? "- "
						    : gradeDiff.difference === 0
						      ? "+/- "
						      : "+ ") +
							  gradeDiff.difference.toFixed(2).replace("-", "") +
							  " pts",
          color:
						gradeDiff.difference === undefined
						  ? void 0
						  : gradeDiff.difference < 0
						    ? "#4CAF50"
						    : gradeDiff.difference === 0
						      ? theme.colors.text
						      : "#F44336",
        },
        !grade.average.disabled && {
          icon: <School />,
          title: "Moyenne de la classe",
          description: "Impact de la note sur la moyenne de la classe",
          value:
						classDiff.difference === undefined
						  ? "???"
						  : (classDiff.difference > 0
						    ? "- "
						    : gradeDiff.difference === 0
						      ? "+/- "
						      : "+ ") +
							  classDiff.difference.toFixed(2).replace("-", "") +
							  " pts",
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 16,
        paddingTop: 0,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <GradeTitle grade={grade} subjectData={subjectData} />

      {lists.map((list, index) => (
        <View key={index}>
          <NativeListHeader label={list.title} />

          <NativeList>
            {list.items.map(
              (item, index) =>
                item && (
                  <NativeItem
                    key={index}
                    icon={item.icon}
                    trailing={
                      <View
                        style={{
                          marginRight: 10,
                          alignItems: "flex-end",
                          flexDirection: "row",
                          gap: 2,
                        }}
                      >
                        <NativeText
                          style={{
                            fontSize: 18,
                            lineHeight: 22,
                            fontFamily: "semibold",
                            color:
															"color" in item ? item.color : theme.colors.text,
                          }}
                        >
                          {item.value}
                        </NativeText>

                        {"bareme" in item && (
                          <NativeText variant="subtitle">
                            {item.bareme}
                          </NativeText>
                        )}
                      </View>
                    }
                  >
                    <NativeText variant="overtitle">{item.title}</NativeText>

                    {item.description && (
                      <NativeText variant="subtitle">
                        {item.description}
                      </NativeText>
                    )}
                  </NativeItem>
                )
            )}
          </NativeList>
        </View>
      ))}

      <InsetsBottomView />
    </ScrollView>
  );
};

export default GradeDocument;
