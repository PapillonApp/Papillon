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
export var useClassSubjectStore = create()(persist(function (set) { return ({
    subjects: [],
    pushSubjects: function (newSubjects) {
        set(function (state) { return ({
            subjects: __spreadArray(__spreadArray([], state.subjects.filter(function (subject) { return !newSubjects.some(function (newSubject) { return newSubject.id === subject.id; }); }), true), newSubjects, true),
        }); });
    },
}); }, {
    name: "<default>-subjects-storage",
    storage: createJSONStorage(function () { return AsyncStorage; }),
}));
