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
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, View } from "react-native";
import { useCurrentAccount } from "@/stores/account";
import { useAttendanceStore } from "@/stores/attendance";
import { updateAttendanceInCache, updateAttendancePeriodsInCache } from "@/services/attendance";
import { NativeText } from "@/components/Global/NativeComponents";
import Reanimated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import PapillonPicker from "@/components/Global/PapillonPicker";
import { ChevronDown, Eye, Scale, Timer, UserX } from "lucide-react-native";
import PapillonHeader, { PapillonHeaderInsetHeight } from "@/components/Global/PapillonHeader";
import { animPapillon } from "@/utils/ui/animations";
import AttendanceItem from "./Atoms/AttendanceItem";
import { getAbsenceTime } from "@/utils/format/attendance_time";
import TotalMissed from "./Atoms/TotalMissed";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { protectScreenComponent } from "@/router/helpers/protected-screen";
import MissingItem from "@/components/Global/MissingItem";
import { hasFeatureAccountSetup } from "@/utils/multiservice";
import { MultiServiceFeature } from "@/stores/multiService/types";
import { AccountService } from "@/stores/account/types";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
var Attendance = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var account = useCurrentAccount(function (store) { return store.account; });
    var isOnline = useOnlineStatus().isOnline;
    var hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.Attendance, account.localID) : true;
    var defaultPeriod = useAttendanceStore(function (store) { return store.defaultPeriod; });
    var periods = useAttendanceStore(function (store) { return store.periods; });
    var attendances = useAttendanceStore(function (store) { return store.attendances; });
    var _b = useState(false), isRefreshing = _b[0], setIsRefreshing = _b[1];
    var _c = useState(hasServiceSetup), isLoading = _c[0], setLoading = _c[1];
    useEffect(function () {
        if (!isOnline && isLoading) {
            setLoading(false);
        }
    }, [isOnline, isLoading]);
    var _d = useState(null), userSelectedPeriod = _d[0], setUserSelectedPeriod = _d[1];
    var selectedPeriod = useMemo(function () { return userSelectedPeriod !== null && userSelectedPeriod !== void 0 ? userSelectedPeriod : defaultPeriod; }, [userSelectedPeriod, defaultPeriod]);
    useEffect(function () {
        updateAttendancePeriodsInCache(account);
    }, [navigation, account.instance]);
    useEffect(function () {
        setIsRefreshing(false);
    }, [attendances]);
    useEffect(function () {
        void function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!selectedPeriod)
                                return [2 /*return*/];
                            setLoading(true);
                            return [4 /*yield*/, updateAttendanceInCache(account, selectedPeriod)];
                        case 1:
                            _a.sent();
                            setLoading(false);
                            return [2 /*return*/];
                    }
                });
            });
        }();
    }, [selectedPeriod]);
    var attendances_observations_details = useMemo(function () {
        if (!attendances[selectedPeriod])
            return {};
        return attendances[selectedPeriod].observations.reduce(function (acc, observation) {
            if (observation.sectionName in acc) {
                acc[observation.sectionName].push(observation);
            }
            else {
                acc[observation.sectionName] = [observation];
            }
            return acc;
        }, {});
    }, [attendances, selectedPeriod]);
    var _e = useState({
        total: {
            hours: 0,
            minutes: 0
        },
        unJustified: {
            hours: 0,
            minutes: 0
        },
        absence: {
            hours: 0,
            minutes: 0
        },
        delay: {
            hours: 0,
            minutes: 0
        }
    }), totalMissed = _e[0], setTotalMissed = _e[1];
    useEffect(function () {
        var _a, _b;
        var totalHours = 0;
        var totalMinutes = 0;
        var totalUnJustifiedHours = 0;
        var totalUnJustifiedMinutes = 0;
        var totalAbsenceHours = 0;
        var totalAbsenceMinutes = 0;
        var totalDelayHours = 0;
        var totalDelayMinutes = 0;
        (_a = attendances[selectedPeriod]) === null || _a === void 0 ? void 0 : _a.absences.forEach(function (absence) {
            var missed = getAbsenceTime(absence.fromTimestamp, absence.toTimestamp);
            if (!absence.justified) {
                totalUnJustifiedHours += parseInt(absence.hours.split("h")[0]);
                totalUnJustifiedMinutes += parseInt(absence.hours.split("h")[1]);
            }
            totalHours += parseInt(absence.hours.split("h")[0]);
            totalMinutes += parseInt(absence.hours.split("h")[1]);
            totalAbsenceHours += parseInt(absence.hours.split("h")[0]);
            totalAbsenceMinutes += parseInt(absence.hours.split("h")[1]);
        });
        (_b = attendances[selectedPeriod]) === null || _b === void 0 ? void 0 : _b.delays.forEach(function (delay) {
            var origMins = delay.duration;
            var missed = {
                hours: Math.floor(origMins / 60),
                minutes: origMins % 60
            };
            if (!delay.justified) {
                totalUnJustifiedHours += missed.hours;
                totalUnJustifiedMinutes += missed.minutes;
            }
            totalHours += missed.hours;
            totalMinutes += missed.minutes;
            totalDelayHours += missed.hours;
            totalDelayMinutes += missed.minutes;
        });
        if (totalMinutes >= 60) {
            totalHours += Math.floor(totalMinutes / 60);
            totalMinutes = totalMinutes % 60;
        }
        if (totalUnJustifiedMinutes >= 60) {
            totalUnJustifiedHours += Math.floor(totalUnJustifiedMinutes / 60);
            totalUnJustifiedMinutes = totalUnJustifiedMinutes % 60;
        }
        if (totalAbsenceMinutes >= 60) {
            totalAbsenceHours += Math.floor(totalAbsenceMinutes / 60);
            totalAbsenceMinutes = totalAbsenceMinutes % 60;
        }
        if (totalDelayMinutes >= 60) {
            totalDelayHours += Math.floor(totalDelayMinutes / 60);
            totalDelayMinutes = totalDelayMinutes % 60;
        }
        setTotalMissed({
            total: {
                hours: totalHours,
                minutes: totalMinutes
            },
            unJustified: {
                hours: totalUnJustifiedHours,
                minutes: totalUnJustifiedMinutes
            },
            absence: {
                hours: totalAbsenceHours,
                minutes: totalAbsenceMinutes
            },
            delay: {
                hours: totalDelayHours,
                minutes: totalDelayMinutes
            }
        });
    }, [attendances, selectedPeriod]);
    return (<>
      <PapillonHeader route={route} navigation={navigation}>
        <Reanimated.View layout={LinearTransition} style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
        }}>
          <Reanimated.View layout={LinearTransition}>
            <PapillonPicker delay={0} data={periods.map(function (period) { return period.name; })} selected={userSelectedPeriod !== null && userSelectedPeriod !== void 0 ? userSelectedPeriod : selectedPeriod} onSelectionChange={setUserSelectedPeriod} direction="right">
              <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                <NativeText style={{ color: theme.colors.primary, maxWidth: 100 }} numberOfLines={1}>
                  {userSelectedPeriod !== null && userSelectedPeriod !== void 0 ? userSelectedPeriod : selectedPeriod}
                </NativeText>
                <ChevronDown color={theme.colors.primary} size={24}/>
              </View>
            </PapillonPicker>
          </Reanimated.View>

          {isLoading && !isRefreshing &&
            <Reanimated.View entering={FadeIn} exiting={FadeOut.duration(1000)} layout={LinearTransition} style={{ marginRight: 6 }}>
              <ActivityIndicator color={Platform.OS === "android" ? theme.colors.primary : void 0}/>
            </Reanimated.View>}
        </Reanimated.View>
      </PapillonHeader>

      <Reanimated.ScrollView layout={animPapillon(LinearTransition)} style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            padding: 16,
            paddingTop: 0,
        }} refreshControl={<RefreshControl refreshing={isRefreshing} progressViewOffset={70} onRefresh={function () {
                var _a;
                setIsRefreshing(true);
                if ((_a = account.identityProvider) === null || _a === void 0 ? void 0 : _a.identifier) {
                    navigation.navigate("BackgroundIdentityProvider");
                    updateAttendanceInCache(account, selectedPeriod).then(function () { return setIsRefreshing(false); });
                }
                else {
                    updateAttendanceInCache(account, selectedPeriod).then(function () { return setIsRefreshing(false); });
                }
            }}/>}>
        <PapillonHeaderInsetHeight route={route}/>

        {!isOnline && <OfflineWarning cache={true}/>}

        {hasServiceSetup && attendances[selectedPeriod] && attendances[selectedPeriod].absences.length === 0 && attendances[selectedPeriod].delays.length === 0 && attendances[selectedPeriod].punishments.length === 0 && Object.keys(attendances_observations_details).length === 0 && (<MissingItem title="Aucune absence" description="Tu n'as pas d'absences ni de retards pour cette période." emoji="🎉" style={{ marginTop: 16 }}/>)}

        {!hasServiceSetup && (<MissingItem title="Aucun service connecté" description="Tu n'as pas encore paramétré de service pour cette fonctionnalité." emoji="🤷" style={{ marginTop: 16 }}/>)}

        {(totalMissed.total.hours > 0 || totalMissed.total.minutes > 0) && (<TotalMissed totalMissed={totalMissed}/>)}

        {attendances[selectedPeriod] && attendances[selectedPeriod].absences.length > 0 && (<AttendanceItem title="Absences" icon={<UserX />} attendances={attendances[selectedPeriod].absences} missed={totalMissed.absence}/>)}

        {attendances[selectedPeriod] && attendances[selectedPeriod].delays.length > 0 && (<AttendanceItem title="Retards" icon={<Timer />} attendances={attendances[selectedPeriod].delays} missed={totalMissed.delay}/>)}

        {Object.keys(attendances_observations_details).map(function (sectionName) { return (<AttendanceItem key={sectionName} title={sectionName} icon={<Eye />} attendances={attendances_observations_details[sectionName]}/>); })}

        {attendances[selectedPeriod] && attendances[selectedPeriod].punishments.length > 0 && (<AttendanceItem title="Punitions" icon={<Scale />} attendances={attendances[selectedPeriod].punishments}/>)}

        <InsetsBottomView />
      </Reanimated.ScrollView>
    </>);
};
export default protectScreenComponent(Attendance);
