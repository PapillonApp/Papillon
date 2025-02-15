import { useTheme } from "@react-navigation/native";
import { BookOpen, Clock8, Book } from "lucide-react-native";
import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from "react";
import { Text, View } from "react-native";
import {NativeText} from "@/components/Global/NativeComponents";
import { WidgetProps } from "@/components/Home/Widget";
import { useCurrentAccount } from "@/stores/account";
import {useHomeworkStore} from "@/stores/homework";
import {dateToEpochWeekNumber} from "@/utils/epochWeekNumber";
import {updateHomeworkForWeekInCache} from "@/services/homework";
import {getSubjectData} from "@/services/shared/Subject";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";
import {timestampToString} from "@/utils/format/DateHelper";
import {error as log_error} from "@/utils/logger/logger";

const NextHomeworksWidget = forwardRef(({
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

  const [nextHomework, undoneHomeworks] = useMemo(() => {
    if (!homeworks || !homeworks[currentWeekNumber]) return [null, 0];
    const weekHomeworks = [...homeworks[currentWeekNumber], ...(homeworks[currentWeekNumber + 1] || [])];
    return [
      weekHomeworks.length > 0 ? weekHomeworks.filter(homework => !homework.done)[1] : undefined,
      weekHomeworks.filter(homework => !homework.done).length
    ];
  }, [homeworks]);

  useEffect(() => {
    const fetchHomeworks = async () => {
      if (!account?.instance) return;
      setLoading(true);
      try {
        await updateHomeworkForWeekInCache(account, new Date());
      } catch (error) {
        log_error(`Erreur lors de la mise à jour des devoirs : ${error}`, "Widget:NextHomeworks");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworks();
  }, [account, setLoading]);


  useEffect(() => {
    const shouldHide = !nextHomework || !account?.personalization.widgets?.nextHomeworks;
    setHidden(shouldHide);
  }, [nextHomework, setHidden]);

  const [subjectData, setSubjectData] = useState({ color: "#888888", pretty: "Matière inconnue" });

  useEffect(() => {
    const fetchSubjectData = async () => {
      const data = await getSubjectData(nextHomework?.subject || "");
      setSubjectData(data);
    };
    fetchSubjectData();
  }, [nextHomework?.subject]);

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
        <BookOpen size={20} color={colors.text} />
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          Devoirs à faire
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
            {nextHomework?.subject}
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
          {parse_homeworks(nextHomework?.content || "")}
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
            {timestampToString(nextHomework?.due || 0)}
          </NativeText>
        </View>
        {(undoneHomeworks - 1) > 0 && <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 5
          }}
        >
          <Book opacity={0.7} size={17} color={colors.text}/>
          <NativeText
            numberOfLines={1}
            variant="subtitle"
          >
            +{undoneHomeworks - 1}
          </NativeText>
        </View>}
      </View>
    </>
  );
});

export default NextHomeworksWidget;
