import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { NativeList, NativeText } from "@/components/Global/NativeComponents";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ArrowUpRight } from "lucide-react-native";
import { useCurrentAccount } from "@/stores/account";
import { PapillonNavigation } from "@/router/refs";
import { animPapillon } from "@/utils/ui/animations";
import { FadeIn, FadeOutUp } from "react-native-reanimated";
var PopupRestauration = function (_a) {
    var _b;
    var onImportance = _a.onImportance;
    var colors = useTheme().colors;
    var account = useCurrentAccount(function (store) { return store.account; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var ImportanceHandler = function () {
        var hours = new Date().getHours();
        if (hours >= 11 && hours < 14)
            onImportance(10);
        else
            onImportance(2);
    };
    if (((_b = account.personalization) === null || _b === void 0 ? void 0 : _b.popupRestauration) === false) {
        return null;
    }
    useEffect(function () {
        ImportanceHandler();
    }, []);
    return (<NativeList inline animated entering={animPapillon(FadeIn)} exiting={animPapillon(FadeOutUp)}>
      <View style={[styles.container, { borderColor: colors.border }]}>
        <View style={styles.imageContainer}>
          <Image source={require("@/../assets/images/service_turboself.png")} style={[styles.image, styles.frontImage]}/>
          <Image source={require("@/../assets/images/service_ard.png")} style={styles.image}/>
        </View>
        <View style={styles.textContainer}>
          <NativeText style={styles.title}>
            Configure ton service de self
          </NativeText>
          <NativeText style={styles.subtitle}>
            Scanne ta carte, gère ton solde et consulte le menu sans quitter Papillon
          </NativeText>
        </View>
        <View style={styles.buttonContainer}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.configureButton} onPress={function () { var _a; return (_a = PapillonNavigation.current) === null || _a === void 0 ? void 0 : _a.navigate("SettingStack"); }}>
              <NativeText style={styles.configureButtonText}>Configurer</NativeText>
              <ArrowUpRight color="white"/>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.ignoreButton} onPress={function () { return mutateProperty("personalization", { popupRestauration: false }); }}>
            <NativeText style={styles.ignoreButtonText}>Ignorer</NativeText>
          </TouchableOpacity>
        </View>
      </View>
    </NativeList>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E2FBFC",
        padding: 15,
        borderWidth: 0,
    },
    imageContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    image: {
        width: 37,
        height: 37,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: "#00000022",
    },
    frontImage: {
        marginRight: -10,
        zIndex: 1,
    },
    textContainer: {
        gap: 2,
    },
    title: {
        fontSize: 18,
        fontFamily: "semibold",
        marginTop: 10,
        color: "#006B6B",
    },
    subtitle: {
        fontSize: 16,
        color: "#006B6B90",
    },
    buttonContainer: {
        flexDirection: "row",
        marginTop: 16,
        flex: 1,
    },
    configureButton: {
        backgroundColor: "#006B6B",
        padding: 10,
        flex: 1,
        borderRadius: 100,
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    configureButtonText: {
        color: "#FFF",
        fontFamily: "semibold",
    },
    ignoreButton: {
        flex: 1,
        backgroundColor: "#FFF",
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    ignoreButtonText: {
        color: "#006B6B",
        fontFamily: "semibold",
    },
});
export default PopupRestauration;
