/* eslint-disable @typescript-eslint/no-require-imports */
import { useTheme } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import LottieView from "lottie-react-native";
import { Authenticator } from "pawrd";
import React, { useEffect, useMemo, useState } from "react";
import { Keyboard, KeyboardAvoidingView, View } from "react-native";
import Reanimated, {
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { fetchARDHistory } from "@/services/ard/history";
import { initializeAccountManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import { useAlert } from "@/ui/components/AlertProvider";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { detectMealPrice } from "@/utils/restaurant/detect-price";
import uuid from "@/utils/uuid/uuid";

const ANIMATION_DURATION = 100;

export default function TurboSelfLoginWithCredentials() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [siteId, setSiteId] = useState<string>("");
  const params = useLocalSearchParams();
  const action = String(params.action);

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const alert = useAlert();

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

  const loginARD = async () => {
    try {
      const authenticator = new Authenticator();
      // ARD require 2 connections, WHY ?
      const authentification = await authenticator.fromCredentials(siteId, username, password);
      const accountId = uuid();
      const store = useAccountStore.getState();

      const history = await fetchARDHistory(authentification, "")
      const mealPrice = detectMealPrice(history)

      const service = {
        id: accountId,
        auth: {
          additionals: {
            schoolId: siteId,
            password,
            username,
            mealPrice: String(mealPrice)
          },
        },
        serviceId: Services.ARD,
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      };

      if (action === "addService") {
        store.addServiceToAccount(store.lastUsedAccount, service);
        await initializeAccountManager()
        router.back();
        return router.back();
      }

      store.addAccount({
        id: accountId,
        firstName: "",
        lastName: "",
        schoolName: authentification.schoolName,
        services: [service],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      });

      store.setLastUsedAccount(accountId);
      return router.push({
        pathname: "../end/color",
        params: {
          accountId,
        },
      });
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
  };

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
          backgroundColor: "#275F8A",
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
            autoPlay
            loop={false}
            style={{ width: 230, height: 230 }}
            source={require("@/assets/lotties/ard.json")}
          />
        </Reanimated.View>
        <Reanimated.View
          style={{
            width: "100%",
            gap: 12,
            opacity: opacity,
            transform: [{ scale: scale }],
          }}
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
            {t("ONBOARDING_LOGIN_CREDENTIALS")} ARD
          </Typography>
        </Reanimated.View>
      </View>
      <Stack padding={20}
        gap={10}
      >
        <OnboardingInput
          icon={"Link"}
          placeholder={t("INPUT_ETABID")}
          text={siteId}
          setText={setSiteId}
          isPassword={false}
          keyboardType={"default"}
          inputProps={{
            autoCapitalize: "none",
            autoCorrect: false,
            spellCheck: false,
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
              // Trigger login
              loginARD();
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
          onPress={loginARD}
        />
      </Stack>
      <OnboardingBackButton />
    </KeyboardAvoidingView>
  );
}