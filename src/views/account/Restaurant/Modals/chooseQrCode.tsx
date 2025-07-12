import React, { useEffect, useState } from "react";
import { Screen } from "@/router/helpers/types";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { QrCodeIcon, X, Eye } from "lucide-react-native";
import { useQrCodeStore } from "@/stores/QrCode";
import { QrCode as QrCodeType } from "@/stores/QrCode/types";
import QRCode from "react-native-qrcode-svg";
import { PressableScale } from "react-native-pressable-scale";
import Reanimated, { ZoomIn } from "react-native-reanimated";
import { anim2Papillon } from "@/utils/ui/animations";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Brightness from "expo-brightness";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { NativeIcon, NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";

const ChooseQrCode: Screen<"ChooseQrCode"> = ({ route, navigation }) => {
  const theme = useTheme();
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [selectedQrCode, setSelectedQrCode] = useState<QrCodeType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [defaultBrightness, setDefaultBrightness] = useState<number>(0.5);
  const { getAllQrCodes } = useQrCodeStore();
  const [savedQrCodes, setSavedQrCodes] = useState<QrCodeType[]>([]);
  const account = useCurrentAccount((store) => store.account);
  const userColor = account?.personalization?.color?.hex.primary || theme.colors.primary;

  useEffect(() => {
    const codes = getAllQrCodes();
    setSavedQrCodes(codes);
  }, []);

  useEffect(() => {
    const handleBrightness = async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted") {
        const currentBrightness = await Brightness.getBrightnessAsync();
        setDefaultBrightness(currentBrightness);
        Brightness.setSystemBrightnessAsync(1);
      }
    };

    if (isModalVisible) {
      handleBrightness();
    }

    const handleBeforeRemove = async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted" && defaultBrightness !== undefined) {
        Brightness.setSystemBrightnessAsync(defaultBrightness);
      }
    };

    if (isModalVisible) {
      const unsubscribe = () => {
        handleBeforeRemove();
      };

      return unsubscribe;
    }
  }, [isModalVisible, defaultBrightness]);

  const showQrCode = (item: QrCodeType) => {
    setSelectedQrCode(item);
    setQrCodeData(item.data);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    const restoreBrightness = async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted" && defaultBrightness !== undefined) {
        Brightness.setSystemBrightnessAsync(defaultBrightness);
      }
    };

    restoreBrightness();
    setIsModalVisible(false);
    setSelectedQrCode(null);
  };

  const renderQrCodeItem = ({ item }: { item: QrCodeType }) => {
    return (
      <View
        style={{
          padding: 10,
          marginBottom: 10,
          backgroundColor: theme.colors.card,
          borderRadius: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <NativeText variant="title">{item.name}</NativeText>
        <TouchableOpacity
          onPress={() => showQrCode(item)}
          style={{
            padding: 8,
            borderRadius: 4,
          }}
        >
          <NativeIcon
            icon={<Eye size={20} />}
            color={userColor}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const QrCodeModal = () => {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background + "50",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <BlurView
          style={{
            flex: 1,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          intensity={100}
          tint={theme.dark ? "dark" : "light"}
        >
          <Pressable
            style={{
              width: "100%",
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
            onPress={closeModal}
          >
            <Reanimated.View
              style={{
                marginBottom: 32,
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                maxWidth: 260,
              }}
            >
              <QrCodeIcon
                size={24}
                color={theme.colors.text}
              />

              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 15,
                  lineHeight: 20,
                  textAlign: "center",
                  fontFamily: "semibold",
                }}
              >
                {selectedQrCode?.name || "Approche le code QR du scanner pour l'utiliser"}
              </Text>
            </Reanimated.View>
          </Pressable>

          {qrCodeData && (
            <Reanimated.View
              entering={anim2Papillon(ZoomIn).delay(100)}
            >
              <PressableScale
                style={{
                  padding: 16,
                  backgroundColor: "white",
                  borderColor: theme.colors.text + "40",
                  borderWidth: 1,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 7,
                  elevation: 5,
                  borderRadius: 16,
                  borderCurve: "continuous",
                }}
                weight="light"
                activeScale={0.9}
              >
                <Reanimated.View
                  entering={anim2Papillon(ZoomIn).delay(200)}
                >
                  <QRCode
                    value={qrCodeData}
                    size={280}
                  />
                </Reanimated.View>
              </PressableScale>
            </Reanimated.View>
          )}

          <Pressable
            style={{
              width: "100%",
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center",
            }}
            onPress={closeModal}
          >
            <TouchableOpacity
              style={{
                marginTop: 32,
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: theme.colors.text + "20",
                borderRadius: 50,
                borderCurve: "continuous",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
              onPress={closeModal}
            >
              <X strokeWidth={2.6} size={20} color={theme.colors.text} />

              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 15,
                  lineHeight: 20,
                  textAlign: "center",
                  fontFamily: "semibold",
                }}
              >
                Fermer
              </Text>
            </TouchableOpacity>
          </Pressable>
        </BlurView>
      </View>
    );
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
      >
        <View style={{ marginTop: 24 }}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16
          }}>
            <NativeText
              variant="title"
              style={{ fontSize: 18 }}
            >
              QR Codes enregistrés
            </NativeText>
            {savedQrCodes.length > 0 && (
              <NativeText
                variant="body"
                style={{ color: theme.colors.text || "#666" }}
              >
                {savedQrCodes.length} {savedQrCodes.length === 1 ? "code" : "codes"}
              </NativeText>
            )}
          </View>

          {savedQrCodes.length === 0 ? (
            <View style={{
              padding: 20,
              alignItems: "center",
              backgroundColor: theme.colors.card,
              borderRadius: 8
            }}>
              <NativeIcon
                icon={<QrCodeIcon size={40} />}
                color="#CCCCCC"
                style={{ marginBottom: 12 }}
              />
              <NativeText
                variant="body"
                style={{ textAlign: "center", color: theme.colors.text || "#666" }}
              >
                Aucun QR code enregistré. Tu peut en ajouter dans les paramètres de Papillon.
              </NativeText>
            </View>
          ) : (
            savedQrCodes.map(code => (
              <React.Fragment key={code.data}>
                {renderQrCodeItem({ item: code })}
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        {QrCodeModal()}
      </Modal>
    </>
  );
};

export default ChooseQrCode;