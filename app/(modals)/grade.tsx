import { Papicons } from '@getpapillon/papicons';
import { useRoute, useTheme } from "@react-navigation/native";
import { t } from "i18next";
import React from "react";
import { Alert, Platform, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import ModalOverhead, { ModalOverHeadScore } from '@/components/ModalOverhead';
import { isEDAttachmentRebuildError } from "@/services/ecoledirecte/attachments";
import { Attachment } from "@/services/shared/attachment";
import { Grade as SharedGrade } from "@/services/shared/grade";
import ContainedNumber from "@/ui/components/ContainedNumber";
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import TypographyLegacy from "@/ui/components/Typography";
import { openAttachment } from "@/utils/attachments/openAttachment";
import adjust from '@/utils/adjustColor';
import { colorCheck } from '@/utils/colorCheck';
import { formatGradeScore, getGradeScoreDenominator, hasDisplayableGradeScore, isNumericGradeScore, isSameNumericScore } from '@/utils/grades/score';
import { warn } from "@/utils/logger/logger";
import { getAttachmentIcon } from "@/utils/news/getAttachmentIcon";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import List from '@/ui/new/List';
import Typography from '@/ui/new/Typography';
import { GradeDisplaySettings } from '@/services/shared/grade';

interface SubjectInfo {
  name: string;
  originalName: string;
  emoji: string;
  color: string;
}

interface GradesModalProps {
  grade: SharedGrade;
  subjectInfo: SubjectInfo;
  display?: GradeDisplaySettings;
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

const GradeBadge = ({ icon, label, color, theme, is_outlined = false }: GradeBadgeProps) => {
  const backgroundColor = is_outlined ? "transparent" : adjust(color, theme.dark ? 0.3 : -0.3);
  const textColor = is_outlined ? color : (colorCheck("#FFFFFF", [backgroundColor]) ? "#FFFFFF" : "#000000");
  const borderStyle = is_outlined ? { borderWidth: 1, borderColor: color } : undefined;

  return (
    <Stack direction="horizontal" gap={8} backgroundColor={backgroundColor} vAlign="center" hAlign="center" padding={[12, 6]} radius={32} style={borderStyle}>
      <Papicons size={20} name={icon} color={textColor} />
      <TypographyLegacy color={textColor} variant='body2'>
        {label}
      </TypographyLegacy>
    </Stack>
  );
};

export default function GradesModal() {
  const { params } = useRoute();
  const theme = useTheme();
  const colors = theme.colors;
  const [openingAttachmentId, setOpeningAttachmentId] = React.useState<string | null>(null);

  if (!params) {
    return null;
  }
  const { grade, subjectInfo, display, avgInfluence = 0, avgClass = 0 } = params as GradesModalProps;

  const insets = useSafeAreaInsets();
  const finalHeaderHeight = Platform.select({
    android: insets.top + 32,
    default: 0
  });
  const averageScale = display?.scale ?? 20;
  const scoreLabel = formatGradeScore(grade.studentScore) ?? "";
  const scoreDenominator = getGradeScoreDenominator(grade.studentScore, grade.outOf?.value);
  const showGradeCoefficient = display?.showGradeCoefficient ?? true;
  const showGradeClassAverage = display?.showGradeClassAverage ?? hasDisplayableGradeScore(grade.averageScore);
  const showGradeMinimum = display?.showGradeMinimum ?? hasDisplayableGradeScore(grade.minScore);
  const showGradeMaximum = display?.showGradeMaximum ?? hasDisplayableGradeScore(grade.maxScore);
  const hasBestGrade = isSameNumericScore(grade.studentScore, grade.maxScore);
  const attachments = [grade.subjectFile, grade.correctionFile].filter(Boolean) as Attachment[];

  const summaryCards = [
    showGradeCoefficient ? {
      key: "coefficient",
      icon: "Coefficient",
      label: t("Grades_Coefficient"),
      value: `x${(grade.coefficient ?? 1).toFixed(2)}`,
      denominator: undefined,
    } : null,
    showGradeClassAverage && hasDisplayableGradeScore(grade.averageScore) ? {
      key: "classAverage",
      icon: "Apple",
      label: t("Grades_Avg_Group_Short"),
      value: formatGradeScore(grade.averageScore),
      denominator: typeof getGradeScoreDenominator(grade.averageScore, grade.outOf?.value) === "number"
        ? "/" + getGradeScoreDenominator(grade.averageScore, grade.outOf?.value)
        : undefined,
    } : null,
  ].filter(Boolean) as Array<{
    key: string;
    icon: string;
    label: string;
    value?: string;
    denominator?: string;
  }>;

  const detailsItems = [
    isNumericGradeScore(grade.studentScore) && typeof grade.outOf?.value === "number" && grade.outOf.value !== averageScale ? {
      key: "normalized",
      icon: "Star",
      title: t("Grades_NormalizedGrade_Title"),
      subtitle: t("Grades_NormalizedGrade_Description"),
      value: ((grade.studentScore.value / grade.outOf.value) * averageScale).toFixed(2),
      denominator: `/${averageScale}`,
    } : null,
    showGradeMaximum && hasDisplayableGradeScore(grade.maxScore) ? {
      key: "maximum",
      icon: "Plus",
      title: t("Grades_HighestGrade_Title"),
      subtitle: t("Grades_HighestGrade_Description"),
      value: formatGradeScore(grade.maxScore),
      denominator: typeof getGradeScoreDenominator(grade.maxScore, grade.outOf?.value) === "number"
        ? "/" + getGradeScoreDenominator(grade.maxScore, grade.outOf?.value)
        : undefined,
    } : null,
    showGradeMinimum && hasDisplayableGradeScore(grade.minScore) ? {
      key: "minimum",
      icon: "Minus",
      title: t("Grades_LowestGrade_Title"),
      subtitle: t("Grades_LowestGrade_Description"),
      value: formatGradeScore(grade.minScore),
      denominator: typeof getGradeScoreDenominator(grade.minScore, grade.outOf?.value) === "number"
        ? "/" + getGradeScoreDenominator(grade.minScore, grade.outOf?.value)
        : undefined,
    } : null,
  ].filter(Boolean) as Array<{
    key: string;
    icon: string;
    title: string;
    subtitle: string;
    value?: string;
    denominator?: string;
  }>;

  const openGradeAttachment = async (attachment: Attachment) => {
    const attachmentId = getGradeAttachmentKey(attachment);
    if (openingAttachmentId) {
      return;
    }

    setOpeningAttachmentId(attachmentId);
    try {
      await openAttachment(attachment);
    } catch (error) {
      warn(String(error));
      if (isEDAttachmentRebuildError(error)) {
        Alert.alert(
          t("Attachment_Open_Rebuild_Title"),
          t("Attachment_Open_Rebuild_Description")
        );
        return;
      }

      Alert.alert(
        t("Attachment_Open_Error_Title"),
        t("Attachment_Open_Error_Description")
      );
    } finally {
      setOpeningAttachmentId(currentId => currentId === attachmentId ? null : currentId);
    }
  };

  return (
    <>
      {Platform.OS !== 'android' && (
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
      )}

      <List
        ListHeaderComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginVertical: 20,
              paddingTop: finalHeaderHeight
            }}
          >
            <ModalOverhead
              color={Platform.OS === 'ios' ? subjectInfo.color : colors.primary}
              emoji={subjectInfo.emoji}
              subject={subjectInfo.name}
              title={grade.description}
              date={grade.givenAt ? new Date(grade.givenAt) : undefined}
              overhead={
                <ModalOverHeadScore
                  color={Platform.OS === 'ios' ? subjectInfo.color : colors.primary}
                  score={scoreLabel}
                  outOf={scoreDenominator}
                />
              }
            />

            {hasBestGrade &&
              <GradeBadge
                icon="crown"
                label={t("Modal_Grades_BestGrade")}
                color={subjectInfo.color}
                theme={theme}
                is_outlined={false}
              />
            }
            {grade.optional &&
              <GradeBadge
                icon="info"
                label={t("Modal_Grades_OptionalGrade")}
                color={subjectInfo.color}
                theme={theme}
                is_outlined={true}
              />
            }

            {grade.bonus &&
              <GradeBadge
                icon="info"
                label={t("Modal_Grades_BonusGrade")}
                color={subjectInfo.color}
                theme={theme}
                is_outlined={true}
              />
            }
            {summaryCards.length > 0 && (
              <Stack
                card
                direction="horizontal"
                width={"100%"}
                style={{ marginTop: 8 }}
              >
                {summaryCards.map((card, index) => (
                  <Stack
                    key={card.key}
                    width={`${100 / summaryCards.length}%`}
                    vAlign="center"
                    hAlign="center"
                    style={index < summaryCards.length - 1 ? { borderRightWidth: 1, borderRightColor: colors.border } : undefined}
                    padding={12}
                  >
                    <Icon papicon opacity={0.5}>
                      <Papicons name={card.icon} />
                    </Icon>
                    <TypographyLegacy color="secondary">
                      {card.label}
                    </TypographyLegacy>
                    <ContainedNumber
                      color={Platform.OS === 'android' ? colors.primary : adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3)}
                      denominator={card.denominator}
                    >
                      {card.value}
                    </ContainedNumber>
                  </Stack>
                ))}
              </Stack>
            )}
          </View>
        }
        style={{ backgroundColor: "transparent" }}
        contentContainerStyle={{ padding: 16,
              paddingBottom: 16 + insets.bottom }}
      >
        {detailsItems.length > 0 && (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Grades_Details_Title")}</List.Label>
            </List.SectionTitle>

            {detailsItems.map((item) => (
              <List.Item key={item.key}>
                <List.Leading>
                  <Icon>
                    <Papicons name={item.icon} />
                  </Icon>
                </List.Leading>
                <Typography variant="title">
                  {item.title}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {item.subtitle}
                </Typography>
                <List.Trailing>
                  <ContainedNumber
                    color={item.key === "normalized" ? subjectInfo.color : (Platform.OS === 'android' ? colors.primary : adjust(subjectInfo.color, theme.dark ? 0.3 : -0.3))}
                    denominator={item.denominator}
                  >
                    {item.value}
                  </ContainedNumber>
                </List.Trailing>
              </List.Item>
            ))}
          </List.Section>
        )}

        {attachments.length > 0 && (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Modal_Task_Attachments")}</List.Label>
            </List.SectionTitle>

            {attachments.map((attachment) => (
              <List.Item
                key={getGradeAttachmentKey(attachment)}
                onPress={() => void openGradeAttachment(attachment)}
              >
                <List.Leading>
                  <Icon>
                    <Papicons name={getAttachmentIcon(attachment)} />
                  </Icon>
                </List.Leading>
                <Typography variant="title">
                  {getGradeAttachmentTitle(attachment)}
                </Typography>
                <Typography variant="body1" color="textSecondary" numberOfLines={1}>
                  {attachment.name}
                </Typography>
                <List.Trailing>
                  {openingAttachmentId === getGradeAttachmentKey(attachment) ? (
                    <ActivityIndicator
                      size={20}
                      color={Platform.OS === 'android' ? colors.primary : subjectInfo.color}
                    />
                  ) : (
                    <Icon opacity={0.5}>
                      <Papicons name="ArrowRight" />
                    </Icon>
                  )}
                </List.Trailing>
              </List.Item>
            ))}
          </List.Section>
        )}

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
                color={avgInfluence === 0 ? "#757575" : avgInfluence >= 0 ? "#2e8900" : "#990000"}
                denominator="pts"
              >
                {avgInfluence >= 0 ? `+${avgInfluence.toFixed(2)}` : avgInfluence.toFixed(2)}
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
                color={avgClass === 0 ? "#757575" : avgClass >= 0 ? "#2e8900" : "#990000"}
                denominator="pts"
              >
                {avgClass >= 0 ? `+${avgClass.toFixed(2)}` : avgClass.toFixed(2)}
              </ContainedNumber>
            </List.Trailing>
          </List.Item>
        </List.Section>
      </List>
    </>
  )
}

function getGradeAttachmentTitle(attachment: Attachment): string {
  switch (attachment.metadata?.role) {
  case "subject":
    return t("Modal_Grades_SubjectAttachment");
  case "correction":
    return t("Modal_Grades_CorrectionAttachment");
  default:
    return attachment.name;
  }
}

function getGradeAttachmentKey(attachment: Attachment): string {
  return `${attachment.metadata?.role ?? "attachment"}-${attachment.url}`;
}
