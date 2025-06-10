import React, { useState } from "react";
import type { Screen } from "@/router/helpers/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  View,
} from "react-native";
import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { useQrCodeStore } from "@/stores/QrCode";
import { QrCode } from "@/stores/QrCode/types";




const SettingsNameQrCode: Screen<"SettingsNameQrCode"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data } = route.params;
  const { addQrCode, getAllQrCodes } = useQrCodeStore();
  const [qrCodeName, setQrCodeName] = React.useState<string | null>(null);
  const [savedQrCodes, setSavedQrCodes] = useState<QrCode[]>([]);



  const loadQrCodes = () => {
    const codes = getAllQrCodes();
    setSavedQrCodes(codes);
  };

  const addQrCodeAction = () => {
    if (qrCodeName) {
      addQrCode(qrCodeName, data);
      loadQrCodes();
      navigation.navigate("SettingsQrCode");
    } else {
      Alert.alert("Erreur", "Le nom du QrCode ne peut pas être vide.");
    }
  };


  return (
    <KeyboardAvoidingView
      behavior="height"
      keyboardVerticalOffset={insets.top + 64}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        overflow: "visible",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          overflow: "visible",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 14,
            margin: 4,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 1,
              gap: 2,
            }}
          >
            <NativeText
              style={{
                fontSize: 16,
                fontFamily: "medium",
                opacity: 0.5,
              }}
            >
              Nomme ton QrCode :
            </NativeText>
          </View>
        </View>

        <NativeList>
          <NativeItem>
            <ResponsiveTextInput
              placeholder={"Le nom de ton QrCode"}
              placeholderTextColor={theme.colors.text + "55"}
              style={{
                fontSize: 16,
                fontFamily: "medium",
                flex: 1,
                color: theme.colors.text,
              }}
              onChangeText={(text) => setQrCodeName(text)}
            />
          </NativeItem>
        </NativeList>

        <ButtonCta
          primary
          value="Ajouter mon QrCode"
          onPress={addQrCodeAction}
          style={{
            marginTop: 24,
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SettingsNameQrCode;
