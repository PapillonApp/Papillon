import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  View,
} from "react-native";
import Reanimated, {
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { login, tokenize } from "ezly";
import { useAlert } from "@/ui/components/AlertProvider";
import { useAccountStore } from "@/stores/account";
import { ServiceAccount, Services } from "@/stores/account/types";
import uuid from "@/utils/uuid/uuid";
import { log } from "@/utils/logger/logger";
import { useTranslation } from "react-i18next";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";

const ANIMATION_DURATION = 100;

export default function TurboSelfLoginWithCredentials() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [linkSended, setLinkSended] = useState<boolean>(false);

  const params = useLocalSearchParams();
  const action = String(params.action);

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const keyboardListeners = useMemo(() => ({
    show: () => {
      "worklet";
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
      scale.value = withTiming(0.8, { duration: ANIMATION_DURATION });
    },
    hide: () => {
      "worklet";
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      scale.value = withTiming(1, { duration: ANIMATION_DURATION });
    },
  }), [opacity]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", keyboardListeners.show);
    const hideSub = Keyboard.addListener("keyboardWillHide", keyboardListeners.hide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardListeners]);

  const { t } = useTranslation();
  const alert = useAlert();

  const handleActivation = useCallback(async (url: string) => {
    const id = uuid();
    const { identification, profile } = await tokenize(url);
    const service: ServiceAccount = {
      id,
      auth: {
        session: identification,
        additionals: {
          secret: password,
        },
      },
      serviceId: Services.IZLY,
      createdAt: (new Date()).toISOString(),
      updatedAt: (new Date()).toISOString(),
    };

    const store = useAccountStore.getState();

    if (action === "addService") {
      store.addServiceToAccount(store.lastUsedAccount, service);
      router.back();
      return router.back();
    }

    store.addAccount({
      id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      services: [service],
      createdAt: (new Date()).toISOString(),
      updatedAt: (new Date()).toISOString(),
    });
    store.setLastUsedAccount(id);

    return router.push({
      pathname: "/(onboarding)/end/color",
      params: {
        accountId: id,
      },
    });
  }, [password, action]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      const scheme = url.split(":")[0];
      if (scheme === "izly") {
        log("[IzlyActivation] Activation link received:", url);
        handleActivation(url);
      } else {
        log("[IzlyActivation] Ignoring link:", url);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const listener = Linking.addEventListener("url", handleDeepLink);

    return () => {
      listener?.remove();
    };
  }, [handleActivation]);

  async function handleLogin(username: string, password: string) {
    try {
      await login(username, password)
      setLinkSended(true);
    } catch (error) {
      alert.showAlert({
        title: "Erreur d'authentification",
        description: "Une erreur est survenue lors de la connexion, elle a donc été abandonnée.",
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(error),
        withoutNavbar: true,
      });
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, marginBottom: insets.bottom }}
      behavior="padding"
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottomLeftRadius: 42,
          borderBottomRightRadius: 42,
          padding: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 34,
          borderCurve: "continuous",
          flex: 1,
          backgroundColor: "#56CEF5",
        }}
      >
        <Reanimated.View
          style={{
            flex: 1,
            marginBottom: 16,
            alignItems: "center",
            justifyContent: "center",
            opacity: opacity,
            transform: [{ scale: scale }],
          }}
        >
          <LottieView
            source={require("../../../assets/lotties/izly.json")}
            autoPlay
            loop={false}
            style={{
              aspectRatio: 1,
              height: "100%",
              maxHeight: 250,
            }}
          />
        </Reanimated.View>
        <Stack
          vAlign="start"
          hAlign="start"
          width="100%"
          gap={12}
        >
          <Stack
            direction="horizontal"
          >
            <Typography
              variant="h5"
              style={{ color: "#FFF", lineHeight: 22, fontSize: 18 }}
            >
              {t("STEP")} 2
            </Typography>
            <Typography
              variant="h5"
              style={{ color: "#FFFFFF90", lineHeight: 22, fontSize: 18 }}
            >
              {t("STEP_OUTOF")} 3
            </Typography>
          </Stack>
          <Typography
            variant="h1"
            style={{ color: "#FFF", fontSize: 32, lineHeight: 34 }}
          >
            {t("ONBOARDING_LOGIN_CREDENTIALS")} Izly
          </Typography>
        </Stack>
      </View>
      {linkSended ? (
        <View
          style={{
            alignItems: "center",
            gap: 10,
            padding: 20,
            height: 200,
            justifyContent: "center",
          }}
        >
          <ActivityIndicator />
          <View>
            <Typography variant="h4"
              color="text"
              align="center"
            >
              {t("WAITING")}
            </Typography>
            <Typography variant="body2"
              color="secondary"
              align="center"
            >
              {t("IZLY_SMS_SEND")}
            </Typography>
          </View>
        </View>
      ) : (
        <Stack padding={20}
          gap={10}
        >
          <OnboardingInput
            icon={"User"}
            placeholder={t("INPUT_PHONE_OR_MAIL")}
            text={username}
            setText={setUsername}
            isPassword={false}
            keyboardType={"default"}
            inputProps={{
              autoCapitalize: "none",
              autoCorrect: false,
              spellCheck: false,
              textContentType: "username",
            }}
          />
          <OnboardingInput
            icon={"Lock"}
            placeholder={t("INPUT_PASSWORD_CODE")}
            text={password}
            setText={setPassword}
            isPassword={true}
            keyboardType={"number-pad"}
            inputProps={{
              autoCapitalize: "none",
              autoCorrect: false,
              spellCheck: false,
              textContentType: "password",
              onSubmitEditing: () => {
                Keyboard.dismiss();
                // Trigger login
                handleLogin(username, password);
              },
              returnKeyType: "done",
            }}
          />
          <Button
            title={t("LOGIN_BTN")}
            style={{
              backgroundColor: theme.dark ? theme.colors.border : "black",
            }}
            size="large"
            disableAnimation
            onPress={() => handleLogin(username, password)}
          />
        </Stack>
      )}
      <OnboardingBackButton />
    </KeyboardAvoidingView>
  );
}