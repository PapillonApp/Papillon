import React from "react";

import { View } from "react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";

const ApparenceContainerCard = () => {
  return (
    <NativeList>
      <View style={{
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#1E316A22",
        flexDirection: "row",
      }}>
        <NativeText style={{fontSize: 100, lineHeight: 125}}>
          🌓
        </NativeText>
      </View>
      <NativeItem>
        <NativeText variant="title">
          Mode d'affichage
        </NativeText>
        <NativeText variant="subtitle">
          Par défaut, Papillon s'adapte à votre thème système. Mais vous pouvez choisir un thème clair ou sombre.
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default ApparenceContainerCard;