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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
import pronote from "pawnote";
import { AccountService, } from "@/stores/account/types";
import { reload } from "@/services/reload-account";
import { useTimetableStore } from "../timetable";
import { useHomeworkStore } from "../homework";
import { useGradesStore } from "../grades";
import { useNewsStore } from "../news";
import { useAttendanceStore } from "../attendance";
import { error, info, log } from "@/utils/logger/logger";
import { useMultiService } from "@/stores/multiService";
var STORES_TO_REHYDRATE = [
    [useTimetableStore, "timetable"],
    [useHomeworkStore, "homework"],
    [useGradesStore, "grades"],
    [useNewsStore, "news"],
    [useAttendanceStore, "attendance"],
];
export var useCurrentAccount = create()(function (set, get) { return ({
    account: null,
    linkedAccounts: [],
    associatedAccounts: [],
    mutateProperty: function (key, value, forceMutation) {
        if (forceMutation === void 0) { forceMutation = false; }
        log("mutate property ".concat(key, " in storage"), "current:update");
        var currentAccount = get().account;
        if (!currentAccount)
            return;
        if (currentAccount.service === AccountService.PapillonMultiService &&
            key === "personalization" &&
            !forceMutation) {
            var val = value;
            delete val.profilePictureB64;
        }
        if (key === "instance") {
            set({
                account: __assign(__assign({}, currentAccount), { 
                    // @ts-expect-error
                    instance: value }),
            });
            return;
        }
        var localID = currentAccount.localID;
        var account = useAccounts.getState().update(localID, key, value);
        set({
            account: __assign(__assign({}, account), { 
                // @ts-expect-error
                instance: currentAccount.instance }),
        });
        log("done mutating property ".concat(key, " in storage"), "[current:update]");
    },
    switchTo: function (account) { return __awaiter(void 0, void 0, void 0, function () {
        var rehydrationPromises, accounts, currentGet, _a, instance, authentication, linkedAccounts, associatedAccounts, reloadPromises;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    log("reading ".concat(account.name), "switchTo");
                    set({ account: account });
                    useAccounts.setState({ lastOpenedAccountID: account.localID });
                    rehydrationPromises = STORES_TO_REHYDRATE.map(function (_a) {
                        var store = _a[0], storageName = _a[1];
                        store.persist.setOptions({
                            name: "".concat(account.localID, "-").concat(storageName, "-storage"),
                        });
                        info("rehydrating ".concat(storageName), "switchTo");
                        return store.persist.rehydrate();
                    });
                    return [4 /*yield*/, Promise.all(rehydrationPromises)];
                case 1:
                    _b.sent();
                    accounts = useAccounts.getState().accounts;
                    currentGet = get();
                    if (!(account.service === AccountService.PapillonMultiService)) return [3 /*break*/, 2];
                    log("switching to virtual space...", "[switchTo]");
                    return [3 /*break*/, 4];
                case 2:
                    if (!(typeof account.instance === "undefined")) return [3 /*break*/, 4];
                    log("instance undefined, reloading...", "switchTo");
                    return [4 /*yield*/, reload(account)];
                case 3:
                    _a = _b.sent(), instance = _a.instance, authentication = _a.authentication;
                    currentGet.mutateProperty("authentication", authentication);
                    currentGet.mutateProperty("instance", instance);
                    log("instance reload done!", "switchTo");
                    _b.label = 4;
                case 4:
                    linkedAccounts = account.linkedExternalLocalIDs
                        .map(function (linkedID) { return accounts.find(function (acc) { return acc.localID === linkedID; }); })
                        .filter(Boolean);
                    associatedAccounts = (account.associatedAccountsLocalIDs || [])
                        .map(function (associatedID) {
                        return accounts.find(function (acc) { return acc.localID === associatedID; });
                    })
                        .filter(Boolean);
                    info("found ".concat(linkedAccounts.length, " external accounts..."), "switchTo");
                    reloadPromises = __spreadArray(__spreadArray([], linkedAccounts.map(function (linkedAccount) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, instance, authentication;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, reload(linkedAccount)];
                                case 1:
                                    _a = _b.sent(), instance = _a.instance, authentication = _a.authentication;
                                    linkedAccount.instance = instance;
                                    linkedAccount.authentication = authentication;
                                    log("reloaded external", "switchTo");
                                    return [2 /*return*/];
                            }
                        });
                    }); }), true), associatedAccounts.map(function (associatedAccount) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, instance, authentication, err_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (typeof associatedAccount.instance !== "undefined")
                                        return [2 /*return*/];
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, reload(associatedAccount)];
                                case 2:
                                    _a = _b.sent(), instance = _a.instance, authentication = _a.authentication;
                                    associatedAccount.instance = instance;
                                    associatedAccount.authentication = authentication;
                                    useAccounts
                                        .getState()
                                        .update(associatedAccount.localID, "authentication", authentication);
                                    log("reloaded associated account", "[switchTo]");
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_1 = _b.sent();
                                    error("failed to reload: ".concat(err_1, "!"), "[switchTo]");
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }), true);
                    return [4 /*yield*/, Promise.all(reloadPromises)];
                case 5:
                    _b.sent();
                    if (account.service === AccountService.PapillonMultiService) {
                        currentGet.mutateProperty("instance", "PapillonPrime");
                    }
                    set({ linkedAccounts: linkedAccounts, associatedAccounts: associatedAccounts });
                    log("done reading ".concat(account.name), "switchTo");
                    return [2 /*return*/];
            }
        });
    }); },
    linkExistingExternalAccount: function (account) {
        log("linking", "linkExistingExternalAccount");
        var currentAccount = get().account;
        if (!currentAccount)
            return;
        set(function (state) { return ({
            linkedAccounts: __spreadArray(__spreadArray([], state.linkedAccounts, true), [account], false),
        }); });
        get().mutateProperty("linkedExternalLocalIDs", __spreadArray(__spreadArray([], (currentAccount.linkedExternalLocalIDs || []), true), [
            account.localID,
        ], false));
        log("linked", "linkExistingExternalAccount");
    },
    logout: function () {
        var account = get().account;
        if (!account)
            return;
        log("logging out ".concat(account.name), "current:logout");
        if (account.service === AccountService.Pronote && account.instance) {
            pronote.clearPresenceInterval(account.instance);
            log("stopped pronote presence", "current:logout");
        }
        set({ account: null, linkedAccounts: [] });
        useAccounts.setState({ lastOpenedAccountID: null });
    },
}); });
export var useAccounts = create()(persist(function (set, get) { return ({
    lastOpenedAccountID: null,
    accounts: [],
    setLastOpenedAccountID: function (id) {
        set({ lastOpenedAccountID: id });
        log("lastOpenedAccountID updated: ".concat(id), "accounts:setLastOpenedAccountID");
    },
    create: function (_a) {
        var instance = _a.instance, account = __rest(_a, ["instance"]);
        log("storing ".concat(account.localID), "accounts:create");
        set(function (state) { return ({
            accounts: __spreadArray(__spreadArray([], state.accounts, true), [account], false),
        }); });
        log("stored ".concat(account.localID), "accounts:create");
    },
    remove: function (localID) {
        log("removing ".concat(localID), "accounts:remove");
        var accounts = get().accounts;
        var spacesAccounts = accounts.filter(function (acc) { return acc.service === AccountService.PapillonMultiService; });
        set({ accounts: accounts.filter(function (acc) { return acc.localID !== localID; }) });
        var multiService = useMultiService.getState();
        spacesAccounts.forEach(function (spaceAccount) {
            if (!spaceAccount.associatedAccountsLocalIDs.includes(localID))
                return;
            log("found ".concat(localID, " in space ").concat(spaceAccount.name), "accounts:remove");
            var updatedSpaceAccount = __assign(__assign({}, spaceAccount), { associatedAccountsLocalIDs: spaceAccount.associatedAccountsLocalIDs.filter(function (id) { return id !== localID; }) });
            var space = multiService.spaces.find(function (s) { return s.accountLocalID === spaceAccount.localID; });
            if (space) {
                var updatedFeatures_1 = __assign({}, space.featuresServices);
                Object.entries(updatedFeatures_1).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    if (value === localID) {
                        updatedFeatures_1[key] = undefined;
                    }
                });
                multiService.update(spaceAccount.localID, "featuresServices", updatedFeatures_1);
            }
            set(function (state) { return ({
                accounts: state.accounts.map(function (acc) {
                    return acc.localID === spaceAccount.localID ? updatedSpaceAccount : acc;
                }),
            }); });
            if (updatedSpaceAccount.associatedAccountsLocalIDs.length === 0) {
                log("space ".concat(spaceAccount.name, " is empty, removing"), "accounts:remove");
                multiService.remove(spaceAccount.localID);
                set(function (state) { return ({
                    accounts: state.accounts.filter(function (acc) { return acc.localID !== spaceAccount.localID; }),
                }); });
            }
        });
        log("removed ".concat(localID), "accounts:remove");
    },
    update: function (localID, key, value) {
        var _a;
        var accounts = get().accounts;
        var account = accounts.find(function (acc) { return acc.localID === localID; });
        if (!account || key === "instance")
            return account || null;
        var accountMutated;
        if (key === "personalization") {
            accountMutated = __assign(__assign({}, account), { personalization: __assign(__assign({}, account.personalization), value) });
        }
        else if (key === "data") {
            accountMutated = __assign(__assign({}, account), { data: __assign(__assign({}, account.data), value) });
        }
        else {
            accountMutated = __assign(__assign({}, account), (_a = {}, _a[key] = value, _a));
        }
        set({
            accounts: accounts.map(function (acc) {
                return acc.localID === localID ? accountMutated : acc;
            }),
        });
        return accountMutated;
    },
}); }, {
    name: "accounts-storage",
    storage: createJSONStorage(function () { return AsyncStorage; }),
}));
