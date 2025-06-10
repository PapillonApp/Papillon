import React from "react";

import { View } from "react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
import { QrCode } from "lucide-react-native";

const QrCodeContainerCard = ({ theme }: { theme: any }) => {
  const { colors } = theme;

  return (
    <NativeList>
      <View style={{
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: colors.primary + "22",
      }}>
        <QrCode
          color={colors.primary}
          size={80}
        />
      </View>
      <NativeItem>
        <NativeText variant="title">
          Ajouter un QR Code de Cantine
        </NativeText>
        <NativeText variant="subtitle">
          Ajoute ton QR Code de cantine pour le scanner directement depuis Papillon.
        </NativeText>
      </NativeItem>
    </NativeList>
  );
};

export default QrCodeContainerCard;