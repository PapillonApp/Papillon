import {
  AuthenticateError,
  createSessionHandle,
  DoubleAuthMode,
  finishLoginManually,
  loginQrCode,
  RefreshInformation,
  SecurityError,
  securitySave,
  securitySource,
} from "@blockshub/pawnote-lts";
import { Papicons } from "@getpapillon/papicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Modal, StyleSheet, TextInput, View } from "react-native";
import Reanimated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import SafeHorizontalView from "@/ui/components/SafeHorizontalView";
import Typography from "@/ui/components/Typography";
import { URLToBase64 } from "@/utils/attachments/helper";
import { error as logError } from "@/utils/logger/logger";
import { setPendingPronoteChallenge } from "@/utils/pronote/challenge";
import { customFetcher } from "@/utils/pronote/fetcher";
import { GetIdentityFromPronoteUsername } from "@/utils/pronote/name";
import uuid from "@/utils/uuid/uuid";

export default function PronoteLoginWithQR() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { colors } = theme;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const [QRValidationCode, setQRValidationCode] = useState("");
  const [pinModalVisible, setPinModalVisible] = useState(false);

  const [loadingModalVisible, setLoadingModalVisible] = useState(false);

  const codeInput = React.createRef<TextInput>();
  const [QRData, setQRData] = useState<string | null>(null);

  const deviceName: string = Device.deviceName ?? "Pronote" 

  async function loginQR() {
    if (!QRData || QRValidationCode.length !== 4) {
      return;
    }

    setLoadingModalVisible(true);

    const accountID = uuid();

    try {
      const decodedJSON = JSON.parse(QRData);

      const data = {
        jeton: decodedJSON.jeton,
        login: decodedJSON.login,
        url: decodedJSON.url,
      };

      const session = createSessionHandle(customFetcher);
      let refresh: RefreshInformation | undefined;
      try {
        refresh = await loginQrCode(session, {
          qr: data,
          pin: QRValidationCode,
          deviceUUID: accountID,
        });
      } catch (error) {
        if (error instanceof SecurityError) {
          if (
            !error.handle.shouldCustomPassword &&
            !error.handle.shouldCustomDoubleAuth &&
            error.handle.shouldEnterSource &&
            !error.handle.shouldEnterPIN
          ) {
            const mode: DoubleAuthMode = DoubleAuthMode.MGDA_NotificationSeulement;
            const source = deviceName.length > 30 ? "Pronote" : deviceName;
            await securitySource(session, source);
            await securitySave(session, error.handle, { mode, deviceName: source });

            const context = error.handle.context;
            refresh = await finishLoginManually(
              session,
              context.authentication,
              context.identity,
              context.initialUsername
            );
          } else {
            setPendingPronoteChallenge({ session, error, deviceUUID: accountID });
            setLoadingModalVisible(false);
            router.push("/(onboarding)/services/pronote/challenge");
            return;
          }
        } else {
          throw error;
        }
      }

      if (!refresh) {
        throw new AuthenticateError("Missing refresh information");
      }

      const user = session.user.resources[0];
      const schoolName = user.establishmentName;
      const className = user.className;
      const { firstName, lastName } = GetIdentityFromPronoteUsername(session.user.name);
      let pp = "";
      if (session.user.resources[0].profilePicture?.url) {
        pp = await URLToBase64(session.user.resources[0].profilePicture?.url);
      }

      useAccountStore.getState().addAccount({
        id: accountID,
        firstName,
        lastName,
        schoolName,
        className,
        customisation: {
          profilePicture: pp,
          subjects: {},
        },
        services: [{
          id: accountID,
          auth: {
            accessToken: refresh.token,
            refreshToken: refresh.token,
            additionals: {
              ...refresh,
              instanceURL: refresh.url,
              kind: refresh.kind,
              username: refresh.username,
              deviceUUID: accountID,
            },
          },
          serviceId: Services.PRONOTE,
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString(),
        }],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      });
      useAccountStore.getState().setLastUsedAccount(accountID);
      setTimeout(() => {
        setLoadingModalVisible(false);
        return router.dismissTo("/");
      }, 1000);
    } catch (error) {
      logError(`Failed to log in via PRONOTE QR code: ${String(error)}`);
      setLoadingModalVisible(false);
      setScanned(false);
      setQRData(null);
      setQRValidationCode("");
      Alert.alert(t("Alert_Auth_Error"), t("ONBOARDING_ALERT_LOGIN_ABORTED"));
    }
  }

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  const handleBarCodeScanned = ({ data }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setQRData(data);
    setPinModalVisible(true);
  };

  const closePinModal = () => {
    setPinModalVisible(false);
    setScanned(false);
    setQRData(null);
    setQRValidationCode("");
  };

  const keyboardDidShow = () => setKeyboardOpen(true);
  const keyboardDidHide = () => setKeyboardOpen(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", keyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", keyboardDidHide);

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={loadingModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }} />

          <ActivityIndicator
            size="large"
          />

          <Typography
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginTop: 16,
            }}
          >
            {t("ONBOARDING_LOADING_LOGIN")}
          </Typography>

          <Typography
            style={{
              fontSize: 16,
              fontWeight: "400",
              color: colors.text + "80",
              marginTop: 4,
            }}
          >
            {t("ONBOARDING_QRCODE_WAIT")}
          </Typography>

          <View style={{ flex: 1 }} />

          <SafeHorizontalView
            base={16}
            style={{
              width: "100%",
              paddingBottom: insets.bottom,
              gap: 8,
            }}
          >
            <Button
              title={t("CANCEL_BTN")}
              onPress={() => {
                setLoadingModalVisible(false);
                router.back();
              }}
            />
          </SafeHorizontalView>
        </View>
      </Modal>

      <Modal
        visible={pinModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePinModal}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
          behavior="padding"
          keyboardVerticalOffset={insets.top}
        >
          <SafeHorizontalView
            base={20}
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              paddingVertical: 16,
              borderBottomColor: colors.border,
              borderBottomWidth: 0.5,
            }}
          >
            <Typography
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: colors.text,
                textAlign: "center",
              }}
            >
              {t("ONBOARDING_QRCODE_VALIDATION")}
            </Typography>
          </SafeHorizontalView>

          <Reanimated.View
            entering={FadeInUp.duration(250)}
            exiting={FadeOutUp.duration(150)}
            style={{
              zIndex: 9999,
              paddingTop: keyboardOpen ? 20 : 100,
              alignItems: "center",
            }}
            layout={LinearTransition}
          >
            <Typography style={{
              color: colors.text,
              fontSize: 16,
              textAlign: "center",
              marginHorizontal: 24,
              fontWeight: "400",
              width: 300,
              marginBottom: 12
            }}>
              {t("ONBOARDING_PRONOTE_PIN")}
            </Typography>
          </Reanimated.View>

          <View
            style={{
              flex: 1,
              alignItems: "center",
              marginBottom: "7%",
            }}
          >
            <TextInput
              style={{
                width: "90%",
                paddingHorizontal: 20,
                paddingVertical: 15,
                backgroundColor: colors.card,
                borderRadius: 12,
                fontSize: 24,
                color: colors.text,
                textAlign: "center",
                borderColor: colors.border,
                borderWidth: 2,
                fontWeight: "500",
              }}
              placeholderTextColor={colors.text + "80"}
              placeholder="••••"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={QRValidationCode}
              onChangeText={(text) => setQRValidationCode(text)}
              ref={codeInput}
              autoFocus
            />
          </View>

          <SafeHorizontalView
            base={16}
            style={{
              width: "100%",
              paddingBottom: insets.bottom + 16,
              gap: 8,
            }}
          >
            <Button
              title={t("CONFIRM_BTN")}
              disabled={QRValidationCode.length !== 4}
              onPress={() => {
                if (QRValidationCode.length !== 4) {
                  return;
                }
                setPinModalVisible(false);
                loginQR();
              }}
            />
            <Button
              title={t("CANCEL_BTN")}
              variant="outline"
              onPress={closePinModal}
            />
          </SafeHorizontalView>
        </KeyboardAvoidingView>
      </Modal>

      <View style={[styles.explainations,
        { top: insets.top + 48 + 10 }
      ]}>
        <Icon size={40} fill={"white"} papicon>
          <Papicons name="QrCode" />
        </Icon>
        <Typography style={styles.title}>
          {t("ONBOARDING_LOGIN_TO")} PRONOTE
        </Typography>
        <Typography style={styles.text}>
          {t("ONBOARDING_SCAN_QRCODE")}
        </Typography>
      </View>

      {permission?.granted && (
        <CameraView
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddleRow}>
          <View style={styles.overlaySide} />
          <View style={styles.viewfinder} />
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  overlayTop: {
    height: "35%",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  overlayMiddleRow: {
    height: 300,
    flexDirection: "row",
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  viewfinder: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 30,
    borderCurve: "continuous",
    backgroundColor: "transparent",
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
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
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "400",
    color: "white",
    textAlign: "center",
    opacity: 0.8,
  },
});
