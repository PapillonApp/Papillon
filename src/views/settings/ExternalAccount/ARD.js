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
import { Authenticator } from "pawrd";
import { AccountService } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import LoginView from "@/components/Templates/LoginView";
export function detectMealPrice(account) {
    return __awaiter(this, void 0, void 0, function () {
        var uid, consumptionsHistory, mostFrequentAmount, maxCount, amountCount, _i, consumptionsHistory_1, consumption, amount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, account.getOnlinePayments().then(function (payment) { return payment.user.uid; })];
                case 1:
                    uid = _a.sent();
                    return [4 /*yield*/, account.getConsumptionsHistory(uid)];
                case 2:
                    consumptionsHistory = _a.sent();
                    mostFrequentAmount = null;
                    maxCount = 0;
                    amountCount = {};
                    for (_i = 0, consumptionsHistory_1 = consumptionsHistory; _i < consumptionsHistory_1.length; _i++) {
                        consumption = consumptionsHistory_1[_i];
                        amount = consumption.amount;
                        amountCount[amount] = (amountCount[amount] || 0) + 1;
                        if (amountCount[amount] > maxCount) {
                            maxCount = amountCount[amount];
                            mostFrequentAmount = amount;
                        }
                    }
                    return [2 /*return*/, mostFrequentAmount || null];
            }
        });
    });
}
var ExternalArdLogin = function (_a) {
    var navigation = _a.navigation;
    var linkExistingExternalAccount = useCurrentAccount(function (store) { return store.linkExistingExternalAccount; });
    var create = useAccounts(function (store) { return store.create; });
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var handleLogin = function (username, password, customFields) { return __awaiter(void 0, void 0, void 0, function () {
        var authenticator, schoolID, client, balances, mealPrice, new_account, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 6]);
                    authenticator = new Authenticator();
                    schoolID = customFields["schoolID"];
                    return [4 /*yield*/, authenticator.fromCredentials(schoolID, username, password)];
                case 1:
                    client = _a.sent();
                    return [4 /*yield*/, client.getOnlinePayments()];
                case 2:
                    balances = _a.sent();
                    return [4 /*yield*/, detectMealPrice(client)];
                case 3:
                    mealPrice = _a.sent();
                    new_account = {
                        instance: client,
                        service: AccountService.ARD,
                        username: username,
                        authentication: {
                            schoolID: schoolID,
                            username: username,
                            password: password,
                            pid: client.pid,
                            mealPrice: mealPrice !== null && mealPrice !== void 0 ? mealPrice : 100,
                            balances: balances
                        },
                        isExternal: true,
                        localID: uuid(),
                        data: {}
                    };
                    create(new_account);
                    linkExistingExternalAccount(new_account);
                    if (!mealPrice)
                        return [2 /*return*/, navigation.navigate("PriceError", { account: client, accountId: new_account.localID })];
                    navigation.pop();
                    navigation.pop();
                    navigation.pop();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error) {
                        setError(error_1.message);
                    }
                    else {
                        setError("Une erreur est survenue lors de la connexion.");
                    }
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (<LoginView serviceIcon={require("@/../assets/images/service_ard.png")} serviceName="ARD" onLogin={function (username, password, customFields) { return handleLogin(username, password, customFields); }} loading={loading} error={error} customFields={[{
                identifier: "schoolID",
                title: "Identifiant de l'établissement",
                placeholder: "Identifiant de l'établissement",
                secureTextEntry: false
            }]}/>);
};
export default ExternalArdLogin;
