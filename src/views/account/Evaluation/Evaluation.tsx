import React, {Suspense, useEffect, useMemo, useRef, useState} from "react";
import {View, ScrollView, RefreshControl, Platform, ActivityIndicator} from "react-native";
import type { Screen } from "@/router/helpers/types";
import {useTheme} from "@react-navigation/native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {PapillonHeaderSelector, PapillonModernHeader} from "@/components/Global/PapillonModernHeader";
import {useCurrentAccount} from "@/stores/account";
import Reanimated, {FadeInUp, FadeOutDown} from "react-native-reanimated";
import {animPapillon} from "@/utils/ui/animations";
import {ChevronDown} from "lucide-react-native";
import PapillonPicker from "@/components/Global/PapillonPicker";
import {updateEvaluationPeriodsInCache, updateEvaluationsInCache} from "@/services/evaluation";
import {useEvaluationStore} from "@/stores/evaluation";
import {EvaluationsPerSubject} from "@/services/shared/Evaluation";
import MissingItem from "@/components/Global/MissingItem";
import Subject from "@/views/account/Evaluation/Subject/Subject";
import EvaluationsLatestList from "@/views/account/Evaluation/Latest/LatestEvaluations";
import {AccountService} from "@/stores/account/types";
import {hasFeatureAccountSetup} from "@/utils/multiservice";
import {MultiServiceFeature} from "@/stores/multiService/types";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";

const Evaluation: Screen<"Evaluation"> = ({ route, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isOnline } = useOnlineStatus();

  const outsideNav = route.params?.outsideNav;

  const account = useCurrentAccount((store) => store.account!);
  const hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.Evaluations, account.localID) : true;
  const defaultPeriod = useEvaluationStore((store) => store.defaultPeriod);
  const periods = useEvaluationStore((store) => store.periods);
  const evaluations = useEvaluationStore((store) => store.evaluations);

  const [userSelectedPeriod, setUserSelectedPeriod] = useState<string | null>(
    null
  );
  const selectedPeriod = useMemo(
    () => userSelectedPeriod ?? defaultPeriod,
    [userSelectedPeriod, defaultPeriod]
  );

  const [evaluationsPerSubject, setEvaluationsPerSubject] = useState<EvaluationsPerSubject[]>(
    []
  );

  const latestEvaluationsRef = useRef<any[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOnline && isLoading) {
      setIsLoading(false);
    }
  }, [isOnline, isLoading]);

  useEffect(() => {
    setTimeout(() => {
      if (!periods.map((period) => period.name).includes(selectedPeriod)) {
        setUserSelectedPeriod(defaultPeriod);
      }
    }, 0);
  }, [account.instance, defaultPeriod]);

  useEffect(() => {
    setTimeout(() => updateEvaluationPeriodsInCache(account), 1);
  }, [account?.instance]);

  async function updateData () {
    return updateEvaluationsInCache(account, selectedPeriod);
  }

  useEffect(() => {
    if (selectedPeriod === "") return;
    if (!account.instance) return;

    void (async () => {
      setIsLoading(true);
      await updateData();

      setTimeout(() => {
        setIsRefreshing(false);
        setIsLoading(false);
      }, 100);
    })();
  }, [selectedPeriod, account.instance, isRefreshing]);

  useEffect(() => {
    setTimeout(() => {
      if (selectedPeriod === "") return;

      const evaluationsPerSubject: EvaluationsPerSubject[] = [];

      for (const evaluation of evaluations[selectedPeriod] ?? []) {
        const subject = evaluationsPerSubject.find((s) => s.subjectName === evaluation.subjectName);

        if (subject) {
          subject.evaluations.push(evaluation);
        } else {
          evaluationsPerSubject.push({
            subjectName: evaluation.subjectName,
            evaluations: [evaluation],
          });
        }
      }

      setEvaluationsPerSubject(evaluationsPerSubject);
    }, 1);
  }, [selectedPeriod, evaluations]);

  useEffect(() => {
    setTimeout(() => {
      if (selectedPeriod === "") return;

      latestEvaluationsRef.current = (evaluations[selectedPeriod] || [])
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    }, 1);
  }, [selectedPeriod, evaluations]);

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
              {!isOnline && <OfflineWarning cache={true} />}

              {(!evaluations[selectedPeriod] || evaluations[selectedPeriod].length === 0) &&
                  !isLoading &&
                  !isRefreshing && hasServiceSetup && (
                <MissingItem
                  style={{ marginTop: 24, marginHorizontal: 16 }}
                  emoji="📚"
                  title="Aucune compétence disponible"
                  description="La période sélectionnée ne contient aucune compétence."
                />
              )}
              {!hasServiceSetup && (
                <MissingItem
                  title="Aucun service connecté"
                  description="Tu n'as pas encore paramétré de service pour cette fonctionnalité."
                  emoji="🤷"
                  style={{ marginTop: 24, marginHorizontal: 16 }}
                />
              )}

              {latestEvaluationsRef.current.length > 2 && (
                <EvaluationsLatestList
                  latestEvaluations={latestEvaluationsRef.current}
                  navigation={navigation}
                  allEvaluations={evaluations[selectedPeriod] || []}
                />
              )}

              {evaluationsPerSubject.length > 0 && (
                <Subject
                  navigation={navigation}
                  evaluationsPerSubject={evaluationsPerSubject}
                  allEvaluations={evaluations[selectedPeriod] || []}
                />
              )}
            </View>
          </Suspense>
        </ScrollView>
      )}
    </>
  );
};

export default Evaluation;
