import React, { useState, useEffect } from "react";
import type { Screen } from "@/router/helpers/types";

import { ScrollView, Image, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";

const SubjectContainerCard = ({ theme }: { theme: any }) => {
  const { colors } = theme;

  return (
    <NativeList>
      <View style={{
        height: 140,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: colors.primary + "22",
      }}>
        <Image
          source={require("@/../assets/images/settings/personalization_palette.png")}
          style={{
            width: "80%",
            height: "80%",
            resizeMode: "contain",
          }}
        />
      </View>
      <NativeItem>
        <NativeText variant="title">
          Personnalisez vos matières
        </NativeText>
        <NativeText variant="subtitle">
          Personnalisez le nom, l'émoji et la couleur des matières de votre emploi du temps
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default SubjectContainerCard;