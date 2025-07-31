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
import React, { useState } from "react";
import { useEffect } from "react";
import { NativeItem, NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useAttendanceStore } from "@/stores/attendance";
import TotalMissed from "../../Attendance/Atoms/TotalMissed";
import { PressableScale } from "react-native-pressable-scale";
import RedirectButton from "@/components/Home/RedirectButton";
import { PapillonNavigation } from "@/router/refs";
import { FadeInDown, FadeOut } from "react-native-reanimated";
import MissingItem from "@/components/Global/MissingItem";
import { updateAttendanceInCache, updateAttendancePeriodsInCache } from "@/services/attendance";
import PapillonLoading from "@/components/Global/PapillonLoading";
var AttendanceElement = function (_a) {
    var onImportance = _a.onImportance;
    var account = useCurrentAccount(function (store) { return store.account; });
    var defaultPeriod = useAttendanceStore(function (store) { return store.defaultPeriod; });
    var attendances = useAttendanceStore(function (store) { return store.attendances; });
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var ImportanceHandler = function () {
        if (attendances && defaultPeriod) {
            var totalMissed_1 = formatTotalMissed(attendances[defaultPeriod]);
            if (totalMissed_1.total.hours > 0 || totalMissed_1.total.minutes > 0) {
                onImportance(3);
            }
            else {
                onImportance(0);
            }
        }
        else {
            onImportance(0);
        }
    };
    useEffect(function () {
        void (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(account === null || account === void 0 ? void 0 : account.instance)) return [3 /*break*/, 4];
                        setLoading(true);
                        return [4 /*yield*/, updateAttendancePeriodsInCache(account)];
                    case 1:
                        _a.sent();
                        if (!defaultPeriod) return [3 /*break*/, 3];
                        return [4 /*yield*/, updateAttendanceInCache(account, defaultPeriod)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        setLoading(false);
                        _a.label = 4;
                    case 4:
                        ImportanceHandler();
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [account === null || account === void 0 ? void 0 : account.instance]);
    var totalMissed = attendances && defaultPeriod ? attendances[defaultPeriod] : null;
    var formatTotalMissed = function (data) {
        if (!data) {
            return {
                total: { hours: 0, minutes: 0 },
                unJustified: { hours: 0, minutes: 0 }
            };
        }
        var totalHours = data.absences.reduce(function (sum, absence) {
            var _a = absence.hours.split("h").map(Number), hours = _a[0], minutes = _a[1];
            return sum + hours + (minutes || 0) / 60;
        }, 0) + data.delays.reduce(function (sum, delay) {
            var _a = [Math.floor(delay.duration / 60), delay.duration % 60], hours = _a[0], minutes = _a[1];
            return sum + hours + (minutes || 0) / 60;
        }, 0);
        ;
        var unJustifiedHours = data.absences.reduce(function (sum, absence) {
            if (!absence.justified) {
                var _a = absence.hours.split("h").map(Number), hours = _a[0], minutes = _a[1];
                return sum + hours + (minutes || 0) / 60;
            }
            return sum;
        }, 0) + data.delays.reduce(function (sum, delay) {
            if (!delay.justified) {
                var _a = [Math.floor(delay.duration / 60), delay.duration % 60], hours = _a[0], minutes = _a[1];
                return sum + hours + (minutes || 0) / 60;
            }
            return sum;
        }, 0);
        return {
            total: {
                hours: Math.floor(totalHours),
                minutes: Math.round((totalHours % 1) * 60),
            },
            unJustified: {
                hours: Math.floor(unJustifiedHours),
                minutes: Math.round((unJustifiedHours % 1) * 60),
            },
        };
    };
    if (loading) {
        return (<>
        <>
          <NativeListHeader animated label="Vie scolaire" trailing={(<RedirectButton navigation={PapillonNavigation.current} redirect="Attendance"/>)}/>
          <NativeList animated key="loadingAttendance" entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)} exiting={FadeOut.duration(300)}>
            <NativeItem animated style={{ paddingVertical: 10 }}>
              <PapillonLoading title="Chargement de la vie scolaire"/>
            </NativeItem>
          </NativeList>
        </>
      </>);
    }
    if (!totalMissed || totalMissed.absences.length === 0) {
        return (<>
        <NativeListHeader label={"Vie scolaire"} trailing={(<RedirectButton navigation={PapillonNavigation.current} redirect="Attendance"/>)}/>
        <NativeList animated key="emptyAttendance" entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)} exiting={FadeOut.duration(300)}>
          <NativeItem animated style={{ paddingVertical: 10 }}>
            <MissingItem title="Aucune absence" description={defaultPeriod
                ? "Tu n'as pas d'absences au ".concat(defaultPeriod, ".")
                : "Tu n'as pas d'absences pour cette période."} emoji="🎉"/>
          </NativeItem>
        </NativeList>
      </>);
    }
    return (<>
      <NativeListHeader label={"Vie scolaire"} trailing={(<RedirectButton navigation={PapillonNavigation.current} redirect="Attendance"/>)}/>
      <PressableScale onPress={function () { var _a; return (_a = PapillonNavigation.current) === null || _a === void 0 ? void 0 : _a.navigate("Attendance"); }}>
        {totalMissed && <TotalMissed totalMissed={formatTotalMissed(totalMissed)}/>}
      </PressableScale>
    </>);
};
export default AttendanceElement;
