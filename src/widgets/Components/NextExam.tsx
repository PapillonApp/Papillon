import { useTheme } from "@react-navigation/native";
import {Calculator, Clock8, GraduationCap} from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";

import { NativeText } from "@/components/Global/NativeComponents";
import { WidgetProps } from "@/components/Home/Widget";
import { getSubjectData } from "@/services/shared/Subject";
import { useCurrentAccount } from "@/stores/account";
import {useHomeworkStore} from "@/stores/homework";
import {dateToEpochWeekNumber} from "@/utils/epochWeekNumber";
import {updateHomeworkForWeekInCache} from "@/services/homework";
import {timestampToString} from "@/utils/format/DateHelper";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";
import detectCategory from "@/utils/magic/categorizeHomeworks";
import {Homework} from "@/services/shared/Homework";
import {error as log_error} from "@/utils/logger/logger";

interface Exam {
  subject: string
  description: string
  date: Date
}

function isExam (homework: Homework) {
  return homework.exam || ["Évaluations"].includes(detectCategory(homework.content) || "");
}

const NextExamWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((store) => store.account);
  const homeworks = useHomeworkStore((store) => store.homeworks);
  const currentWeekNumber = useMemo(() => dateToEpochWeekNumber(new Date()), []);

  useImperativeHandle(ref, () => ({
    handlePress: () => {
      if (account?.personalization.widgets?.deleteAfterRead) {
        setTimeout(() => setHidden(true), 1000);
      }
      return "Homeworks";
    }
  }));

  const [nextExam, totalExams] = useMemo(() => {
    if (!homeworks || !homeworks[currentWeekNumber]) return [null, 0];
    const now = new Date();
    const examList = [...homeworks[currentWeekNumber], ...(homeworks[currentWeekNumber + 1] || [])]
      .filter(homework => isExam(homework) && homework.due > now.getTime())
      .sort((a, b) => b.due - a.due);
    return [examList.length > 0 ? examList[examList.length - 1] : null, examList.length];
  }, [homeworks, currentWeekNumber]);

  const subjectData = getSubjectData(nextExam?.subject || "");

  useEffect(() => {
    const fetchHomeworks = async () => {
      if (!account?.instance) return;
      setLoading(true);
      try {
        await updateHomeworkForWeekInCache(account, new Date());
      } catch (error) {
        log_error(`Erreur lors de la mise à jour des devoirs : ${error}`, "Widget:LastExam");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworks();
  }, [account, setLoading]);

  useEffect(() => {
    const shouldHide = !nextExam || !account?.personalization.widgets?.nextTest;
    setHidden(shouldHide);
  }, [nextExam, setHidden]);

  if (!nextExam) {
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
        <GraduationCap size={20} color={colors.text} />
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          Prochaine évaluation
        </Text>
      </View>

      <View
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          marginTop: "auto",
          gap: 0
        }}>
        <View
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 5
          }}
        >
          <NativeText
            variant="title"
            style={{
              width: "100%",
              color: subjectData.color
            }}
            numberOfLines={1}
          >
            {nextExam.subject}
          </NativeText>
        </View>
        <NativeText
          variant="subtitle"
          style={{
            width: "100%",
            opacity: 1
          }}
          numberOfLines={2}
        >
          {parse_homeworks(nextExam.content)}
        </NativeText>
      </View>

      <View
        style={{
          marginTop: "auto",
          display: "flex",
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        }}>

        <View
          style={{
            display: "flex",
            width: "50%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 5
          }}
        >
          <Clock8 opacity={0.7} size={17} color={colors.text}/>
          <NativeText
            numberOfLines={1}
            variant="subtitle"
          >
            {timestampToString(nextExam.due)}
          </NativeText>
        </View>
        {(totalExams - 1) > 0 && <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 5
          }}
        >
          <Calculator opacity={0.7} size={17} color={colors.text}/>
          <NativeText
            numberOfLines={1}
            variant="subtitle"
          >
            +{totalExams - 1}
          </NativeText>
        </View>}
      </View>
    </>
  );
});

export default NextExamWidget;
