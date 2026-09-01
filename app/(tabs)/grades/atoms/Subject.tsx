import { Papicons } from '@getpapillon/papicons';
import { useTheme } from "expo-router/react-navigation";
import { useNavigation } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { Grade } from '@/database/models/Grades';
import Subject from '@/database/models/Subject';
import Stack from '@/ui/components/Stack';
import LegacyTypography from '@/ui/components/Typography';
import adjust from '@/utils/adjustColor';
import { getSubjectColor } from '@/utils/subjects/colors';
import { getSubjectEmoji } from '@/utils/subjects/emoji';
import { getSubjectName } from '@/utils/subjects/name';
import List from '@/ui/new/List';
import Typography from '@/ui/new/Typography';
import { GradeDisplayScale, formatScoreForDisplay } from '@/utils/grades/scale';
import { getSubjectAverage } from '@/utils/grades/algorithms/subject';
import { Grade as ServiceGrade } from '@/services/shared/grade';
import { SkillChip } from "@/ui/components/SkillChip";

const GradeItem = React.memo(({ grade, subjectName, subjectColor }: { grade: Grade, subjectName: string, subjectColor: string }) => {
  const dateString = useMemo(() => {
    // @ts-expect-error date type
    return grade.givenAt.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
  }, [grade.givenAt]);

  const theme = useTheme();

  const hasMaxScore = (grade.studentScore?.value ?? 0) === (grade.maxScore?.value ?? 1) && !grade.studentScore.disabled;
  const trailingBackground = hasMaxScore ? adjust(subjectColor, theme.dark ? -0.2 : 0) : subjectColor + "15";
  const trailingForeground = hasMaxScore ? "#FFFFFF" : subjectColor;

  return (
    <List.Item href={{ pathname: "/(tabs)/grades/[id]", params: { id: grade.id } }}>
      <Typography variant="title">
        {grade.description
          ? grade.description
          : t("Grade_NoDescription", { subject: subjectName })}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {dateString}
      </Typography>

      <List.Trailing>
        <Stack
          pointerEvents="none"
          noShadow
          direction="horizontal"
          gap={2}
          card
          hAlign="end"
          vAlign="end"
          padding={[9, 3]}
          radius={32}
          backgroundColor={trailingBackground}
        >
          {grade.studentScore === undefined ? (
            <LegacyTypography color={trailingForeground} variant="navigation">
              {t("Grade_Unavailable")}
            </LegacyTypography>
          ) : grade.studentScore.disabled ? (
            <>
              {(grade.skills?.length ?? 0) > 0 ? (
                <Stack direction={"horizontal"} hAlign={"center"}>
                  <Stack direction={"horizontal"}>
                    {grade.skills.slice(0, 4).map((item, index) => (
                      <SkillChip
                        key={index}
                        level={item.score}
                        style={{
                          marginLeft: index > 0 ? -13 : -5,
                          marginRight:
                            grade.skills.length <= 4 &&
                            index == Math.min(grade.skills.length - 1, 3)
                              ? -5
                              : 0,
                        }}
                      />
                    ))}
                  </Stack>
                  {grade.skills.length > 4 && (
                    <LegacyTypography
                      color={trailingForeground + "99"}
                      variant="body2"
                    >
                      {`+${grade.skills.length - 4}`}
                    </LegacyTypography>
                  )}
                </Stack>
              ) : (
                <LegacyTypography
                  color={trailingForeground}
                  variant="navigation"
                >
                  {grade.studentScore.status}
                </LegacyTypography>
              )}
            </>
          ) : (
            grade.studentScore.value !== undefined && (
              <>
                <LegacyTypography
                  color={trailingForeground}
                  variant="navigation"
                >
                  {grade.studentScore.value.toFixed(2)}
                </LegacyTypography>
                <LegacyTypography
                  color={trailingForeground + "99"}
                  variant="body2"
                >
                  /{grade.outOf.value}
                </LegacyTypography>
              </>
            )
          )}

          {hasMaxScore && (
            <Papicons
              style={{ marginBottom: 3.5, marginLeft: 2 }}
              name="crown"
              color={trailingForeground}
              size={18}
            />
          )}
        </Stack>
      </List.Trailing>
    </List.Item>
  );
});

