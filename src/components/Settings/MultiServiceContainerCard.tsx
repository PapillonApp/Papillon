import React, { useState, useEffect } from "react";
import type { Screen } from "@/router/helpers/types";

import { ScrollView, Image, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
import { LinearGradient } from "expo-linear-gradient";
import BetaIndicator from "../News/Beta";

const MultiServiceContainerCard = ({ theme }: { theme: any }) => {
  const { colors } = theme;
  const animationref = React.useRef<LottieView>(null);

  useEffect(() => {
    animationref.current?.play();
  }, []);

  return (
    <NativeList>
      <LinearGradient
        colors={["#cb7712", "#dec46d"]}
      >
        <View style={{
          height: 200,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}>
          <NativeText>Maybe une image ici, là j'attend l'avis des #designers</NativeText>
          {/*<Image*/}
          {/*  source={require("@/../assets/images/settings/magic_header.png")}*/}
          {/*  style={{*/}
          {/*    width: "90%",*/}
          {/*    height: 230,*/}
          {/*    resizeMode: "contain",*/}
          {/*    marginTop: 75,*/}
          {/*  }}*/}
          {/*/>*/}
        </View>
      </LinearGradient>
      <NativeItem>
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <NativeText variant="title">
            Activer le multi service
          </NativeText>
          <BetaIndicator colors={["#cb7712", "#dec46d"]} />
        </View>
        <NativeText variant="subtitle">
          Rassemble tes services scolaires en un espace virtuel unique, géré par Papillon.
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default MultiServiceContainerCard;