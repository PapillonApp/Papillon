import ModalOverhead, { ModalOverHeadScore } from "@/components/ModalOverhead";
import Subject from "@/database/models/Subject";
import Stack from "@/ui/components/Stack";
import TableFlatList from "@/ui/components/TableFlatList";
import TypographyLegacy from "@/ui/components/Typography";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
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
import { useSettingsStore } from "@/stores/settings";
import { formatScoreForDisplay, getGradeDisplayScale } from "@/utils/grades/scale";

const SubjectInfo = () => {
  const { params } = useRoute();
  const theme = useTheme();
  const colors = theme.colors;

  const subject: Subject = params?.subject;
  const displayScale = getGradeDisplayScale(useSettingsStore(state => state.personalization.gradesDisplayScale));
  const subjectColor = getSubjectColor(subject?.name);
  const subjectName = getSubjectName(subject?.name);
  const subjectEmoji = getSubjectEmoji(subject?.name);

  const displayedSubjectAverage = formatScoreForDisplay(subject.studentAverage.value, subject.outOf.value, displayScale);
  const displayedDenominator = formatScoreForDisplay(0, subject.outOf.value, displayScale).denominator;

  const averagesData = [
    {
      title: i18n.t("SubjectInfo_ClassAverage_Label"),
      subtitle: i18n.t("SubjectInfo_ClassAverage_Description"),
      disabled: subject.classAverage.disabled,
      value: formatScoreForDisplay(subject.classAverage.value, subject.outOf.value, displayScale).value,
      status: subject.classAverage.status,
      icon: "GraduationHat",
    },
    {
      title: i18n.t("SubjectInfo_MaxAverage_Label"),
      subtitle: i18n.t("SubjectInfo_MaxAverage_Description"),
      disabled: subject.maximum.disabled,
      value: formatScoreForDisplay(subject.maximum.value, subject.outOf.value, displayScale).value,
      status: subject.maximum.status,
      icon: "ArrowRightUp",
    },
    {
      title: i18n.t("SubjectInfo_MinAverage_Label"),
      subtitle: i18n.t("SubjectInfo_MinAverage_Description"),
      disabled: subject.minimum.disabled,
      value: formatScoreForDisplay(subject.minimum.value, subject.outOf.value, displayScale).value,
      status: subject.minimum.status,
      icon: "Minus",
    }
  ]

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
                  score={subject.studentAverage.disabled ? String(subject.studentAverage.status) : String(displayedSubjectAverage.value.toFixed(2))}
                  outOf={displayedDenominator.startsWith("/") ? displayedDenominator.slice(1) : displayedDenominator}
                />
              }
              style={{
                marginBottom: (!subject.studentAverage.disabled && subject.studentAverage.value === subject.maximum.value) ? 12 : 0
              }}
            />

            {(!subject.studentAverage.disabled && subject.studentAverage.value === subject.maximum.value) && (
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

          {averagesData.map((average, index) => (
            <List.Item>
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
                <Stack gap={2} direction="horizontal" vAlign="center" hAlign="end">
                  <TypographyLegacy variant="header" weight="semibold" inline>
                    {average.disabled ? average.status : average.value.toFixed(2)}
                  </TypographyLegacy>
                  <TypographyLegacy variant="body2" inline color="secondary">
                    {displayedDenominator}
                  </TypographyLegacy>
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
