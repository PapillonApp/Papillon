import { Papicons } from "@getpapillon/papicons";
import { useRoute, useTheme } from "@react-navigation/native";
import { t } from "i18next";
import React from "react";
import { Platform, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import ModalOverhead, { ModalOverHeadScore } from "@/components/ModalOverhead";
import { Grade as SharedGrade } from "@/services/shared/grade";
import ContainedNumber from "@/ui/components/ContainedNumber";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import TypographyLegacy from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";
import { colorCheck } from "@/utils/colorCheck";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { SkillChip } from "@/ui/components/SkillChip";

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
  const { params } = useRoute();
  const theme = useTheme();
  const colors = theme.colors;

  if (!params) {
    return null;
  }
  const {
    grade,
    subjectInfo,
    avgInfluence = 0,
    avgClass = 0,
  } = params as GradesModalProps;

  const insets = useSafeAreaInsets();
  const finalHeaderHeight = Platform.select({
    android: insets.top + 32,
    default: 0,
  });

  return (
    <>
      {Platform.OS !== "android" && (
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
            opacity: 0.4,
          }}
        />
      )}

      <List
        ListHeaderComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginVertical: 20,
              paddingTop: finalHeaderHeight,
            }}
          >
            <ModalOverhead
              color={Platform.OS === "ios" ? subjectInfo.color : colors.primary}
              emoji={subjectInfo.emoji}
              subject={subjectInfo.name}
              title={grade.description}
              date={new Date(grade.givenAt)}
              overhead={
                <ModalOverHeadScore
                  color={
                    Platform.OS === "ios" ? subjectInfo.color : colors.primary
                  }
                  score={
                    grade.studentScore?.disabled
                      ? String(grade.studentScore?.status)
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
            {grade.studentScore && (
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
                  style={{
                    borderRightWidth: 1,
                    borderRightColor: colors.border,
                  }}
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
                        : adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)
                    }
                  >
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
                  <TypographyLegacy color="secondary">
                    {t("Grades_Avg_Group_Short")}
                  </TypographyLegacy>
                  <ContainedNumber
                    color={
                      Platform.OS === "android"
                        ? theme.colors.tint
                        : adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)
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
        style={{ backgroundColor: "transparent" }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 16 + insets.bottom,
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

        {grade.studentScore && (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Grades_Details_Title")}</List.Label>
            </List.SectionTitle>

            {grade.studentScore && grade.outOf && grade.outOf.value !== 20 ? (
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
                    denominator={"/20"}
                  >
                    {(
                      (grade.studentScore.value / grade.outOf.value) *
                      20
                    ).toFixed(2)}
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
                      : adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)
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
                      : adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)
                  }
                  denominator={"/" + grade.outOf?.value}
                >
                  {grade.minScore?.value.toFixed(2)}
                </ContainedNumber>
              </List.Trailing>
            </List.Item>
          </List.Section>
        )}
        {grade.studentScore && (
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
            <Typography variant="title">{t("Grades_Avg_All_Title")}</Typography>
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
