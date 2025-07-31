import React, { useEffect } from "react";
import { Image, View } from "react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
import { LinearGradient } from "expo-linear-gradient";
import BetaIndicator from "../News/Beta";
var MagicContainerCard = function (_a) {
    var theme = _a.theme;
    var colors = theme.colors;
    var animationref = React.useRef(null);
    useEffect(function () {
        var _a;
        (_a = animationref.current) === null || _a === void 0 ? void 0 : _a.play();
    }, []);
    return (<NativeList>
      <LinearGradient colors={["#04ACDC", "#6FE3CD"]}>
        <View style={{
            height: 200,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
        }}>
          <Image source={require("@/../assets/images/settings/magic_header.png")} style={{
            width: "90%",
            height: 230,
            resizeMode: "contain",
            marginTop: 75,
        }}/>
        </View>
      </LinearGradient>
      <NativeItem>
        <View style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
        }}>
          <NativeText variant="title">
            Activer Papillon Magic
          </NativeText>
          <BetaIndicator />
        </View>
        <NativeText variant="subtitle">
          Optimise ta gestion scolaire et consacre-toi aux choses qui comptent vraiment.
        </NativeText>
      </NativeItem>
    </NativeList>);
};
export default MagicContainerCard;
