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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { NativeItem, NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { PapillonNavigation } from "@/router/refs";
import { updateGradesAndAveragesInCache, updateGradesPeriodsInCache } from "@/services/grades";
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";
import React, { useEffect, useState } from "react";
import GradeItem from "../../Grades/Subject/GradeItem";
import RedirectButton from "@/components/Home/RedirectButton";
import { FadeInDown, FadeOut } from "react-native-reanimated";
import MissingItem from "@/components/Global/MissingItem";
import PapillonLoading from "@/components/Global/PapillonLoading";
var GradesElement = function (_a) {
    var onImportance = _a.onImportance;
    var account = useCurrentAccount(function (store) { return store.account; });
    var defaultPeriod = useGradesStore(function (store) { return store.defaultPeriod; });
    var grades = useGradesStore(function (store) { return store.grades; });
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var ImportanceHandler = function () {
        if (grades && grades[defaultPeriod] && grades[defaultPeriod].length > 0) {
            var score = 0;
            var date = new Date();
            var lastGradeDate = new Date(grades[defaultPeriod][0].timestamp);
            var difference = Math.floor((Math.abs(date.getTime() - lastGradeDate.getTime())) / (1000 * 3600 * 24));
            score += 3 - difference;
            if (score < 0) {
                score = 0;
            }
            onImportance(score);
        }
        else {
            onImportance(0);
        }
    };
    useEffect(function () {
        void function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(account === null || account === void 0 ? void 0 : account.instance)) return [3 /*break*/, 4];
                            setLoading(true);
                            return [4 /*yield*/, updateGradesPeriodsInCache(account)];
                        case 1:
                            _a.sent();
                            if (!defaultPeriod) return [3 /*break*/, 3];
                            return [4 /*yield*/, updateGradesAndAveragesInCache(account, defaultPeriod)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            setLoading(false);
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }();
    }, [account === null || account === void 0 ? void 0 : account.instance]);
    var _c = useState([]), lastThreeGrades = _c[0], setLastThreeGrades = _c[1];
    useEffect(function () {
        if (grades && grades[defaultPeriod]) {
            var lastThree = __spreadArray([], grades[defaultPeriod], true).sort(function (a, b) { return b.timestamp - a.timestamp; })
                .slice(0, 3)
                .map(function (grade) { return ({
                subject: { average: { subjectName: grade.subjectName }, grades: [] },
                grade: grade
            }); });
            setLastThreeGrades(lastThree);
            ImportanceHandler();
        }
    }, [grades]);
    if (loading) {
        return (<>
        <NativeListHeader animated label="Notes" trailing={(<RedirectButton navigation={PapillonNavigation.current} redirect="Grades"/>)}/>
        <NativeList animated key="loadingGrades" entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)} exiting={FadeOut.duration(300)}>
          <NativeItem animated style={{ paddingVertical: 10 }}>
            <PapillonLoading title="Chargement des notes"/>
          </NativeItem>
        </NativeList>
      </>);
    }
    if (!grades || lastThreeGrades.length === 0) {
        return (<NativeList animated key="emptyGrades" entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)} exiting={FadeOut.duration(300)}>
        <NativeItem animated style={{ paddingVertical: 10 }}>
          <MissingItem style={{ marginHorizontal: 16 }} emoji="📊" title="Aucune note disponible" description={defaultPeriod
                ? "Tu n'as aucune note au ".concat(defaultPeriod.toLowerCase(), ".")
                : "Tu n'as aucune note pour cette période."}/>
        </NativeItem>
      </NativeList>);
    }
    return (<>
      <NativeListHeader label="Dernières Notes" trailing={(<RedirectButton navigation={PapillonNavigation.current} redirect="Grades"/>)}/>
      <NativeList animated>
        {lastThreeGrades.map(function (item, index) { return (<GradeItem key={index} subject={item.subject} grade={item.grade} navigation={PapillonNavigation.current} index={index} totalItems={lastThreeGrades.length} allGrades={grades[defaultPeriod] || []}/>); })}
      </NativeList>
    </>);
};
export default GradesElement;
