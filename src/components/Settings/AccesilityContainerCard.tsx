import React from "react";

import { View } from "react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";

const AccessibilityContainerCard = () => {
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
        <NativeText style={{ fontSize: 75, lineHeight: 125 }}>🖌️</NativeText>
      </View>
      <NativeItem>
        <NativeText variant="title">Personnalise à ta manière</NativeText>
        <NativeText variant="subtitle">
          Adapte l'affichage et la navigation entre les pages
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default AccessibilityContainerCard;
