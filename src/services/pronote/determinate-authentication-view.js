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
import { BadgeX, KeyRound, LockKeyhole, PlugZap } from "lucide-react-native";
import pronote from "pawnote";
import { info, warn } from "@/utils/logger/logger";
/**
 * Va exécuter une requête pour déterminer
 * la vue d'authentification à afficher.
 *
 * Permet de savoir si l'on a besoin d'une connexion
 * par ENT ou d'une connexion par identifiants simples.
 */
var determinateAuthenticationView = function (pronoteURL, navigation, showAlert) { return __awaiter(void 0, void 0, void 0, function () {
    var waitingInstance, error_1, _a, instance, goToLoginNoENT, goToLoginENT;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!pronoteURL.startsWith("https://") && !pronoteURL.startsWith("http://")) {
                    pronoteURL = "https://".concat(pronoteURL);
                }
                pronoteURL = pronote.cleanURL(pronoteURL);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 8]);
                return [4 /*yield*/, pronote.instance(pronoteURL)];
            case 2:
                waitingInstance = _b.sent();
                info("PRONOTE->determinateAuthenticationView(): OK", "pronote");
                return [3 /*break*/, 8];
            case 3:
                error_1 = _b.sent();
                _b.label = 4;
            case 4:
                _b.trys.push([4, 6, , 7]);
                warn("PRONOTE->determinateAuthenticationView(): Une erreur est survenue avec l'URL '".concat(pronoteURL, "' ! Tentative avec une URL alternative (TOUTATICE)..."), "pronote");
                pronoteURL = pronoteURL.replace(".index-education.net", ".pronote.toutatice.fr");
                return [4 /*yield*/, pronote.instance(pronoteURL)];
            case 5:
                waitingInstance = _b.sent();
                info("PRONOTE->determinateAuthenticationView(): OK", "pronote");
                return [3 /*break*/, 7];
            case 6:
                _a = _b.sent();
                showAlert({
                    title: "Erreur",
                    message: "Impossible de récupérer les informations de l'instance PRONOTE.",
                    icon: <BadgeX />,
                });
                return [2 /*return*/];
            case 7: return [3 /*break*/, 8];
            case 8:
                instance = waitingInstance;
                goToLoginNoENT = function () { return navigation.navigate("PronoteCredentials", {
                    instanceURL: pronoteURL,
                    information: instance
                }); };
                goToLoginENT = function () { return navigation.navigate("PronoteWebview", {
                    instanceURL: pronoteURL
                }); };
                info(JSON.stringify(instance, null, 2), (new Error()).stack);
                if (instance.casToken && instance.casURL) {
                    showAlert({
                        title: "L'instance ".concat(instance.name, " n\u00E9cessite une connexion ENT."),
                        message: "Tu seras redirigé vers le portail de connexion de ton ENT.",
                        icon: <PlugZap />,
                        actions: [
                            {
                                title: "Identifiants",
                                onPress: function () { return goToLoginNoENT(); },
                                icon: <KeyRound />,
                            },
                            {
                                title: "Utiliser l'ENT",
                                onPress: function () { return goToLoginENT(); },
                                primary: true,
                                icon: <LockKeyhole />,
                            }
                        ],
                    });
                }
                else
                    goToLoginNoENT();
                return [2 /*return*/];
        }
    });
}); };
export default determinateAuthenticationView;
