import React, { useEffect } from "react";

import { Image, View } from "react-native";
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
        colors={["#1f76ce", "#56cbfe"]}
      >
        <View style={{
          height: 150,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}>
          <Image
            source={require("@/../assets/images/settings/multiservice.png")}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "cover",
            }}
          />
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
          <BetaIndicator colors={["#1f76ce", "#56cbfe"]} />
        </View>
        <NativeText variant="subtitle">
          Rassemble tes services scolaires en un espace virtuel unique, géré par Papillon.
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default MultiServiceContainerCard;
