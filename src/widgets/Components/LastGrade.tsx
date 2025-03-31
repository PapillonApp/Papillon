import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { TrendingUp } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";

import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { NativeText } from "@/components/Global/NativeComponents";
import { WidgetProps } from "@/components/Home/Widget";
import { updateGradesAndAveragesInCache } from "@/services/grades";
import { getSubjectData } from "@/services/shared/Subject";
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";

const LastGradeWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((store) => store.account);
  const grades = useGradesStore((store) => store.grades);
  const defaultPeriod = useGradesStore((store) => store.defaultPeriod);

  let lastPeriod = defaultPeriod;

  // find last period with grades
  if(!grades[lastPeriod] || grades[lastPeriod] && grades[lastPeriod].length === 0) {
    const periods = Object.keys(grades);
    for(let i = periods.length - 1; i >= 0; i--) {
      if(grades[periods[i]].length > 0) {
        lastPeriod = periods[i];
        break;
      }
    }
  }

  useImperativeHandle(ref, () => ({
    handlePress: () => "Grades"
  }));

  const lastGrade = useMemo(() => {
    if (!grades || !defaultPeriod || !grades[defaultPeriod]) return null;
    const periodGrades = grades[lastPeriod];
    return periodGrades.length > 0 ? periodGrades[periodGrades.length - 1] : null;
  }, [grades, defaultPeriod]);

  const gradeValue = lastGrade?.student?.value ?? null;
  const maxGradeValue = lastGrade?.outOf?.value ?? 20;

  const subjectData = getSubjectData(lastGrade?.subjectName || "");
  const subjectEmoji = subjectData.emoji;
  const subjectColor = subjectData.color;

  useEffect(() => {
    const fetchGrades = async () => {
      if (!account?.instance || !defaultPeriod) return;
      setLoading(true);
      try {
        await updateGradesAndAveragesInCache(account, defaultPeriod);
      } catch (error) {
        console.error("Erreur lors de la mise à jour des notes :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [account, defaultPeriod, setLoading]);

  const descriptionText = getSubjectData(lastGrade?.subjectName || "").pretty;

  useEffect(() => {
    const shouldHide = !lastGrade || typeof gradeValue !== "number" || gradeValue < 0;
    setHidden(shouldHide);
  }, [lastGrade, gradeValue, setHidden]);

  if (!lastGrade) {
    return null;
  }

  return (
    <>
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          gap: 7,
          opacity: 0.5,
        }}
      >
        <TrendingUp size={20} color={colors.text} />
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          Dernière note
        </Text>
      </View>

      <Reanimated.View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "auto",
          gap: 10,
        }}
        layout={LinearTransition}
      >
        <View
          style={{
            backgroundColor: subjectColor + "22",
            borderRadius: 50,
            padding: 6,
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>{subjectEmoji}</Text>
        </View>

        <NativeText
          variant="title"
          style={{
            width: "70%",
          }}
          numberOfLines={2}
        >
          {descriptionText}
        </NativeText>
      </Reanimated.View>

      <Reanimated.View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "flex-start",
          marginTop: 10,
          gap: 4,
        }}
      >
        {gradeValue !== null && (
          <>
            <AnimatedNumber
              value={gradeValue.toFixed(2)}
              style={{
                fontSize: 24.5,
                lineHeight: 24,
                fontFamily: "semibold",
                color: colors.text,
              }}
              contentContainerStyle={{
                paddingLeft: 6,
              }}
            />
            <Text
              style={{
                color: colors.text + "50",
                fontFamily: "semibold",
                fontSize: 15,
              }}
            >
              /{maxGradeValue}
            </Text>
          </>
        )}
      </Reanimated.View>
    </>
  );
});

export default LastGradeWidget;