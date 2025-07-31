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
export var useAttendanceStore = create()(persist(function (set) { return ({
    defaultPeriod: "",
    periods: [],
    attendances: {},
    updatePeriods: function (periods, defaultPeriodName) {
        set({
            defaultPeriod: defaultPeriodName,
            periods: periods,
        });
    },
    updateAttendance: function (periodName, attendance) {
        set(function (state) {
            var _a;
            return {
                attendances: __assign(__assign({}, state.attendances), (_a = {}, _a[periodName] = attendance, _a))
            };
        });
    },
}); }, {
    name: "<default>-attendance-storage", // <default> will be replace to user id when using "switchTo"
    storage: createJSONStorage(function () { return AsyncStorage; })
}));
