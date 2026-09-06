import { Papicons } from '@getpapillon/papicons';
import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import { Link, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import ModalOverhead, { ModalOverHeadScore } from '@/components/ModalOverhead';
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import { getManager } from "@/services/shared";
import { Grade as SharedGrade, Subject } from "@/services/shared/grade";
import ContainedNumber from "@/ui/components/ContainedNumber";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import TypographyLegacy from "@/ui/components/Typography";
import adjust from '@/utils/adjustColor';
import { colorCheck } from '@/utils/colorCheck';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import List from '@/ui/new/List';
import Typography from '@/ui/new/Typography';
import { useSettingsStore } from '@/stores/settings';
import { formatAssumed20ForDisplay, getGradeDisplayScale, getDisplayScaleMax } from '@/utils/grades/scale';
import { SkillChip } from "@/ui/components/SkillChip";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import { useGradeInfluence } from "./hooks/useGradeInfluence";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { warn } from "@/utils/logger/logger";

interface SubjectInfo {
  name: string;
  originalName: string;
  emoji: string;
  color: string;
}

interface GradeBadgeProps {
  icon: string;
  label: string;
  color: string;
  theme: any;
  is_outlined?: boolean;
}

const GradeBadge = ({
  icon,
  label,
  color,
  theme,
  is_outlined = false,
}: GradeBadgeProps) => {
  const backgroundColor = is_outlined
    ? "transparent"
    : adjust(color, theme.dark ? 0.3 : -0.3);
  const textColor = is_outlined
    ? color
    : colorCheck("#FFFFFF", [backgroundColor])
      ? "#FFFFFF"
      : "#000000";
  const borderStyle = is_outlined
    ? { borderWidth: 1, borderColor: color }
    : undefined;

  return (
    <Stack
      direction="horizontal"
      gap={8}
      backgroundColor={backgroundColor}
      vAlign="center"
      hAlign="center"
      padding={[12, 6]}
      radius={32}
      style={borderStyle}
    >
      <Papicons size={20} name={icon} color={textColor} />
      <TypographyLegacy color={textColor} variant="body2">
        {label}
      </TypographyLegacy>
    </Stack>
  );
};

export default function GradesModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const colors = theme.colors;
  const [grade, setGrade] = useState<SharedGrade>();
  const headerHeight = useHeaderHeight();
  const [subject, setSubject] = useState<Subject>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const displayScale = getGradeDisplayScale(useSettingsStore(state => state.personalization.gradesDisplayScale));
  const displayScaleMax = getDisplayScaleMax(displayScale);
  const insets = useSafeAreaInsets();
  const finalHeaderHeight = Platform.select({
    android: insets.top + 32,
    default: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchGrade = async () => {
      setLoading(true);
      setGrade(undefined);
      setSubject(undefined);
      setSubjects([]);

      try {
        const manager = getManager();
        if (!manager || !id) return;

        const periods = await manager.getGradesPeriods();
        const currentPeriod = getCurrentPeriod(periods);
        const orderedPeriods = currentPeriod
          ? [currentPeriod, ...periods.filter(period => period.id !== currentPeriod.id)]
          : periods;

        for (const period of orderedPeriods) {
          try {
            const periodGrades = await manager.getGradesForPeriod(
              period,
              period.createdByAccount
            );
            const periodSubjects = [
              ...(periodGrades.subjects ?? []),
              ...(periodGrades.modules ?? []),
            ];
            const matchingSubject = periodSubjects.find(candidate =>
              candidate.grades?.some(candidateGrade => candidateGrade.id === id)
            );
            const matchingGrade = matchingSubject?.grades?.find(
              candidateGrade => candidateGrade.id === id
            );

            if (matchingGrade) {
              if (!cancelled) {
                setGrade(matchingGrade);
                setSubject(matchingSubject);
                setSubjects(periodSubjects);
              }
              return;
            }
          } catch (error) {
            warn(`Unable to fetch grades for period ${period.id}: ${String(error)}`);
          }
        }
      } catch (error) {
        warn(`Unable to fetch grade ${id}: ${String(error)}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGrade();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const getSubjectById = useCallback(
    (subjectId: string) => subjects.find(candidate => candidate.id === subjectId),
    [subjects]
  );
  const { getAvgInfluence, getAvgClassInfluence } = useGradeInfluence(
    subjects,
    getSubjectById
  );
  const avgInfluence = grade ? getAvgInfluence(grade) : 0;
  const avgClass = grade ? getAvgClassInfluence(grade) : 0;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!grade || !subject) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Typography variant="title">{t("Grades_Empty_Title")}</Typography>
        <Typography variant="body1" color="textSecondary">
          {t("Grades_Empty_Description")}
        </Typography>
      </View>
    );
  }

  const subjectInfo: SubjectInfo = {
    name: getSubjectName(subject.name),
    originalName: subject.name,
    emoji: getSubjectEmoji(subject.name),
    color: getSubjectColor(subject.name),
  };

  const adjustedTextColor = adjust(subjectInfo.color, theme.dark ? 0.5 : -0.5);

  return (
    <>
      {Platform.OS !== "android" && (
        <LinearGradient
          colors={[adjust(subjectInfo.color, theme.dark ? -0.6 : 0.6), theme.colors.overground]}
          locations={[0, 0.5]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -9,
          }}
        />
      )}

      <List
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              paddingTop: finalHeaderHeight + (Platform.OS === "ios" ? 0 : 16),
            }}
          >
            <ModalOverhead
              color={Platform.OS === "ios" ? subjectInfo.color : colors.primary}
              emoji={subjectInfo.emoji}
              subject={
                (grade.skills?.length ?? 0 > 0)
                  ? grade.description
                  : subjectInfo.name
              }
              title={
                (grade.skills?.length ?? 0 > 0) ? undefined : grade.description
              }
              date={new Date(grade.givenAt)}
              overhead={
                <ModalOverHeadScore
                  color={
                    Platform.OS === "ios" ? subjectInfo.color : colors.primary
                  }
                  score={
                    grade.studentScore?.disabled
                      ? (grade.skills?.length ?? 0 > 0)
                        ? subjectInfo.name
                        : String(grade.studentScore?.status)
                      : grade.studentScore
                        ? String(grade.studentScore?.value.toFixed(2))
                        : undefined
                  }
                  outOf={grade.outOf?.value}
                />
              }
              subjectVariant={grade.studentScore ? undefined : "h2"}
            />

            {(grade.studentScore?.value ?? 0) ===
              (grade.maxScore?.value ?? 1) &&
              !grade.studentScore?.disabled && (
                <GradeBadge
                  icon="crown"
                  label={t("Modal_Grades_BestGrade")}
                  color={subjectInfo.color}
                  theme={theme}
                  is_outlined={false}
                />
              )}
            {grade.optional && (
              <GradeBadge
                icon="info"
                label={t("Modal_Grades_OptionalGrade")}
                color={subjectInfo.color}
                theme={theme}
                is_outlined={true}
              />
            )}

            {grade.bonus && (
              <GradeBadge
                icon="info"
                label={t("Modal_Grades_BonusGrade")}
                color={subjectInfo.color}
                theme={theme}
                is_outlined={true}
              />
            )}
            {grade.studentScore && !grade.studentScore.disabled && (
              <Stack
                card
                direction="horizontal"
                hAlign="center"
                gap={0}
                width={"100%"}
                style={{ marginTop: 8, shadowColor: "transparent", borderWidth: 0 }}
              >
                <Stack
                  width={"50%"}
                  vAlign="center"
                  hAlign="center"
                  padding={12}
                >
                  <Icon papicon opacity={0.5}>
                    <Papicons name={"Coefficient"} />
                  </Icon>
                  <TypographyLegacy color="secondary">
                    {t("Grades_Coefficient")}
                  </TypographyLegacy>
                  <ContainedNumber
                    color={
                      Platform.OS === "android"
                        ? theme.colors.tint
                        : adjustedTextColor
                    }
                  >
                    x{(grade.coefficient ?? 1).toFixed(2)}
                  </ContainedNumber>
                </Stack>
                <View style={{
                  width: 0.5,
                  height: "80%",
                  backgroundColor: colors.border,
                }} />
                <Stack
                  width={"50%"}
                  vAlign="center"
                  hAlign="center"
                  padding={12}
                >
                  <Icon papicon opacity={0.5}>
                    <Papicons name={"Apple"} />
                  </Icon>
                  <TypographyLegacy color="secondary">
                    {t("Grades_Avg_Group_Short")}
                  </TypographyLegacy>
                  <ContainedNumber
                    color={
                      Platform.OS === "android"
                        ? theme.colors.tint
                        : adjustedTextColor
                    }
                    denominator={"/" + grade.outOf?.value}
                  >
                    {grade.averageScore?.value.toFixed(2)}
                  </ContainedNumber>
                </Stack>
              </Stack>
            )}
          </View>
        }
        contentContainerStyle={{
          padding: 16,
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
          width: '100%',
          maxWidth: 900,
          alignSelf: 'center',
        }}
      >
        {grade.skills && grade.skills.length > 0 && (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Grades_Skills_Title")}</List.Label>
            </List.SectionTitle>
            {grade.skills.map(skill => (
              <List.Item>
                <Typography variant="title">{skill.name}</Typography>
                <Typography variant="body1" color="textSecondary">
                  {skill.description}
                </Typography>
                <List.Trailing>
                  <SkillChip level={skill.score} />
                </List.Trailing>
              </List.Item>
            ))}
          </List.Section>
        )}

        {grade.studentScore && !grade.studentScore?.disabled && (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Grades_Details_Title")}</List.Label>
            </List.SectionTitle>

            {grade.studentScore &&
            grade.outOf &&
            grade.outOf.value !== displayScaleMax ? (
              <List.Item>
                <List.Leading>
                  <Icon>
                    <Papicons name={"Star"} />
                  </Icon>
                </List.Leading>
                <Typography variant="title">
                  {t("Grades_NormalizedGrade_Title")}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {t("Grades_NormalizedGrade_Description")}
                </Typography>
                <List.Trailing>
                  <ContainedNumber
                    color={subjectInfo.color}
                    denominator={
                      formatAssumed20ForDisplay(0, displayScale).denominator
                    }
                  >
                    {formatAssumed20ForDisplay(
                      (grade.studentScore.value / grade.outOf.value) * 20,
                      displayScale
                    ).value.toFixed(2)}
                  </ContainedNumber>
                </List.Trailing>
              </List.Item>
            ) : null}

            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name={"Plus"} />
                </Icon>
              </List.Leading>
              <Typography variant="title">
                {t("Grades_HighestGrade_Title")}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t("Grades_HighestGrade_Description")}
              </Typography>
              <List.Trailing>
                <ContainedNumber
                  color={
                    Platform.OS === "android"
                      ? theme.colors.tint
                      : adjustedTextColor
                  }
                  denominator={"/" + grade.outOf?.value}
                >
                  {grade.maxScore?.value.toFixed(2)}
                </ContainedNumber>
              </List.Trailing>
            </List.Item>

            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name={"Minus"} />
                </Icon>
              </List.Leading>
              <Typography variant="title">
                {t("Grades_LowestGrade_Title")}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t("Grades_LowestGrade_Description")}
              </Typography>
              <List.Trailing>
                <ContainedNumber
                  color={
                    Platform.OS === "android"
                      ? theme.colors.tint
                      : adjustedTextColor
                  }
                  denominator={"/" + grade.outOf?.value}
                >
                  {grade.minScore?.value.toFixed(2)}
                </ContainedNumber>
              </List.Trailing>
            </List.Item>
          </List.Section>
        )}
        {grade.studentScore && !grade.studentScore?.disabled && (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Grades_Influence_Title")}</List.Label>
            </List.SectionTitle>

            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name={"Grades"} />
                </Icon>
              </List.Leading>
              <Typography variant="title">
                {t("Grades_Avg_All_Title")}
              </Typography>
              <List.Trailing>
                <ContainedNumber
                  color={
                    avgInfluence === 0
                      ? "#757575"
                      : avgInfluence >= 0
                        ? "#2e8900"
                        : "#990000"
                  }
                  denominator="pts"
                >
                  {avgInfluence >= 0
                    ? `+${avgInfluence.toFixed(2)}`
                    : avgInfluence.toFixed(2)}
                </ContainedNumber>
              </List.Trailing>
            </List.Item>

            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name={"Apple"} />
                </Icon>
              </List.Leading>
              <Typography variant="title">
                {t("Grades_Avg_Group_Title")}
              </Typography>
              <List.Trailing>
                <ContainedNumber
                  color={
                    avgClass === 0
                      ? "#757575"
                      : avgClass >= 0
                        ? "#2e8900"
                        : "#990000"
                  }
                  denominator="pts"
                >
                  {avgClass >= 0
                    ? `+${avgClass.toFixed(2)}`
                    : avgClass.toFixed(2)}
                </ContainedNumber>
              </List.Trailing>
            </List.Item>
          </List.Section>
        )}
      </List>
    </>
  );
}
