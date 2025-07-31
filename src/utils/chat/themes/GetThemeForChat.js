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
import { DefaultTheme } from "@/consts/DefaultTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
function GetThemeForChatId(chatId) {
    return __awaiter(this, void 0, void 0, function () {
        var theme, themeName, theme_json_str, theme_json, image, image;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    theme = JSON.parse(JSON.stringify(DefaultTheme));
                    return [4 /*yield*/, AsyncStorage.getItem("chat_theme_" + chatId)];
                case 1:
                    themeName = _a.sent();
                    if (themeName === null)
                        return [2 /*return*/, theme];
                    return [4 /*yield*/, AsyncStorage.getItem(themeName)];
                case 2:
                    theme_json_str = _a.sent();
                    if (theme_json_str === null)
                        return [2 /*return*/, theme];
                    theme_json = JSON.parse(theme_json_str);
                    //Set theme metadata
                    theme.meta.name = theme_json.meta.name;
                    theme.meta.author = theme_json.meta.author;
                    theme.meta.path = theme_json.meta.path;
                    theme.meta.icon = theme_json.meta.icon;
                    theme.meta.darkIcon = theme_json.meta.darkIcon;
                    //Set theme light mode
                    theme.lightModifier.headerBackgroundColor = theme_json.lightModifier.headerBackgroundColor || theme.lightModifier.headerBackgroundColor;
                    theme.lightModifier.headerTextColor = theme_json.lightModifier.headerTextColor || theme.lightModifier.headerTextColor;
                    theme.lightModifier.chatBackgroundColor = theme_json.lightModifier.chatBackgroundColor || theme.lightModifier.chatBackgroundColor;
                    if (!theme_json.lightModifier.chatBackgroundImage) return [3 /*break*/, 4];
                    return [4 /*yield*/, AsyncStorage.getItem("theme_" + theme.meta.name + "_@" + theme.meta.author + "_" + theme_json.lightModifier.chatBackgroundImage)];
                case 3:
                    image = _a.sent();
                    console.log("theme_" + theme.meta.name + "_@" + theme.meta.author + "_" + theme_json.lightModifier.chatBackgroundImage);
                    if (image !== null) {
                        theme.lightModifier.chatBackgroundImage = image;
                    }
                    _a.label = 4;
                case 4:
                    theme.lightModifier.sentMessageBackgroundColor = theme_json.lightModifier.sentMessageBackgroundColor || theme.lightModifier.sentMessageBackgroundColor;
                    theme.lightModifier.sentMessageTextColor = theme_json.lightModifier.sentMessageTextColor || theme.lightModifier.sentMessageTextColor;
                    theme.lightModifier.sentMessageBorderColor = theme_json.lightModifier.sentMessageBorderColor || theme.lightModifier.sentMessageBorderColor;
                    theme.lightModifier.sentMessageBorderSize = theme_json.lightModifier.sentMessageBorderSize || theme.lightModifier.sentMessageBorderSize;
                    theme.lightModifier.sentMessageborderRadiusDefault = theme_json.lightModifier.sentMessageborderRadiusDefault || theme.lightModifier.sentMessageborderRadiusDefault;
                    theme.lightModifier.sentMessageBorderRadiusLinked = theme_json.lightModifier.sentMessageBorderRadiusLinked || theme.lightModifier.sentMessageBorderRadiusLinked;
                    theme.lightModifier.receivedMessageBackgroundColor = theme_json.lightModifier.receivedMessageBackgroundColor || theme.lightModifier.receivedMessageBackgroundColor;
                    theme.lightModifier.receivedMessageTextColor = theme_json.lightModifier.receivedMessageTextColor || theme.lightModifier.receivedMessageTextColor;
                    theme.lightModifier.receivedMessageBorderColor = theme_json.lightModifier.receivedMessageBorderColor || theme.lightModifier.receivedMessageBorderColor;
                    theme.lightModifier.receivedMessageBorderSize = theme_json.lightModifier.receivedMessageBorderSize || theme.lightModifier.receivedMessageBorderSize;
                    theme.lightModifier.receivedMessageborderRadiusDefault = theme_json.lightModifier.receivedMessageborderRadiusDefault || theme.lightModifier.receivedMessageborderRadiusDefault;
                    theme.lightModifier.receivedMessageBorderRadiusLinked = theme_json.lightModifier.receivedMessageBorderRadiusLinked || theme.lightModifier.receivedMessageBorderRadiusLinked;
                    theme.lightModifier.inputBarBackgroundColor = theme_json.lightModifier.inputBarBackgroundColor || theme.lightModifier.inputBarBackgroundColor;
                    theme.lightModifier.sendButtonBackgroundColor = theme_json.lightModifier.sendButtonBackgroundColor || theme.lightModifier.sendButtonBackgroundColor;
                    //Set theme dark mode
                    theme.darkModifier.headerBackgroundColor = theme_json.darkModifier.headerBackgroundColor || theme_json.lightModifier.headerBackgroundColor || theme.darkModifier.headerBackgroundColor;
                    theme.darkModifier.headerTextColor = theme_json.darkModifier.headerTextColor || theme_json.lightModifier.headerTextColor || theme.darkModifier.headerTextColor;
                    theme.darkModifier.chatBackgroundColor = theme_json.darkModifier.chatBackgroundColor || theme_json.lightModifier.chatBackgroundColor || theme.darkModifier.chatBackgroundColor;
                    if (!theme_json.darkModifier.chatBackgroundImage) return [3 /*break*/, 6];
                    return [4 /*yield*/, AsyncStorage.getItem("theme_" + theme.meta.name + "_@" + theme.meta.author + "_" + theme_json.darkModifier.chatBackgroundImage)];
                case 5:
                    image = _a.sent();
                    if (image !== null) {
                        theme.darkModifier.chatBackgroundImage = image;
                    }
                    return [3 /*break*/, 7];
                case 6:
                    if (theme_json.lightModifier.chatBackgroundImage) {
                        theme.darkModifier.chatBackgroundImage = theme_json.lightModifier.chatBackgroundImage;
                    }
                    _a.label = 7;
                case 7:
                    theme.darkModifier.sentMessageBackgroundColor = theme_json.darkModifier.sentMessageBackgroundColor || theme_json.lightModifier.sentMessageBackgroundColor || theme.darkModifier.sentMessageBackgroundColor;
                    theme.darkModifier.sentMessageTextColor = theme_json.darkModifier.sentMessageTextColor || theme_json.lightModifier.sentMessageTextColor || theme.darkModifier.sentMessageTextColor;
                    theme.darkModifier.sentMessageBorderColor = theme_json.darkModifier.sentMessageBorderColor || theme_json.lightModifier.sentMessageBorderColor || theme.darkModifier.sentMessageBorderColor;
                    theme.darkModifier.sentMessageBorderSize = theme_json.darkModifier.sentMessageBorderSize || theme_json.lightModifier.sentMessageBorderSize || theme.darkModifier.sentMessageBorderSize;
                    theme.darkModifier.sentMessageborderRadiusDefault = theme_json.darkModifier.sentMessageborderRadiusDefault || theme_json.lightModifier.sentMessageborderRadiusDefault || theme.darkModifier.sentMessageborderRadiusDefault;
                    theme.darkModifier.sentMessageBorderRadiusLinked = theme_json.darkModifier.sentMessageBorderRadiusLinked || theme_json.lightModifier.sentMessageBorderRadiusLinked || theme.darkModifier.sentMessageBorderRadiusLinked;
                    theme.darkModifier.receivedMessageBackgroundColor = theme_json.darkModifier.receivedMessageBackgroundColor || theme_json.lightModifier.receivedMessageBackgroundColor || theme.darkModifier.receivedMessageBackgroundColor;
                    theme.darkModifier.receivedMessageTextColor = theme_json.darkModifier.receivedMessageTextColor || theme_json.lightModifier.receivedMessageTextColor || theme.darkModifier.receivedMessageTextColor;
                    theme.darkModifier.receivedMessageBorderColor = theme_json.darkModifier.receivedMessageBorderColor || theme_json.lightModifier.receivedMessageBorderColor || theme.darkModifier.receivedMessageBorderColor;
                    theme.darkModifier.receivedMessageBorderSize = theme_json.darkModifier.receivedMessageBorderSize || theme_json.lightModifier.receivedMessageBorderSize || theme.darkModifier.receivedMessageBorderSize;
                    theme.darkModifier.receivedMessageborderRadiusDefault = theme_json.darkModifier.receivedMessageborderRadiusDefault || theme_json.lightModifier.receivedMessageborderRadiusDefault || theme.darkModifier.receivedMessageborderRadiusDefault;
                    theme.darkModifier.receivedMessageBorderRadiusLinked = theme_json.darkModifier.receivedMessageBorderRadiusLinked || theme_json.lightModifier.receivedMessageBorderRadiusLinked || theme.darkModifier.receivedMessageBorderRadiusLinked;
                    theme.darkModifier.inputBarBackgroundColor = theme_json.darkModifier.inputBarBackgroundColor || theme_json.lightModifier.inputBarBackgroundColor || theme.darkModifier.inputBarBackgroundColor;
                    theme.darkModifier.sendButtonBackgroundColor = theme_json.darkModifier.sendButtonBackgroundColor || theme_json.lightModifier.sendButtonBackgroundColor || theme.darkModifier.sendButtonBackgroundColor;
                    return [2 /*return*/, theme];
            }
        });
    });
}
export default GetThemeForChatId;
