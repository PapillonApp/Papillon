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
export var useFlagsStore = create()(persist(function (set, get) { return ({
    flags: [],
    set: function (flag) {
        set(function (state) { return ({
            // make sure we don't add the same flag twice
            flags: __spreadArray([], new Set(__spreadArray(__spreadArray([], state.flags, true), [flag], false)), true)
        }); });
    },
    remove: function (flag) {
        set(function (state) { return ({
            flags: state.flags.filter(function (f) { return f !== flag; })
        }); });
    },
    defined: function (flag) {
        return get().flags.includes(flag);
    }
}); }, {
    name: "flags-storage",
    storage: createJSONStorage(function () { return AsyncStorage; })
}));
