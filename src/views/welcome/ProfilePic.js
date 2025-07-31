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
import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Reanimated, { FadeOut, LinearTransition, ZoomIn } from "react-native-reanimated";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { useCurrentAccount } from "@/stores/account";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Camera, Trash } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
var ProfilePic = function (_a) {
    var _b, _c;
    var navigation = _a.navigation;
    var account = useCurrentAccount(function (state) { return state.account; });
    var mutateProperty = useCurrentAccount().mutateProperty;
    var theme = useTheme();
    var _d = useSoundHapticsWrapper(), playHaptics = _d.playHaptics, playSound = _d.playSound;
    var LEson5 = require("@/../assets/sound/5.wav");
    var LEson6 = require("@/../assets/sound/6.wav");
    var hasProfilePic = account && (account === null || account === void 0 ? void 0 : account.personalization) && (account === null || account === void 0 ? void 0 : account.personalization.profilePictureB64) !== undefined && (account === null || account === void 0 ? void 0 : account.personalization.profilePictureB64.trim()) !== "";
    var _e = React.useState(false), loadingPic = _e[0], setLoadingPic = _e[1];
    var updateProfilePic = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, img;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoadingPic(true);
                    return [4 /*yield*/, ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 1,
                            base64: true,
                        })];
                case 1:
                    result = _a.sent();
                    if (!result.canceled) {
                        img = "data:image/jpeg;base64," + result.assets[0].base64;
                        mutateProperty("personalization", __assign(__assign({}, account.personalization), { profilePictureB64: img }), true);
                    }
                    setLoadingPic(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var name = (!account || !((_b = account.studentName) === null || _b === void 0 ? void 0 : _b.first)) ? null
        : (_c = account.studentName) === null || _c === void 0 ? void 0 : _c.first;
    // Truncate name if over 10 characters.
    if (name && name.length > 10) {
        name = name.substring(0, 10) + "...";
    }
    return (<SafeAreaView style={styles.container}>
      <MaskStars />

      <View style={{ height: 48 }}/>

      <PapillonShineBubble message={name ? "Tr\u00E8s bon choix, ".concat(name, " ! Maintenant, une petite photo ?") : "Ajouter une photo de profil ?"} numberOfLines={name ? 2 : 1} width={260} style={{
            zIndex: 10,
        }} noFlex/>

      <Reanimated.View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Reanimated.View layout={animPapillon(LinearTransition)}>
          <Pressable onPress={function () { updateProfilePic(); }} style={function (state) { return [
            styles.profilePicContainer,
            {
                borderColor: theme.colors.text + "33",
                borderWidth: 1,
                marginTop: -100,
            },
            state.pressed && {
                opacity: 0.5,
            },
        ]; }}>
            {loadingPic ? (<PapillonSpinner size={100} strokeWidth={5} color={theme.colors.primary} style={{ opacity: 0.5 }}/>) : hasProfilePic ? (<Reanimated.Image source={{ uri: account.personalization.profilePictureB64 }} style={{ width: "100%", height: "100%", borderRadius: 200, overflow: "hidden" }} entering={animPapillon(ZoomIn)} exiting={FadeOut.duration(100)}/>) : (<Reanimated.View entering={animPapillon(ZoomIn)} exiting={FadeOut.duration(100)}>
                <Camera size={100} strokeWidth={1} color={theme.colors.text} style={{ opacity: 0.5 }}/>
              </Reanimated.View>)}
          </Pressable>
        </Reanimated.View>

        {hasProfilePic && (<Reanimated.View layout={animPapillon(LinearTransition)}>
            <TouchableOpacity onPress={function () {
                mutateProperty("personalization", __assign(__assign({}, account.personalization), { profilePictureB64: undefined }), true);
            }} style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 24,
            }}>
              <Trash size={20} strokeWidth={2} color={theme.colors.primary}/>

              <NativeText style={{
                color: theme.colors.primary,
                fontSize: 15,
                fontFamily: "semibold",
            }}>
                Supprimer la photo
              </NativeText>
            </TouchableOpacity>
          </Reanimated.View>)}
      </Reanimated.View>

      <View style={styles.buttons}>
        <ButtonCta value="Magnifique !" disabled={!hasProfilePic} primary onPress={function () {
            navigation.navigate("AccountStack", { onboard: true });
            playSound(LEson6);
        }}/>
        <ButtonCta value="Ignorer cette étape" onPress={function () {
            navigation.navigate("AccountStack", { onboard: true });
            playSound(LEson6);
        }}/>
      </View>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        gap: 20,
    },
    profilePicContainer: {
        width: 180,
        height: 180,
        borderRadius: 200,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    buttons: {
        width: "100%",
        paddingHorizontal: 16,
        gap: 9,
        marginBottom: 16,
    },
    terms_text: {
        fontSize: 12,
        textAlign: "center",
        fontFamily: "medium",
        paddingHorizontal: 20,
    },
});
export default ProfilePic;
