import React, { useEffect, useState } from "react";
import { ScrollView, View, Alert, TouchableOpacity, StyleSheet, Modal, Text } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useGradesStore } from "@/stores/grades";
import QrCodeContainerCard from "@/components/Settings/QrCodeContainerCard";
import {
  NativeList,
  NativeIcon,
  NativeItem,
  NativeText,
} from "@/components/Global/NativeComponents";
import { Camera, Image, QrCodeIcon, Trash2, QrCode  } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useCameraPermissions } from "expo-camera";
import { useQrCodeStore } from "@/stores/QrCode";
import { QrCode as QrCodeType } from "@/stores/QrCode/types";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import * as Haptics from "expo-haptics";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BarCodeScanner as ExpoBarCodeScanner } from "expo-barcode-scanner";
import MaskedView from "@react-native-masked-view/masked-view";



const SettingsQrCode: Screen<"SettingsQrCode"> = ({
  navigation,
}) => {
  const theme = useTheme();
  const reelsObject = useGradesStore((store) => store.reels);
  const reels = Object.values(reelsObject);
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const { addQrCode, getAllQrCodes, removeQrCode } = useQrCodeStore();
  const [savedQrCodes, setSavedQrCodes] = useState<QrCodeType[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannerModalVisible, setScannerModalVisible] = useState(false);
  const { playHaptics, playSound } = useSoundHapticsWrapper();



  useEffect(() => {
    const codes = getAllQrCodes();
    setSavedQrCodes(codes);
    const unsubscribe = navigation.addListener("focus", () => {
      loadQrCodes();
    });

    const getBarCodeScannerPermissions = async () => {
      const { status } = await ExpoBarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getBarCodeScannerPermissions();
    return unsubscribe;
  }, []);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    playHaptics("notification", {
      notification: Haptics.NotificationFeedbackType.Success,
    });
    setScannerModalVisible(false);
    navigation.navigate("SettingsNameQrCode", { data });
  };

  const openScanner = async () => {
    if (hasPermission) {
      setScannerModalVisible(true);
      setScanned(false);
    } else {
      const { status } = await ExpoBarCodeScanner.requestPermissionsAsync();
      if (status === "granted") {
        setHasPermission(true);
        setScannerModalVisible(true);
        setScanned(false);
      } else {
        Alert.alert("Permission refusée", "Merci d'autoriser Papillon à accéder à ta caméra pour scanner ton QrCode.");
      }
    }
  };

  // on modal close, setScanned to false
  useEffect(() => {
    if (!scannerModalVisible) {
      setScanned(false);
    }
  }, [scannerModalVisible]);

  const loadQrCodes = () => {
    const codes = getAllQrCodes();
    setSavedQrCodes(codes);
  };

  const addQrCodePic = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      try {
        const scannedResults = await ExpoBarCodeScanner.scanFromURLAsync(result.assets[0].uri);
        if (scannedResults && scannedResults.length > 0) {
          const data = scannedResults[0].data;
          setQrCodeData(data);
          navigation.navigate("SettingsNameQrCode", { data });
        } else {
          Alert.alert("Erreur : Aucun QR code trouvé", "L'image ne contient pas de QR code valide.");
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de lire le QR code depuis cette image.");
      }
    }
  };

  const deleteQrCode = (id: string) => {
    removeQrCode(id);
    loadQrCodes();
    Alert.alert("QR Code supprimé", "Le QR code a été supprimé avec succès.");
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
          onPress={() => deleteQrCode(item.id)}
          style={{
            padding: 8,
            borderRadius: 4,
          }}
        >
          <NativeIcon
            icon={<Trash2 size={20} />}
            color="#FF3B30"
          />
        </TouchableOpacity>
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
        <QrCodeContainerCard theme={theme} />
        <NativeList>
          <NativeItem
            onPress={() => addQrCodePic()}
            leading={
              <NativeIcon
                icon={<Image />}
                color={"#006B6B"}
              />}
          >
            <NativeText variant="title">Depuis une image</NativeText>
          </NativeItem>
          <NativeItem
            onPress={openScanner}
            leading={
              <NativeIcon
                icon={<Camera />}
                color={"#006B6B"}
              />}
          >
            <NativeText variant="title">Scanner le QrCode</NativeText>
          </NativeItem>
        </NativeList>

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
                Aucun QR code enregistré.
              </NativeText>
            </View>
          ) : (
            savedQrCodes.map(code => (
              <React.Fragment key={code.id}>
                {renderQrCodeItem({ item: code })}
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={scannerModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setScannerModalVisible(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={[styles.explainations, { top: insets.top + 48 + 10 }]}>
            <QrCode size={32} color={"#fff"} />
            <Text style={styles.title}>
              Scanner un QR Code
            </Text>
            <Text style={styles.text}>
              Positionne ton QrCode dans le cadre pour l'ajouter !
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 16 }]}
            onPress={() => setScannerModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>

          <MaskedView
            style={StyleSheet.absoluteFillObject}
            maskElement={
              <View style={styles.maskContainer}>
                <View style={styles.transparentSquare} />
              </View>
            }
          >
            <View
              style={styles.maskContainer}
            />
            {hasPermission === true && (
              <ExpoBarCodeScanner
                onBarCodeScanned={
                  scanned ? undefined : handleBarCodeScanned
                }
                style={StyleSheet.absoluteFillObject}
              />
            )}
            {hasPermission === true && (
              <View style={styles.transparentSquareBorder} />
            )}
          </MaskedView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  maskContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  transparentSquare: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "black",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    borderCurve: "continuous",
    alignSelf: "center",
    top: "30%",
  },
  transparentSquareBorder: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    borderCurve: "continuous",
    alignSelf: "center",
    top: "30%",
  },
  explainations: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    gap: 4,
    zIndex: 9999,
  },
  title: {
    fontFamily: "semibold",
    fontSize: 18,
    color: "white",
    textAlign: "center",
  },
  text: {
    fontFamily: "medium",
    fontSize: 16,
    color: "white",
    textAlign: "center",
    opacity: 0.8,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    zIndex: 10000,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "white",
    fontFamily: "medium",
    fontSize: 16,
  },
});

export default SettingsQrCode;