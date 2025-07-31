var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, RefreshControl, Platform, ActivityIndicator } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PapillonHeaderSelector, PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { useCurrentAccount } from "@/stores/account";
import Reanimated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { ChevronDown } from "lucide-react-native";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { updateEvaluationPeriodsInCache, updateEvaluationsInCache } from "@/services/evaluation";
import { useEvaluationStore } from "@/stores/evaluation";
import MissingItem from "@/components/Global/MissingItem";
import Subject from "@/views/account/Evaluation/Subject/Subject";
import EvaluationsLatestList from "@/views/account/Evaluation/Latest/LatestEvaluations";
import { AccountService } from "@/stores/account/types";
import { hasFeatureAccountSetup } from "@/utils/multiservice";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
var Evaluation = function (_a) {
    var _b;
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var isOnline = useOnlineStatus().isOnline;
    var outsideNav = (_b = route.params) === null || _b === void 0 ? void 0 : _b.outsideNav;
    var account = useCurrentAccount(function (store) { return store.account; });
    var hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.Evaluations, account.localID) : true;
    var defaultPeriod = useEvaluationStore(function (store) { return store.defaultPeriod; });
    var periods = useEvaluationStore(function (store) { return store.periods; });
    var evaluations = useEvaluationStore(function (store) { return store.evaluations; });
    var _c = useState(null), userSelectedPeriod = _c[0], setUserSelectedPeriod = _c[1];
    var selectedPeriod = useMemo(function () { return userSelectedPeriod !== null && userSelectedPeriod !== void 0 ? userSelectedPeriod : defaultPeriod; }, [userSelectedPeriod, defaultPeriod]);
    var _d = useState([]), evaluationsPerSubject = _d[0], setEvaluationsPerSubject = _d[1];
    var latestEvaluationsRef = useRef([]);
    var _e = useState(false), isRefreshing = _e[0], setIsRefreshing = _e[1];
    var _f = useState(true), isLoading = _f[0], setIsLoading = _f[1];
    useEffect(function () {
        if (!isOnline && isLoading) {
            setIsLoading(false);
        }
    }, [isOnline, isLoading]);
    useEffect(function () {
        setTimeout(function () {
            if (!periods.map(function (period) { return period.name; }).includes(selectedPeriod)) {
                setUserSelectedPeriod(defaultPeriod);
            }
        }, 0);
    }, [account.instance, defaultPeriod]);
    useEffect(function () {
        setTimeout(function () { return updateEvaluationPeriodsInCache(account); }, 1);
    }, [account === null || account === void 0 ? void 0 : account.instance]);
    function updateData() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, updateEvaluationsInCache(account, selectedPeriod)];
            });
        });
    }
    useEffect(function () {
        if (selectedPeriod === "")
            return;
        if (!account.instance)
            return;
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        return [4 /*yield*/, updateData()];
                    case 1:
                        _a.sent();
                        setTimeout(function () {
                            setIsRefreshing(false);
                            setIsLoading(false);
                        }, 100);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [selectedPeriod, account.instance, isRefreshing]);
    useEffect(function () {
        setTimeout(function () {
            var _a;
            if (selectedPeriod === "")
                return;
            var evaluationsPerSubject = [];
            var _loop_1 = function (evaluation) {
                var subject = evaluationsPerSubject.find(function (s) { return s.subjectName === evaluation.subjectName; });
                if (subject) {
                    subject.evaluations.push(evaluation);
                }
                else {
                    evaluationsPerSubject.push({
                        subjectName: evaluation.subjectName,
                        evaluations: [evaluation],
                    });
                }
            };
            for (var _i = 0, _b = (_a = evaluations[selectedPeriod]) !== null && _a !== void 0 ? _a : []; _i < _b.length; _i++) {
                var evaluation = _b[_i];
                _loop_1(evaluation);
            }
            setEvaluationsPerSubject(evaluationsPerSubject);
        }, 1);
    }, [selectedPeriod, evaluations]);
    useEffect(function () {
        setTimeout(function () {
            if (selectedPeriod === "")
                return;
            latestEvaluationsRef.current = (evaluations[selectedPeriod] || [])
                .slice()
                .sort(function (a, b) { return b.timestamp - a.timestamp; })
                .slice(0, 10);
        }, 1);
    }, [selectedPeriod, evaluations]);
    return (<>
      <PapillonModernHeader outsideNav={outsideNav}>
        <PapillonPicker delay={0} data={periods.map(function (period) {
            return {
                label: period.name,
                subtitle: new Date(period.startTimestamp).toLocaleDateString("fr-FR", {
                    month: "long",
                    day: "numeric",
                }),
                onPress: function () { return setUserSelectedPeriod(period.name); },
                checked: period.name === selectedPeriod,
            };
        })} selected={userSelectedPeriod !== null && userSelectedPeriod !== void 0 ? userSelectedPeriod : selectedPeriod} onSelectionChange={setUserSelectedPeriod}>
          <PapillonHeaderSelector loading={isLoading}>
            <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
              <Reanimated.Text style={{
            color: theme.colors.text,
            maxWidth: 100,
            fontFamily: "medium",
            fontSize: 16,
        }} numberOfLines={1} key={"".concat(selectedPeriod, "sel")} entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutDown)}>
                {userSelectedPeriod !== null && userSelectedPeriod !== void 0 ? userSelectedPeriod : selectedPeriod}
              </Reanimated.Text>

              <ChevronDown color={theme.colors.text} size={22} strokeWidth={2.5} style={{ marginRight: -4 }}/>
            </View>
          </PapillonHeaderSelector>
        </PapillonPicker>
      </PapillonModernHeader>
      {!isLoading && (<ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={function () { return setIsRefreshing(true); }} colors={Platform.OS === "android" ? [theme.colors.primary] : void 0} progressViewOffset={outsideNav ? 72 : insets.top + 56}/>} contentContainerStyle={{
                paddingTop: outsideNav ? 64 : insets.top + 42,
            }} scrollIndicatorInsets={{ top: outsideNav ? 64 : insets.top + 16 }}>
          <Suspense fallback={<ActivityIndicator />}>
            <View style={{
                padding: 16,
                overflow: "visible",
                paddingTop: 0,
                paddingBottom: 16 + insets.bottom,
            }}>
              {!isOnline && <OfflineWarning cache={true}/>}

              {(!evaluations[selectedPeriod] || evaluations[selectedPeriod].length === 0) &&
                !isLoading &&
                !isRefreshing && hasServiceSetup && (<MissingItem style={{ marginTop: 24, marginHorizontal: 16 }} emoji="📚" title="Aucune compétence disponible" description="La période sélectionnée ne contient aucune compétence."/>)}
              {!hasServiceSetup && (<MissingItem title="Aucun service connecté" description="Tu n'as pas encore paramétré de service pour cette fonctionnalité." emoji="🤷" style={{ marginTop: 24, marginHorizontal: 16 }}/>)}

              {latestEvaluationsRef.current.length > 2 && (<EvaluationsLatestList latestEvaluations={latestEvaluationsRef.current} navigation={navigation} allEvaluations={evaluations[selectedPeriod] || []}/>)}

              {evaluationsPerSubject.length > 0 && (<Subject navigation={navigation} evaluationsPerSubject={evaluationsPerSubject} allEvaluations={evaluations[selectedPeriod] || []}/>)}
            </View>
          </Suspense>
        </ScrollView>)}
    </>);
};
export default Evaluation;
