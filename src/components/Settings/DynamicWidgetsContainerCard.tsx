import React, { useEffect } from "react";

import { Image, View } from "react-native";
import LottieView from "lottie-react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
import { LinearGradient } from "expo-linear-gradient";
import BetaIndicator from "../News/Beta";

const DynamicWidgetsContainerCard = ({ theme }: { theme: any }) => {
  const { colors } = theme;
  const animationref = React.useRef<LottieView>(null);

  useEffect(() => {
    animationref.current?.play();
  }, []);

  return (
    <NativeList>
      <LinearGradient
        colors={["#ba00f1", "#8900f5"]}
      >
        <View style={{
          height: 200,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}>
          <Image
            source={require("@/../assets/images/settings/dynamic_widgets.png")}
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
            Dynamics Widgets
          </NativeText>
          <BetaIndicator
            colors={["#ce4ff5", "#8900f5"]}
          />
        </View>
        <NativeText variant="subtitle">
          Choisis les widgets à afficher sur ton écran d'accueil.
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default DynamicWidgetsContainerCard;
