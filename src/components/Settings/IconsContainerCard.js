import React, { useEffect } from "react";
import { Image, View } from "react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
var IconsContainerCard = function (_a) {
    var theme = _a.theme;
    var colors = theme.colors;
    var animationref = React.useRef(null);
    useEffect(function () {
        var _a;
        (_a = animationref.current) === null || _a === void 0 ? void 0 : _a.play();
    }, []);
    return (<NativeList>
      <View style={{
            height: 120,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            backgroundColor: "#FFE5EB",
        }}>
        <Image source={require("@/../assets/images/settings/icons_set.png")} style={{
            width: "90%",
            height: "90%",
            resizeMode: "contain",
            marginTop: 50,
        }}/>
      </View>
      <NativeItem>
        <NativeText variant="title">
          Icône personnalisée
        </NativeText>
        <NativeText variant="subtitle">
          Choisis parmi une sélection d’icônes conçues par la communauté Papillon.
        </NativeText>
      </NativeItem>
    </NativeList>);
};
export default IconsContainerCard;
