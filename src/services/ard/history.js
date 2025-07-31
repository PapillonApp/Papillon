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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
export var history = function (account) { return __awaiter(void 0, void 0, void 0, function () {
    var uid, _a, financialHistory, ordersHistory, consumptionsHistory;
    var _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [4 /*yield*/, ((_b = account.instance) === null || _b === void 0 ? void 0 : _b.getOnlinePayments().then(function (payments) { return payments.user.uid; }))];
            case 1:
                uid = _f.sent();
                if (!uid)
                    throw new Error("We can't get the account UID");
                return [4 /*yield*/, Promise.all([
                        (_c = account.instance) === null || _c === void 0 ? void 0 : _c.getFinancialHistory(uid),
                        (_d = account.instance) === null || _d === void 0 ? void 0 : _d.getOrdersHistory(uid),
                        (_e = account.instance) === null || _e === void 0 ? void 0 : _e.getConsumptionsHistory(uid)
                    ])];
            case 2:
                _a = _f.sent(), financialHistory = _a[0], ordersHistory = _a[1], consumptionsHistory = _a[2];
                return [2 /*return*/, __spreadArray(__spreadArray(__spreadArray([], (financialHistory !== null && financialHistory !== void 0 ? financialHistory : []).map(function (item) {
                        var _a, _b;
                        return ({
                            amount: (((_a = item.credit) !== null && _a !== void 0 ? _a : 0) - ((_b = item.debit) !== null && _b !== void 0 ? _b : 0)) / 100,
                            timestamp: item.operationDate * 1000,
                            currency: "€",
                            label: item.operationName
                        });
                    }), true), (ordersHistory !== null && ordersHistory !== void 0 ? ordersHistory : []).map(function (item) { return ({
                        amount: item.amount / 100,
                        timestamp: item.orderDate * 1000,
                        currency: "€",
                        label: "Transaction n°" + item.orderReference.toString()
                    }); }), true), (consumptionsHistory !== null && consumptionsHistory !== void 0 ? consumptionsHistory : []).map(function (item) { return ({
                        amount: -item.amount / 100,
                        timestamp: item.consumptionDate * 1000,
                        currency: "€",
                        label: item.consumptionDescription
                    }); }), true)];
        }
    });
}); };
