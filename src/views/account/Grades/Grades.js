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
import MissingItem from "@/components/Global/MissingItem";
import { PapillonHeaderSelector, PapillonModernHeader, } from "@/components/Global/PapillonModernHeader";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { updateGradesAndAveragesInCache, updateGradesPeriodsInCache, } from "@/services/grades";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { useGradesStore } from "@/stores/grades";
import { animPapillon } from "@/utils/ui/animations";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { ChevronDown } from "lucide-react-native";
import React from "react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Platform, RefreshControl, ScrollView, View, } from "react-native";
import Reanimated, { FadeInUp, FadeOut, FadeOutDown, LinearTransition, } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GradesScodocUE from "./Atoms/GradesScodocUE";
import { hasFeatureAccountSetup } from "@/utils/multiservice";
import { MultiServiceFeature } from "@/stores/multiService/types";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
var GradesAverageGraph = lazy(function () { return import("./Graph/GradesAverage"); });
var GradesLatestList = lazy(function () { return import("./Latest/LatestGrades"); });
var Subject = lazy(function () { return import("./Subject/Subject"); });
var Grades = function (_a) {
    var _b, _c, _d, _e, _f, _g;
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var isOnline = useOnlineStatus().isOnline;
    var outsideNav = (_b = route.params) === null || _b === void 0 ? void 0 : _b.outsideNav;
    var account = useCurrentAccount(function (store) { return store.account; });
    var hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.Grades, account.localID) : true;
    var defaultPeriod = useGradesStore(function (store) { return store.defaultPeriod; });
    var periods = useGradesStore(function (store) { return store.periods; });
    var averages = useGradesStore(function (store) { return store.averages; });
    var grades = useGradesStore(function (store) { return store.grades; });
    var _h = useState(null), userSelectedPeriod = _h[0], setUserSelectedPeriod = _h[1];
    var selectedPeriod = useMemo(function () { return userSelectedPeriod !== null && userSelectedPeriod !== void 0 ? userSelectedPeriod : defaultPeriod; }, [userSelectedPeriod, defaultPeriod]);
    var _j = useState([]), gradesPerSubject = _j[0], setGradesPerSubject = _j[1];
    var _k = useState([]), latestGradesData = _k[0], setLatestGradesData = _k[1];
    var _l = useState(false), isRefreshing = _l[0], setIsRefreshing = _l[1];
    var _m = useState(true), isLoading = _m[0], setIsLoading = _m[1];
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
        setTimeout(function () { return updateGradesPeriodsInCache(account); }, 1);
    }, [account === null || account === void 0 ? void 0 : account.instance]);
    function updateData() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, updateGradesAndAveragesInCache(account, selectedPeriod)];
            });
        });
    }
    useEffect(function () {
        if (selectedPeriod === "")
            return;
        if (!account.instance)
            return;
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        setIsLoading(true);
                        return [4 /*yield*/, updateData()];
                    case 1:
                        _b.sent();
                        if (isRefreshing && ((_a = account.identityProvider) === null || _a === void 0 ? void 0 : _a.identifier)) {
                            navigation.navigate("BackgroundIdentityProvider");
                        }
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
            if (selectedPeriod === "")
                return;
            var gradesPerSubject = [];
            var _loop_1 = function (average) {
                var newGrades = (grades[selectedPeriod] || [])
                    .filter(function (grade) { return account.service === AccountService.Pronote ? grade.subjectId === average.id : grade.subjectName === average.subjectName; })
                    .sort(function (a, b) { return b.timestamp - a.timestamp; });
                gradesPerSubject.push({
                    average: average,
                    grades: newGrades,
                });
            };
            for (var _i = 0, _a = (averages[selectedPeriod] || { subjects: [] }).subjects; _i < _a.length; _i++) {
                var average = _a[_i];
                _loop_1(average);
            }
            if (account.service !== AccountService.EcoleDirecte) {
                gradesPerSubject.sort(function (a, b) {
                    return a.average.subjectName.localeCompare(b.average.subjectName);
                });
            }
            setGradesPerSubject(gradesPerSubject);
        }, 1);
    }, [selectedPeriod, averages, grades]);
    useEffect(function () {
        if (selectedPeriod === "")
            return;
        var latestGrades = (grades[selectedPeriod] || [])
            .slice()
            .sort(function (a, b) { return b.timestamp - a.timestamp; })
            .slice(0, 10);
        setLatestGradesData(latestGrades);
    }, [selectedPeriod, grades]);
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


      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={function () { return setIsRefreshing(true); }} colors={Platform.OS === "android" ? [theme.colors.primary] : void 0} progressViewOffset={outsideNav ? 72 : insets.top + 56}/>} contentContainerStyle={{
            paddingTop: outsideNav ? 64 : insets.top + 42,
        }} scrollIndicatorInsets={{ top: outsideNav ? 64 : insets.top + 16 }}>
        <Suspense fallback={<View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 24,
            }}>
            <PapillonSpinner size={42} color={theme.colors.primary}/>
          </View>}>
          {!isLoading && (<View style={{
                padding: 16,
                overflow: "visible",
                paddingTop: 0,
                paddingBottom: 16 + insets.bottom,
            }}>
              {!isOnline && <OfflineWarning cache={true}/>}

              {(!grades[selectedPeriod] || grades[selectedPeriod].length === 0) &&
                !isRefreshing && hasServiceSetup && (<MissingItem style={{ marginTop: 24, marginHorizontal: 16 }} emoji="📚" title={"Aucune note pour le ".concat(selectedPeriod.toLowerCase())} description={"La période ne contient pas de notes pour le moment."}/>)}

              {!hasServiceSetup && (<MissingItem title="Aucun service connecté" description="Tu n'as pas encore paramétré de service pour cette fonctionnalité." emoji="🤷" style={{ marginTop: 24, marginHorizontal: 16 }}/>)}

              {grades[selectedPeriod] &&
                grades[selectedPeriod].filter(function (grade) { return grade.student.value !== null && !isNaN(grade.student.value); }).length > 1 && (<Reanimated.View layout={animPapillon(LinearTransition)} entering={FadeInUp.duration(200)} exiting={FadeOut.duration(100)} key={account.instance + "graph"}>
                  <GradesAverageGraph grades={(_c = grades[selectedPeriod]) !== null && _c !== void 0 ? _c : []} overall={(((_d = averages[selectedPeriod]) === null || _d === void 0 ? void 0 : _d.overall) && !((_e = averages[selectedPeriod]) === null || _e === void 0 ? void 0 : _e.overall.disabled)) ? (_f = averages[selectedPeriod]) === null || _f === void 0 ? void 0 : _f.overall.value : null} classOverall={(_g = averages[selectedPeriod]) === null || _g === void 0 ? void 0 : _g.classOverall.value}/>
                </Reanimated.View>)}

              {latestGradesData.length > 2 && (<GradesLatestList latestGrades={latestGradesData} navigation={navigation} allGrades={grades[selectedPeriod] || []}/>)}

              {gradesPerSubject.length > 0 && "providers" in account && account.providers && account.providers.includes("scodoc") && (<GradesScodocUE account={account} navigation={navigation} selectedPeriod={selectedPeriod}/>)}

              {gradesPerSubject.length > 0 && (<Subject navigation={navigation} gradesPerSubject={gradesPerSubject} allGrades={grades[selectedPeriod] || []} currentPeriod={selectedPeriod}/>)}
            </View>)}
        </Suspense>
      </ScrollView>
    </>);
};
export default Grades;
