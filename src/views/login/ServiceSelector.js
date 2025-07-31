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
import React, { memo, useEffect, useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Reanimated, { LinearTransition, FlipInXDown } from "react-native-reanimated";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import GetV6Data from "@/utils/login/GetV6Data";
import { Check, School, WifiOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAlert } from "@/providers/AlertProvider";
var ServiceSelector = function (_a) {
    var _b;
    var navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var isOnline = useOnlineStatus().isOnline;
    var showAlert = useAlert().showAlert;
    var _c = useState(null), service = _c[0], setService = _c[1];
    var _d = useState(null), v6Data = _d[0], setV6Data = _d[1];
    var playSound = useSoundHapticsWrapper().playSound;
    var LEson = require("@/../assets/sound/1.wav");
    useEffect(function () {
        setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
            var v6Data, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, GetV6Data()];
                    case 1:
                        v6Data = _a.sent();
                        setV6Data(v6Data);
                        if (v6Data.restore && !v6Data.imported) {
                            data = {
                                username: v6Data.data.username || "",
                                deviceUUID: v6Data.data.deviceUUID || "",
                                instanceUrl: v6Data.data.instanceUrl || "",
                                nextTimeToken: v6Data.data.nextTimeToken || ""
                            };
                            navigation.navigate("PronoteV6Import", { data: data });
                        }
                        return [2 /*return*/];
                }
            });
        }); }, 1);
    }, []);
    var services = [
        {
            name: "pronote",
            title: "PRONOTE",
            image: require("../../../assets/images/service_pronote.png"),
            login: function () {
                navigation.navigate("PronoteAuthenticationSelector");
                playSound(LEson);
            },
        },
        {
            name: "ed",
            title: "ÉcoleDirecte",
            image: require("../../../assets/images/service_ed.png"),
            login: function () {
                navigation.navigate("EcoleDirecteCredentials");
                playSound(LEson);
            }
        },
        {
            name: "skolengo",
            title: "Skolengo",
            image: require("../../../assets/images/service_skolengo.png"),
            login: function () {
                navigation.navigate("SkolengoAuthenticationSelector");
                playSound(LEson);
            }
        },
        {
            name: "university",
            title: "Enseignement supérieur",
            subtitle: "Universités, IUT, écoles, etc.",
            image: require("../../../assets/images/service_skolengo.png"),
            icon: <School />,
            login: function () {
                navigation.navigate("IdentityProviderSelector");
                playSound(LEson);
            }
        },
    ];
    return (<SafeAreaView style={styles.container}>
      <MaskStars />

      <PapillonShineBubble message="Pour commencer, quel est ton service scolaire ?" numberOfLines={2} width={260} offsetTop={"20%"}/>

      <View style={{
            width: "100%",
            flex: 1,
            alignItems: "center",
            marginTop: -36,
            zIndex: 1000,
        }}>
        <LinearGradient colors={[colors.background, colors.background + "00"]} style={{
            width: "100%",
            height: 40,
            position: "absolute",
            top: 0,
            zIndex: 100,
        }}/>

        <LinearGradient colors={[colors.background + "00", colors.background]} style={{
            width: "100%",
            height: 40,
            position: "absolute",
            bottom: 0,
            zIndex: 100,
        }}/>

        <Reanimated.ScrollView style={styles.list} contentContainerStyle={{
            alignItems: "center",
            gap: 9,
            paddingHorizontal: 20,
            paddingTop: 30,
            paddingBottom: 60,
        }} layout={LinearTransition}>
          {services.map(function (srv, i) { return (<Reanimated.View style={{ width: "100%" }} layout={LinearTransition} entering={FlipInXDown.springify().delay(100 * i)} key={srv.name}>
              <DuoListPressable key={srv.name} leading={srv.icon ?
                <View style={{
                        opacity: srv.name === service ? 1 : 0.5,
                        padding: 3,
                    }}>
                      {React.cloneElement(srv.icon, { size: 26, strokeWidth: 2.5, color: srv.name === service ? colors.primary : colors.text })}
                    </View>
                :
                    <Image source={srv.image} style={styles.image} resizeMode="contain"/>} text={srv.title} subtext={srv.subtitle} enabled={srv.name === service} onPress={function () { return setService(srv.name); }}/>
            </Reanimated.View>); })}
        </Reanimated.ScrollView>
      </View>

      <View style={styles.buttons}>
        <ButtonCta primary value="Confirmer" disabled={service === null} onPress={isOnline
            ? (_b = services.find(function (srv) { return srv.name === service; })) === null || _b === void 0 ? void 0 : _b.login
            : function () {
                showAlert({
                    title: "Information",
                    message: "Pour poursuivre la connexion, tu dois être connecté à Internet. Vérifie ta connexion Internet et réessaie",
                    icon: <WifiOff />,
                    actions: [
                        {
                            title: "OK",
                            icon: <Check />,
                        },
                    ],
                });
            }}/>

        {v6Data && v6Data.restore && (<ButtonCta value="Importer mon compte" onPress={function () { return navigation.navigate("PronoteV6Import", { data: v6Data.data }); }}/>)}
      </View>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        gap: 20,
    },
    list: {
        flex: 1,
        width: "100%",
    },
    buttons: {
        width: "100%",
        paddingHorizontal: 16,
        gap: 9,
        marginBottom: 16,
    },
    image: {
        width: 32,
        height: 32,
        borderRadius: 80,
    },
});
export default memo(ServiceSelector);
