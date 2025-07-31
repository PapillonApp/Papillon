import React from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { BellRing } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, View, StyleSheet, Text } from "react-native";
import { NativeText, } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { TouchableOpacity } from "react-native-gesture-handler";
import BetaIndicator from "@/components/News/Beta";
var PriceDetectionOnboarding = function (_a) {
    var _b;
    var navigation = _a.navigation, route = _a.route;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var accountID = (_b = route.params) === null || _b === void 0 ? void 0 : _b.accountID;
    return (<View style={styles.container}>
      <View style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 200,
        }}>
        <BetaIndicator />
      </View>
      <Image source={require("@/../assets/images/scanner_cantine.png")} style={{
            width: 420,
            height: 420,
            marginTop: insets.top - 40,
            marginLeft: insets.left - 200,
        }} resizeMode="contain"/>
      <View style={{
            width: "100%",
            paddingHorizontal: 20,
            marginTop: -20,
        }}>
        <Text style={{
            fontSize: 24,
            fontFamily: "semibold",
        }}>Détection du prix des repas</Text>
        <NativeText>Papillon détecte automatiquement le prix de ton repas et te montre combien de repas il te reste selon ton solde. Pour démarrer, tu dois pouvoir scanne ton QR-Code au self.</NativeText>
      </View>
      <View style={{
            gap: 20,
        }}>
        <TouchableOpacity onPress={function () { return navigation.navigate("PriceBeforeScan", { accountID: accountID }); }} style={{
            backgroundColor: "#006B6B",
            marginTop: 20,
            borderRadius: 100,
            paddingVertical: 15,
            paddingHorizontal: 90,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        }}>
          <BellRing color={"#fff"} size={"20"}/>
          <Text style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: "#fff",
        }}>
            Me rappeler & midi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={function () { return navigation.navigate("PriceBeforeScan", { accountID: accountID }); }} style={{
            alignItems: "center",
        }}>
          <Text style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: "#006B6B",
        }}>Continuer quand même</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={function () {
            navigation.goBack();
            navigation.goBack();
            navigation.goBack();
            navigation.goBack();
            mutateProperty("personalization", { popupRestauration: false });
        }} style={{
            alignItems: "center",
        }}>
          <Text style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: colors.text + "80",
        }}>Ignorer</Text>
        </TouchableOpacity>

      </View>
    </View>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    list: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        gap: 9,
        paddingHorizontal: 20,
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
export default PriceDetectionOnboarding;
