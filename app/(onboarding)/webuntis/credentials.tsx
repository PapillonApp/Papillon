import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from "react-native";
import Reanimated, {
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebUntis } from "webuntis";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { useAlert } from "@/ui/components/AlertProvider";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import uuid from "@/utils/uuid/uuid";

const ANIMATION_DURATION = 170;
export const PlatformPressable = Platform.OS === 'android' ? Pressable : AnimatedPressable;

export default function WebUntisLoginWithCredentials() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const alert = useAlert();
  const { t } = useTranslation();

  const [baseURL, setBaseURL] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

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

  const handleLogin = async () => {
    if (!baseURL.trim() || !username.trim() || !password.trim()) {
      alert.showAlert({
        title: t("ERROR_AUTHENTICATION"),
        description: t("ERROR_MISSING_FIELDS"),
        icon: "TriangleAlert",
        color: "#D60046",
        withoutNavbar: true,
      });
      return;
    }

    setIsLoggingIn(true);
    Keyboard.dismiss();

    const school = baseURL.trim().split('.')[0];
    const identity = "PapillonApp";

    const client = new WebUntis(school, username, password, baseURL, identity);
    const accountId = uuid();
    const store = useAccountStore.getState();

    try {
      await client.login();

      if (!client.sessionInformation) {
        throw new Error("No session information returned from WebUntis");
      }

      const account: Account = {
        id: accountId,
        firstName: username,
        lastName: "",
        schoolName: school,
        services: [
          {
            id: accountId,
            auth: {
              accessToken: client.sessionInformation.sessionId,
              refreshToken: password,
              additionals: {
                school: school,
                username: username,
                baseURL: baseURL,
                password: password,
              }
            },
            serviceId: Services.WEBUNTIS,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.addAccount(account);
      store.setLastUsedAccount(accountId);

      queueMicrotask(() => {
        router.push({
          pathname: "../end/color",
          params: { accountId },
        });
      });
      
    } catch (e) {
      setIsLoggingIn(false);

      alert.showAlert({
        title: t("ERROR_AUTHENTICATION"),
        description: t("ERROR_WEBUNTIS_LOGIN"),
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(e),
        withoutNavbar: true,
      });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, marginBottom: insets.bottom }} behavior="padding">
      <View
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottomLeftRadius: 42,
          borderBottomRightRadius: 42,
          padding: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 34,
          flex: 1,
          backgroundColor: "#E50052",
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
        />
        <Stack vAlign="start" hAlign="start" width="100%" gap={12}>
          <Stack direction="horizontal">
            <Typography variant="h5" style={{ color: "#FFF", fontSize: 18 }}>
              {t("STEP")} 2
            </Typography>
            <Typography variant="h5" style={{ color: "#FFFFFF90", fontSize: 18 }}>
              {t("STEP_OUTOF")} 3
            </Typography>
          </Stack>
          <Typography variant="h1" style={{ color: "#FFF", fontSize: 32 }}>
            {t("ONBOARDING_LOGIN_CREDENTIALS")} Web Untis
          </Typography>
        </Stack>
      </View>

      <Stack padding={20} gap={10}>
        <OnboardingInput
          icon={"Link"}
          placeholder={t("INPUT_BASE_URL")}
          text={baseURL}
          setText={setBaseURL}
          isPassword={false}
          keyboardType={"url"}
          inputProps={{
            autoCapitalize: "none",
            autoCorrect: false,
            spellCheck: false,
            textContentType: "URL",
            editable: !isLoggingIn,
          }}
        />
        <OnboardingInput
          icon={"User"}
          placeholder={t("INPUT_USERNAME")}
          text={username}
          setText={setUsername}
          isPassword={false}
          keyboardType={"default"}
          inputProps={{
            autoCapitalize: "none",
            autoCorrect: false,
            spellCheck: false,
            textContentType: "username",
            editable: !isLoggingIn,
          }}
        />
        <OnboardingInput
          icon={"Lock"}
          placeholder={t("INPUT_PASSWORD")}
          text={password}
          setText={setPassword}
          isPassword={true}
          keyboardType={"default"}
          inputProps={{
            autoCapitalize: "none",
            autoCorrect: false,
            spellCheck: false,
            textContentType: "password",
            onSubmitEditing: () => {
              Keyboard.dismiss();

              if (!isLoggingIn && baseURL.trim() && username.trim() && password.trim()) {
                handleLogin();
              }
            },
            returnKeyType: "done",
            editable: !isLoggingIn,
          }}
        />
        <Button
          title={isLoggingIn ? t("ONBOARDING_LOADING_LOGIN") : t("LOGIN_BTN")}
          style={{
            backgroundColor: (theme.dark ? theme.colors.border : "#000000") + (isLoggingIn ? "50" : "FF"),
          }}
          size="large"
          onPress={handleLogin}
          disabled={isLoggingIn}
          loading={isLoggingIn}
        />
      </Stack>

      <OnboardingBackButton />
    </KeyboardAvoidingView>
  );
}