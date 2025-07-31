import React, { useEffect } from "react";
import type { Screen } from "@/router/helpers/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { QrCode } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import { ExternalAccount } from "@/stores/account/types";
import { useAccounts } from "@/stores/account";
import { BarCodeScanner } from "expo-barcode-scanner";
import MaskedView from "@react-native-masked-view/masked-view";
import * as Haptics from "expo-haptics";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";

type Props = {
  navigation: any;
  route: { params: { accountID: string } };
};

const QrcodeScanner: Screen<"QrcodeScanner"> = ({ navigation, route }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const update = useAccounts(store => store.update);
  const accountID = route.params?.accountID;
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
  const [scanned, setScanned] = React.useState(false);
  const { playHaptics } = useSoundHapticsWrapper();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getBarCodeScannerPermissions();
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
    update<ExternalAccount>(accountID, "data", { "qrcodedata": data, "qrcodetype": type });
    navigation.navigate("PriceDetectionOnboarding", { accountID });
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View style={[styles.explainations,
        { top: insets.top + 20 }
      ]}>
        <QrCode size={32} color={"#fff"} />
        <Text style={styles.title}>
          Associe ton QR Code à ton compte
        </Text>
        <Text style={styles.text}>
          Scanne le QR code de ton self pour le lier à ton compte
        </Text>
      </View>

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
          <BarCodeScanner
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
});


export default QrcodeScanner;
