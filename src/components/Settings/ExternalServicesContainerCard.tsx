import React from "react";

import { View } from "react-native";
import LottieView from "lottie-react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";

const ExternalServicesContainerCard = () => {

  return (
    <NativeList>
      <View style={{
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#FCF8E2",
      }}>
        <LottieView
          source={require("@/../assets/lottie/header_services.json")}
          style={{
            width: "100%",
            height: "100%",
          }}

          loop
          autoPlay
        />
      </View>
      <NativeItem>
        <NativeText variant="title">
          Services externes
        </NativeText>
        <NativeText variant="subtitle">
          Connecte tes services scolaires préférés et profite de l’interface de Papillon partout où tu vas.
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default ExternalServicesContainerCard;
