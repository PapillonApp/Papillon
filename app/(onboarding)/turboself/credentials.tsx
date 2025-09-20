import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, View } from "react-native";
import Reanimated, {
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { authenticateWithCredentials } from 'turboself-api'

import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';
import Button from '@/ui/components/Button';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import uuid from '@/utils/uuid/uuid';
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlert } from '@/ui/components/AlertProvider';

const ANIMATION_DURATION = 100;

export default function TurboSelfLoginWithCredentials() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("");
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
        return router.push({
          pathname: "../end/color",
          params: {
            accountId
          }
        });
      }

      return router.push({
        pathname: "./hostSelector",
        params: {
          siblings: JSON.stringify(siblings),
          username,
          password
        }
      });
    } catch (error) {
      return alert.showAlert({
        title: "Identifiants incorrects",
        description: "Nous n’avons pas réussi à te connecter à ton compte TurboSelf. Vérifie ton identifiant et ton mot de passe puis essaie de nouveau.",
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(error),
        withoutNavbar: true
      })
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
          backgroundColor: "#E70026"
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
            style={{
              height: "100%",
              aspectRatio: 1,
              maxHeight: 250,
            }}
            source={require('@/assets/lotties/turboself.json')}
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
              style={{ color: '#FFF', lineHeight: 22, fontSize: 18 }}
            >
              {t("STEP")} 2
            </Typography>
            <Typography
              variant="h5"
              style={{ color: '#FFFFFF90', lineHeight: 22, fontSize: 18 }}
            >
              {t("STEP_OUTOF")} 3
            </Typography>
          </Stack>
          <Typography
            variant="h1"
            style={{ color: '#FFF', fontSize: 32, lineHeight: 34 }}
          >
            {t("ONBOARDING_LOGIN_CREDENTIALS")} TurboSelf
          </Typography>
        </Stack>
      </View>
      <Stack padding={20} gap={10}>
        <OnboardingInput
          icon={"Mail"}
          placeholder={t("INPUT_MAIL")}
          text={username}
          setText={setUsername}
          isPassword={false}
          keyboardType={"default"}
          inputProps={{
            autoCapitalize: "none",
            autoCorrect: false,
            spellCheck: false,
            textContentType: "username"
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
              loginTurboself();
            },
            returnKeyType: "done",
          }}
        />
        <Button
          title={t("LOGIN_BTN")}
          style={{
            backgroundColor: theme.dark ? theme.colors.border : "black",
          }}
          size='large'
          disableAnimation
          onPress={loginTurboself}
        />
      </Stack>
      <OnboardingBackButton />
    </KeyboardAvoidingView>
  );
}