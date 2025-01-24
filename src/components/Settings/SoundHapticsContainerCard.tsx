import React from "react";

import { View } from "react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";

const ApparenceContainerCard = () => {
  return (
    <NativeList>
      <View
        style={{
          height: 120,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          backgroundColor: "#1E316A22",
          flexDirection: "row",
        }}
      >
        <NativeText style={{ fontSize: 75, lineHeight: 125 }}>🔊</NativeText>
      </View>
      <NativeItem>
        <NativeText variant="title">Son et vibrations</NativeText>
        <NativeText variant="subtitle">
          Par défaut, Papillon joue des sons et des vibrations mais cela peut être changé.
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default ApparenceContainerCard;
