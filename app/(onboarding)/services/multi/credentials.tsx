
import { useTheme } from "@react-navigation/native";
import { authWithCredentials } from 'esup-multi.js';
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
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
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { useAlert } from "@/ui/components/AlertProvider";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import uuid from "@/utils/uuid/uuid";
import LoginView from "../../components/LoginView";

const ANIMATION_DURATION = 170;

export default function MultiLoginWithCredentials() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation();

  const alert = useAlert();
  const { t } = useTranslation();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const param = useLocalSearchParams();
  console.log(param);
  const instanceUrl = String(param.url);
  const university = String(param.university);
  const color = String(param.color);

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

  async function handleLogin(password: string, username: string) {
    setIsLoggingIn(true);
    try {
      const store = useAccountStore.getState()
      const MultiAccount = await authWithCredentials(instanceUrl, { username, password });
      const accountUUID = String(uuid());

      const account: Account = {
        id: accountUUID,
        firstName: MultiAccount?.userData.firstname ?? "",
        lastName: MultiAccount?.userData.name ?? "",
        schoolName: university,
        services: [
          {
            id: uuid(),
            auth: {
              refreshToken: MultiAccount.userData.refreshAuthToken,
              additionals: { instanceUrl: instanceUrl },
            },
            serviceId: Services.MULTI,
            createdAt: (new Date()).toISOString(),
            updatedAt: (new Date()).toISOString()
          }
        ],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString()
      }

      store.addAccount(account)
      store.setLastUsedAccount(accountUUID)

      setIsLoggingIn(false);

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
                    return router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        alert.showAlert({
          title: t("Alert_Auth_Error"),
          description: t("Alert_Auth_Bad_Creds"),
          icon: "TriangleAlert",
          color: "#D60046",
          withoutNavbar: true
        });
      }
      setIsLoggingIn(false);
    }
  }

  return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <LoginView
            color={color ?? theme.colors.primary}
            serviceName={String(param.university)}
            loading={isLoggingIn}
            onSubmit={(values) => {
              if (!isLoggingIn && values.username && values.password) {
                handleLogin(values.password, values.username);
              }
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
}
