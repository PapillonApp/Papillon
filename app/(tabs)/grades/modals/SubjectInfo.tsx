import ModalOverhead, { ModalOverHeadScore } from "@/components/ModalOverhead";
import { GradeDisplaySettings, Subject } from "@/services/shared/grade";
import Stack from "@/ui/components/Stack";
import TypographyLegacy from "@/ui/components/Typography";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { formatGradeScore, getGradeScoreDenominator, hasDisplayableGradeScore, isNumericGradeScore, isSameNumericScore } from "@/utils/grades/score";
import { Papicons } from "@getpapillon/papicons";
import { useRoute, useTheme } from "@react-navigation/native";
import React from "react";
import { Platform, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { colorCheck } from '@/utils/colorCheck';
import adjust from "@/utils/adjustColor";
import i18n from "@/utils/i18n";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import Icon from "@/ui/components/Icon";
import Averages from "../atoms/Averages";
import { ErrorBoundary } from "@/ui/components/ErrorBoundary";

const SubjectInfo = () => {
  const { params } = useRoute();
  const theme = useTheme();
  const colors = theme.colors;

  const subject: Subject = params?.subject;
  const display = params?.display as GradeDisplaySettings | undefined;
  const subjectColor = getSubjectColor(subject?.name);
  const subjectName = getSubjectName(subject?.name);
  const subjectEmoji = getSubjectEmoji(subject?.name);
  const outOf = getGradeScoreDenominator(subject.studentAverage, subject.outOf?.value);
  const hasTopAverage = isSameNumericScore(subject.studentAverage, subject.maximum);
  const showSubjectClassAverage = display?.showSubjectClassAverage ?? hasDisplayableGradeScore(subject.classAverage);
  const showSubjectMaximum = display?.showSubjectMaximum ?? hasDisplayableGradeScore(subject.maximum);
  const showSubjectMinimum = display?.showSubjectMinimum ?? hasDisplayableGradeScore(subject.minimum);
  const showSubjectRank = display?.showSubjectRank ?? hasDisplayableGradeScore(subject.rank);
  const showSubjectCoefficient = display?.showSubjectCoefficient ?? typeof subject.coefficient === "number";
  const realAverage = isNumericGradeScore(subject.studentAverage)
    ? subject.studentAverage.value
    : undefined;

  const averagesData = [
    showSubjectClassAverage && hasDisplayableGradeScore(subject.classAverage) ? {
      key: "classAverage",
      title: i18n.t("SubjectInfo_ClassAverage_Label"),
      subtitle: i18n.t("SubjectInfo_ClassAverage_Description"),
      value: formatGradeScore(subject.classAverage),
      denominator: typeof getGradeScoreDenominator(subject.classAverage, subject.outOf?.value) === "number"
        ? "/" + getGradeScoreDenominator(subject.classAverage, subject.outOf?.value)
        : undefined,
      icon: "GraduationHat",
    } : null,
    showSubjectMaximum && hasDisplayableGradeScore(subject.maximum) ? {
      key: "maximum",
      title: i18n.t("SubjectInfo_MaxAverage_Label"),
      subtitle: i18n.t("SubjectInfo_MaxAverage_Description"),
      value: formatGradeScore(subject.maximum),
      denominator: typeof getGradeScoreDenominator(subject.maximum, subject.outOf?.value) === "number"
        ? "/" + getGradeScoreDenominator(subject.maximum, subject.outOf?.value)
        : undefined,
      icon: "ArrowRightUp",
    } : null,
    showSubjectMinimum && hasDisplayableGradeScore(subject.minimum) ? {
      key: "minimum",
      title: i18n.t("SubjectInfo_MinAverage_Label"),
      subtitle: i18n.t("SubjectInfo_MinAverage_Description"),
      value: formatGradeScore(subject.minimum),
      denominator: typeof getGradeScoreDenominator(subject.minimum, subject.outOf?.value) === "number"
        ? "/" + getGradeScoreDenominator(subject.minimum, subject.outOf?.value)
        : undefined,
      icon: "Minus",
    } : null,
    showSubjectRank && hasDisplayableGradeScore(subject.rank) ? {
      key: "rank",
      title: i18n.t("Grades_Tab_Rank"),
      subtitle: i18n.t("Grades_Tab_Rank_Description"),
      value: formatGradeScore(subject.rank, 0),
      denominator: typeof subject.rank?.outOf === "number"
        ? "/" + subject.rank.outOf
        : undefined,
      icon: "crown",
    } : null,
    showSubjectCoefficient && typeof subject.coefficient === "number" ? {
      key: "coefficient",
      title: i18n.t("Grades_Coefficient"),
      subtitle: i18n.t("Grades_Avg_All_Pond_Description"),
      value: subject.coefficient.toFixed(2),
      denominator: undefined,
      icon: "Coefficient",
    } : null,
  ].filter(Boolean) as Array<{
    key: string;
    title: string;
    subtitle: string;
    value?: string;
    denominator?: string;
    icon: string;
  }>;

  return (
    <>
      {Platform.OS !== 'android' && (
        <LinearGradient
          colors={[subjectColor, colors.background]}
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
      )}

      <List
        contentInsetAdjustmentBehavior="automatic"
        engine='FlashList'

        ListHeaderComponent={
          <View style={{ marginBottom: 24, alignItems: 'center' }}>
            <ModalOverhead
              subject={subjectName}
              color={Platform.OS === 'ios' ? subjectColor : colors.primary}
              emoji={subjectEmoji}
              overtitle={i18n.t("Grades_SubjectInfo_NbGrades", { number: subject.grades.length })}
              overhead={
                <ModalOverHeadScore
                  color={Platform.OS === 'ios' ? subjectColor : colors.primary}
                  score={formatGradeScore(subject.studentAverage) ?? ""}
                  outOf={outOf}
                />
              }
              style={{
                marginBottom: hasTopAverage ? 12 : 0
              }}
            />

            {hasTopAverage && (
              <Stack
                direction="horizontal"
                gap={8}
                backgroundColor={adjust(subjectColor, theme.dark ? 0.3 : -0.3)}
                padding={[12, 6]}
                radius={32}
                hAlign="center"
                vAlign="center"
              >
                <Papicons size={20} name="crown" color={colorCheck("#FFFFFF", [adjust(subjectColor, theme.dark ? 0.3 : -0.3)]) ? "#FFFFFF" : "#000000"} />
                <TypographyLegacy color={colorCheck("#FFFFFF", [adjust(subjectColor, theme.dark ? 0.3 : -0.3)]) ? "#FFFFFF" : "#000000"} variant='body2'>
                  {i18n.t("SubjectInfo_MaxAverage_Description")}
                </TypographyLegacy>
              </Stack>
            )}

            {subject.grades.length > 0 && (
              <View style={{ width: "100%", marginTop: 16 }}>
                <ErrorBoundary>
                  <Averages
                    grades={subject.grades}
                    realAverage={realAverage}
                    color={subjectColor}
                    scale={outOf ?? display?.scale ?? 20}
                    variant="subject"
                    averageTitle={i18n.t("SubjectInfo_StudentAverage_Label")}
                  />
                </ErrorBoundary>
              </View>
            )}
          </View>
        }

        contentContainerStyle={{
          padding: 16,
        }}
      >
        <List.Section>
          <List.SectionTitle>
            <List.Label>
              {i18n.t("SubjectInfo_Stats_Header")}
            </List.Label>
          </List.SectionTitle>

          {averagesData.map((average) => (
            <List.Item key={average.key}>
              <List.Leading>
                <Icon>
                  <Papicons name={average.icon} />
                </Icon>
              </List.Leading>

              <Typography variant="title">
                {average.title}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {average.subtitle}
              </Typography>

              <List.Trailing>
                <Stack gap={2} direction="horizontal" vAlign="center" hAlign="end" style={{ flexShrink: 0 }}>
                  <TypographyLegacy variant="header" weight="semibold" inline nowrap style={{ flexShrink: 0 }}>
                    {average.value}
                  </TypographyLegacy>
                  {average.denominator && (
                    <TypographyLegacy variant="body2" inline nowrap color="secondary" style={{ flexShrink: 0 }}>
                      {average.denominator}
                    </TypographyLegacy>
                  )}
                </Stack>
              </List.Trailing>
            </List.Item>
          ))}
        </List.Section>
      </List>
    </>
  );
};

export default SubjectInfo;
