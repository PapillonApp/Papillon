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
import React, { useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, ScrollView, View, } from "react-native";
import * as Device from "expo-device";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import { Info } from "lucide-react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import pronote from "pawnote";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import extract_pronote_name from "@/utils/format/extract_pronote_name";
import defaultPersonalization from "@/services/pronote/default-personalization";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
export var Pronote2FA_Auth = function (_a) {
    var navigation = _a.navigation, route = _a.route;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var pinInputRefs = useRef([]);
    var deviceNameInputRef = useRef(null);
    var _b = useState(false), loading = _b[0], setLoading = _b[1];
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var inputParams = route.params;
    var errorHandler = inputParams.error.handle;
    var session = inputParams.session;
    var accountID = inputParams.accountID;
    var needPin = errorHandler.shouldEnterPIN;
    var _c = useState(["", "", "", ""]), pin = _c[0], setPin = _c[1];
    var _d = useState("Papillon sur ".concat(Device.modelName)), deviceName = _d[0], setDeviceName = _d[1];
    if (deviceName.length > 30) {
        setDeviceName(deviceName.slice(0, 30)); // Prevent too long names
    }
    var handlePinChange = function (text, index) {
        if (text.length === 1) {
            var newPin = __spreadArray([], pin, true);
            newPin[index] = text;
            setPin(newPin);
            if (index < 3) {
                pinInputRefs.current[index + 1].focus();
            }
        }
    };
    var handlePinKeyPress = function (e, index) {
        if (e.nativeEvent.key === "Backspace") {
            var newPin = __spreadArray([], pin, true);
            // If input is empty, go back to precedent
            if (pin[index] === "" && index > 0) {
                pinInputRefs.current[index - 1].focus();
            }
            // Else we clear it
            newPin[index] = "";
            setPin(newPin);
        }
    };
    var handleSubmit = function () { return __awaiter(void 0, void 0, void 0, function () {
        var firstEmptyIndex, isPinCorrect, context, refresh, user, name, account;
        var _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!needPin) return [3 /*break*/, 3];
                    if (!(pin.join("").length != 4)) return [3 /*break*/, 1];
                    firstEmptyIndex = pin.findIndex(function (value) { return value === ""; });
                    pinInputRefs.current[firstEmptyIndex].focus();
                    setLoading(false);
                    return [2 /*return*/];
                case 1: return [4 /*yield*/, pronote.securityCheckPIN(session, pin.join(""))];
                case 2:
                    isPinCorrect = _c.sent();
                    if (!isPinCorrect) {
                        pinInputRefs.current[4].focus();
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    _c.label = 3;
                case 3:
                    if (deviceName == "") {
                        (_b = deviceNameInputRef.current) === null || _b === void 0 ? void 0 : _b.focus();
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, pronote.securitySource(session, deviceName)];
                case 4:
                    _c.sent(); // Pronote use it, but why ?
                    return [4 /*yield*/, pronote.securitySave(session, errorHandler, {
                            pin: pin.join("") || undefined,
                            deviceName: deviceName,
                        })];
                case 5:
                    _c.sent();
                    context = errorHandler.context;
                    return [4 /*yield*/, pronote.finishLoginManually(session, context.authentication, context.identity, context.initialUsername)];
                case 6:
                    refresh = _c.sent();
                    user = session.user.resources[0];
                    name = user.name;
                    _a = {
                        instance: session,
                        localID: accountID,
                        service: AccountService.Pronote,
                        isExternal: false,
                        linkedExternalLocalIDs: [],
                        name: name,
                        className: user.className,
                        schoolName: user.establishmentName,
                        studentName: {
                            first: extract_pronote_name(name).givenName,
                            last: extract_pronote_name(name).familyName,
                        },
                        authentication: __assign(__assign({}, refresh), { deviceUUID: accountID })
                    };
                    return [4 /*yield*/, defaultPersonalization(session)];
                case 7:
                    account = (_a.personalization = _c.sent(),
                        _a.identity = {},
                        _a.serviceData = {},
                        _a.providers = [],
                        _a);
                    pronote.startPresenceInterval(session);
                    createStoredAccount(account);
                    setLoading(false);
                    switchTo(account);
                    // We need to wait a tick to make sure the account is set before navigating.
                    queueMicrotask(function () {
                        // Reset the navigation stack to the "Home" screen.
                        // Prevents the user from going back to the login screen.
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "AccountCreated" }],
                        });
                    });
                    return [2 /*return*/];
            }
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
        }}>
          <Image source={require("@/../assets/images/service_pronote.png")} style={{
            width: 42,
            height: 42,
            borderRadius: 80,
        }}/>
          <View>
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
              Pronote
            </NativeText>
          </View>
        </View>

        <NativeList inline>
          <NativeItem icon={<Info />}>
            <NativeText variant="subtitle">
              Papillon n'est pas affilié à Pronote. La politique de
              confidentialité de Pronote s'applique.
            </NativeText>
          </NativeItem>
        </NativeList>
        {needPin && (<>
            <NativeListHeader label="Code Pin"/>
            <View style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-evenly",
            }}>
              {pin.map(function (value, index) { return (<NativeList style={{
                    width: 48,
                    height: 64,
                    alignItems: "center",
                    justifyContent: "center",
                }} key={index}>
                  <ResponsiveTextInput placeholder="0" placeholderTextColor={theme.colors.text + "55"} style={{
                    fontSize: 32,
                    fontFamily: "medium",
                    color: theme.colors.text,
                    width: 32,
                    lineHeight: 32,
                    textAlign: "center",
                }} keyboardType="numeric" autoComplete="off" maxLength={1} value={value} onChangeText={function (text) { return handlePinChange(text, index); }} onKeyPress={function (e) { return handlePinKeyPress(e, index); }} autoFocus={index === 0} ref={function (ref) {
                    if (ref)
                        pinInputRefs.current[index] = ref;
                }} // Sorcellerie pour TypeScript
            />
                </NativeList>); })}
            </View>
          </>)}

        <NativeListHeader label="Nom de l'appareil"/>
        <NativeList>
          <NativeItem>
            <ResponsiveTextInput placeholder="Nom de l'appareil" placeholderTextColor={theme.colors.text + "55"} value={deviceName} onChangeText={setDeviceName} maxLength={30} // Limit from pawnote sources
     style={{
            color: theme.colors.text,
        }} ref={deviceNameInputRef}/>
          </NativeItem>
        </NativeList>

        <ButtonCta primary value="Se connecter" style={{
            marginTop: 24,
        }} onPress={function () {
            setLoading(true);
            handleSubmit();
        }} icon={loading ? <ActivityIndicator /> : void 0}/>
      </ScrollView>
    </KeyboardAvoidingView>);
};
export default Pronote2FA_Auth;
