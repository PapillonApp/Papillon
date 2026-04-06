
import { Client, DoubleAuthQuestions, DoubleAuthResult, Require2FA } from "@blockshub/blocksdirecte";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";
import Reanimated, {
  FadeInDown,
  FadeOutUp,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import OnboardingScrollingFlatList from "@/components/onboarding/OnboardingScrollingFlatList";
import { fetchEDProfilePicture } from "@/services/ecoledirecte/profile";
import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { useAlert } from "@/ui/components/AlertProvider";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import uuid from "@/utils/uuid/uuid";
import { ScrollView } from "react-native-gesture-handler";
import LoginView from "../../components/LoginView";
import { useHeaderHeight } from "@react-navigation/elements";

const ANIMATION_DURATION = 170;
export const PlatformPressable = Platform.OS === 'android' ? Pressable : AnimatedPressable;

export default function EDLoginWithCredentials() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;

  const alert = useAlert();
  const { t } = useTranslation();

  const [challengeModalVisible, setChallengeModalVisible] = useState<boolean>(false);
  const [doubleAuthChallenge, setDoubleAuthChallenge] = useState<DoubleAuthQuestions | null>(null);

  const [session, setSession] = useState<Client | null>(null);
  const [token, setToken] = useState<string>();

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

  const handleLogin = async (
    username: string,
    password: string,
    keys?: DoubleAuthResult,
    token2faHint?: string
  ) => {
    const client = new Client();
    const device = uuid();
    const store = useAccountStore.getState();

    try {
      const tokens = await client.auth.loginUsername(username, password, keys?.cn, keys?.cv, true, device);
      if (tokens) {
        client.auth.setAccount(0);
        const authentication = client.auth.getAccount();
        const token2fa = getEDToken2FA(client) ?? normalizeEDToken(token2faHint);
        const profilePicture = (await fetchEDProfilePicture(client).catch(() => "")) ?? "";
        const account: Account = {
          id: device,
          firstName: authentication.prenom,
          lastName: authentication.nom,
          schoolName: authentication.nomEtablissement,
          customisation: {
            profilePicture,
            subjects: {}
          },
          services: [
            {
              id: device,
              auth: {
                additionals: {
                  "username": username,
                  "token": authentication.accessToken,
                  "cn": keys?.cn ?? "",
                  "cv": keys?.cv ?? "",
                  "deviceUUID": device,
                  ...(token2fa ? { "token2fa": token2fa } : {})
                }
              },
              serviceId: Services.ECOLEDIRECTE,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.addAccount(account);
        store.setLastUsedAccount(device);

        queueMicrotask(() => {
          router.push({
            pathname: "../end/color",
            params: { accountId: device },
          });
        });
      }
    } catch (e) {
      setIsLoggingIn(false);
      if (e instanceof Require2FA) {
        const questions = await client.auth.get2FAQuestion(e.token);
        setDoubleAuthChallenge(questions);
        setSession(client);
        setChallengeModalVisible(true);
        setToken(e.token);
      } else {
        Alert.alert(t("Alert_Auth_Error"), t("ONBOARDING_ALERT_LOGIN_ABORTED"));
      }
    }
  }

  const loginED = async () => {
    if (!username.trim() || !password.trim()) { return; }
    setIsLoggingIn(true);
    Keyboard.dismiss();
    await handleLogin(username, password);
    setIsLoggingIn(false);
  };

  async function handleChallenge(index: number) {
    setChallengeModalVisible(false);

    if (!session || !doubleAuthChallenge?.propositions?.[index]) { return }
    try {
      const keys = await session.auth.send2FAQuestion(doubleAuthChallenge.propositions[index], token ?? "");
      queueMicrotask(() => void handleLogin(username, password, keys, token));
    } catch {
      throw new Error("2FA challenge failed");
    }
  }

  function questionComponent({ item, index }: { item: unknown; index: number }) {
    return (
      <Reanimated.View
        entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
        exiting={FadeOutUp.springify().duration(400).delay(index * 80 + 150)}
      >
        <PlatformPressable
          onPress={() => {
            handleChallenge(index);
          }}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 10,
            paddingRight: 18,
            borderColor: colors.border,
            borderWidth: 1.5,
            borderRadius: 80,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Stack
            width={45}
            height={45}
            vAlign="center"
            hAlign="center"
            radius={80}
            backgroundColor={colors.border}
          >
            <Typography variant="h4" color={colors.text}>
              {index + 1}
            </Typography>
          </Stack>
          <Stack gap={0} style={{ width: "80%" }}>
            <Typography nowrap variant="title" style={{ width: "100%" }}>
              {String(item)}
            </Typography>
          </Stack>
        </PlatformPressable>
      </Reanimated.View>
    );
  }

  const headerHeight = useHeaderHeight();
  const finalHeaderHeight = Platform.select({
    android: headerHeight,
    default: insets.top
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, marginBottom: insets.bottom }} behavior="padding">
      <ScrollView contentContainerStyle={{ paddingTop: finalHeaderHeight, paddingBottom: insets.bottom }}>
              <LoginView
                color="#1788bc"
                serviceName="ÉcoleDirecte"
                serviceIcon={require('@/assets/images/service_ed.png')}
                loading={isLoggingIn}
                onSubmit={(values) => {
                  if (!isLoggingIn && values.username && values.password) {
                    setUsername(values.username);
                    setPassword(values.password);
                    loginED();
                  }
                }}
              />
            </ScrollView>

      <Modal
        visible={challengeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChallengeModalVisible(false)}
      >
        <OnboardingScrollingFlatList
          title={doubleAuthChallenge?.question ?? t("ONBOARDING_DOUBLE_AUTH")}
          color={"#E50052"}
          step={3}
          hasReturnButton={false}
          totalSteps={3}
          elements={doubleAuthChallenge?.propositions ?? []}
          renderItem={questionComponent}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

function getEDToken2FA(client: Client): string | undefined {
  try {
    return client.getToken2FA();
  } catch {
    return undefined;
  }
}

function normalizeEDToken(value?: string): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}
