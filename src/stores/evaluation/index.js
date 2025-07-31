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
export var useEvaluationStore = create()(persist(function (set) { return ({
    defaultPeriod: "",
    periods: [],
    lastUpdated: 0,
    evaluations: {},
    updatePeriods: function (periods, defaultPeriodName) {
        set({
            defaultPeriod: defaultPeriodName,
            periods: periods,
        });
    },
    updateEvaluations: function (periodName, evaluation) {
        set(function (state) {
            var _a;
            return {
                lastUpdated: Date.now(),
                evaluations: __assign(__assign({}, state.evaluations), (_a = {}, _a[periodName] = evaluation, _a)),
            };
        });
    }
}); }, {
    name: "<default>-evaluations-storage", // <default> will be replace to user id when using "switchTo"
    storage: createJSONStorage(function () { return AsyncStorage; })
}));
