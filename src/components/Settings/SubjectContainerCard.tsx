import React from "react";

import { Image, View } from "react-native";
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
          Personnalise tes matières
        </NativeText>
        <NativeText variant="subtitle">
          Personnalise le nom, l'émoji et la couleur des matières de ton emploi du temps
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default SubjectContainerCard;