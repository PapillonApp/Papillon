

import { Papicons } from "@getpapillon/papicons";
import MaskedView from "@react-native-masked-view/masked-view";
import { useTheme } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router, useGlobalSearchParams } from "expo-router";
import { AuthenticateError, createSessionHandle, loginQrCode, SecurityError } from "pawnote";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, StyleSheet, TextInput, View } from "react-native";
import Reanimated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import Typography from "@/ui/components/Typography";
import { URLToBase64 } from "@/utils/attachments/helper";
import { GetIdentityFromPronoteUsername } from "@/utils/pronote/name";
import { customFetcher } from "@/utils/pronote/fetcher";
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

  async function loginQR() {
    setScanned(false);
    setLoadingModalVisible(true);

    if (QRValidationCode === "" || QRValidationCode.length !== 4) {
      // Handle error
      return;
    }

    const accountID = uuid();

    try {
      const decodedJSON = JSON.parse(QRData!);

      const data = {
        jeton: decodedJSON.jeton,
        login: decodedJSON.login,
        url: decodedJSON.url,
      };

      const session = createSessionHandle(customFetcher);
      const refresh = await loginQrCode(session, {
        qr: data,
        pin: QRValidationCode,
        deviceUUID: accountID
      }).catch((error) => {
        if (error instanceof SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
          router.push({
            pathname: "/(onboarding)/pronote/2fa",
            params: {
              error: JSON.stringify(error),
              session: JSON.stringify(session),
              deviceId: accountID
            }
          });
        } else {
          throw error;
        }
      });

      if (!refresh) { throw AuthenticateError; }

      const user = session.user.resources[0];
      const schoolName = user.establishmentName;
      const className = user.className;
      const { firstName, lastName } = GetIdentityFromPronoteUsername(session.user.name)
      let pp = "";
      if (session.user.resources[0].profilePicture?.url) {
        pp = await URLToBase64(session.user.resources[0].profilePicture?.url)
      }

      useAccountStore.getState().addAccount({
        id: accountID,
        firstName,
        lastName,
        schoolName,
        className,
        customisation: {
          profilePicture: pp,
          subjects: {}
        },
        services: [{
          id: accountID,
          auth: {
            accessToken: refresh.token,
            refreshToken: refresh.token,
            additionals: {
              instanceURL: refresh.url,
              kind: refresh.kind,
              username: refresh.username,
              deviceUUID: accountID
            }
          },
          serviceId: Services.PRONOTE,
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString()
        }],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString()
      });
      useAccountStore.getState().setLastUsedAccount(accountID)
      setTimeout(() => {
        setLoadingModalVisible(false);
        router.push({
          pathname: "../end/color",
          params: {
            accountId: accountID
          }
        });
      }, 1000);
    } catch (error) {
      console.error(error);
      // Handle error
    }
  }

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setQRData(data);
    setPinModalVisible(true);
  };

  useEffect(() => {
    if (!pinModalVisible) {
      setScanned(false);
      setQRData(null);
    }
  }, [pinModalVisible]);

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

  const local = useGlobalSearchParams();

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
            Connexion en cours...
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

          <View
            style={{
              width: "100%",
              paddingHorizontal: 16,
              paddingBottom: insets.bottom,
              gap: 8,
            }}
          >
            <Button
              title="Annuler"
              onPress={() => {
                setLoadingModalVisible(false);
                router.back();
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={pinModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setPinModalVisible(!pinModalVisible);
        }}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
          behavior="padding"
          keyboardVerticalOffset={insets.top}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              paddingVertical: 16,
              paddingHorizontal: 20,
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
          </View>

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

          <View
            style={{
              width: "100%",
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 16,
              gap: 8,
            }}
          >
            <Button
              title={t("CONFIRM_BTN")}
              onPress={() => {
                setPinModalVisible(false);
                loginQR();
              }}
            />
            <Button
              title={t("CANCEL_BTN")}
              variant="outline"
              onPress={() => {
                setPinModalVisible(false);
              }}
            />
          </View>
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
        {permission?.granted && (
          <CameraView
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={
              scanned ? undefined : handleBarCodeScanned
            }
            style={StyleSheet.absoluteFillObject}
          />
        )}
        {permission?.granted && (
          <View style={styles.transparentSquareBorder} />
        )}
      </MaskedView>
      <OnboardingBackButton />
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
  maskContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  transparentSquare: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "black",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 30,
    borderCurve: "continuous",
    alignSelf: "center",
    top: "35%",
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 200,
    backgroundColor: '#ffffff42',
    padding: 10,
    borderRadius: 100,
  },
  transparentSquareBorder: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 30,
    borderCurve: "continuous",
    alignSelf: "center",
    top: "35%",
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