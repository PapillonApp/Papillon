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
import AsyncStorage from "@react-native-async-storage/async-storage";
function DownloadTheme(meta) {
    return __awaiter(this, void 0, void 0, function () {
        var f_theme, r_theme, to_download, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("https://raw.githubusercontent.com/PapillonApp/datasets/refs/heads/main/themes/" + meta.path + "/theme.json")];
                case 1:
                    f_theme = _a.sent();
                    return [4 /*yield*/, f_theme.json()];
                case 2:
                    r_theme = _a.sent();
                    to_download = [];
                    if (r_theme.darkModifier && r_theme.darkModifier.chatBackgroundImage) {
                        to_download.push(r_theme.darkModifier.chatBackgroundImage);
                    }
                    if (r_theme.lightModifier && r_theme.lightModifier.chatBackgroundImage) {
                        to_download.push(r_theme.lightModifier.chatBackgroundImage);
                    }
                    _loop_1 = function (i) {
                        var f, r, reader;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, fetch("https://raw.githubusercontent.com/PapillonApp/datasets/refs/heads/main/themes/" + meta.path + "/" + to_download[i])];
                                case 1:
                                    f = _b.sent();
                                    return [4 /*yield*/, f.blob()];
                                case 2:
                                    r = _b.sent();
                                    reader = new FileReader();
                                    reader.readAsDataURL(r);
                                    reader.onloadend = function () {
                                        if (reader.result && typeof reader.result === "string") {
                                            var base64data = reader.result;
                                            AsyncStorage.setItem("theme_" + meta.name + "_@" + meta.author + "_" + to_download[i], base64data);
                                            console.log("Asset downloaded to " + "theme_" + meta.name + "_@" + meta.author + "_" + to_download[i]);
                                        }
                                        else {
                                            console.error("Error: reader.result is not a string or is null.");
                                        }
                                    };
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < to_download.length)) return [3 /*break*/, 6];
                    return [5 /*yield**/, _loop_1(i)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, AsyncStorage.setItem("theme_" + meta.name + "_@" + meta.author, JSON.stringify(r_theme))];
                case 7:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
function SetThemeForChatId(chatId, meta) {
    return __awaiter(this, void 0, void 0, function () {
        var themeDownloaded;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, DownloadTheme(meta)];
                case 1:
                    themeDownloaded = _a.sent();
                    if (!themeDownloaded) {
                        console.error("Failed to download the theme for chatId: " + chatId);
                        return [2 /*return*/, false];
                    }
                    if (!themeDownloaded) return [3 /*break*/, 3];
                    return [4 /*yield*/, AsyncStorage.setItem("chat_theme_" + chatId, "theme_" + meta.name + "_@" + meta.author)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, true];
            }
        });
    });
}
export default SetThemeForChatId;
