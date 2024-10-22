import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { getCourseSpeciality } from "@/utils/format/format_cours_name";
import { getAverageDiffGrade } from "@/utils/grades/getAverages";
import { useTheme } from "@react-navigation/native";
import { User, UserMinus, UserPlus, Users } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, ScrollView } from "react-native";

const GradeSubjectScreen = ({ route }) => {
  const { subject, allGrades } = route.params;
  const theme = useTheme();

  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const fetchSubjectData = async () => {
    const data = await getSubjectData(subject.average.subjectName);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [subject.average.subjectName]);

  const averages = [
    {
      icon: <User />,
      label: "Votre moyenne",
      value: parseFloat(subject.average.average.value || -1).toFixed(2),
    },
    {
      icon: <Users />,
      label: "Moy. de classe",
      value: parseFloat(subject.average.classAverage.value || -1).toFixed(2),
    },
    {
      icon: <UserPlus />,
      label: "Moy. la plus haute",
      value: parseFloat(subject.average.max.value || -1).toFixed(2),
    },
    {
      icon: <UserMinus />,
      label: "Moy. la plus basse",
      value:
				subject.average.min.value.toFixed(2) &&
				subject.average.min.value.toFixed(2) !== "-1.00"
				  ? subject.average.min.value?.toFixed(2)
				  : "??",
    },
  ];

  const subjectOutOf = subject.average.outOf.value || 20;

  const [averageDiff, setAverageDiff] = useState({
    difference: 0,
    with: 0,
    without: 0,
  });

  useLayoutEffect(() => {
    const diff = getAverageDiffGrade(subject.grades, allGrades);
    setAverageDiff(diff);
  }, [subject.average]);

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 16,
        paddingTop: 0,
      }}
    >
      <NativeList>
        <NativeItem>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 300,
                backgroundColor: subjectData.color + "22",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <NativeText
                style={{
                  fontSize: 24,
                  lineHeight: 32,
                }}
              >
                {subjectData.emoji}
              </NativeText>
            </View>

            <View
              style={{
                gap: 2,
                flex: 1,
              }}
            >
              <NativeText variant="overtitle">{subjectData.pretty}</NativeText>

              {getCourseSpeciality(subject.average.subjectName) && (
                <NativeText variant="subtitle">
                  {getCourseSpeciality(subject.average.subjectName)}
                </NativeText>
              )}
            </View>
          </View>
        </NativeItem>
      </NativeList>

      <NativeListHeader label="Moyennes" />

      <NativeList>
        {averages.map((average) => {
          return (
            <NativeItem
              key={average.label}
              icon={average.icon}
              trailing={
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 2,
                    marginRight: 6,
                  }}
                >
                  <NativeText
                    style={{
                      fontSize: 18,
                      lineHeight: 22,
                      fontFamily: "semibold",
                    }}
                  >
                    {average.value}
                  </NativeText>
                  <NativeText
                    style={{
                      fontSize: 15,
                      lineHeight: 15,
                      fontFamily: "medium",
                      opacity: 0.5,
                      marginBottom: 1,
                      letterSpacing: 0.5,
                    }}
                  >
                    /{subjectOutOf}
                  </NativeText>
                </View>
              }
            >
              <NativeText variant="subtitle">{average.label}</NativeText>
            </NativeItem>
          );
        })}
      </NativeList>

      <NativeListHeader label="Détails" />

      <NativeList>
        <NativeItem
          trailing={
            <NativeText
              style={{
                fontSize: 16,
                lineHeight: 18,
                fontFamily: "semibold",
                color:
									averageDiff.difference < 0
									  ? "#4CAF50"
									  : averageDiff.difference === 0
									    ? theme.colors.text
									    : "#F44336",
                marginLeft: 12,
                marginRight: 6,
              }}
            >
              {averageDiff.difference > 0
                ? "- "
                : averageDiff.difference === 0
                  ? "+/- "
                  : "+ "}
              {averageDiff.difference.toFixed(2).replace("-", "")} pts
            </NativeText>
          }
        >
          <NativeText variant="overtitle">Impact sur la moyenne</NativeText>
          <NativeText variant="subtitle">
            Indique le poids de {subjectData.pretty} sur votre moyenne générale
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};

export default GradeSubjectScreen;
