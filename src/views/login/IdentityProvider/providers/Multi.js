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
import React, { useState } from "react";
import { authWithCredentials } from "esup-multi.js";
import uuid from "@/utils/uuid-v4";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import defaultPersonalization from "@/services/multi/default-personalization";
import LoginView from "@/components/Templates/LoginView";
var Muli_Login = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var handleLogin = function (username, password) { return __awaiter(void 0, void 0, void 0, function () {
        var account, local_account, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, authWithCredentials(route.params.instanceURL, { username: username, password: password })];
                case 1:
                    account = _b.sent();
                    _a = {
                        instance: undefined,
                        localID: uuid(),
                        service: AccountService.Multi,
                        isExternal: false,
                        linkedExternalLocalIDs: [],
                        identity: {
                            firstName: account.userData.firstname,
                            lastName: account.userData.name,
                            ine: account.userData.ine,
                            birthDate: account.userData.birthDate ? new Date(account.userData.birthDate) : undefined,
                            email: [account.userData.email],
                        },
                        name: account.userData.name + " " + account.userData.firstname,
                        studentName: {
                            last: account.userData.name,
                            first: account.userData.firstname
                        },
                        className: "", // TODO ?
                        schoolName: route.params.title,
                        authentication: {
                            instanceURL: route.params.instanceURL,
                            refreshAuthToken: account.userData.refreshAuthToken || "",
                        }
                    };
                    return [4 /*yield*/, defaultPersonalization(account)];
                case 2:
                    local_account = (_a.personalization = _b.sent(),
                        _a.serviceData = {},
                        _a.providers = [],
                        _a);
                    createStoredAccount(local_account);
                    setLoading(false);
                    switchTo(local_account);
                    // We need to wait a tick to make sure the account is set before navigating.
                    queueMicrotask(function () {
                        // Reset the navigation stack to the "Home" screen.
                        // Prevents the user from going back to the login screen.
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "AccountCreated" }],
                        });
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    if (error_1 instanceof Error) {
                        setError(error_1.message);
                    }
                    else {
                        setError("Erreur inconnue");
                    }
                    setLoading(false);
                    console.error(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<>
      <LoginView serviceIcon={route.params.image} serviceName={route.params.title} loading={loading} error={error} onLogin={function (username, password) { return handleLogin(username, password); }}/>
    </>);
};
export default Muli_Login;
