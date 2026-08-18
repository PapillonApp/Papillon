import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import Stack from "@/ui/components/Stack";
import Icon from "@/ui/components/Icon";
import { Papicons } from "@getpapillon/papicons";
import LegacyTypography from "@/ui/components/Typography";
import { t } from "i18next";
import { LegendList } from "@legendapp/list";
import { Dimensions, View } from "react-native";
import { ErrorBoundary } from "@/ui/components/ErrorBoundary";
import { CompactGrade } from "@/ui/components/CompactGrade";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { getSubjectColor } from "@/utils/subjects/colors";
import { Dynamic } from "@/ui/components/Dynamic";
import React, { JSX, useMemo } from "react";
import { Grade, Subject } from "@/services/shared/grade";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";

export interface CompactGradeListProps {
  grades: Grade[];
  getSubjectById: (id: string) => Subject | undefined;
  large?: boolean;
}

export function CompactGradeList({
  grades,
  getSubjectById,
  large = false,
}: CompactGradeListProps): JSX.Element {
  const list = useMemo(() => (
    <LegendList
      horizontal
      data={grades.slice(0, 10)}
      style={{
        overflow: "visible",
        height: 140,
      }}
      contentContainerStyle={{
        gap: 12,
        paddingStart: 16 + (large ? 20 : 0),
        paddingEnd: 4 + (large ? 20 : 0),
      }}
      estimatedItemSize={210 + 12}
      showsHorizontalScrollIndicator={false}
      recycleItems={true}
      keyExtractor={item => item.id}
      renderItem={({ item: grade }) => (
        <ErrorBoundary fallback={<View style={{ width: 140, height: 140 }} />}>
          <Link
            href={{ pathname: "/(tabs)/grades/[id]", params: { id: grade.id } }}
            asChild
          >
            <Link.AppleZoom>
              <CompactGrade
                key={grade.id + "_compactGrade_header"}
                emoji={getSubjectEmoji(getSubjectById(grade.subjectId)?.name || "")}
                title={getSubjectName(getSubjectById(grade.subjectId)?.name || "")}
                description={grade.description}
                skillLevel={grade.skills?.map(v => v.score) ?? []}
                score={grade.studentScore?.value || 0}
                outOf={grade.outOf?.value || 20}
                disabled={grade.studentScore?.disabled}
                status={grade.studentScore?.status}
                color={getSubjectColor(getSubjectById(grade.subjectId)?.name || "")}
                date={grade.givenAt}
                hasMaxScore={
                  (grade?.studentScore?.value ?? 0) ===
                    (grade?.maxScore?.value ?? 1) && !grade?.studentScore?.disabled
                }
              />
            </Link.AppleZoom>
          </Link>
        </ErrorBoundary>
      )}
    />
  ), [grades]);

  return (
    <Dynamic animated entering={PapillonAppearIn} exiting={PapillonAppearOut}>
      <Stack gap={8} width={"100%"} style={{ marginBottom: large ? 0 : 16 }}>
        {!large && (
          <Stack
            direction="horizontal"
            gap={8}
            vAlign="start"
            hAlign="center"
            style={{ opacity: 0.4 }}
            padding={[0, 0]}
          >
            <Icon size={20}>
              <Papicons name="star" />
            </Icon>
            <LegacyTypography variant="h6" color="text">
              {t("Grades_Tab_Latest")}
            </LegacyTypography>
          </Stack>
        )}

        {large ? (
          <MaskedView
            style={{ width: "100%" }}
            maskElement={
              <View
                style={{ width: "100%", height: 140, flexDirection: "row" }}
              >
                {large && (
                  <LinearGradient
                    colors={["#0000", "#000"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: 40, height: 140 }}
                  />
                )}
                <View style={{ flex: 1, backgroundColor: "#000" }} />
                {large && (
                  <LinearGradient
                    colors={["#000", "#0000"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: 40, height: 140 }}
                  />
                )}
              </View>
            }
          >
            {list}
          </MaskedView>
        ) : (
          <View style={{ width: Dimensions.get("window").width, marginHorizontal: -16 }}>{list}</View>
        )}
      </Stack>
    </Dynamic>
  );
}

/*
() => {
                  // @ts-expect-error navigation types

 */
