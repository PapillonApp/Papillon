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
import { Dimensions, Image, View } from "react-native";
import { WebView } from "react-native-webview";
import { NativeText } from "@/components/Global/NativeComponents";
import React, { useEffect } from "react";
import { Frown, MapPin } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import Reanimated, { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { get_iso_date } from "@/utils/logger/logger";
var AddonsWebview = function (_a) {
    var setTitle = _a.setTitle, addon = _a.addon, url = _a.url, navigation = _a.navigation, _b = _a.scrollEnabled, scrollEnabled = _b === void 0 ? false : _b, _c = _a.inset, inset = _c === void 0 ? { top: 0, left: 0, right: 0, bottom: 0 } : _c, requestNavigate = _a.requestNavigate, data = _a.data;
    var theme = useTheme();
    var colors = theme.colors;
    var _d = React.useState(false), error = _d[0], setError = _d[1];
    var _e = React.useState(""), content = _e[0], setContent = _e[1];
    var _f = React.useState(""), injectedJS = _f[0], setInjectedJS = _f[1];
    var _g = React.useState([]), logs = _g[0], setLogs = _g[1];
    var _h = React.useState(false), showAuthorizations = _h[0], setShowAuthorizations = _h[1];
    var webview = React.useRef(null);
    var title = "";
    //animation opacity
    var opacity = useSharedValue(0);
    function get_plugin_path() {
        var path = url.split("/");
        var res = "";
        for (var i = 0; i < path.length - 1; i++) {
            res += path[i] + "/";
            if (path[i] === "addons") {
                res += path[i + 1] + "/";
                return res;
            }
        }
        return res;
    }
    function load_fonts() {
        return __awaiter(this, void 0, void 0, function () {
            var bold, semiBold, medium, regular, light;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Asset.fromModule(require("../../../assets/fonts/FixelText-Bold.ttf")).downloadAsync()];
                    case 1:
                        bold = _a.sent();
                        return [4 /*yield*/, Asset.fromModule(require("../../../assets/fonts/FixelText-SemiBold.ttf")).downloadAsync()];
                    case 2:
                        semiBold = _a.sent();
                        return [4 /*yield*/, Asset.fromModule(require("../../../assets/fonts/FixelText-Medium.ttf")).downloadAsync()];
                    case 3:
                        medium = _a.sent();
                        return [4 /*yield*/, Asset.fromModule(require("../../../assets/fonts/FixelText-Regular.ttf")).downloadAsync()];
                    case 4:
                        regular = _a.sent();
                        return [4 /*yield*/, Asset.fromModule(require("../../../assets/fonts/FixelText-Light.ttf")).downloadAsync()];
                    case 5:
                        light = _a.sent();
                        return [2 /*return*/, {
                                bold: bold.uri,
                                semiBold: semiBold.uri,
                                medium: medium.uri,
                                regular: regular.uri,
                                light: light.uri,
                            }];
                }
            });
        });
    }
    function load_css() {
        return __awaiter(this, void 0, void 0, function () {
            var css;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Asset.fromModule(require("../../addons/addons_stylesheet.css")).downloadAsync()];
                    case 1:
                        css = _a.sent();
                        return [4 /*yield*/, FileSystem.readAsStringAsync(css.localUri || "")];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    function load_js() {
        return __awaiter(this, void 0, void 0, function () {
            var js;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Asset.fromModule(require("../../addons/addons_modules.rawjs")).downloadAsync()];
                    case 1:
                        js = _a.sent();
                        return [4 /*yield*/, FileSystem.readAsStringAsync(js.localUri || "")];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    function load_content() {
        return __awaiter(this, void 0, void 0, function () {
            var path, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = get_plugin_path();
                        return [4 /*yield*/, FileSystem.readAsStringAsync(url)];
                    case 1:
                        file = _a.sent();
                        file = file.replaceAll("./", path);
                        if (data) {
                            file = "<script>let params = ".concat(JSON.stringify(data), ";</script>").concat(file);
                        }
                        return [2 /*return*/, file];
                }
            });
        });
    }
    function inject_css(css, fonts) {
        css = css.replace("{{FONT_BOLD}}", fonts.bold);
        css = css.replace("{{FONT_SEMIBOLD}}", fonts.semiBold);
        css = css.replace("{{FONT_MEDIUM}}", fonts.medium);
        css = css.replace("{{FONT_REGULAR}}", fonts.regular);
        css = css.replace("{{FONT_LIGHT}}", fonts.light);
        css = css.replace("{{PRIMARY_COLOR}}", colors.primary);
        css = css.replace("{{BACKGROUND_COLOR}}", colors.background);
        css = css.replace("{{TEXT_COLOR}}", colors.text);
        css = css.replace("{{SEPARATOR_COLOR}}", colors.text + "33");
        css = css.replace("{{INSET_TOP}}", String(inset.top));
        css = css.replace("{{INSET_BOTTOM}}", String(inset.bottom));
        css = css.replace("{{INSET_LEFT}}", String(inset.left));
        css = css.replace("{{INSET_RIGHT}}", String(inset.right));
        return css;
    }
    function inject_js(js, css) {
        return js.replace("{{STYLESHEET}}", css);
    }
    function load_addon() {
        return __awaiter(this, void 0, void 0, function () {
            var fonts, css, js, content;
            return __generator(this, function (_a) {
                fonts = load_fonts();
                css = load_css();
                js = load_js();
                content = load_content();
                Promise.all([fonts, css, js, content]).then(function (values) {
                    var css = inject_css(values[1], values[0]);
                    var js = inject_js(values[2], css);
                    setContent(values[3]);
                    setInjectedJS(js);
                }).catch(function () {
                    setError(true);
                });
                return [2 /*return*/];
            });
        });
    }
    useEffect(function () {
        load_addon();
    }, [content, injectedJS, error, logs, showAuthorizations]);
    return (<Reanimated.View style={{ flex: 1, opacity: opacity }}>
      <BottomSheet opened={showAuthorizations} setOpened={setShowAuthorizations}>
        <View style={{ height: 23, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <View style={{
            backgroundColor: "#00000015",
            height: 5,
            width: 50,
            borderRadius: 5,
        }}></View>
        </View>
        <View style={{ padding: 16, display: "flex", flexDirection: "row", gap: 16 }}>
          <View>
            <Image source={addon.icon ? { uri: addon.icon } : require("../../../assets/images/addon_default_logo.png")} style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#00000015",
        }}/>
            <View style={{
            padding: 5,
            backgroundColor: colors.primary,
            position: "absolute",
            borderRadius: 100,
            borderColor: colors.background,
            borderWidth: 4,
            top: 32,
            left: 32
        }}>
              <MapPin size={24} color={"#FFF"}/>
            </View>
          </View>
          <View style={{ flex: 1, display: "flex", gap: 5 }}>
            <NativeText variant="title">{addon.name + " requiert ta position"}</NativeText>
            <NativeText variant="subtitle">L'extension indique : Nous utilisons ta position pour te manger durant ton sommeil 😈</NativeText>
          </View>
        </View>
        <View style={{ paddingHorizontal: 16, display: "flex", flexDirection: "row", gap: 10, height: 48 }}>
          <ButtonCta value={"Refuser"} onPress={function () { return setShowAuthorizations(false); }} style={{ minWidth: null, maxWidth: null, width: (Dimensions.get("window").width - 42) / 2 }}/>
          <ButtonCta value={"Autoriser"} primary onPress={function () { return setShowAuthorizations(false); }} style={{ minWidth: null, maxWidth: null, width: (Dimensions.get("window").width - 42) / 2 }}/>
        </View>
      </BottomSheet>
      {error ?
            (<View style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
              <Frown size={32} color={"#000"}/>
              <NativeText variant="title" style={{ textAlign: "center" }}>L'extension à planté...</NativeText>
            </View>)
            :
                (<WebView onLoadEnd={function () {
                        opacity.value = withTiming(1, {
                            duration: 100,
                            easing: Easing.inOut(Easing.quad),
                        });
                    }} allowFileAccessFromFileURLs={true} allowUniversalAccessFromFileURLs={true} webviewDebuggingEnabled={true} ref={webview} style={{ backgroundColor: "transparent" }} source={{ html: content }} scrollEnabled={scrollEnabled} onError={function () { return setError(true); }} injectedJavaScript={injectedJS} originWhitelist={[get_plugin_path()]} onMessage={function (event) {
                        var _a;
                        var data = JSON.parse(event.nativeEvent.data);
                        // CHANGE TITLE
                        if (data.type == "title") {
                            if (data.title != "" && data.title != title) {
                                setTitle === null || setTitle === void 0 ? void 0 : setTitle(data.title);
                            }
                        }
                        // CONSOLE.LOG
                        if (data.type == "log") {
                            console.log("[ADDON][".concat(addon.name, "] Log : ").concat(data.message));
                            var log = {
                                message: data.message,
                                type: "log",
                                date: new Date(get_iso_date())
                            };
                            setLogs(__spreadArray(__spreadArray([], logs, true), [log], false));
                        }
                        if (data.type == "error") {
                            console.log("[ADDON][".concat(addon.name, "] Error : ").concat(data.message));
                            var log = {
                                message: data.message,
                                type: "error",
                                date: new Date(get_iso_date())
                            };
                            setLogs(__spreadArray(__spreadArray([], logs, true), [log], false));
                        }
                        if (data.type == "warn") {
                            console.log("[ADDON][".concat(addon.name, "] Warning : ").concat(data.message));
                            var log = {
                                message: data.message,
                                type: "warn",
                                date: new Date(get_iso_date())
                            };
                            setLogs(__spreadArray(__spreadArray([], logs, true), [log], false));
                        }
                        if (data.type == "info") {
                            console.log("[ADDON][".concat(addon.name, "] Info : ").concat(data.message));
                            var log = {
                                message: data.message,
                                type: "info",
                                date: new Date(get_iso_date())
                            };
                            setLogs(__spreadArray(__spreadArray([], logs, true), [log], false));
                        }
                        if (data.type == "open_logs") {
                            navigation.navigate("AddonLogs", {
                                logs: logs,
                                name: addon.name
                            });
                        }
                        if (data.type == "request_permission") {
                            setShowAuthorizations(true);
                        }
                        if (data.type == "navigation_navigate") {
                            requestNavigate === null || requestNavigate === void 0 ? void 0 : requestNavigate(data.to, { addon: addon, data: data.params });
                        }
                        if (data.type == "get_user_location") {
                            (_a = webview.current) === null || _a === void 0 ? void 0 : _a.postMessage("Hello from React Native!");
                        }
                    }}/>)}
    </Reanimated.View>);
};
export default AddonsWebview;
