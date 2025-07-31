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
import React, { useState, useCallback, useMemo } from "react";
import { View } from "react-native";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import defaultPersonalization from "@/services/local/default-personalization";
import uuid from "@/utils/uuid-v4";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import LoginView from "@/components/Templates/LoginView";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";
var API_BASE_URL = "https://api.univ-spn.fr";
var USER_AGENT = "USPNAPP/1.0.1 CFNetwork/1568.200.41 Darwin/24.1.0";
var UnivSorbonneParisNord_login = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var _b = useState(false), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(""), loadingText = _c[0], setLoadingText = _c[1];
    var fetchStudentInfo = useCallback(function (identifier, token) { return __awaiter(void 0, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/student/infos"), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "User-Agent": USER_AGENT,
                        },
                        body: JSON.stringify({ identifier: identifier, token: token }),
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch student info");
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data.identite];
            }
        });
    }); }, []);
    var login = useCallback(function (identifier, password) { return __awaiter(void 0, void 0, void 0, function () {
        var loginResponse, _a, studentId, token, studentInfo, INE, safeStudentInfo, localAccount, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setIsLoading(true);
                    setLoadingText("Connexion en cours...");
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/student/login"), {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "User-Agent": USER_AGENT,
                            },
                            body: JSON.stringify({ identifier: identifier, password: password }),
                        })];
                case 2:
                    loginResponse = _c.sent();
                    if (!loginResponse.ok) {
                        throw new Error("Login failed");
                    }
                    return [4 /*yield*/, loginResponse.json()];
                case 3:
                    _a = _c.sent(), studentId = _a[0], token = _a[1];
                    setLoadingText("Récupération des informations...");
                    return [4 /*yield*/, fetchStudentInfo(studentId, token)];
                case 4:
                    studentInfo = _c.sent();
                    INE = studentInfo.INE, safeStudentInfo = __rest(studentInfo, ["INE"]);
                    _b = {
                        authentication: undefined,
                        instance: undefined,
                        identityProvider: {
                            identifier: "univ_sorbonne_paris_nord",
                            name: "Université Sorbonne Paris Nord",
                            rawData: safeStudentInfo
                        },
                        localID: uuid(),
                        service: AccountService.Local,
                        isExternal: false,
                        linkedExternalLocalIDs: [],
                        name: "".concat(safeStudentInfo.NOM_PATRONYMIQUE, " ").concat(safeStudentInfo.PRENOM1),
                        studentName: {
                            first: safeStudentInfo.PRENOM1,
                            last: safeStudentInfo.NOM_PATRONYMIQUE,
                        },
                        className: "",
                        schoolName: "Université Sorbonne Paris Nord"
                    };
                    return [4 /*yield*/, defaultPersonalization()];
                case 5:
                    localAccount = (_b.personalization = _c.sent(),
                        _b.identity = {},
                        _b.serviceData = {},
                        _b.providers = [],
                        _b);
                    createStoredAccount(localAccount);
                    switchTo(localAccount);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "AccountCreated" }],
                    });
                    return [3 /*break*/, 8];
                case 6:
                    error_1 = _c.sent();
                    console.error("Error during login process:", error_1);
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [createStoredAccount, switchTo, navigation, fetchStudentInfo]);
    var loginViewProps = useMemo(function () { return ({
        serviceName: "Université Sorbonne Paris Nord",
        serviceIcon: require("@/../assets/images/service_uspn.png"),
        onLogin: login,
    }); }, [login]);
    return (<View style={{ flex: 1 }}>
      {isLoading ? (<View style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.colors.background,
                justifyContent: "center",
                alignItems: "center",
            }}>
          <PapillonSpinner color={theme.colors.primary} size={50} strokeWidth={4}/>
          <NativeText style={{ color: theme.colors.text, marginTop: 16 }}>
            {loadingText}
          </NativeText>
        </View>) : (<LoginView {...loginViewProps}/>)}

    </View>);
};
export default UnivSorbonneParisNord_login;
