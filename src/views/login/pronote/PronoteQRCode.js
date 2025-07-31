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
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, StyleSheet, Modal, KeyboardAvoidingView, Keyboard } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { BarCodeScanner } from "expo-barcode-scanner";
import MaskedView from "@react-native-masked-view/masked-view";
import * as Haptics from "expo-haptics";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { BadgeX, QrCode } from "lucide-react-native";
import Reanimated, { LinearTransition, FadeOutUp, FadeInUp } from "react-native-reanimated";
import pronote from "pawnote";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import defaultPersonalization from "@/services/pronote/default-personalization";
import extract_pronote_name from "@/utils/format/extract_pronote_name";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var makeUUID = function () {
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
};
var PronoteQRCode = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var createStoredAccount = useAccounts(function (store) { return store.create; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var colors = theme.colors;
    var _b = useState(null), hasPermission = _b[0], setHasPermission = _b[1];
    var _c = useState(false), scanned = _c[0], setScanned = _c[1];
    var _d = useState(false), keyboardOpen = _d[0], setKeyboardOpen = _d[1];
    var _e = useState(""), QRValidationCode = _e[0], setQRValidationCode = _e[1];
    var _f = useState(false), pinModalVisible = _f[0], setPinModalVisible = _f[1];
    var _g = useState(false), loadingModalVisible = _g[0], setLoadingModalVisible = _g[1];
    var codeInput = React.createRef();
    var _h = useState(null), QRData = _h[0], setQRData = _h[1];
    var _j = useSoundHapticsWrapper(), playHaptics = _j.playHaptics, playSound = _j.playSound;
    var LEson = require("@/../assets/sound/4.wav");
    var showAlert = useAlert().showAlert;
    function loginQR() {
        return __awaiter(this, void 0, void 0, function () {
            var accountID, decodedJSON, data, session_1, refresh, user, name_1, account, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        setScanned(false);
                        setLoadingModalVisible(true);
                        if (QRValidationCode === "" || QRValidationCode.length !== 4) {
                            showAlert({
                                title: "Code invalide",
                                message: "Entre un code à 4 chiffres.",
                                icon: <BadgeX />,
                            });
                            return [2 /*return*/];
                        }
                        accountID = makeUUID();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        decodedJSON = JSON.parse(QRData);
                        data = {
                            jeton: decodedJSON.jeton,
                            login: decodedJSON.login,
                            url: decodedJSON.url,
                        };
                        session_1 = pronote.createSessionHandle();
                        return [4 /*yield*/, pronote.loginQrCode(session_1, {
                                qr: data,
                                pin: QRValidationCode,
                                deviceUUID: accountID
                            }).catch(function (error) {
                                if (error instanceof pronote.SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
                                    navigation.navigate("Pronote2FA_Auth", {
                                        session: session_1,
                                        error: error,
                                        accountID: accountID
                                    });
                                }
                                else {
                                    throw error;
                                }
                            })];
                    case 2:
                        refresh = _b.sent();
                        if (!refresh)
                            throw pronote.AuthenticateError;
                        user = session_1.user.resources[0];
                        name_1 = user.name;
                        _a = {
                            instance: session_1,
                            localID: accountID,
                            service: AccountService.Pronote,
                            isExternal: false,
                            linkedExternalLocalIDs: [],
                            name: name_1,
                            className: user.className,
                            schoolName: user.establishmentName,
                            studentName: {
                                first: extract_pronote_name(name_1).givenName,
                                last: extract_pronote_name(name_1).familyName
                            },
                            authentication: __assign(__assign({}, refresh), { deviceUUID: accountID })
                        };
                        return [4 /*yield*/, defaultPersonalization(session_1)];
                    case 3:
                        account = (_a.personalization = _b.sent(),
                            _a.identity = {},
                            _a.serviceData = {},
                            _a.providers = [],
                            _a);
                        pronote.startPresenceInterval(session_1);
                        createStoredAccount(account);
                        switchTo(account);
                        setTimeout(function () {
                            setLoadingModalVisible(false);
                            queueMicrotask(function () {
                                // Reset the navigation stack to the "Home" screen.
                                // Prevents the user from going back to the login screen.
                                playSound(LEson);
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: "AccountCreated" }],
                                });
                            });
                        }, 1000);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        console.error(error_1);
                        showAlert({
                            title: "Erreur",
                            message: "Une erreur est survenue lors de la connexion.",
                            icon: <BadgeX />,
                        });
                        return [2 /*return*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    useEffect(function () {
        var getBarCodeScannerPermissions = function () { return __awaiter(void 0, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, BarCodeScanner.requestPermissionsAsync()];
                    case 1:
                        status = (_a.sent()).status;
                        setHasPermission(status === "granted");
                        return [2 /*return*/];
                }
            });
        }); };
        getBarCodeScannerPermissions();
    }, []);
    var handleBarCodeScanned = function (_a) {
        var type = _a.type, data = _a.data;
        setScanned(true);
        playHaptics("notification", {
            notification: Haptics.NotificationFeedbackType.Success,
        });
        setQRData(data);
        setPinModalVisible(true);
    };
    // on modal close, setScanned to false
    useEffect(function () {
        if (!pinModalVisible) {
            setScanned(false);
            setQRData(null);
        }
    }, [pinModalVisible]);
    var keyboardDidShow = function () { return setKeyboardOpen(true); };
    var keyboardDidHide = function () { return setKeyboardOpen(false); };
    useEffect(function () {
        Keyboard.addListener("keyboardDidShow", keyboardDidShow);
        Keyboard.addListener("keyboardDidHide", keyboardDidHide);
        return function () {
            Keyboard.removeAllListeners("keyboardDidShow");
            Keyboard.removeAllListeners("keyboardDidHide");
        };
    }, []);
    return (<SafeAreaView style={styles.container}>
      <Modal visible={loadingModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
        }}>
          <View style={{ flex: 1 }}/>

          <ActivityIndicator size="large"/>

          <Text style={{
            fontFamily: "semibold",
            color: colors.text,
            fontSize: 18,
            marginTop: 16,
        }}>
            Connexion en cours...
          </Text>

          <Text style={{
            fontFamily: "medium",
            color: colors.text + "80",
            fontSize: 16,
            marginTop: 4,
        }}>
            Cela peut prendre quelques instants...
          </Text>

          <View style={{ flex: 1 }}/>

          <View style={{
            width: "100%",
            paddingHorizontal: 16,
            paddingBottom: insets.bottom,
            gap: 8,
        }}>
            <ButtonCta value="Annuler" onPress={function () {
            setLoadingModalVisible(false);
            navigation.goBack();
        }}/>
          </View>
        </View>
      </Modal>

      <Modal visible={pinModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={function () {
            setPinModalVisible(!pinModalVisible);
        }}>
        <KeyboardAvoidingView style={{
            flex: 1,
            backgroundColor: colors.background,
        }} behavior="padding" keyboardVerticalOffset={insets.top}>
          <View style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
            gap: 10,
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderBottomColor: colors.border,
            borderBottomWidth: 0.5,
        }}>
            <QrCode size={24} color={colors.text}/>
            <Text style={{
            fontFamily: "semibold",
            color: colors.text,
            fontSize: 17,
        }}>
              Validation du QR code
            </Text>
          </View>

          {!keyboardOpen && (<Reanimated.View entering={FadeInUp.duration(250)} exiting={FadeOutUp.duration(150)} style={{
                zIndex: 9999,
                paddingTop: 100,
            }} layout={LinearTransition}>
              <PapillonShineBubble message="Indique le code à 4 chiffres que tu viens de créer sur PRONOTE" width={250} numberOfLines={3} noFlex/>
            </Reanimated.View>)}

          <View style={{
            flex: 1,
            alignItems: "center",
            marginBottom: "7%",
        }}>
            <ResponsiveTextInput style={{
            paddingHorizontal: 75,
            paddingVertical: 10,
            backgroundColor: colors.card,
            borderRadius: 12,
            fontFamily: "medium",
            color: colors.text,
            fontSize: 24,
            textAlign: "center",
            borderColor: colors.border,
            borderWidth: 2,
        }} placeholderTextColor={colors.text + "80"} placeholder="Code à 4 chiffres" keyboardType="number-pad" maxLength={4} secureTextEntry value={QRValidationCode} onChangeText={function (text) { return setQRValidationCode(text); }} ref={codeInput}/>
          </View>

          <View style={{
            width: "100%",
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 16,
            gap: 8,
        }}>
            <ButtonCta value="Confirmer" primary onPress={function () {
            setPinModalVisible(false);
            loginQR();
        }}/>
            <ButtonCta value="Annuler" onPress={function () {
            setPinModalVisible(false);
        }}/>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={[styles.explainations,
            { top: insets.top + 48 + 10 }
        ]}>
        <QrCode size={32} color={"#fff"}/>
        <Text style={styles.title}>
          Connexion à PRONOTE
        </Text>
        <Text style={styles.text}>
          Scanne le QR code de ton établissement pour te connecter.
        </Text>
      </View>

      <MaskedView style={StyleSheet.absoluteFillObject} maskElement={<View style={styles.maskContainer}>
            <View style={styles.transparentSquare}/>
          </View>}>
        <View style={styles.maskContainer}/>
        {hasPermission === true && (<BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject}/>)}
        {hasPermission === true && (<View style={styles.transparentSquareBorder}/>)}
      </MaskedView>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
    maskContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    transparentSquare: {
        position: "absolute",
        width: 300,
        height: 300,
        backgroundColor: "black",
        borderWidth: 2,
        borderColor: "#fff",
        borderRadius: 10,
        borderCurve: "continuous",
        alignSelf: "center",
        top: "30%",
    },
    transparentSquareBorder: {
        position: "absolute",
        width: 300,
        height: 300,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#fff",
        borderRadius: 10,
        borderCurve: "continuous",
        alignSelf: "center",
        top: "30%",
    },
    explainations: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 24,
        gap: 4,
        zIndex: 9999,
    },
    title: {
        fontFamily: "semibold",
        fontSize: 18,
        color: "white",
        textAlign: "center",
    },
    text: {
        fontFamily: "medium",
        fontSize: 16,
        color: "white",
        textAlign: "center",
        opacity: 0.8,
    },
});
export default PronoteQRCode;