export const SubjectItem: React.FC<{ subject: Subject, displayScale: GradeDisplayScale }> = React.memo(({ subject, displayScale }) => {
  const theme = useTheme();
  const navigation = useNavigation()

  // Memoize derived values
  const subjectAdjustedColor = useMemo(
    () => adjust(getSubjectColor(subject.name), theme.dark ? 0.2 : -0.4),
    [subject.name, theme.dark]
  );

  const subjectName = useMemo(() => getSubjectName(subject.name), [subject.name]);
  const subjectEmoji = useMemo(() => getSubjectEmoji(subject.name), [subject.name]);
  const displayedSubjectAverage = useMemo(() => {
    return formatScoreForDisplay(subject.studentAverage.value, subject.outOf.value, displayScale);
  }, [subject.studentAverage.value, subject.outOf.value, displayScale]);
  const displayedMaximumAverage = useMemo(() => {
    return formatScoreForDisplay(subject.maximum?.value, subject.outOf.value, displayScale).value;
  }, [subject.maximum?.value, subject.outOf.value, displayScale]);
  const computedSubjectAverage = useMemo(() => {
    const calculatedAverage = getSubjectAverage(subject.grades as unknown as ServiceGrade[]);
    if (calculatedAverage === -1) {
      return null;
    }
    return formatScoreForDisplay(calculatedAverage, subject.outOf.value, displayScale);
  }, [subject.grades, subject.outOf.value, displayScale]);
  const isUnknownSubjectAverage = useMemo(() => {
    if (!subject.studentAverage.disabled) {
      return false;
    }
    const status = String(subject.studentAverage.status ?? "").trim().toLowerCase();
    return status === "unknown";
  }, [subject.studentAverage.disabled, subject.studentAverage.status]);

  const handlePressSubject = useCallback(() => {
    // @ts-expect-error navigation types
    navigation.navigate('modals/SubjectInfo', {
      subject: subject
    });
  }, [navigation, subject]);

  return (
    <List.Section>
      <List.View>
        <TouchableOpacity
          style={{ width: "100%", paddingVertical: 8 }}
          activeOpacity={0.5}
          onPress={handlePressSubject}
          disabled={subject.studentAverage.disabled}
        >
          <Stack
            direction="horizontal"
            hAlign="center"
            gap={10}
            padding={[4, 0]}
          >
            <Stack
              width={28}
              height={28}
              card
              hAlign="center"
              vAlign="center"
              radius={32}
              backgroundColor={subjectAdjustedColor + "22"}
            >
              <Text style={{ fontSize: 15 }}>{subjectEmoji}</Text>
            </Stack>

            <Stack flex inline>
              <Typography
                numberOfLines={1}
                variant="title"
                weight="bold"
                color={subjectAdjustedColor}
              >
                {subjectName}
              </Typography>
            </Stack>

            {subject.studentAverage && (
              <Stack
                inline
                direction="horizontal"
                gap={1}
                hAlign="end"
                vAlign="end"
              >
                {subject.studentAverage.disabled ? (
                  isUnknownSubjectAverage &&
                  computedSubjectAverage && (
                    <LegacyTypography
                      variant="h5"
                      inline
                      style={{ marginTop: 0, fontSize: 19 }}
                      color={
                        computedSubjectAverage.value === displayedMaximumAverage
                          ? subjectAdjustedColor
                          : undefined
                      }
                    >
                      {computedSubjectAverage.value.toFixed(2)}
                    </LegacyTypography>
                  )
                ) : (
                  <>
                    <LegacyTypography
                      variant="h5"
                      inline
                      style={{ marginTop: 0, fontSize: 19 }}
                      color={
                        subject.studentAverage.value === subject.maximum?.value
                          ? subjectAdjustedColor
                          : undefined
                      }
                    >
                      {displayedSubjectAverage.value.toFixed(2)}
                    </LegacyTypography>
                    <LegacyTypography
                      inline
                      variant="body2"
                      color={theme.colors.text + "99"}
                      style={{ marginBottom: 4 }}
                    >
                      {isUnknownSubjectAverage && computedSubjectAverage
                        ? computedSubjectAverage.denominator
                        : displayedSubjectAverage.denominator}
                    </LegacyTypography>
                  </>
                )}
                {subject.studentAverage.value === subject.maximum?.value &&
                  !subject.studentAverage.disabled && (
                    <Papicons
                      style={{ alignSelf: "center", marginLeft: 4 }}
                      name="crown"
                      color={subjectAdjustedColor}
                      size={20}
                    />
                  )}
              </Stack>
            )}
          </Stack>
        </TouchableOpacity>
      </List.View>

      {subject.grades.map(grade => (
        <GradeItem
          key={grade.id}
          grade={grade}
          subjectName={subjectName}
          subjectColor={subjectAdjustedColor}
        />
      ))}
    </List.Section>
  );
});

GradeItem.displayName = "GradeItem"
SubjectItem.displayName = "SubjectItem"
  