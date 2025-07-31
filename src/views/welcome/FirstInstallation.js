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
import React from "react";
import { Image, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import * as WebBrowser from "expo-web-browser";
var PRIVACY_POLICY_URL = "https://support.papillon.bzh/articles/352402-privacy-policy";
var TERMS_OF_SERVICE_URL = "https://support.papillon.bzh/articles/352401-terms-of-service";
var FirstInstallation = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var openUrl = function (url) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, WebBrowser.openBrowserAsync(url, {
                        controlsColor: colors.primary,
                        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return (<SafeAreaView style={styles.container}>
      <MaskStars />

      <PapillonShineBubble message="Bienvenue sur Papillon !" numberOfLines={1} width={220} offsetTop={"15%"}/>

      <View style={styles.presentation}>

        <Image source={require("../../../assets/images/mask_logotype.png")} style={styles.logotype} tintColor={colors.primary} resizeMode="contain"/>
        <Text style={[styles.presentation_text, { color: colors.text + "79" }]}>
          L’unique application pour gérer toute ta vie scolaire au même endroit !
        </Text>
      </View>

      <View style={styles.buttons}>
        <ButtonCta value="Commençons !" primary onPress={function () { return navigation.navigate("ServiceSelector"); }}/>

        <ButtonCta value="Besoin d'aide ?" onPress={function () { return openUrl("https://support.papillon.bzh/"); }}/>
      </View>
      <Text style={[styles.terms_text, { color: colors.text + "59" }]}>
        En continuant, tu acceptes les&nbsp;
        <Text style={{ textDecorationLine: "underline" }} onPress={function () { return openUrl(TERMS_OF_SERVICE_URL); }}>
          conditions d'utilisation
        </Text>
        &nbsp;et la&nbsp;
        <Text style={{ textDecorationLine: "underline" }} onPress={function () { return openUrl(PRIVACY_POLICY_URL); }}>
          politique de confidentialité
        </Text>.
      </Text>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        gap: 20,
        paddingBottom: 16,
    },
    presentation: {
        alignItems: "center",
        gap: 9,
        paddingHorizontal: 20,
    },
    logotype: {
        height: 28,
    },
    presentation_text: {
        fontSize: 16,
        textAlign: "center",
        fontFamily: "medium",
        marginHorizontal: 20,
    },
    buttons: {
        width: "100%",
        paddingHorizontal: 16,
        gap: 9,
    },
    terms_text: {
        fontSize: 12,
        lineHeight: 16,
        textAlign: "center",
        fontFamily: "medium",
        paddingHorizontal: 20,
    },
});
export default FirstInstallation;
