import MissingItem from "@/components/Global/MissingItem";
import {
  PapillonHeaderSelector,
  PapillonModernHeader,
} from "@/components/Global/PapillonModernHeader";
import PapillonPicker from "@/components/Global/PapillonPicker";
import type { Screen } from "@/router/helpers/types";
import {
  updateGradesAndAveragesInCache,
  updateGradesPeriodsInCache,
} from "@/services/grades";
import type { GradesPerSubject } from "@/services/shared/Grade";
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";
import { animPapillon } from "@/utils/ui/animations";
import BackgroundIUTLannion from "@/views/login/IdentityProvider/actions/BackgroundIUTLannion";
import { useTheme } from "@react-navigation/native";
import { ChevronDown } from "lucide-react-native";
import React from "react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import Reanimated, {
  FadeInUp,
  FadeOut,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GradesAverageGraph = lazy(() => import("./Graph/GradesAverage"));
const GradesLatestList = lazy(() => import("./Latest/LatestGrades"));
const Subject = lazy(() => import("./Subject/Subject"));

const Grades: Screen<"Grades"> = ({ route, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const outsideNav = route.params?.outsideNav;

  const account = useCurrentAccount((store) => store.account!);
  const defaultPeriod = useGradesStore((store) => store.defaultPeriod);
  const periods = useGradesStore((store) => store.periods);
  const averages = useGradesStore((store) => store.averages);
  const grades = useGradesStore((store) => store.grades);

  const [userSelectedPeriod, setUserSelectedPeriod] = useState<string | null>(
    null
  );
  const selectedPeriod = useMemo(
    () => userSelectedPeriod ?? defaultPeriod,
    [userSelectedPeriod, defaultPeriod]
  );

  const [gradesPerSubject, setGradesPerSubject] = useState<GradesPerSubject[]>(
    []
  );
  const latestGradesRef = useRef<any[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (!periods.map((period) => period.name).includes(selectedPeriod)) {
        setUserSelectedPeriod(defaultPeriod);
      }
    }, 0);
  }, [account.instance, defaultPeriod]);

  useEffect(() => {
    setTimeout(() => updateGradesPeriodsInCache(account), 1);
  }, [account?.instance]);

  async function updateData () {
    return updateGradesAndAveragesInCache(account, selectedPeriod);
  }

  useEffect(() => {
    if (selectedPeriod === "") return;
    if (!account.instance) return;

    void (async () => {
      setIsLoading(true);
      await updateData();

      if(isRefreshing) {
        navigation.navigate("BackgroundIUTLannion");
      }

      setTimeout(() => {
        setIsRefreshing(false);
        setIsLoading(false);
      }, 100);
    })();
  }, [selectedPeriod, account.instance, isRefreshing]);

  useEffect(() => {
    setTimeout(() => {
      if (selectedPeriod === "") return;

      const gradesPerSubject: GradesPerSubject[] = [];

      for (const average of (averages[selectedPeriod] || { subjects: [] })
        .subjects) {
        const newGrades = (grades[selectedPeriod] || [])
          .filter((grade) => grade.subjectName === average.subjectName)
          .sort((a, b) => b.timestamp - a.timestamp);

        gradesPerSubject.push({
          average: average,
          grades: newGrades,
        });
      }

      gradesPerSubject.sort((a, b) =>
        a.average.subjectName.localeCompare(b.average.subjectName)
      );
      setGradesPerSubject(gradesPerSubject);
    }, 1);
  }, [selectedPeriod, averages, grades]);

  useEffect(() => {
    setTimeout(() => {
      if (selectedPeriod === "") return;

      const latestGrades = (grades[selectedPeriod] || [])
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      latestGradesRef.current = latestGrades;
    }, 1);
  }, [selectedPeriod, grades]);

  return (
    <>
      <PapillonModernHeader outsideNav={outsideNav}>
        <PapillonPicker
          delay={0}
          data={periods.map((period) => period.name)}
          selected={userSelectedPeriod ?? selectedPeriod}
          onSelectionChange={setUserSelectedPeriod}
        >
          <PapillonHeaderSelector loading={isLoading}>
            <View
              style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
            >
              <Reanimated.Text
                style={{
                  color: theme.colors.text,
                  maxWidth: 100,
                  fontFamily: "medium",
                  fontSize: 16,
                }}
                numberOfLines={1}
                key={`${selectedPeriod}sel`}
                entering={animPapillon(FadeInUp)}
                exiting={animPapillon(FadeOutDown)}
              >
                {userSelectedPeriod ?? selectedPeriod}
              </Reanimated.Text>

              <ChevronDown
                color={theme.colors.text}
                size={22}
                strokeWidth={2.5}
                style={{ marginRight: -4 }}
              />
            </View>
          </PapillonHeaderSelector>
        </PapillonPicker>
      </PapillonModernHeader>

      {!isLoading && (
        <ScrollView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => setIsRefreshing(true)}
              colors={Platform.OS === "android" ? [theme.colors.primary] : void 0}
              progressViewOffset={outsideNav ? 72 : insets.top + 56}
            />
          }
          contentContainerStyle={{
            paddingTop: outsideNav ? 64 : insets.top + 42,
          }}
          scrollIndicatorInsets={{ top: outsideNav ? 64 : insets.top + 16 }}
        >
          <Suspense fallback={<ActivityIndicator />}>
            <View
              style={{
                padding: 16,
                overflow: "visible",
                paddingTop: 0,
                paddingBottom: 16 + insets.bottom,
              }}
            >
              {(!grades[selectedPeriod] || grades[selectedPeriod].length === 0) &&
							!isLoading &&
							!isRefreshing && (
                <MissingItem
                  style={{ marginTop: 24, marginHorizontal: 16 }}
                  emoji="📚"
                  title="Aucune note disponible"
                  description="La période sélectionnée ne contient aucune note."
                />
              )}

              {!isLoading &&
							grades[selectedPeriod] &&
							grades[selectedPeriod].length > 1 && (
                <Reanimated.View
                  layout={animPapillon(LinearTransition)}
                  entering={FadeInUp.duration(200)}
                  exiting={FadeOut.duration(100)}
                  key={account.instance + "graph"}
                >
                  <GradesAverageGraph
                    grades={grades[selectedPeriod] ?? []}
                    overall={averages[selectedPeriod]?.overall.value}
                    classOverall={averages[selectedPeriod]?.classOverall.value}
                  />
                </Reanimated.View>
              )}

              {latestGradesRef.current.length > 2 && (
                <GradesLatestList
                  latestGrades={latestGradesRef.current}
                  navigation={navigation}
                  allGrades={grades[selectedPeriod] || []}
                />
              )}

              {gradesPerSubject.length > 0 && (
                <Subject
                  navigation={navigation}
                  gradesPerSubject={gradesPerSubject}
                  allGrades={grades[selectedPeriod] || []}
                />
              )}
            </View>
          </Suspense>
        </ScrollView>
      )}
    </>
  );
};

export default Grades;
