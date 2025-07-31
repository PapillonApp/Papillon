import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import QRCode from "react-native-qrcode-svg";
import Barcode from "react-native-barcode-svg";
import { useAccounts } from "@/stores/account";
import { Screen } from "@/router/helpers/types";
import { ExternalAccount, PrimaryAccount } from "@/stores/account/types";

const PriceBeforeScan: Screen<"PriceBeforeScan"> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const accounts = useAccounts((state) => state.accounts);
  const { accountID } = route.params;

  const { mainAccount, externalAccount } = useMemo(() => {
    const mainAccount = accounts.find(acc => acc.localID === accountID && !acc.isExternal) as PrimaryAccount;
    const externalAccount = accounts.find(acc => acc.localID === accountID || acc.linkedExternalLocalIDs?.includes(accountID)) as ExternalAccount;
    return { mainAccount, externalAccount };
  }, [accounts, accountID]);

  const accountName = useMemo(() => {
    if (mainAccount?.studentName) {
      return `${mainAccount.studentName?.first} ${mainAccount.studentName?.last}`;
    } else if (mainAccount?.name) {
      return mainAccount.name;
    }
    return "";
  }, [mainAccount]);

  const getBarcodeFormat = useCallback((type: string): string => {
    switch(type) {
      case "org.gs1.EAN-8":
        return "EAN8";
      case "org.gs1.EAN-13":
        return "EAN13";
      default:
        return "CODE128";
    }
  }, []);

  const renderCode = useMemo(() => {
    const qrcodedata = externalAccount?.data?.qrcodedata || (externalAccount as any)?.qrcodedata;
    const qrcodetype = externalAccount?.data?.qrcodetype || (externalAccount as any)?.qrcodetype;
    if (qrcodedata) {
      if (qrcodetype === "org.iso.QR-Code") {
        return <QRCode value={qrcodedata} size={200} />;
      } else {
        return (
          <Barcode
            value={qrcodedata}
            format={getBarcodeFormat(qrcodetype)}
            height={80}
            maxWidth={2}
          />
        );
      }
    }
    return null;
  }, [externalAccount, getBarcodeFormat]);

  const handleScanComplete = useCallback(() => {
    navigation.navigate("PriceAfterScan", { accountID });
  }, [navigation, accountID]);

  const handleCancel = useCallback(() => {
    navigation.navigate("HomeScreen");
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.codeContainer}>
        {renderCode}
        <Text style={[styles.accountName, { color: colors.text }]}>
          {accountName}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleScanComplete}
          style={styles.scanButton}
        >
          <Text style={styles.scanButtonText}>
            J'ai scanné le QR-Code
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCancel}
          style={styles.cancelButton}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text + "80" }]}>
            Annuler
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  codeContainer: {
    alignItems: "center",
    marginTop: 80,
    gap: 20,
  },
  accountName: {
    fontSize: 18,
    fontFamily: "semibold",
    textAlign: "center",
  },
  buttonContainer: {
    alignItems: "center",
    gap: 20,
  },
  scanButton: {
    backgroundColor: "#006B6B",
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonText: {
    fontSize: 16,
    fontFamily: "semibold",
    color: "#fff",
  },
  cancelButton: {
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "semibold",
  },
});

export default PriceBeforeScan;
