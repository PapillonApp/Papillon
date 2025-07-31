import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { getCourseSpeciality } from "@/utils/format/format_cours_name";
import { AverageDiffGrade, getAverageDiffGrade } from "@/utils/grades/getAverages";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Trophy, User, UserMinus, UserPlus, Users } from "lucide-react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Screen } from "@/router/helpers/types";

const GradeSubjectScreen: Screen<"GradeSubject"> = ({ route, navigation }) => {
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

  const studentAverage = parseFloat((subject.average?.average?.value || -1).toString()).toFixed(2);
  const classAverage = parseFloat((subject.average?.classAverage?.value || -1).toString()).toFixed(2);
  const highAverage = parseFloat((subject.average?.max?.value || -1).toString()).toFixed(2);
  const lowAverage = parseFloat((subject.average?.min?.value || -1).toString()).toFixed(2);

  const averages = [
    {
      icon: <User />,
      label: "Ta moyenne",
      value: studentAverage !== "-1.00" ? studentAverage : "N.Not",
    },
    {
      icon: <Users />,
      label: "Moy. de classe",
      value: classAverage !== "-1.00" ? classAverage : "??",
    },
    {
      icon: <UserPlus />,
      label: "Moy. la plus haute",
      value: highAverage !== "-1.00" ? highAverage : "??",
    },
    {
      icon: <UserMinus />,
      label: "Moy. la plus basse",
      value: lowAverage !== "-1.00" ? lowAverage : "??",
    },
  ].filter((value) => value.value != "??");

  const subjectOutOf = subject.average?.outOf?.value || 20;

  const [averageDiff, setAverageDiff] = useState<AverageDiffGrade>({
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

      {subject.rank && (
        <>
          <NativeListHeader label="Classement" />

          <NativeList>
            <NativeItem
              icon={<Trophy />}
              trailing={
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 4,
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
                    {subject.rank.value}
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
                    /{subject.rank.outOf}
                  </NativeText>
                </View>
              }
            >
              <NativeText variant="title">
                Position dans le groupe
              </NativeText>
              <NativeText variant="subtitle">
                Rang de la moyenne de cette matière dans la classe
              </NativeText>
            </NativeItem>
          </NativeList>
        </>
      )}

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

      {averageDiff.without !== -1 && (
        <>
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
									(averageDiff.difference || 0) < 0
									  ? "#4CAF50"
									  : (averageDiff.difference || 0) === 0
									    ? theme.colors.text
									    : "#F44336",
                    marginLeft: 12,
                    marginRight: 6,
                  }}
                >
                  {(averageDiff.difference || 0) > 0
                    ? "- "
                    : (averageDiff.difference || 0) === 0
                      ? "+/- "
                      : "+ "}
                  {(averageDiff.difference || 0).toFixed(2).replace("-", "")} pts
                </NativeText>
              }
            >
              <NativeText variant="overtitle">Impact sur la moyenne</NativeText>
              <NativeText variant="subtitle">
                Indique le poids de {subjectData.pretty} sur ta moyenne générale
              </NativeText>
            </NativeItem>
          </NativeList>
        </>
      )}
    </ScrollView>
  );
};

export default GradeSubjectScreen;
