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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { log } from "@/utils/logger/logger";
export var useHomeworkStore = create()(persist(function (set) { return ({
    homeworks: {},
    updateHomeworks: function (epochWeekNumber, homeworks) {
        log("updating homeworks for week ".concat(epochWeekNumber), "homework:updateHomeworks");
        set(function (state) {
            var _a;
            return {
                homeworks: __assign(__assign({}, state.homeworks), (_a = {}, _a[epochWeekNumber] = homeworks, _a))
            };
        });
        log("updated homeworks for week ".concat(epochWeekNumber), "homework:updateHomeworks");
    },
    addHomework: function (epochWeekNumber, homework) {
        set(function (state) {
            var _a;
            return ({
                homeworks: __assign(__assign({}, state.homeworks), (_a = {}, _a[epochWeekNumber] = __spreadArray(__spreadArray([], (state.homeworks[epochWeekNumber] || []), true), [
                    homework,
                ], false), _a)),
            });
        });
    },
    updateHomework: function (epochWeekNumber, homeworkID, updatedHomework) {
        set(function (state) {
            var _a;
            var _b;
            return ({
                homeworks: __assign(__assign({}, state.homeworks), (_a = {}, _a[epochWeekNumber] = (_b = state.homeworks[epochWeekNumber]) === null || _b === void 0 ? void 0 : _b.map(function (homework) {
                    return homework.id === homeworkID ? updatedHomework : homework;
                }), _a)),
            });
        });
    },
    removeHomework: function (epochWeekNumber, homeworkID) {
        set(function (state) {
            var _a;
            var _b;
            return ({
                homeworks: __assign(__assign({}, state.homeworks), (_a = {}, _a[epochWeekNumber] = (_b = state.homeworks[epochWeekNumber]) === null || _b === void 0 ? void 0 : _b.filter(function (homework) { return homework.id !== homeworkID; }), _a)),
            });
        });
    },
    existsHomework: function (epochWeekNumber, homeworkID) {
        var _a;
        var state = useHomeworkStore.getState();
        return (_a = state.homeworks[epochWeekNumber]) === null || _a === void 0 ? void 0 : _a.some(function (homework) { return homework.id === homeworkID; });
    },
}); }, {
    name: "<default>-homework-storage", // <default> will be replace to user id when using "switchTo"
    storage: createJSONStorage(function () { return AsyncStorage; })
}));
