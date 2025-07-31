import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import * as Haptics from "expo-haptics";
import { useCurrentAccount } from "@/stores/account";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
var AccountCreated = function (_a) {
    var _b, _c;
    var navigation = _a.navigation;
    var account = useCurrentAccount(function (state) { return state.account; });
    var _d = useSoundHapticsWrapper(), playHaptics = _d.playHaptics, playSound = _d.playSound;
    var LEson5 = require("@/../assets/sound/5.wav");
    var LEson6 = require("@/../assets/sound/6.wav");
    var name = (!account || !((_b = account.studentName) === null || _b === void 0 ? void 0 : _b.first)) ? null
        : (_c = account.studentName) === null || _c === void 0 ? void 0 : _c.first;
    // Truncate name if over 10 characters.
    if (name && name.length > 10) {
        name = name.substring(0, 10) + "...";
    }
    var animationRef = useRef(null);
    var _e = useState(false), showAnimation = _e[0], setShowAnimation = _e[1];
    // show animation on focus
    useEffect(function () {
        var unsubscribe = navigation.addListener("focus", function () {
            setShowAnimation(true);
            // loop 20 times
            for (var i = 0; i < 15; i++) {
                setTimeout(function () {
                    playHaptics("impact", {
                        impact: Haptics.ImpactFeedbackStyle.Medium,
                    });
                }, i * 20);
            }
        });
        return unsubscribe;
    }, [navigation]);
    // hide animation on blur
    useEffect(function () {
        var unsubscribe = navigation.addListener("blur", function () {
            setShowAnimation(false);
        });
        return unsubscribe;
    }, [navigation]);
    return (<SafeAreaView style={styles.container}>
      <MaskStars />

      {showAnimation && (<LottieView ref={animationRef} source={require("@/../assets/lottie/confetti_1.json")} style={{
                width: Dimensions.get("window").width,
                height: Dimensions.get("window").height,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -200,
            }} autoPlay loop={false}/>)}

      <PapillonShineBubble message={name ? "Enchant\u00E9, ".concat(name, " ! On va personnaliser ton exp\u00E9rience !") : "Bienvenue sur Papillon !"} numberOfLines={name ? 2 : 1} width={260} style={{
            zIndex: 10,
        }}/>

      <View style={styles.buttons}>
        <ButtonCta value="Personnaliser Papillon" primary onPress={function () {
            navigation.navigate("ColorSelector");
            playSound(LEson5);
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
export default AccountCreated;
