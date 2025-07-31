import React from "react";
import { Image, View } from "react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
var AboutContainerCard = function (_a) {
    var theme = _a.theme;
    var colors = theme.colors;
    return (<NativeList>
      <View style={{
            height: 120,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            backgroundColor: colors.primary + "22",
        }}>
        <Image source={require("@/../assets/images/settings/about_papillon.png")} style={{
            width: "90%",
            height: "90%",
            resizeMode: "contain",
            marginTop: 30,
        }}/>
      </View>
      <NativeItem>
        <NativeText variant="title">
          Derrière Papillon
        </NativeText>
        <NativeText variant="subtitle">
          Papillon est maintenu par des étudiants 100% bénévoles.
        </NativeText>
      </NativeItem>
    </NativeList>);
};
export default AboutContainerCard;
