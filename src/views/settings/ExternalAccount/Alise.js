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
import { useState } from "react";
import LoginView from "@/components/Templates/LoginView";
import { authenticateWithCredentials } from "alise-api";
import { AccountService } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { useAccounts, useCurrentAccount } from "@/stores/account";
function detectMealPrice(account) {
    return __awaiter(this, void 0, void 0, function () {
        var history, mostFrequentAmount, maxCount, amountCount, _i, history_1, consumption, amount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, account.getFinancialHistory()];
                case 1:
                    history = _a.sent();
                    mostFrequentAmount = null;
                    maxCount = 0;
                    amountCount = {};
                    for (_i = 0, history_1 = history; _i < history_1.length; _i++) {
                        consumption = history_1[_i];
                        amount = consumption.amount;
                        amountCount[amount] = (amountCount[amount] || 0) + 1;
                        if (amountCount[amount] > maxCount) {
                            maxCount = amountCount[amount];
                            mostFrequentAmount = amount;
                        }
                    }
                    return [2 /*return*/, -mostFrequentAmount || null];
            }
        });
    });
}
var ExternalAliseLogin = function (_a) {
    var navigation = _a.navigation;
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var linkExistingExternalAccount = useCurrentAccount(function (store) { return store.linkExistingExternalAccount; });
    var create = useAccounts(function (store) { return store.create; });
    var handleLogin = function (username, password, customFields) { return __awaiter(void 0, void 0, void 0, function () {
        var session, mealPrice, schoolID, bookings, new_account, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, authenticateWithCredentials(username, password, customFields["schoolID"])];
                case 2:
                    session = _b.sent();
                    return [4 /*yield*/, detectMealPrice(session)];
                case 3:
                    mealPrice = (_a = _b.sent()) !== null && _a !== void 0 ? _a : 100;
                    schoolID = customFields["schoolID"];
                    return [4 /*yield*/, session.getBookings()];
                case 4:
                    bookings = _b.sent();
                    new_account = {
                        instance: undefined,
                        service: AccountService.Alise,
                        username: username,
                        authentication: {
                            session: session,
                            username: username,
                            password: password,
                            schoolID: schoolID,
                            mealPrice: mealPrice,
                            bookings: bookings
                        },
                        isExternal: true,
                        localID: uuid(),
                        data: {}
                    };
                    create(new_account);
                    linkExistingExternalAccount(new_account);
                    navigation.pop();
                    navigation.pop();
                    navigation.pop();
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _b.sent();
                    if (error_1 instanceof Error) {
                        setError(error_1.message);
                    }
                    else {
                        setError("Une erreur est survenue lors de la connexion.");
                    }
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (<LoginView serviceIcon={require("@/../assets/images/service_alise.jpg")} serviceName="Alise" onLogin={function (username, password, customFields) { return handleLogin(username, password, customFields); }} loading={loading} error={error} usernameKeyboardType="email-address" usernamePlaceholder="Identifiant ou adresse e-mail" passwordLabel="Mot de passe" passwordPlaceholder="Mot de passe" customFields={[{
                identifier: "schoolID",
                title: "Identifiant de l'établissement",
                placeholder: "aes00000",
                secureTextEntry: false
            }]}/>);
};
export default ExternalAliseLogin;
