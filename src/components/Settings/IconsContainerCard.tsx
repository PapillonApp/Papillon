import React, { useEffect } from "react";

import { Image, View } from "react-native";
import LottieView from "lottie-react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";

const IconsContainerCard = ({ theme }: { theme: any }) => {
  const animationref = React.useRef<LottieView>(null);

  useEffect(() => {
    animationref.current?.play();
  }, []);

  return (
    <NativeList>
      <View style={{
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "#FFE5EB",
      }}>
        <Image
          source={require("@/../assets/images/settings/icons_set.png")}
          style={{
            width: "90%",
            height: "90%",
            resizeMode: "contain",
            marginTop: 50,
          }}
        />
      </View>
      <NativeItem>
        <NativeText variant="title">
          Icône personnalisée
        </NativeText>
        <NativeText variant="subtitle">
          Choisis parmi une sélection d’icônes conçues par la communauté Papillon.
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default IconsContainerCard;
