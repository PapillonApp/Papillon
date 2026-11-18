import { Papicons } from '@getpapillon/papicons';
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ModalOverhead, { ModalOverHeadScore } from '@/components/ModalOverhead';
import { getManager } from "@/services/shared";
import { GradeScore, Subject } from "@/services/shared/grade";
import { useSettingsStore } from '@/stores/settings';
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import ContainedNumber from "@/ui/components/ContainedNumber";
import Icon from "@/ui/components/Icon";
import SafeHorizontalView from "@/ui/components/SafeHorizontalView";
import List from '@/ui/new/List';
import Typography from '@/ui/new/Typography';
import adjust from '@/utils/adjustColor';
import PapillonSubjectAvg, { getSubjectAverage } from "@/utils/grades/algorithms/subject";
import { getCurrentPeriod } from "@/utils/grades/helper/period";
import {
  formatScoreForDisplay,
  getGradeDisplayScale,
  toDisplayScaleFrom20,
} from '@/utils/grades/scale';
import { warn } from "@/utils/logger/logger";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

export default function SubjectModal() {
  const { id, period: periodId } = useLocalSearchParams<{ id: string; period?: string }>();
  const theme = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const displayScale = getGradeDisplayScale(useSettingsStore(state => state.personalization.gradesDisplayScale));
  const [subject, setSubject] = useState<Subject>();
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const manager = getManager();
        if (!manager || !id) {
          return;
        }

        const periods = await manager.getGradesPeriods();
        const period = periods.find(candidate => candidate.id === periodId) ?? getCurrentPeriod(periods);
        if (!period) {
          return;
        }

        const periodGrades = await manager.getGradesForPeriod(period, period.createdByAccount);
        if (!periodGrades) {
          return;
        }

        const combinedSubjects = [
          ...(periodGrades.subjects ?? []),
          ...(periodGrades.modules ?? []),
        ];
        const match = combinedSubjects.find(candidate => candidate.id === id);
        if (!cancelled) {
          setSubject(match);
          setAllSubjects(combinedSubjects);
        }
      } catch (error) {
        warn(`Unable to fetch subject ${id}: ${String(error)}`);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, periodId]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!subject) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Typography variant="title">{t("Grades_Empty_Title")}</Typography>
        <Typography variant="body1" color="textSecondary">
          {t("Grades_Empty_Description")}
        </Typography>
      </View>
    );
  }

  const color = getSubjectColor(subject.name);
  const tint = Platform.OS === "android" ? colors.tint : adjust(color, theme.dark ? 0.5 : -0.5);
  const outOf = subject.outOf?.value ?? 20;
  const denominator = formatScoreForDisplay(0, outOf, displayScale).denominator;
  const format = (score?: GradeScore) =>
    !score || score.disabled
      ? String(score?.status ?? "N/A")
      : formatScoreForDisplay(score.value, outOf, displayScale).value.toFixed(2);

  // Some services don't provide the subject average, compute it from the grades instead.
  const computedAverage = getSubjectAverage(subject.grades ?? []);
  const studentScore = subject.studentAverage && !subject.studentAverage.disabled
    ? format(subject.studentAverage)
    : computedAverage !== -1
      ? formatScoreForDisplay(computedAverage, outOf, displayScale).value.toFixed(2)
      : format(subject.studentAverage);

  const averages = [
    { title: "SubjectInfo_ClassAverage_Label", description: "SubjectInfo_ClassAverage_Description", score: subject.classAverage, icon: "GraduationHat" },
    { title: "SubjectInfo_MaxAverage_Label", description: "SubjectInfo_MaxAverage_Description", score: subject.maximum, icon: "Plus" },
    { title: "SubjectInfo_MinAverage_Label", description: "SubjectInfo_MinAverage_Description", score: subject.minimum, icon: "Minus" },
  ];

  const allGrades = allSubjects.flatMap(candidate => candidate.grades ?? []);
  const gradesWithoutSubject = allSubjects
    .filter(candidate => candidate.id !== subject.id)
    .flatMap(candidate => candidate.grades ?? []);
  const overallWithSubject = PapillonSubjectAvg(allGrades);
  const overallWithoutSubject = PapillonSubjectAvg(gradesWithoutSubject);
  const hasCalculableImpact =
    computedAverage >= 0 &&
    overallWithSubject >= 0 &&
    overallWithoutSubject >= 0;
  const globalImpact = hasCalculableImpact
    ? Number(
      toDisplayScaleFrom20(
        overallWithSubject - overallWithoutSubject,
        displayScale
      ).toFixed(2)
    ) || 0
    : null;

  return (
    <>
      {Platform.OS !== "android" && (
        <LinearGradient
          colors={[adjust(color, theme.dark ? -0.6 : 0.6), colors.overground]}
          locations={[0, 0.5]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -9 }}
        />
      )}

      <List
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        safeHorizontalPadding={16}
        ListHeaderComponent={
          <SafeHorizontalView
            base={16}
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              paddingTop: Platform.select({ android: insets.top + 48, default: 0 }),
            }}
          >
            <ModalOverhead
              color={Platform.OS === "ios" ? color : colors.primary}
              emoji={getSubjectEmoji(subject.name)}
              subject={getSubjectName(subject.name)}
              overtitle={t("Grades_SubjectInfo_NbGrades", { number: subject.grades?.length ?? 0 })}
              overhead={
                <ModalOverHeadScore
                  color={Platform.OS === "ios" ? color : colors.primary}
                  score={studentScore}
                  outOf={denominator.replace("/", "")}
                />
              }
            />
          </SafeHorizontalView>
        }
        contentContainerStyle={{
          paddingVertical: 16,
          width: '100%',
          maxWidth: 900,
          alignSelf: 'center',
        }}
      >
        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("SubjectInfo_Stats_Header")}</List.Label>
          </List.SectionTitle>

          {averages.map(average => (
            <List.Item key={average.title}>
              <List.Leading>
                <Icon>
                  <Papicons name={average.icon} />
                </Icon>
              </List.Leading>
              <Typography variant="title">{t(average.title)}</Typography>
              <Typography variant="body1" color="textSecondary">
                {t(average.description)}
              </Typography>
              <List.Trailing>
                <ContainedNumber color={tint} denominator={denominator}>
                  {format(average.score)}
                </ContainedNumber>
              </List.Trailing>
            </List.Item>
          ))}

          {globalImpact !== null && (
            <List.Item key="SubjectInfo_GlobalImpact">
              <List.Leading>
                <Icon>
                  <Papicons name="Grades" />
                </Icon>
              </List.Leading>
              <Typography variant="title">{t("SubjectInfo_GlobalImpact_Label")}</Typography>
              <Typography variant="body1" color="textSecondary">
                {t("SubjectInfo_GlobalImpact_Description")}
              </Typography>
              <List.Trailing>
                <ContainedNumber
                  color={
                    globalImpact === 0
                      ? "#757575"
                      : globalImpact > 0
                        ? "#2e8900"
                        : "#990000"
                  }
                  denominator="pts"
                >
                  {globalImpact > 0 ? `+${globalImpact.toFixed(2)}` : globalImpact.toFixed(2)}
                </ContainedNumber>
              </List.Trailing>
            </List.Item>
          )}
        </List.Section>
      </List>
    </>
  );
}
