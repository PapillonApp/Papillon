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
import React, { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, ScrollView, TouchableOpacity, View, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "../Global/NativeComponents";
import { AlertTriangle, Eye, EyeOff, Info } from "lucide-react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import ButtonCta from "../FirstInstallation/ButtonCta";
import ResponsiveTextInput from "../FirstInstallation/ResponsiveTextInput";
var LoginView = function (_a) {
    var serviceIcon = _a.serviceIcon, serviceName = _a.serviceName, _b = _a.loading, loading = _b === void 0 ? false : _b, _c = _a.error, error = _c === void 0 ? null : _c, _d = _a.autoCapitalize, autoCapitalize = _d === void 0 ? "none" : _d, onLogin = _a.onLogin, _e = _a.customFields, customFields = _e === void 0 ? [] : _e, _f = _a.usernameLabel, usernameLabel = _f === void 0 ? "Identifiant" : _f, _g = _a.usernamePlaceholder, usernamePlaceholder = _g === void 0 ? "Nom d'utilisateur" : _g, _h = _a.passwordLabel, passwordLabel = _h === void 0 ? "Mot de passe" : _h, _j = _a.passwordPlaceholder, passwordPlaceholder = _j === void 0 ? "Mot de passe" : _j, _k = _a.usernameKeyboardType, usernameKeyboardType = _k === void 0 ? "default" : _k, _l = _a.passwordKeyboardType, passwordKeyboardType = _l === void 0 ? "default" : _l;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var _m = useState(""), username = _m[0], setUsername = _m[1];
    var _o = useState(""), password = _o[0], setPassword = _o[1];
    var _p = useState(customFields.map(function (field) { return (__assign(__assign({}, field), { value: "" })); })), customFieldsInputs = _p[0], setCustomFieldsInputs = _p[1];
    var _q = useState(false), showPassword = _q[0], setShowPassword = _q[1];
    var actionLogin = function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFieldsDict;
        return __generator(this, function (_a) {
            customFieldsDict = customFieldsInputs.reduce(function (acc, field) {
                var _a;
                acc[field.identifier] = (_a = field.value) !== null && _a !== void 0 ? _a : "";
                return acc;
            }, {});
            onLogin(username, password, customFieldsDict);
            return [2 /*return*/];
        });
    }); };
    return (<KeyboardAvoidingView behavior="height" keyboardVerticalOffset={insets.top + 64} style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            overflow: "visible",
        }}>
      <ScrollView contentContainerStyle={{
            padding: 16,
            overflow: "visible",
        }}>
        <View style={{
            flexDirection: "row",
            gap: 14,
            margin: 4,
            alignItems: "center",
        }}>
          <Image source={serviceIcon} style={{
            width: 42,
            height: 42,
            borderRadius: 12,
        }}/>
          <View style={{
            flex: 1,
            gap: 2,
        }}>
            <NativeText style={{
            fontSize: 16,
            fontFamily: "medium",
            opacity: 0.5,
        }}>
              Se connecter au service
            </NativeText>
            <NativeText style={{
            fontSize: 20,
            lineHeight: 24,
            fontFamily: "semibold",
        }}>
              {serviceName}
            </NativeText>
          </View>
        </View>

        <NativeList inline>
          <NativeItem icon={<Info />}>
            <NativeText variant="subtitle">
              Papillon n'est pas affilié à {serviceName}. La politique de
              confidentialité de {serviceName} s'applique.
            </NativeText>
          </NativeItem>
        </NativeList>

        {error && (<NativeList style={{
                backgroundColor: "#eb403422",
            }}>
            <NativeItem icon={<AlertTriangle />}>
              <NativeText variant="subtitle">Impossible de se connecter, vérifie tes identifiants ou utilise le portail de ton ENT pour te connecter.</NativeText>
            </NativeItem>
          </NativeList>)}

        <NativeListHeader label={usernameLabel}/>
        <NativeList>
          <NativeItem>
            <ResponsiveTextInput defaultValue={username} onChangeText={setUsername} placeholder={usernamePlaceholder} autoCapitalize={autoCapitalize} keyboardType={usernameKeyboardType} placeholderTextColor={theme.colors.text + "55"} style={{
            fontSize: 16,
            fontFamily: "medium",
            flex: 1,
            color: theme.colors.text,
        }}/>
          </NativeItem>
        </NativeList>

        <NativeListHeader label={passwordLabel}/>
        <NativeList>
          <NativeItem>
            <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        }}>
              <ResponsiveTextInput defaultValue={password} onChangeText={setPassword} placeholder={passwordPlaceholder} placeholderTextColor={theme.colors.text + "55"} autoCapitalize={autoCapitalize} keyboardType={passwordKeyboardType} style={{
            fontSize: 16,
            fontFamily: "medium",
            flex: 1,
            color: theme.colors.text,
        }} secureTextEntry={!showPassword}/>

              <TouchableOpacity onPress={function () { return setShowPassword(!showPassword); }}>
                {showPassword ? (<EyeOff color={theme.colors.text + "55"}/>) : (<Eye color={theme.colors.text + "55"}/>)}
              </TouchableOpacity>
            </View>
          </NativeItem>
        </NativeList>

        {customFieldsInputs.map(function (field, index) { return (<View key={"c" + index}>
            <NativeListHeader label={field.title}/>

            <NativeList>
              <NativeItem>
                <ResponsiveTextInput value={field.value} onChangeText={function (text) {
                setCustomFieldsInputs(customFieldsInputs.map(function (f, i) {
                    if (i === index) {
                        return __assign(__assign({}, f), { value: text });
                    }
                    return f;
                }));
            }} placeholder={field.placeholder} placeholderTextColor={theme.colors.text + "55"} autoCapitalize={autoCapitalize} style={{
                fontSize: 16,
                fontFamily: "medium",
                flex: 1,
                color: theme.colors.text,
            }} secureTextEntry={field.secureTextEntry}/>
              </NativeItem>
            </NativeList>
          </View>); })}

        <ButtonCta primary value="Se connecter" onPress={actionLogin} style={{
            marginTop: 24,
        }} icon={loading ? <ActivityIndicator /> : void 0}/>
      </ScrollView>
    </KeyboardAvoidingView>);
};
export default LoginView;
