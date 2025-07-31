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
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Pizza } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { balanceFromExternal } from "@/services/balance";
var RestaurantBalanceWidget = forwardRef(function (_a, ref) {
    var _b, _c, _d, _e;
    var setLoading = _a.setLoading, setHidden = _a.setHidden, loading = _a.loading;
    var theme = useTheme();
    var colors = theme.colors;
    var account = useCurrentAccount(function (store) { return store.account; });
    var linkedAccounts = useCurrentAccount(function (store) { return store.linkedAccounts; });
    var _f = useState(null), balances = _f[0], setBalances = _f[1];
    var _g = useState(0), currentBalanceIndex = _g[0], setCurrentBalanceIndex = _g[1];
    useImperativeHandle(ref, function () { return ({
        handlePress: function () { return "Menu"; }
    }); });
    useEffect(function () {
        void function () {
            return __awaiter(this, void 0, void 0, function () {
                var balances, _i, linkedAccounts_1, account_1, balance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setHidden(true);
                            setLoading(true);
                            balances = [];
                            _i = 0, linkedAccounts_1 = linkedAccounts;
                            _a.label = 1;
                        case 1:
                            if (!(_i < linkedAccounts_1.length)) return [3 /*break*/, 4];
                            account_1 = linkedAccounts_1[_i];
                            if (!(account_1.service === AccountService.Turboself || account_1.service === AccountService.ARD)) return [3 /*break*/, 3];
                            return [4 /*yield*/, balanceFromExternal(account_1)];
                        case 2:
                            balance = _a.sent();
                            balances.push.apply(balances, balance);
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            setBalances(balances.filter(function (balance) { return balance.label.toLowerCase() !== "cafetaria"; }));
                            setHidden(balances.length === 0 || balances.every(function (balance) { return balance.remaining === 0; }));
                            setLoading(false);
                            return [2 /*return*/];
                    }
                });
            });
        }();
    }, [linkedAccounts, setHidden]);
    useEffect(function () {
        if (balances && balances.length > 1) {
            var interval_1 = setInterval(function () {
                setCurrentBalanceIndex(function (prevIndex) { return (prevIndex + 1) % balances.length; });
            }, 5000);
            return function () { return clearInterval(interval_1); };
        }
    }, [balances]);
    var currentBalance = balances === null || balances === void 0 ? void 0 : balances[currentBalanceIndex];
    return (<>
      <View style={{
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
            width: "100%",
            gap: 7,
            opacity: 0.5,
        }}>
        <Pizza size={20} color={colors.text}/>
        <Text style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
        }}>
          Solde du Self
        </Text>
      </View>

      <Reanimated.View style={{
            alignItems: "flex-start",
            justifyContent: "center",
            flexDirection: "column",
            width: "100%",
            height: "90%",
            gap: 4,
        }} layout={LinearTransition}>
        <AnimatedNumber value={currentBalance ? "".concat(currentBalance.amount.toFixed(2).toString()).concat(currentBalance.currency) : "0.00€"} style={{
            fontSize: 37,
            lineHeight: 37,
            fontFamily: "semibold",
            color: ((_b = currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.remaining) !== null && _b !== void 0 ? _b : 0) <= 0
                ? "#D10000"
                : "#5CB21F",
        }} contentContainerStyle={{
            paddingLeft: 6,
        }}/>
        {(currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.remaining) !== undefined && (currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.remaining) !== null && currentBalance.remaining !== Infinity && (<View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: ((_c = currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.remaining) !== null && _c !== void 0 ? _c : 0) <= 0
                    ? "#D1000035"
                    : "#5CB21F35",
                borderRadius: 6,
            }}>
            <Text style={{
                color: ((_d = currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.remaining) !== null && _d !== void 0 ? _d : 0) <= 0
                    ? "#D10000"
                    : "#5CB21F",
                fontFamily: "medium",
                fontSize: 16,
                paddingHorizontal: 7,
                paddingVertical: 3,
            }}>
              {Math.max(0, (_e = currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.remaining) !== null && _e !== void 0 ? _e : 0)} {(currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.remaining) === 1 ? "repas restant" : "repas restants"}
            </Text>
          </View>)}
      </Reanimated.View>
    </>);
});
export default RestaurantBalanceWidget;
