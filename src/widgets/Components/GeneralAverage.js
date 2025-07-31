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
import { PieChart } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { updateGradesAndAveragesInCache, updateGradesPeriodsInCache, } from "@/services/grades";
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";
import { getPronoteAverage } from "@/utils/grades/getAverages";
var GeneralAverageWidget = forwardRef(function (_a, ref) {
    var _b;
    var setLoading = _a.setLoading, setHidden = _a.setHidden;
    var theme = useTheme();
    var colors = theme.colors;
    var account = useCurrentAccount(function (store) { return store.account; });
    var grades = useGradesStore(function (store) { return store.grades; });
    var averages = useGradesStore(function (store) { return store.averages; });
    var defaultPeriod = useGradesStore(function (store) { return store.defaultPeriod; });
    useImperativeHandle(ref, function () { return ({
        handlePress: function () { return "Grades"; },
    }); });
    var average = useMemo(function () {
        var _a, _b;
        return !((_a = averages[defaultPeriod]) === null || _a === void 0 ? void 0 : _a.overall.disabled)
            ? (_b = averages[defaultPeriod]) === null || _b === void 0 ? void 0 : _b.overall.value
            : getPronoteAverage(grades[defaultPeriod]);
    }, [averages, grades, defaultPeriod]);
    useEffect(function () {
        void (function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(account === null || account === void 0 ? void 0 : account.instance))
                                return [2 /*return*/];
                            setLoading(true);
                            return [4 /*yield*/, updateGradesPeriodsInCache(account)];
                        case 1:
                            _a.sent();
                            setLoading(false);
                            return [2 /*return*/];
                    }
                });
            });
        })();
    }, [account === null || account === void 0 ? void 0 : account.instance]);
    useEffect(function () {
        void (function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(account === null || account === void 0 ? void 0 : account.instance) || !defaultPeriod)
                                return [2 /*return*/];
                            setLoading(true);
                            return [4 /*yield*/, updateGradesAndAveragesInCache(account, defaultPeriod)];
                        case 1:
                            _a.sent();
                            setLoading(false);
                            return [2 /*return*/];
                    }
                });
            });
        })();
    }, [defaultPeriod]);
    useEffect(function () {
        setHidden(typeof average !== "number" || average < 0 || average + "" === "NaN");
    }, [average]);
    if (isNaN(average !== null && average !== void 0 ? average : 0)) {
        setHidden(true);
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
          <PieChart size={20} color={colors.text}/>
          <Text style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
        }}>
            Notes
          </Text>
        </View>

        <Reanimated.View style={{
            alignItems: "flex-start",
            flexDirection: "column",
            width: "100%",
            marginTop: "auto",
            gap: 4,
        }} layout={LinearTransition}>
          <Reanimated.Text style={{
            color: colors.text + "50",
            fontFamily: "medium",
            fontSize: 16,
        }} layout={LinearTransition}>
            Moyenne générale
          </Reanimated.Text>

          <Reanimated.View style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 4,
        }}>
            <AnimatedNumber value={(_b = average === null || average === void 0 ? void 0 : average.toFixed(2)) !== null && _b !== void 0 ? _b : ""} style={{
            color: colors.text,
            fontSize: 24,
            lineHeight: 24,
            fontFamily: "semibold",
        }} contentContainerStyle={{
            paddingLeft: 6,
        }}/>
            <Text style={{
            color: colors.text + "50",
            fontFamily: "medium",
            fontSize: 16,
        }}>
              /20
            </Text>
          </Reanimated.View>
        </Reanimated.View>
      </>);
});
export default GeneralAverageWidget;
