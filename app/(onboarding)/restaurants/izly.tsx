/* eslint-disable @typescript-eslint/no-require-imports */
import { useTheme } from "@react-navigation/native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { login, tokenize } from "ezly";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  ScrollView,
  View,
} from "react-native";
import Reanimated, {
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { initializeAccountManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";
import { ServiceAccount, Services } from "@/stores/account/types";
import { useAlert } from "@/ui/components/AlertProvider";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { log } from "@/utils/logger/logger";
import uuid from "@/utils/uuid/uuid";
import LoginView from "../components/LoginView";

const ANIMATION_DURATION = 100;

export default function TurboSelfLoginWithCredentials() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [linkSended, setLinkSended] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

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
      await initializeAccountManager()
      const parent = navigation.getParent();
            if (parent) {
              parent.goBack();
              
              const parentsParent = parent.getParent();
              if (parentsParent) {
                parentsParent.goBack();
              }
            }
    
            router.back();
            router.dismissAll();
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

     const parent = navigation.getParent();
            if (parent) {
              parent.goBack();
              
              const parentsParent = parent.getParent();
              if (parentsParent) {
                parentsParent.goBack();
              }
            }
    
            router.back();
            router.dismissAll();
            return router.replace('/index')
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
      setIsLoggingIn(true);
      await login(username, password)
      setIsLoggingIn(false);
      setLinkSended(true);
      Alert.alert(t("ONBOARDING_SMS_SENT_TITLE"), t("ONBOARDING_IZLY_SMS_SENT_DESCRIPTION"));
    } catch (error) {
      setIsLoggingIn(false);
      Alert.alert(t("Alert_Auth_Error"), t("ONBOARDING_ALERT_LOGIN_ABORTED"));
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={32}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <LoginView
          color="#00b7cf"
          serviceName="Izly"
          fields={[
            {
              name: "username",
              placeholder: t("INPUT_PHONE_OR_MAIL"),
              secureTextEntry: false,
              textContentType: "username",
              keyboardType: "email-address",
            },
            {
              name: "password",
              placeholder: t("INPUT_PASSWORD_CODE"),
              secureTextEntry: true,
              textContentType: "password",
              keyboardType: "number-pad",
            }
          ]}
          serviceIcon={require('@/assets/images/izly.png')}
          loading={isLoggingIn}
          onSubmit={(values) => {
            if (!isLoggingIn && values.username && values.password) {
              handleLogin(values.username, values.password);
            }
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
