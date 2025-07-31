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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useState } from "react";
import { View, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { DoubleAuthRequired, initDoubleAuth, login, checkDoubleAuth, setAccessToken } from "pawdirecte";
import uuid from "@/utils/uuid-v4";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import defaultPersonalization from "@/services/ecoledirecte/default-personalization";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import { NativeText } from "@/components/Global/NativeComponents";
import Reanimated, { FlipInXDown, LinearTransition, useSharedValue } from "react-native-reanimated";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import { SvgFromXml } from "react-native-svg";
import LoginView from "@/components/Templates/LoginView";
var EcoleDirecteCredentials = function (_a) {
    var navigation = _a.navigation;
    var _b = useState(null), session = _b[0], setSession = _b[1];
    var _c = useState(""), cachedPassword = _c[0], setCachedPassword = _c[1];
    var _d = useState(null), doubleAuthChallenge = _d[0], setDoubleAuthChallenge = _d[1];
    var _e = useState(false), loading = _e[0], setLoading = _e[1];
    var _f = useState(null), error = _f[0], setError = _f[1];
    var _g = useState(null), selectedAnswer = _g[0], setSelectedAnswer = _g[1];
    var scrollY = useSharedValue(0);
    var theme = useTheme();
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var handleLogin = function (username_1, password_1) {
        var args_1 = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args_1[_i - 2] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([username_1, password_1], args_1, true), void 0, function (username, password, currentSession) {
            var accountID, accounts, account, local_account, error_1, challenge;
            var _a;
            if (currentSession === void 0) { currentSession = session; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 6]);
                        setLoading(true);
                        setError(null);
                        if (username === "demo" && password === "demo") {
                            setDoubleAuthChallenge({ answers: ["demo00", "demo01", "demo02", "demo03", "demo04", "demo05", "demo06", "demo07", "demo08", "demo09"], question: "Ceci est une question de démonstration" });
                        }
                        if (currentSession === null) {
                            accountID = uuid();
                            currentSession = { username: username, device_uuid: accountID };
                            setCachedPassword(password);
                        }
                        return [4 /*yield*/, login(currentSession, password ? password : cachedPassword)];
                    case 1:
                        accounts = _b.sent();
                        account = accounts[0];
                        setAccessToken(currentSession, account);
                        _a = {
                            instance: {},
                            localID: currentSession.device_uuid,
                            service: AccountService.EcoleDirecte,
                            isExternal: false,
                            linkedExternalLocalIDs: [],
                            identity: {
                                firstName: account.firstName,
                                lastName: account.lastName,
                                civility: account.gender,
                                phone: [account.phone],
                                email: [account.email],
                            },
                            name: "".concat(account.lastName, " ").concat(account.firstName),
                            studentName: {
                                first: account.firstName,
                                last: account.lastName,
                            },
                            className: account.class.short,
                            schoolName: account.schoolName,
                            authentication: {
                                session: currentSession,
                                account: account
                            }
                        };
                        return [4 /*yield*/, defaultPersonalization(account)];
                    case 2:
                        local_account = (_a.personalization = _b.sent(),
                            _a.profilePictureURL = "",
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
                        return [3 /*break*/, 6];
                    case 3:
                        error_1 = _b.sent();
                        if (!(error_1 instanceof DoubleAuthRequired)) return [3 /*break*/, 5];
                        return [4 /*yield*/, initDoubleAuth(currentSession).catch(function (e) {
                                console.error(e);
                                setError("Une erreur est survenue lors de la récupération des questions pour la double authentification");
                                return null;
                            }).finally(function () { return setLoading(false); })];
                    case 4:
                        challenge = _b.sent();
                        setDoubleAuthChallenge(challenge);
                        setSession(currentSession);
                        return [2 /*return*/];
                    case 5:
                        if (error_1 instanceof Error) {
                            if (error_1.message === "Bad credentials, no token found in response")
                                setError("Nom d'utilisateur ou mot de passe incorrect!");
                            else
                                setError(error_1.message);
                        }
                        else {
                            setError("Erreur inconnue");
                        }
                        setLoading(false);
                        console.error(error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    var handleChallenge = function (answer) { return __awaiter(void 0, void 0, void 0, function () {
        var currentSession, correct;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!session) {
                        console.warn("No session to handle challenge");
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    currentSession = __assign({}, session);
                    return [4 /*yield*/, checkDoubleAuth(currentSession, answer).finally(function () { return setLoading(false); })];
                case 1:
                    correct = _a.sent();
                    if (!correct) {
                        setError("Mauvaise réponse, réessaye");
                        setDoubleAuthChallenge(null);
                        setSession(null);
                        return [2 /*return*/];
                    }
                    // username et password n'ont pas besoin d'être défini ici
                    // car ils sont liés par la session directement.
                    queueMicrotask(function () { return void handleLogin("", "", currentSession); });
                    return [2 /*return*/];
            }
        });
    }); };
    return (<>
      <LoginView serviceIcon={require("@/../assets/images/service_ed.png")} serviceName="EcoleDirecte" loading={loading} error={error} onLogin={function (username, password) { return handleLogin(username, password); }}/>

      {doubleAuthChallenge !== null && (<BottomSheet opened={true} setOpened={function () { return setDoubleAuthChallenge(null); }}>
          <View>
            <View style={{ padding: 16, height: 60 + 16, paddingBottom: 0 }}>
              <NativeText variant={"title"}>{doubleAuthChallenge.question}</NativeText>
              <NativeText variant={"subtitle"}>Réponds à la question suivante pour continuer ton authentification</NativeText>
            </View>
            <SvgFromXml xml={"\n                <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"".concat(theme.colors.text, "\" width=\"10000\">\n                    <rect x=\"0\" y=\"0\" width=\"1000000\" height=\"16\" fill=\"url(#gradient)\"/>\n                    <linearGradient id=\"gradient\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n                      <stop offset=\"0%\" stop-color=\"").concat(theme.colors.background, "\"/>\n                      <stop offset=\"100%\" stop-color=\"").concat(theme.colors.background, "\" stop-opacity=\"0\"/>\n                    </linearGradient>\n                </svg>\n              ")} style={{
                position: "absolute",
                top: 60 + 16,
                left: 0,
                height: 16,
                width: Dimensions.get("screen").width,
                zIndex: 999,
                pointerEvents: "none",
            }}/>
            <ScrollView style={{ height: 450 }} showsVerticalScrollIndicator={false}>
              <Reanimated.View style={{ display: "flex", gap: 9, padding: 16, marginTop: scrollY, paddingBottom: 50 + 32 }}>
                {doubleAuthChallenge.answers.map(function (answer, index) { return (<Reanimated.View style={{
                    width: "100%",
                    height: 50,
                }} layout={LinearTransition} entering={FlipInXDown.springify().delay(50 * index)}>
                    <DuoListPressable text={answer} enabled={selectedAnswer === answer} onPress={function () { return setSelectedAnswer(answer); }}/>
                  </Reanimated.View>); })}
              </Reanimated.View>
            </ScrollView>
            <View style={{ padding: 16, position: "absolute", height: 50 + 32, bottom: -5 }}>
              <SvgFromXml xml={"\n                <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"".concat(theme.colors.text, "\" width=\"10000\">\n                    <rect x=\"0\" y=\"0\" width=\"1000000\" height=\"100%\" fill=\"url(#gradient)\"/>\n                    <linearGradient id=\"gradient\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n                      <stop offset=\"0%\" stop-color=\"").concat(theme.colors.background, "\" stop-opacity=\"0\"/>\n                      <stop offset=\"20%\" stop-color=\"").concat(theme.colors.background, "\"/>\n                    </linearGradient>\n                </svg>\n              ")} style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: Dimensions.get("screen").width,
            }}/>
              <ButtonCta value="Valider" onPress={function () { return void handleChallenge(selectedAnswer); }} primary={!loading} icon={loading ? <ActivityIndicator /> : void 0} disabled={selectedAnswer === null}/>
            </View>
          </View>
        </BottomSheet>)}
    </>);
};
export default EcoleDirecteCredentials;
