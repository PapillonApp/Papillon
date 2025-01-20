import React from "react";

import { View } from "react-native";
import LottieView from "lottie-react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
import { useTranslation } from "react-i18next";

const ExternalServicesContainerCard = ({ theme }: { theme: any }) => {
  const { colors } = theme;
  const { t } = useTranslation();

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
          {t("settings.sections.general.externalServices.captionTitle")}
        </NativeText>
        <NativeText variant="subtitle">
          {t("settings.sections.general.externalServices.captionMessage")}
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default ExternalServicesContainerCard;