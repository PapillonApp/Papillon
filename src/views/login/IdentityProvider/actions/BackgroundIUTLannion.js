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
import defaultPersonalization from "@/services/local/default-personalization";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React from "react";
import { Pressable, View } from "react-native";
import { WebView } from "react-native-webview";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useAlert } from "@/providers/AlertProvider";
import { BadgeX, Undo2 } from "lucide-react-native";
import { BlurView } from "expo-blur";
var providers = ["scodoc", "moodle", "ical"];
var capitalizeFirst = function (str) {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
};
var buildIdentity = function (data) {
    return {
        firstName: capitalizeFirst(data["relevé"].etudiant.prenom || ""),
        lastName: (data["relevé"].etudiant.nom || "").toUpperCase(),
        civility: data["relevé"].etudiant.civilite || undefined,
        boursier: data["relevé"].etudiant.boursier || false,
        ine: data["relevé"].etudiant.code_ine || undefined,
        birthDate: data["relevé"].etudiant.date_naissance
            ? new Date(data["relevé"].etudiant.date_naissance.split("/").reverse().join("-"))
            : undefined,
        birthPlace: data["relevé"].etudiant.lieu_naissance || undefined,
        phone: [
            data["relevé"].etudiant.telephonemobile ? (data["relevé"].etudiant.telephonemobile).replaceAll(".", " ") : undefined,
        ],
        email: [
            data["relevé"].etudiant.email || undefined,
            data["relevé"].etudiant.emailperso || undefined,
        ],
        address: {
            street: data["relevé"].etudiant.domicile || undefined,
            city: data["relevé"].etudiant.villedomicile || undefined,
            zipCode: data["relevé"].etudiant.codepostaldomicile || undefined,
        },
    };
};
var BackgroundIUTLannion = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var params = route.params;
    var username = (params === null || params === void 0 ? void 0 : params.username) || null;
    var password = (params === null || params === void 0 ? void 0 : params.password) || null;
    var account = useCurrentAccount(function (store) { return store.account; });
    var url = "https://notes9.iutlan.univ-rennes1.fr/";
    var firstLogin = (params === null || params === void 0 ? void 0 : params.firstLogin) || false;
    var theme = useTheme();
    var _b = React.useState("Chargement du portail"), step = _b[0], setStep = _b[1];
    if (!firstLogin) {
        if ((account === null || account === void 0 ? void 0 : account.service) == AccountService.Local && account.credentials) {
            username = account.credentials.username;
            password = account.credentials.password;
        }
        else {
            navigation.goBack();
        }
    }
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var showAlert = useAlert().showAlert;
    var useData = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!firstLogin) return [3 /*break*/, 2];
                    return [4 /*yield*/, actionFirstLogin(data)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    mutateProperty("identityProvider", {
                        identifier: "iut-lannion",
                        name: "IUT de Lannion",
                        rawData: data,
                    });
                    // @ts-ignore
                    mutateProperty("providers", providers);
                    mutateProperty("identity", buildIdentity(data));
                    retreiveGrades(data);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var _c = React.useState([]), semestresToRetrieve = _c[0], setSemestresToRetrieve = _c[1];
    var _d = React.useState(0), currentSemestre = _d[0], setCurrentSemestre = _d[1];
    var retreiveGrades = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var scodocData, semestres, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setStep("Récupération des notes");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    scodocData = data;
                    semestres = scodocData["semestres"];
                    setSemestresToRetrieve(semestres);
                    return [4 /*yield*/, retreiveNextSemestre(currentSemestre, semestres)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error(e_1);
                    showAlert({
                        title: "Erreur",
                        message: "Impossible de récupérer les notes de l'IUT de Lannion. Vérifie ta connexion Internet et réessaie.",
                        icon: <BadgeX />,
                        actions: [
                            {
                                title: "OK",
                                icon: <Undo2 />,
                                onPress: function () { return navigation.goBack(); },
                                primary: true,
                            }
                        ]
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var retreiveNextSemestre = function (cs_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([cs_1], args_1, true), void 0, function (cs, semestres) {
            var sem;
            var _a;
            if (semestres === void 0) { semestres = semestresToRetrieve; }
            return __generator(this, function (_b) {
                sem = semestres[cs];
                setStep("Récupération du semestre " + sem.semestre_id);
                (_a = wbref.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript("\n      window.location.href = \"https://notes9.iutlan.univ-rennes1.fr/services/data.php?q=relev%C3%A9Etudiant&semestre=\" + ".concat(sem.formsemestre_id, ";\n    "));
                return [2 /*return*/];
            });
        });
    };
    var processSemestre = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var newServiceData, semesterName, newCurrentSemestre;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newServiceData = (account === null || account === void 0 ? void 0 : account.serviceData) || {};
                    if (!newServiceData["semestres"]) {
                        newServiceData["semestres"] = {};
                    }
                    semesterName = "Semestre " + semestresToRetrieve[currentSemestre].semestre_id;
                    newServiceData["semestres"][semesterName] = data;
                    mutateProperty("serviceData", newServiceData);
                    newCurrentSemestre = currentSemestre + 1;
                    setCurrentSemestre(newCurrentSemestre);
                    if (!(newCurrentSemestre < semestresToRetrieve.length)) return [3 /*break*/, 2];
                    return [4 /*yield*/, retreiveNextSemestre(newCurrentSemestre, semestresToRetrieve)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    if (firstLogin) {
                        queueMicrotask(function () {
                            // Reset the navigation stack to the "Home" screen.
                            // Prevents the user from going back to the login screen.
                            navigation.goBack();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "AccountCreated" }],
                            });
                        });
                    }
                    else {
                        navigation.goBack();
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var actionFirstLogin = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var local_account;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = {
                        authentication: undefined,
                        instance: undefined,
                        identityProvider: {
                            identifier: "iut-lannion",
                            name: "IUT de Lannion",
                            rawData: data,
                        },
                        providers: providers,
                        identity: buildIdentity(data),
                        credentials: {
                            username: username || "",
                            password: password || ""
                        },
                        localID: uuid(),
                        service: AccountService.Local,
                        isExternal: false,
                        linkedExternalLocalIDs: [],
                        name: data["relevé"].etudiant.nom + " " + capitalizeFirst(data["relevé"].etudiant.prenom),
                        studentName: {
                            first: capitalizeFirst(data["relevé"].etudiant.prenom),
                            last: data["relevé"].etudiant.nom
                        },
                        className: data["relevé"].etudiant.dept_acronym,
                        schoolName: "IUT de Lannion - Université de Rennes"
                    };
                    return [4 /*yield*/, defaultPersonalization({
                            tabs: [
                                { name: "Home", enabled: true },
                                { name: "Lessons", enabled: true },
                                { name: "Grades", enabled: true },
                                { name: "Attendance", enabled: true },
                                { name: "Menu", enabled: true }
                            ]
                        })];
                case 1:
                    local_account = (_a.personalization = _b.sent(),
                        _a.serviceData = {},
                        _a);
                    // https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/pn8d0kn8.shu
                    createStoredAccount(local_account);
                    switchTo(local_account);
                    retreiveGrades(data);
                    return [2 /*return*/];
            }
        });
    }); };
    var wbref = React.useRef(null);
    var _e = React.useState(false), canExtractJSON = _e[0], setCanExtractJSON = _e[1];
    var _f = React.useState(0), redirectCount = _f[0], setRedirectCount = _f[1];
    var injectPassword = function () {
        var _a;
        if (redirectCount >= 2) {
            showAlert({
                title: "Erreur",
                message: "Impossible de se connecter au portail du l'IUT de Lannion. Vérifie tes identifiants et réessaye.",
                icon: <BadgeX />,
                actions: [
                    {
                        title: "OK",
                        icon: <Undo2 />,
                        onPress: function () { return navigation.goBack(); },
                        primary: true,
                    }
                ]
            });
            navigation.goBack();
            return;
        }
        setStep("Connexion à Sésame");
        var newRedirCount = redirectCount + 1;
        setRedirectCount(newRedirCount);
        (_a = wbref.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript("\n            // fill input id=username\n            document.getElementById(\"username\").value = \"".concat(username, "\";\n            // fill input id=password\n            document.getElementById(\"password\").value = \"").concat(password, "\";\n            // press button name=submitBtn\n            document.getElementsByName(\"submitBtn\")[0].click();\n          "));
        setCanExtractJSON(true);
    };
    var redirectToData = function () {
        var _a;
        setStep("Récupération des données");
        (_a = wbref.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript("\n              window.location.href = \"https://notes9.iutlan.univ-rennes1.fr/services/data.php?q=dataPremi\u00E8reConnexion\";\n            ");
    };
    return (<>
      <BlurView tint="dark" intensity={100} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}/>

      <View style={{
            backgroundColor: "#00000020",
            padding: 10,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            zIndex: 9999,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
        }}>
        <View style={{ height: 40 }}/>
        <PapillonSpinner size={56} strokeWidth={5} color={theme.colors.primary}/>
        <View style={{ height: 10 }}/>
        <NativeText variant="title" key={step} animated entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOutUp)} style={{ color: "#fff" }}>
          {step}
        </NativeText>
        <NativeText variant="subtitle" style={{ color: "#fff" }}>
          Cela peut prendre quelques secondes...
        </NativeText>
        <View style={{ height: 40 }}/>
        <Pressable onPress={function () {
            navigation.goBack();
        }} style={function (_a) {
            var pressed = _a.pressed;
            return ({
                backgroundColor: "#ffffff33",
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 60,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: pressed ? 0.5 : 1,
            });
        }}>
          <NativeText variant="body" style={{ color: "#fff" }}>
            Annuler
          </NativeText>
        </Pressable>
      </View>

      <WebView source={{ uri: url }} incognito={true} ref={wbref} style={{ opacity: 0 }} onLoad={function (data) {
            var _a, _b;
            var url = data.nativeEvent.url;
            if (url.startsWith("https://sso-cas.univ-rennes.fr//login?")) {
                injectPassword();
            }
            if (url.startsWith("https://notes9.iutlan.univ-rennes1.fr/") && canExtractJSON) {
                redirectToData();
                setCanExtractJSON(false);
            }
            if (url.startsWith("https://notes9.iutlan.univ-rennes1.fr/services/data.php?q=relev%C3%A9Etudiant&semestre=")) {
                (_a = wbref.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript("\n              window.ReactNativeWebView.postMessage(\"semestre:\"+document.body.innerText);\n            ");
            }
            else if (url.startsWith("https://notes9.iutlan.univ-rennes1.fr/services/data.php")) {
                (_b = wbref.current) === null || _b === void 0 ? void 0 : _b.injectJavaScript("\n              window.ReactNativeWebView.postMessage(\"firstLogin:\"+document.body.innerText);\n            ");
            }
        }} onError={function (data) {
            console.error(data);
            showAlert({
                title: "Erreur",
                message: "Impossible de se connecter au portail de l'IUT de Lannion. Vérifie ta connexion Internet et réessaie.",
                icon: <BadgeX />,
                actions: [
                    {
                        title: "OK",
                        icon: <Undo2 />,
                        onPress: function () { return navigation.goBack(); },
                        primary: true,
                    }
                ]
            });
        }} onMessage={function (event) {
            try {
                if (event.nativeEvent.data.startsWith("firstLogin:")) {
                    var data = event.nativeEvent.data.replace("firstLogin:", "");
                    var parsedData = JSON.parse(data);
                    useData(parsedData);
                }
                else if (event.nativeEvent.data.startsWith("semestre:")) {
                    var data = event.nativeEvent.data.replace("semestre:", "");
                    var parsedData = JSON.parse(data);
                    processSemestre(parsedData);
                }
            }
            catch (e) {
                console.error(e);
            }
        }}/>
    </>);
};
export default BackgroundIUTLannion;
