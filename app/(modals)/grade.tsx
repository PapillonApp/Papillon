import { CompactGrade } from "@/ui/components/CompactGrade";
import TableFlatList from "@/ui/components/TableFlatList";
import { useRoute, useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { View } from "react-native";

import { Grade as SharedGrade } from "@/services/shared/grade";

import { t } from "i18next";
import Reanimated from 'react-native-reanimated';
import { Papicons } from '@getpapillon/papicons';
import ContainedNumber from "@/ui/components/ContainedNumber";
import PapillonSubjectAvg from "@/utils/grades/algorithms/subject";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import Icon from "@/ui/components/Icon";
import LinearGradient from "react-native-linear-gradient";

interface SubjectInfo {
  name: string;
  originalName: string;
  emoji: string;
  color: string;
}

interface GradesModalProps {
  grade: SharedGrade;
  subjectInfo: SubjectInfo;
  allGrades: SharedGrade[];
}

export default function GradesModal() {
  const { params } = useRoute();
  const { colors } = useTheme();

  if (!params) {
    return null;
  }
  const { grade, subjectInfo, allGrades } = params as GradesModalProps;

  const avgInfluence = useMemo(() => {
    const average = PapillonSubjectAvg(allGrades);
    const averageWithoutGrade = PapillonSubjectAvg(allGrades.filter(g => g.id !== grade.id));
    return Number((average - averageWithoutGrade).toFixed(2));
  }, [allGrades, grade]);

  const avgClass = useMemo(() => {
    const average = PapillonSubjectAvg(allGrades, "averageScore");
    const averageWithoutGrade = PapillonSubjectAvg(allGrades.filter(g => g.id !== grade.id), "averageScore");
    return Number((average - averageWithoutGrade).toFixed(2));
  }, [allGrades, grade]);

  return (
    <>
      <LinearGradient
        colors={[subjectInfo.color, colors.background]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          width: "100%",
          zIndex: -9,
          opacity: 0.4
        }}
      />

      <TableFlatList
        sections={[
          {
            title: t("Grades_Details_Title"),
            icon: <Papicons name={"Menu"} />,
            items: [
              {
                icon: <Papicons name={"Plus"} />,
                title: t("Grades_HighestGrade_Title"),
                description: t("Grades_HighestGrade_Description"),
                trailing: (
                  <ContainedNumber
                    color="#757575"
                    denominator={"/" + grade.outOf?.value}
                  >
                    {grade.maxScore?.value.toFixed(2)}
                  </ContainedNumber>
                )
              },
              {
                icon: <Papicons name={"Minus"} />,
                title: t("Grades_LowestGrade_Title"),
                description: t("Grades_LowestGrade_Description"),
                trailing: (
                  <ContainedNumber
                    color="#757575"
                    denominator={"/" + grade.outOf?.value}
                  >
                    {grade.minScore?.value.toFixed(2)}
                  </ContainedNumber>
                )
              }
            ]
          },
          {
            title: t("Grades_Influence_Title"),
            icon: <Papicons name={"Pie"} />,
            items: [
              {
                icon: <Papicons name={"Grades"} />,
                title: t("Grades_Avg_All_Title"),
                trailing: (
                  <ContainedNumber
                    color={avgInfluence === 0 ? "#757575" : avgInfluence >= 0 ? "#42C500" : "#C50000"}
                    denominator="pts"
                  >
                    {avgInfluence >= 0 ? `+${avgInfluence.toFixed(2)}` : avgInfluence.toFixed(2)}
                  </ContainedNumber>
                )
              },
              {
                icon: <Papicons name={"Apple"} />,
                title: t("Grades_Avg_Group_Title"),
                trailing: (
                  <ContainedNumber
                    color={avgClass === 0 ? "#757575" : avgClass >= 0 ? "#42C500" : "#C50000"}
                    denominator="pts"
                  >
                    {avgClass >= 0 ? `+${avgClass.toFixed(2)}` : avgClass.toFixed(2)}
                  </ContainedNumber>
                )
              }
            ]
          }
        ]}
        ListHeaderComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <Reanimated.View>
              <CompactGrade
                key={grade.id + "_compactGrade"}
                emoji={subjectInfo.emoji}
                title={subjectInfo.name}
                description={grade.description}
                score={grade.studentScore?.value ?? 0}
                outOf={grade.outOf?.value ?? 20}
                disabled={grade.studentScore?.disabled}
                status={grade.studentScore?.status}
                color={subjectInfo.color}
                date={grade.givenAt}
              />
            </Reanimated.View>

            <Stack
              card
              direction="horizontal"
              width={"100%"}
              style={{ marginTop: 8 }}
            >
              <Stack
                width={"50%"}
                vAlign="center"
                hAlign="center"
                style={{ borderRightWidth: 1, borderRightColor: colors.border }}
                padding={12}
              >
                <Icon papicon opacity={0.5}>
                  <Papicons name={"Coefficient"} />
                </Icon>
                <Typography color="secondary">
                  {t("Grades_Coefficient")}
                </Typography>
                <ContainedNumber color={subjectInfo.color}>
                  x{(grade.coefficient || 1).toFixed(2)}
                </ContainedNumber>
              </Stack>
              <Stack
                width={"50%"}
                vAlign="center"
                hAlign="center"
                padding={12}
              >
                <Icon papicon opacity={0.5}>
                  <Papicons name={"Apple"} />
                </Icon>
                <Typography color="secondary">
                  {t("Grades_Avg_Group_Short")}
                </Typography>
                <ContainedNumber color={subjectInfo.color} denominator={"/" + grade.outOf?.value}>
                  {grade.averageScore?.value.toFixed(2)}
                </ContainedNumber>
              </Stack>
            </Stack>
          </View>
        }
        style={{ backgroundColor: "transparent" }}
      />
    </>
  )
}