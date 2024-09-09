import MissingItem from "@/components/Global/MissingItem";
import { NativeText } from "@/components/Global/NativeComponents";
import PapillonHeader from "@/components/Global/PapillonHeader";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { Screen } from "@/router/helpers/types";
import { updateGradesAndAveragesInCache, updateGradesPeriodsInCache } from "@/services/grades";
import type { GradesPerSubject } from "@/services/shared/Grade";
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";
import { animPapillon } from "@/utils/ui/animations";
import { useTheme } from "@react-navigation/native";
import { ChevronDown } from "lucide-react-native";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, View } from "react-native";
import Reanimated, { FadeIn, FadeInUp, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GradesAverageGraph = lazy(() => import("./Graph/GradesAverage"));
const GradesLatestList = lazy(() => import("./Latest/LatestGrades"));
const Subject = lazy(() => import("./Subject/Subject"));

const Grades: Screen<"Grades"> = ({ route, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const account = useCurrentAccount(store => store.account!);
  const defaultPeriod = useGradesStore(store => store.defaultPeriod);
  const periods = useGradesStore(store => store.periods);
  const averages = useGradesStore(store => store.averages);
  const grades = useGradesStore(store => store.grades);

  const [userSelectedPeriod, setUserSelectedPeriod] = useState<string | null>(null);
  const selectedPeriod = useMemo(() => userSelectedPeriod ?? defaultPeriod, [userSelectedPeriod, defaultPeriod]);

  const [gradesPerSubject, setGradesPerSubject] = useState<GradesPerSubject[]>([]);
  const latestGradesRef = useRef<any[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (!periods.map(period => period.name).includes(selectedPeriod)) {
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

    void (async function () {
      setIsLoading(true);
      setTimeout(async () => {
        await updateData();
        setIsRefreshing(false);
        setIsLoading(false);
      }, 100);
    })();
  }, [selectedPeriod, account.instance, isRefreshing]);

  useEffect(() => {
    setTimeout(() => {
      if (selectedPeriod === "") return;

      const gradesPerSubject: GradesPerSubject[] = [];

      for (const average of (averages[selectedPeriod] || { subjects: [] }).subjects) {
        const newGrades = (grades[selectedPeriod] || []).filter(grade => grade.subjectName === average.subjectName).sort((a, b) => b.timestamp - a.timestamp);

        gradesPerSubject.push({
          average: average,
          grades: newGrades,
        });
      }

      gradesPerSubject.sort((a, b) => a.average.subjectName.localeCompare(b.average.subjectName));
      setGradesPerSubject(gradesPerSubject);
    }, 1);
  }, [selectedPeriod, averages, grades]);

  useEffect(() => {
    setTimeout(() => {
      if (selectedPeriod === "") return;

      const latestGrades = (grades[selectedPeriod] || []).slice().sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

      latestGradesRef.current = latestGrades;
    }, 1);
  }, [selectedPeriod, grades]);

  return (
    <>
      <PapillonHeader route={route} navigation={navigation}>
        <Reanimated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
          layout={LinearTransition}
        >
          <Reanimated.View
            layout={LinearTransition}
          >
            <PapillonPicker
              delay={0}
              data={periods.map(period => period.name)}
              selected={userSelectedPeriod ?? selectedPeriod}
              onSelectionChange={setUserSelectedPeriod}
            >
              <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                <NativeText style={{ color: theme.colors.primary, maxWidth: 100 }} numberOfLines={1}>
                  {userSelectedPeriod ?? selectedPeriod}
                </NativeText>
                <ChevronDown color={theme.colors.primary} size={24} />
              </View>
            </PapillonPicker>
          </Reanimated.View>

          {isLoading && !isRefreshing &&
            <Reanimated.View
              entering={FadeIn}
              exiting={FadeOut.duration(1000)}
              layout={LinearTransition}
              style={{ marginRight: 6 }}
            >
              <ActivityIndicator color={Platform.OS === "android" ? theme.colors.primary : void 0} />
            </Reanimated.View>
          }
        </Reanimated.View>
      </PapillonHeader>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => setIsRefreshing(true)}
            colors={Platform.OS === "android" ? [theme.colors.primary] : void 0}
          />
        }
      >
        <Suspense fallback={<ActivityIndicator />}>
          <View style={{ padding: 16, overflow: "visible", paddingTop: 0, paddingBottom: 16 + insets.bottom }}>
            {(!grades[selectedPeriod] || grades[selectedPeriod].length === 0) && !isLoading && !isRefreshing && (
              <MissingItem
                style={{ marginTop: 24, marginHorizontal: 16 }}
                emoji="📚"
                title="Aucune note disponible"
                description="La période sélectionnée ne contient aucune note."
              />
            )}

            {grades[selectedPeriod] && grades[selectedPeriod].length > 2 && (
              <Reanimated.View layout={animPapillon(LinearTransition)} entering={FadeInUp.duration(200)} exiting={FadeOut.duration(100)} key={account.instance + "graph"}>
                <GradesAverageGraph
                  grades={grades[selectedPeriod] ?? []}
                  overall={averages[selectedPeriod]?.overall.value}
                />
              </Reanimated.View>
            )}

            {latestGradesRef.current.length > 2 && (
              <GradesLatestList latestGrades={latestGradesRef.current} navigation={navigation} allGrades={grades[selectedPeriod] || []} />
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
    </>
  );
};

export default Grades;
