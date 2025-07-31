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
import { TrendingUp } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { NativeText } from "@/components/Global/NativeComponents";
import { updateGradesAndAveragesInCache } from "@/services/grades";
import { getSubjectData } from "@/services/shared/Subject";
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";
var LastGradeWidget = forwardRef(function (_a, ref) {
    var _b, _c, _d, _e;
    var setLoading = _a.setLoading, setHidden = _a.setHidden, loading = _a.loading;
    var theme = useTheme();
    var colors = theme.colors;
    var account = useCurrentAccount(function (store) { return store.account; });
    var grades = useGradesStore(function (store) { return store.grades; });
    var defaultPeriod = useGradesStore(function (store) { return store.defaultPeriod; });
    var lastPeriod = defaultPeriod;
    // find last period with grades
    if (!grades[lastPeriod] || grades[lastPeriod] && grades[lastPeriod].length === 0) {
        var periods = Object.keys(grades);
        for (var i = periods.length - 1; i >= 0; i--) {
            if (grades[periods[i]].length > 0) {
                lastPeriod = periods[i];
                break;
            }
        }
    }
    useImperativeHandle(ref, function () { return ({
        handlePress: function () { return "Grades"; }
    }); });
    var lastGrade = useMemo(function () {
        if (!grades || !defaultPeriod || !grades[defaultPeriod])
            return null;
        var periodGrades = grades[lastPeriod];
        return periodGrades.length > 0 ? periodGrades[periodGrades.length - 1] : null;
    }, [grades, defaultPeriod]);
    var gradeValue = (_c = (_b = lastGrade === null || lastGrade === void 0 ? void 0 : lastGrade.student) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : null;
    var maxGradeValue = (_e = (_d = lastGrade === null || lastGrade === void 0 ? void 0 : lastGrade.outOf) === null || _d === void 0 ? void 0 : _d.value) !== null && _e !== void 0 ? _e : 20;
    var subjectData = getSubjectData((lastGrade === null || lastGrade === void 0 ? void 0 : lastGrade.subjectName) || "");
    var subjectEmoji = subjectData.emoji;
    var subjectColor = subjectData.color;
    useEffect(function () {
        var fetchGrades = function () { return __awaiter(void 0, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(account === null || account === void 0 ? void 0 : account.instance) || !defaultPeriod)
                            return [2 /*return*/];
                        setLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, updateGradesAndAveragesInCache(account, defaultPeriod)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Erreur lors de la mise à jour des notes :", error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchGrades();
    }, [account, defaultPeriod, setLoading]);
    var descriptionText = getSubjectData((lastGrade === null || lastGrade === void 0 ? void 0 : lastGrade.subjectName) || "").pretty;
    useEffect(function () {
        var shouldHide = !lastGrade || typeof gradeValue !== "number" || gradeValue < 0;
        setHidden(shouldHide);
    }, [lastGrade, gradeValue, setHidden]);
    if (!lastGrade) {
        return null;
    }
    return (<>
      <View style={{
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            gap: 7,
            opacity: 0.5,
        }}>
        <TrendingUp size={20} color={colors.text}/>
        <Text style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
        }}>
          Dernière note
        </Text>
      </View>

      <Reanimated.View style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            marginTop: "auto",
            gap: 10,
        }} layout={LinearTransition}>
        <View style={{
            backgroundColor: subjectColor + "22",
            borderRadius: 50,
            padding: 6,
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
        }}>
          <Text style={{ fontSize: 18 }}>{subjectEmoji}</Text>
        </View>

        <NativeText variant="title" style={{
            width: "70%",
        }} numberOfLines={2}>
          {descriptionText}
        </NativeText>
      </Reanimated.View>

      <Reanimated.View style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            marginTop: 10,
            gap: 4,
        }}>
        {gradeValue !== null && (<>
            <AnimatedNumber value={gradeValue.toFixed(2)} style={{
                fontSize: 24.5,
                lineHeight: 24,
                fontFamily: "semibold",
                color: colors.text,
            }} contentContainerStyle={{
                paddingLeft: 6,
            }}/>
            <Text style={{
                color: colors.text + "50",
                fontFamily: "semibold",
                fontSize: 15,
            }}>
              /{maxGradeValue}
            </Text>
          </>)}
      </Reanimated.View>
    </>);
});
export default LastGradeWidget;
