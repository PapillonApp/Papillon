import { Papicons } from '@getpapillon/papicons';
import { useRoute, useTheme } from "@react-navigation/native";
import { t } from "i18next";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Reanimated from 'react-native-reanimated';

import { Grade as SharedGrade } from "@/services/shared/grade";
import { CompactGrade } from "@/ui/components/CompactGrade";
import ContainedNumber from "@/ui/components/ContainedNumber";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import TableFlatList from "@/ui/components/TableFlatList";
import Typography from "@/ui/components/Typography";
import adjust from '@/utils/adjustColor';

interface SubjectInfo {
  name: string;
  originalName: string;
  emoji: string;
  color: string;
}

interface GradesModalProps {
  grade: SharedGrade;
  subjectInfo: SubjectInfo;
  avgInfluence: number;
  avgClass: number;
}

export default function GradesModal() {
  const { params } = useRoute();
  const theme = useTheme();
  const colors = theme.colors;

  if (!params) {
    return null;
  }
  const { grade, subjectInfo, avgInfluence = 0, avgClass = 0 } = params as GradesModalProps;

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
        engine='FlashList'
        sections={[
          {
            title: t("Grades_Details_Title"),
            icon: <Papicons name={"Menu"} />,
            items: [
              ...(grade.studentScore && grade.outOf && grade.outOf.value !== 20 ? [{
                icon: <Papicons name={"Star"} />,
                title: t("Grades_NormalizedGrade_Title"),
                description: t("Grades_NormalizedGrade_Description"),
                trailing: (
                  <ContainedNumber
                    color="#757575"
                    denominator="/20"
                  >
                    {((grade.studentScore.value / grade.outOf.value) * 20).toFixed(2)}
                  </ContainedNumber>
                )
              }] : []),
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
              marginVertical: 20,
            }}
          >
            <Stack
              vAlign="center"
              hAlign="center"
              gap={4}
              padding={[20, 0]}
            >
              <View
                style={{
                  backgroundColor: subjectInfo.color + "22",
                  width: 48,
                  height: 48,
                  borderRadius: 120,
                  alignItems: "center",
                  justifyContent: "center",
                  borderColor: colors.text + "22",
                  borderWidth: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 28
                  }}
                >
                  {subjectInfo.emoji}
                </Text>
              </View>

              <Stack
                direction='horizontal'
                vAlign="end"
                hAlign="end"
                gap={2}
                style={{ marginBottom: -4 }}
              >
                <Typography variant='h0' weight='medium' inline color={adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)}>
                  {grade.studentScore?.disabled ? grade.studentScore?.status : grade.studentScore?.value.toFixed(2) ?? 0}
                </Typography>
                <Typography variant='h3' weight='semibold' color={adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)} style={{ marginBottom: 7, opacity: 0.5 }}>
                  /{grade.outOf?.value ?? 20}
                </Typography>
              </Stack>

              <Typography
                variant="title"
                color={adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)}
              >
                {subjectInfo.name}
              </Typography>
              {grade.description && (
                <Typography
                  variant="body1"
                >
                  {grade.description}
                </Typography>
              )}
              <Typography
                variant="body1"
                color='secondary'
              >
                {new Date(grade.givenAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            </Stack>

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
                <ContainedNumber color={adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)}>
                  x{(grade.coefficient ?? 1).toFixed(2)}
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
                <ContainedNumber color={adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)} denominator={"/" + grade.outOf?.value}>
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