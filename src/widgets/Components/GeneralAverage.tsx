
import { useTheme } from "@react-navigation/native";
import { PieChart } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";

import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { WidgetProps } from "@/components/Home/Widget";
import { updateGradesAndAveragesInCache, updateGradesPeriodsInCache } from "@/services/grades";
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";
import { getPronoteAverage } from "@/utils/grades/getAverages";

const GeneralAverageWidget = forwardRef(
  ({ setLoading, setHidden, loading }: WidgetProps, ref) => {
    const theme = useTheme();
    const { colors } = theme;

    const account = useCurrentAccount((store) => store.account);

    const grades = useGradesStore((store) => store.grades);
    const averages = useGradesStore((store) => store.averages);
    const defaultPeriod = useGradesStore((store) => store.defaultPeriod);
    const currentPeriod = useGradesStore((store) => store.currentPeriod);

    useImperativeHandle(ref, () => ({
      handlePress: () => "Grades",
    }));

    const average = useMemo(() => {
      return !averages[defaultPeriod]?.overall.disabled
        ? averages[defaultPeriod]?.overall.value
        : getPronoteAverage(grades[defaultPeriod]);
    }, [averages, grades, defaultPeriod]);

    useEffect(() => {
      void async function () {
        if (!account?.instance) return;
        setLoading(true);

        await updateGradesPeriodsInCache(account);
        setLoading(false);
      }();
    }, [account?.instance]);

    useEffect(() => {
      void async function () {
        if (!account?.instance || !defaultPeriod) return;
        setLoading(true);

        await updateGradesAndAveragesInCache(account, defaultPeriod);
        setLoading(false);
      }();
    }, [defaultPeriod]);

    useEffect(() => {
      setHidden(typeof average !== "number" || average < 0);
    }, [average]);

    if (isNaN(average ?? 0)) {
      setHidden(true);
    }

    return (
      <>
        {/* Section Notes */}
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
          <PieChart size={20} color={colors.text} />
          <Text
            style={{
              color: colors.text,
              fontFamily: "semibold",
              fontSize: 17,
            }}
          >
            Mes Notes
          </Text>
        </View>

        {/* Texte de la Période Actuelle avec la période dynamique */}
        <Reanimated.Text
          style={{
            color: colors.text,
            marginTop: 17,
            fontFamily: "medium",
            fontSize: 15,
            marginVertical: 4,
            opacity: 0.4,
          }}
          layout={LinearTransition}
        >
          Période actuelle: {currentPeriod || "Indisponible"} {/* Utilise la période actuelle dynamique */}
        </Reanimated.Text>

        {/* Section Moyenne Générale */}
        <Reanimated.View
          style={{
            alignItems: "flex-start",
            flexDirection: "column",
            width: "100%",
            marginTop: "auto",
            gap: 4,
          }}
          layout={LinearTransition}
        >
          <Reanimated.Text
            style={{
              color: colors.text + "50",
              fontFamily: "medium",
              fontSize: 16,
            }}
            layout={LinearTransition}
          >
            Moyenne générale
          </Reanimated.Text>

          <Reanimated.View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 4,
            }}
          >
            <AnimatedNumber
              value={average?.toFixed(2) ?? ""}
              style={{
                fontSize: 24,
                lineHeight: 24,
                fontFamily: "semibold",
              }}
              contentContainerStyle={{
                paddingLeft: 6,
              }}
            />
            <Text
              style={{
                color: colors.text + "50",
                fontFamily: "medium",
                fontSize: 16,
              }}
            >
              /20
            </Text>
          </Reanimated.View>
        </Reanimated.View>
      </>
    );
  }
);

export default GeneralAverageWidget;