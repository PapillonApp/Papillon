/* eslint-disable @typescript-eslint/no-require-imports */
import { useTheme } from "@react-navigation/native";
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Keyboard, KeyboardAvoidingView, ScrollView, View } from "react-native";
import Reanimated, {
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authenticateWithCredentials } from 'turboself-api'

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { initializeAccountManager } from "@/services/shared";
import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';
import { useAlert } from '@/ui/components/AlertProvider';
import Button from '@/ui/components/Button';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import uuid from '@/utils/uuid/uuid';
import LoginView from "../components/LoginView";

const ANIMATION_DURATION = 100;

export default function TurboSelfLoginWithCredentials() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const params = useLocalSearchParams();
  const action = String(params.action);

  const opacity = useSharedValue(1);
  const alert = useAlert();
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

  const loginTurboself = async () => {
    try {
      setIsLoggingIn(true);
      const authentification = await authenticateWithCredentials(username, password, true, false)
      const siblings = await authentification.getSiblings();
      if (siblings.length === 0) {
        const accountId = uuid()
        const store = useAccountStore.getState()
        const service = {
          id: accountId,
          auth: {
            additionals: {
              username,
              password,
              "hoteId": authentification.host?.id ?? "N/A"
            }
          },
          serviceId: Services.TURBOSELF,
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString()
        }

        if (action === "addService") {
          store.addServiceToAccount(store.lastUsedAccount, service)
          await initializeAccountManager()
          router.back();
          router.back();
          return router.back();
        }

        store.addAccount({
          id: accountId,
          firstName: authentification.host?.firstName ?? "N/A",
          lastName: authentification.host?.lastName ?? "N/A",
          schoolName: authentification.establishment?.name,
          className: authentification.host?.division,
          services: [service],
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString()
        })

        store.setLastUsedAccount(accountId)
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
      }
      setIsLoggingIn(false);

      const global = [authentification.host, ...siblings].flat()
      return router.push({
        pathname: "/(onboarding)/restaurants/turboselfHost",
        params: {
          siblings: JSON.stringify(global),
          username,
          password
        }
      });
    } catch (error) {
      setIsLoggingIn(false);
      Alert.alert(t("Alert_Auth_Error"), t("ONBOARDING_ALERT_BAD_CREDENTIALS_TURBOSELF"));
    }
  }

  return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={32}>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <LoginView
            color="#cf0000"
            serviceName="TurboSelf"
            serviceIcon={require('@/assets/images/turboself.png')}
            loading={isLoggingIn}
            onSubmit={(values) => {
              if (!isLoggingIn && values.username && values.password) {
                setPassword(values.password);
                setUsername(values.username);
                loginTurboself();
              }
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
}
