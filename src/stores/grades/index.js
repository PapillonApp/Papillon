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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
export var useGradesStore = create()(persist(function (set) { return ({
    defaultPeriod: "",
    periods: [],
    lastUpdated: 0,
    averages: {},
    grades: {},
    reels: {},
    updatePeriods: function (periods, defaultPeriodName) {
        set({
            defaultPeriod: defaultPeriodName,
            periods: periods,
        });
    },
    updateGradesAndAverages: function (periodName, grades, averages) {
        set(function (state) {
            var _a, _b;
            return {
                lastUpdated: Date.now(),
                grades: __assign(__assign({}, state.grades), (_a = {}, _a[periodName] = grades, _a)),
                averages: __assign(__assign({}, state.averages), (_b = {}, _b[periodName] = averages, _b))
            };
        });
    },
}); }, {
    name: "<default>-grades-storage", // <default> will be replace to user id when using "switchTo"
    storage: createJSONStorage(function () { return AsyncStorage; })
}));
