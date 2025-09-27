import { router, useLocalSearchParams } from "expo-router";
import { AccountKind, createSessionHandle, loginCredentials, SecurityError, SessionHandle } from 'pawnote';
import React, { useEffect, useMemo, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, View } from "react-native";
import Reanimated, {
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';
import { useAlert } from '@/ui/components/AlertProvider';
import Button from '@/ui/components/Button';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import uuid from '@/utils/uuid/uuid';
import { useTheme } from '@react-navigation/native';
import { customFetcher } from '@/utils/pronote/fetcher';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pronote2FAModal } from "./2fa";

const ANIMATION_DURATION = 170;

export default function PronoteLoginWithCredentials() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const alert = useAlert();

  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("");

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const local = useLocalSearchParams();

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

  const [challengeModalVisible, setChallengeModalVisible] = useState<boolean>(false);
  const [doubleAuthError, setDoubleAuthError] = useState<SecurityError | null>(null);
  const [doubleAuthSession, setDoubleAuthSession] = useState<SessionHandle | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");

  const loginPronote = async () => {
    if (!username.trim() || !password.trim()) { return; }
    const device = uuid()
    const session = createSessionHandle(customFetcher)

    try {
      const authentication = await loginCredentials(session, {
        url: String(local.url),
        deviceUUID: device,
        kind: AccountKind.STUDENT,
        username: username.trim(),
        password: password.trim()
      })

    }

    if (!authentication) {
      return alert.showAlert({
        title: "Erreur d'authentification",
        description: "Une erreur inattendue s'est produite. Réessaie plus tard.",
        icon: "TriangleAlert",
        color: "#D60046",
        withoutNavbar: true
      });
    }

      const splittedUsername = session.user.name.split(" ")
      const firstName = splittedUsername[splittedUsername.length - 1]
      const lastName = splittedUsername.slice(0, splittedUsername.length - 1).join(" ")
      const schoolName = session.user.resources[0].establishmentName
      const className = session.user.resources[0].className

      const account = {
        id: device,
        firstName,
        lastName,
        schoolName,
        className,
        services: [{
          id: device,
          auth: {
            accessToken: authentication.token,
            refreshToken: authentication.token,
            additionals: {
              instanceURL: authentication.url,
              kind: authentication.kind,
              username: authentication.username,
              deviceUUID: device
            }
          },
          serviceId: Services.PRONOTE,
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString()
        }],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString()
      }

      const store = useAccountStore.getState()
      store.addAccount(account)
      store.setLastUsedAccount(device)

      router.push({
        pathname: "../end/color",
        params: {
          accountId: device
        }
      });
    } catch (error) {
      if (error instanceof SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
        setDoubleAuthError(error)
        setDoubleAuthSession(session)
        setDeviceId(device)
        setChallengeModalVisible(true)
      }
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
          backgroundColor: theme.dark ? '#2f2f2fff' : '#C6C6C6'
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
              style={{ color: theme.dark ? '#FFF' : '#000', lineHeight: 22, fontSize: 18 }}
            >
              {t("STEP")} 2
            </Typography>
            <Typography
              variant="h5"
              style={{ color: theme.dark ? '#FFFFFF90' : '#00000090', lineHeight: 22, fontSize: 18 }}
            >
              {t("STEP_OUTOF")} 3
            </Typography>
          </Stack>
          <Typography
            variant="h1"
            style={{ color: theme.dark ? '#FFF' : '#000', fontSize: 32, lineHeight: 34 }}
          >
            {t("ONBOARDING_LOGIN_CREDENTIALS")} PRONOTE
          </Typography>
        </Stack>
      </View>
      <Stack padding={20} gap={10}>
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
              loginPronote();
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
          onPress={loginPronote}
        />
      </Stack>
      <OnboardingBackButton />
      <Modal
        visible={challengeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChallengeModalVisible(false)}
      >
        <Pronote2FAModal doubleAuthSession={doubleAuthSession} doubleAuthError={doubleAuthError} setChallengeModalVisible={setChallengeModalVisible} deviceId={deviceId} />
      </Modal>
    </KeyboardAvoidingView>
  );
}