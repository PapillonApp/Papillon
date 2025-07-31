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
import { log } from "@/utils/logger/logger";
export var useTimetableStore = create()(persist(function (set) { return ({
    timetables: {},
    updateClasses: function (weekNumber, classes) {
        log("updating classes for week ".concat(weekNumber), "timetable:updateClasses");
        set(function (state) {
            var _a;
            return {
                timetables: __assign(__assign({}, state.timetables), (_a = {}, _a[weekNumber] = classes, _a))
            };
        });
        log("[timetable:updateClasses]: updated classes for week ".concat(weekNumber), "timetable:updateClasses");
    },
    injectClasses: function (data) {
        log("replacing classes", "timetable:replaceClasses");
        set(function (state) {
            return {
                timetables: data,
            };
        });
        log("[timetable:replaceClasses]: replaced classes for week ".concat(data.weekNumber), "timetable:replaceClasses");
    },
    removeClasses: function (weekNumber) {
        log("removing classes for week ".concat(weekNumber), "timetable:removeClasses");
        set(function (state) {
            var timetables = __assign({}, state.timetables);
            delete timetables[weekNumber];
            return {
                timetables: timetables
            };
        });
        log("[timetable:removeClasses]: removed classes for week ".concat(weekNumber), "timetable:removeClasses");
    },
    removeClassesFromSource: function (source) {
        log("removing classes from source ".concat(source), "timetable:removeClassesFromSource");
        set(function (state) {
            var timetables = __assign({}, state.timetables);
            for (var weekNumber in timetables) {
                timetables[weekNumber] = timetables[weekNumber].filter(function (c) { return c.source !== source; });
            }
            return {
                timetables: timetables
            };
        });
        log("[timetable:removeClassesFromSource]: removed classes from source ".concat(source), "timetable:removeClassesFromSource");
    }
}); }, {
    name: "<default>-timetable-storage", // <default> will be replace to user id when using "switchTo"
    storage: createJSONStorage(function () { return AsyncStorage; })
}));
