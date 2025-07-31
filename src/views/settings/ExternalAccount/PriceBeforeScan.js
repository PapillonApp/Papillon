import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import QRCode from "react-native-qrcode-svg";
import Barcode from "react-native-barcode-svg";
import { useAccounts } from "@/stores/account";
var PriceBeforeScan = function (_a) {
    var navigation = _a.navigation, route = _a.route;
    var colors = useTheme().colors;
    var accounts = useAccounts(function (state) { return state.accounts; });
    var accountID = route.params.accountID;
    var _b = useMemo(function () {
        var mainAccount = accounts.find(function (acc) { return acc.localID === accountID && !acc.isExternal; });
        var externalAccount = accounts.find(function (acc) { var _a; return acc.localID === accountID || ((_a = acc.linkedExternalLocalIDs) === null || _a === void 0 ? void 0 : _a.includes(accountID)); });
        return { mainAccount: mainAccount, externalAccount: externalAccount };
    }, [accounts, accountID]), mainAccount = _b.mainAccount, externalAccount = _b.externalAccount;
    var accountName = useMemo(function () {
        var _a, _b;
        if (mainAccount === null || mainAccount === void 0 ? void 0 : mainAccount.studentName) {
            return "".concat((_a = mainAccount.studentName) === null || _a === void 0 ? void 0 : _a.first, " ").concat((_b = mainAccount.studentName) === null || _b === void 0 ? void 0 : _b.last);
        }
        else if (mainAccount === null || mainAccount === void 0 ? void 0 : mainAccount.name) {
            return mainAccount.name;
        }
        return "";
    }, [mainAccount]);
    var getBarcodeFormat = useCallback(function (type) {
        switch (type) {
            case "org.gs1.EAN-8":
                return "EAN8";
            case "org.gs1.EAN-13":
                return "EAN13";
            default:
                return "CODE128";
        }
    }, []);
    var renderCode = useMemo(function () {
        var _a, _b;
        var qrcodedata = ((_a = externalAccount === null || externalAccount === void 0 ? void 0 : externalAccount.data) === null || _a === void 0 ? void 0 : _a.qrcodedata) || (externalAccount === null || externalAccount === void 0 ? void 0 : externalAccount.qrcodedata);
        var qrcodetype = ((_b = externalAccount === null || externalAccount === void 0 ? void 0 : externalAccount.data) === null || _b === void 0 ? void 0 : _b.qrcodetype) || (externalAccount === null || externalAccount === void 0 ? void 0 : externalAccount.qrcodetype);
        if (qrcodedata) {
            if (qrcodetype === "org.iso.QR-Code") {
                return <QRCode value={qrcodedata} size={200}/>;
            }
            else {
                return (<Barcode value={qrcodedata} format={getBarcodeFormat(qrcodetype)} height={80} maxWidth={2}/>);
            }
        }
        return null;
    }, [externalAccount, getBarcodeFormat]);
    var handleScanComplete = useCallback(function () {
        navigation.navigate("PriceAfterScan", { accountID: accountID });
    }, [navigation, accountID]);
    var handleCancel = useCallback(function () {
        navigation.navigate("HomeScreen");
    }, [navigation]);
    return (<SafeAreaView style={styles.container}>
      <View style={styles.codeContainer}>
        {renderCode}
        <Text style={[styles.accountName, { color: colors.text }]}>
          {accountName}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleScanComplete} style={styles.scanButton}>
          <Text style={styles.scanButtonText}>
            J'ai scanné le QR-Code
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={[styles.cancelButtonText, { color: colors.text + "80" }]}>
            Annuler
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>);
};
var styles = StyleSheet.create({
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
