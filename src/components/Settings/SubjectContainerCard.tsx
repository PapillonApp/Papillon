import React from "react";

import { Image, View } from "react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
import { useTranslation } from "react-i18next";

const SubjectContainerCard = ({ theme }: { theme: any }) => {
  const { colors } = theme;
  const { t } = useTranslation();

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
          {t("settings.sections.customization.subjects.captionTitle")}
        </NativeText>
        <NativeText variant="subtitle">
          {t("settings.sections.customization.subjects.captionMessage")}
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default SubjectContainerCard;