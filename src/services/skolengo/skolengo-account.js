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
import { Skolengo, OID_CLIENT_ID, OID_CLIENT_SECRET, BASE_URL } from "scolengo-api";
import { authTokenToSkolengoTokenSet } from "./skolengo-types";
import { AccountService } from "@/stores/account/types";
import axios from "axios";
import { decode as b64decode, encode as b64encode } from "js-base64";
import { decode as htmlDecode } from "html-entities";
import { useCurrentAccount } from "@/stores/account";
import defaultSkolengoPersonalization from "./default-personalization";
import { Alert } from "react-native";
var getSkolengoAxiosInstance = function () {
    var axioss = axios.create({
        baseURL: BASE_URL
    });
    axioss.interceptors.response.use(function (r) { return r; }, function (error) {
        var _a, _b, _c, _d, _e, _f, _g;
        if ((_c = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors) === null || _c === void 0 ? void 0 : _c.find(function (e) { return e.title.includes("PRONOTE_RESOURCES"); })) {
            return Promise.reject(error);
        }
        if (__DEV__) {
            console.warn("[SKOLENGO] ERR - ", JSON.stringify(error, null, 2), JSON.stringify((_d = error.response) === null || _d === void 0 ? void 0 : _d.data, null, 2));
        }
        (_g = (_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.errors) === null || _g === void 0 ? void 0 : _g.forEach(function (e) {
            var _a;
            if (!e["title"] || e["title"] === "FORBIDDEN")
                return;
            Alert.alert("Skolengo - " + (e["title"].toString() || "Erreur"), htmlDecode(((_a = e["detail"]) === null || _a === void 0 ? void 0 : _a.toString().replace(/<(\/)?([a-z0-9]+)>/g, "")) || "Erreur inconnue") +
                "\n\nSi cette erreur persiste, contacte les équipes de Papillon.", [{ text: "OK" }]);
        });
        return Promise.reject(error);
    });
    return axioss;
};
export var refreshSkolengoToken = function (refreshToken, discovery) { return __awaiter(void 0, void 0, void 0, function () {
    var formData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                formData = new FormData();
                formData.append("grant_type", "refresh_token");
                formData.append("refresh_token", refreshToken);
                if (!discovery.tokenEndpoint)
                    throw new Error("[SKOLENGO] ERR - No token endpoint in discovery document");
                return [4 /*yield*/, fetch(discovery.tokenEndpoint, {
                        method: "POST",
                        headers: {
                            Authorization: "Basic " + b64encode(OID_CLIENT_ID + ":" + OID_CLIENT_SECRET),
                        },
                        body: formData
                    }).then(function (response) { return response.json(); }).then(function (d) { return authTokenToSkolengoTokenSet(d); })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var getJWTClaims = function (token) {
    var _a, _b;
    var dataPart = (_b = (_a = token.split(".")) === null || _a === void 0 ? void 0 : _a.at(1)) === null || _b === void 0 ? void 0 : _b.replace(/-/g, "+").replace(/_/g, "/");
    if (!dataPart)
        throw new Error("[SKOLENGO] ERR - No data part in token");
    var data = JSON.parse(b64decode(dataPart));
    return data;
};
export var getSkolengoAccount = function (authConfig, userInfo) { return __awaiter(void 0, void 0, void 0, function () {
    var skolengoAccount, jwtDecoded, account;
    var _a;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                skolengoAccount = new Skolengo(null, authConfig.school, authConfig.tokenSet, {
                    refreshToken: function (tokenSet) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (!tokenSet.refresh_token)
                                throw new Error("[SKOLENGO] ERR - No refresh token");
                            return [2 /*return*/, refreshSkolengoToken(tokenSet.refresh_token, authConfig.discovery)];
                        });
                    }); },
                    onTokenRefresh: function (tokenSet) { return __awaiter(void 0, void 0, void 0, function () {
                        var state;
                        var _a;
                        return __generator(this, function (_b) {
                            state = (_a = useCurrentAccount.getState().account) === null || _a === void 0 ? void 0 : _a.authentication;
                            useCurrentAccount.getState().mutateProperty("authentication", __assign(__assign({}, state), { tokenSet: tokenSet }));
                            return [2 /*return*/];
                        });
                    }); },
                    httpClient: getSkolengoAxiosInstance(),
                    handlePronoteError: true
                });
                if (!!userInfo) return [3 /*break*/, 2];
                return [4 /*yield*/, skolengoAccount.getUserInfo()];
            case 1:
                userInfo = _c.sent();
                _c.label = 2;
            case 2:
                jwtDecoded = getJWTClaims(skolengoAccount.tokenSet.id_token);
                _a = {
                    service: AccountService.Skolengo,
                    localID: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.id) || jwtDecoded.sub,
                    isExternal: false,
                    name: jwtDecoded.given_name + " " + jwtDecoded.family_name,
                    instance: skolengoAccount,
                    authentication: {
                        school: authConfig.school,
                        tokenSet: skolengoAccount.tokenSet,
                        discovery: authConfig.discovery
                    },
                    linkedExternalLocalIDs: [],
                    studentName: {
                        first: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.firstName) || jwtDecoded.given_name || "Inconnu",
                        last: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.lastName) || jwtDecoded.family_name || "Inconnu",
                    },
                    schoolName: (_b = userInfo === null || userInfo === void 0 ? void 0 : userInfo.school) === null || _b === void 0 ? void 0 : _b.name,
                    className: userInfo === null || userInfo === void 0 ? void 0 : userInfo.className
                };
                return [4 /*yield*/, defaultSkolengoPersonalization(skolengoAccount)];
            case 3:
                account = (_a.personalization = _c.sent(),
                    _a.userInfo = userInfo,
                    _a.identity = {},
                    _a.providers = [],
                    _a.serviceData = {},
                    _a);
                return [2 /*return*/, account];
        }
    });
}); };
