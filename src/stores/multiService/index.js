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
/**
 * Store for the MultiService settings & states.
 * Persisted, as we want to keep the virtual spaces between app restarts.
 */
export var useMultiService = create()(persist(function (set, get) { return ({
    // When opening the app for the first time, it's null.
    enabled: undefined,
    spaces: [],
    // When creating, we don't want the "instance" to be stored.
    create: function (space, linkAccount) {
        log("creating a virtual MultiService space with account id ".concat(linkAccount.localID, " (").concat(space.name, ")"), "multiService:create");
        set(function (state) { return ({
            spaces: __spreadArray(__spreadArray([], state.spaces, true), [space], false)
        }); });
        log("stored ".concat(space.name, ", with account ").concat(linkAccount.localID), "multiService:create");
    },
    remove: function (localID) {
        log("removing virtual MultiService space ".concat(localID), "multiService:remove");
        set(function (state) { return ({
            spaces: state.spaces.filter(function (space) { return space.accountLocalID !== localID; })
        }); });
        log("removed ".concat(localID), "multiService:remove");
    },
    toggleEnabledState: function () {
        set(function (state) { return ({
            enabled: !state.enabled
        }); });
    },
    /**
     * Mutates a given property for a given space
     * and return the updated space.
     */
    update: function (localID, key, value) {
        var _a;
        // Find the account to update in the storage.
        var space = get().spaces.find(function (space) { return space.accountLocalID === localID; });
        if (!space)
            return null;
        var spaceMutated;
        // Mutate only image and name properties.
        if (["name", "image", "featuresServices"].includes(key)) {
            spaceMutated = __assign(__assign({}, space), (_a = {}, _a[key] = value, _a));
            // Save the update in the store and storage.
            set(function (state) { return ({
                spaces: state.spaces.map(function (space) {
                    return space.accountLocalID === localID
                        ? spaceMutated
                        : space;
                })
            }); });
        }
    },
    setFeatureAccount: function (spaceLocalID, feature, account) {
        var space = get().spaces.find(function (space) { return space.accountLocalID === spaceLocalID; });
        if (!space)
            return;
        var mutatedFeatureServices = space.featuresServices;
        mutatedFeatureServices[feature] = account === null || account === void 0 ? void 0 : account.localID;
        var spaceMutated = __assign(__assign({}, space), { featuresServices: mutatedFeatureServices });
        // Save the update in the store and storage.
        set(function (state) { return ({
            spaces: state.spaces.map(function (space) {
                return space.accountLocalID === spaceLocalID
                    ? spaceMutated
                    : space;
            })
        }); });
    },
    getFeatureAccountId: function (feature, spaceLocalID) {
        // Find the account associated to the feature
        var space = get().spaces.find(function (space) { return space.accountLocalID === spaceLocalID; });
        if (!space)
            return undefined;
        return space.featuresServices[feature];
    },
}); }, {
    name: "multiservice-storage",
    storage: createJSONStorage(function () { return AsyncStorage; })
}));
