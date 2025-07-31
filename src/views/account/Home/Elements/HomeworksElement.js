var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { NativeItem, NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHomeworkStore } from "@/stores/homework";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import HomeworkItem from "../../Homeworks/Atoms/Item";
import { debounce } from "lodash";
import { PapillonNavigation } from "@/router/refs";
import RedirectButton from "@/components/Home/RedirectButton";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { FadeInDown, FadeOut } from "react-native-reanimated";
import MissingItem from "@/components/Global/MissingItem";
import PapillonLoading from "@/components/Global/PapillonLoading";
import { AccountService } from "@/stores/account/types";
var HomeworksElement = function (_a) {
    var _b, _c, _d, _e;
    var navigation = _a.navigation, onImportance = _a.onImportance;
    var account = useCurrentAccount(function (store) { return store.account; });
    var homeworks = useHomeworkStore(function (store) { return store.homeworks; });
    var _f = useState(false), loading = _f[0], setLoading = _f[1];
    var actualDay = useMemo(function () { return new Date(); }, []);
    var nextWeek = useMemo(function () { return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); }, []);
    var ImportanceHandler = function () {
        if (!homeworks[dateToEpochWeekNumber(actualDay)])
            return;
        var score = 0;
        var hw = homeworks[dateToEpochWeekNumber(actualDay)]
            .filter(function (hw) { return hw.due / 1000 >= Date.now() / 1000 && hw.due / 1000 <= Date.now() / 1000 + 7 * 24 * 60 * 60; })
            .filter(function (hw) { return !hw.done; });
        var date = new Date();
        if (date.getHours() >= 17 && date.getHours() < 22)
            score += 4;
        if (hw.length > 0)
            score += 3;
        onImportance(score);
    };
    var updateHomeworks = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!account.instance) return [3 /*break*/, 3];
                    setLoading(true);
                    return [4 /*yield*/, updateHomeworkForWeekInCache(account, actualDay)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, updateHomeworkForWeekInCache(account, nextWeek)];
                case 2:
                    _a.sent();
                    ImportanceHandler();
                    setLoading(false);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); }, [account, actualDay]);
    var debouncedUpdateHomeworks = useMemo(function () { return debounce(updateHomeworks, 500); }, [updateHomeworks]);
    useEffect(function () {
        debouncedUpdateHomeworks();
    }, [account.instance, actualDay]);
    var handleDonePress = useCallback(function (homework) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!homework.personalizate) return [3 /*break*/, 1];
                    useHomeworkStore
                        .getState()
                        .updateHomework(dateToEpochWeekNumber(new Date(homework.due)), homework.id, __assign(__assign({}, homework), { done: !homework.done }));
                    return [3 /*break*/, 3];
                case 1:
                    if (!(account.service !== AccountService.Skolengo)) return [3 /*break*/, 3];
                    return [4 /*yield*/, toggleHomeworkState(account, homework)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, updateHomeworks()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [account, updateHomeworks]);
    var mtn = new Date();
    mtn.setHours(0, 0, 0, 0);
    var startTime = mtn.getTime() / 1000;
    var endTime = startTime + 7 * 24 * 60 * 60 * 1000;
    var hwSemaineActuelle = (_c = (_b = homeworks[dateToEpochWeekNumber(actualDay)]) === null || _b === void 0 ? void 0 : _b.filter(function (hw) { return hw.due / 1000 >= startTime && hw.due / 1000 <= endTime; })) !== null && _c !== void 0 ? _c : [];
    var hwSemaineProchaine = (_e = (_d = homeworks[dateToEpochWeekNumber(actualDay) + 1]) === null || _d === void 0 ? void 0 : _d.filter(function (hw) { return hw.due / 1000 >= startTime && hw.due / 1000 <= endTime; })) !== null && _e !== void 0 ? _e : [];
    if (loading) {
        return (<>
        <>
          <NativeListHeader animated label="Travail à faire" trailing={(<RedirectButton navigation={PapillonNavigation.current} redirect="Homeworks"/>)}/>
          <NativeList animated key="loadingHomeworks" entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)} exiting={FadeOut.duration(300)}>
            <NativeItem animated style={{ paddingVertical: 10 }}>
              <PapillonLoading title="Chargement des devoirs"/>
            </NativeItem>
          </NativeList>
        </>
      </>);
    }
    if (hwSemaineActuelle.length === 0 && hwSemaineProchaine.length === 0) {
        return (<>
        <NativeListHeader animated label="Travail à faire" trailing={(<RedirectButton navigation={PapillonNavigation.current} redirect="Homeworks"/>)}/>
        <NativeList animated key="emptyHomeworks" entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)} exiting={FadeOut.duration(300)}>
          <NativeItem animated style={{ paddingVertical: 10 }}>
            <MissingItem emoji="📚" title="Aucun devoir" description="Tu n'as aucun devoir pour ces deux prochaines semaines."/>
          </NativeItem>
        </NativeList>
      </>);
    }
    var hw2Semaines = hwSemaineActuelle
        .concat(hwSemaineProchaine)
        .filter(function (element) { return !element.done; });
    return (<>
      <NativeListHeader animated label={hw2Semaines.length > 7
            ? "7 / ".concat(hw2Semaines.length, " Devoirs \u00E0 faire")
            : "Devoirs à faire"} trailing={(<RedirectButton navigation={PapillonNavigation.current} redirect="Homeworks"/>)}/>
      <NativeList>
        {hw2Semaines
            .slice(0, 7)
            .sort(function (a, b) { return a.due - b.due; })
            .map(function (hw, index) { return (<HomeworkItem homework={hw} key={index} index={index} navigation={navigation} total={hw2Semaines.length} onDonePressHandler={function () {
                try {
                    handleDonePress(hw);
                }
                catch (e) {
                    console.error(e);
                }
            }}/>); })}
      </NativeList>
    </>);
};
export default HomeworksElement;
