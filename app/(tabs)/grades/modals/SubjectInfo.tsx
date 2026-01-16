import ModalOverhead, { ModalOverHeadScore } from "@/components/ModalOverhead";
import Subject from "@/database/models/Subject";
import Stack from "@/ui/components/Stack";
import TableFlatList from "@/ui/components/TableFlatList";
import Typography from "@/ui/components/Typography";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { Papicons } from "@getpapillon/papicons";
import { useRoute, useTheme } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { colorCheck } from '@/utils/colorCheck';
import adjust from "@/utils/adjustColor";
import i18n from "@/utils/i18n";

const SubjectInfo = () => {
  const { params } = useRoute();
  const theme = useTheme();
  const colors = theme.colors;

  const subject: Subject = params?.subject;
  const subjectColor = getSubjectColor(subject?.name);
  const subjectName = getSubjectName(subject?.name);
  const subjectEmoji = getSubjectEmoji(subject?.name);

  const outOf = subject.outOf.value;

  const averagesData = [
    {
      title: i18n.t("SubjectInfo_ClassAverage_Label"),
      subtitle: i18n.t("SubjectInfo_ClassAverage_Description"),
      disabled: subject.classAverage.disabled,
      value: subject.classAverage.value.toFixed(2),
      status: subject.classAverage.status,
      icon: "GraduationHat",
    },
    {
      title: i18n.t("SubjectInfo_MaxAverage_Label"),
      subtitle: i18n.t("SubjectInfo_MaxAverage_Description"),
      disabled: subject.maximum.disabled,
      value: subject.maximum.value.toFixed(2),
      status: subject.maximum.status,
      icon: "ArrowRightUp",
    },
    {
      title: i18n.t("SubjectInfo_MinAverage_Label"),
      subtitle: i18n.t("SubjectInfo_MinAverage_Description"),
      disabled: subject.minimum.disabled,
      value: subject.minimum.value.toFixed(2),
      status: subject.minimum.status,
      icon: "Minus",
    }
  ]

  return (
    <>
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

      <TableFlatList
        contentInsetAdjustmentBehavior="automatic"
        engine='FlashList'

        ListHeaderComponent={
          <View style={{ marginBottom: 24, alignItems: 'center' }}>
            <ModalOverhead
              subject={subjectName}
              color={subjectColor}
              emoji={subjectEmoji}
              overtitle={i18n.t("Grades_SubjectInfo_NbGrades", { number: subject.grades.length })}
              overhead={
                <ModalOverHeadScore
                  color={subjectColor}
                  score={subject.studentAverage.disabled ? String(subject.studentAverage.status) : String(subject.studentAverage.value.toFixed(2))}
                  outOf={outOf}
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
                <Typography color={colorCheck("#FFFFFF", [adjust(subjectColor, theme.dark ? 0.3 : -0.3)]) ? "#FFFFFF" : "#000000"} variant='body2'>
                  {i18n.t("SubjectInfo_MaxAverage_Description")}
                </Typography>
              </Stack>
            )}
          </View>
        }

        sections={[
          {
            title: i18n.t("SubjectInfo_Stats_Header"),
            icon: <Papicons name="grades" />,
            items: averagesData.map((average) => ({
              icon: <Papicons name={average.icon} />,
              title: average.title,
              description: average.subtitle,
              trailing: (
                <Stack gap={2} direction="horizontal" vAlign="center" hAlign="end">
                  <Typography variant="header" weight="semibold" inline>
                    {average.disabled ? average.status : average.value}
                  </Typography>
                  <Typography variant="body2" inline color="secondary">
                    /{outOf}
                  </Typography>
                </Stack>
              )
            }))
          }
        ]}
      />
    </>
  );
};

export default SubjectInfo;
