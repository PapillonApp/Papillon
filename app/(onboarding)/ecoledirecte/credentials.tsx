
import { Client, DoubleAuthQuestions, DoubleAuthResult, Require2FA } from "@blockshub/blocksdirecte";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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

  const handleLogin = async (username: string, password: string, keys?: DoubleAuthResult) => {
    const client = new Client();
    const device = uuid();
    const store = useAccountStore.getState();

    try {
      const tokens = await client.auth.loginUsername(username, password, keys?.cn, keys?.cv, true, device);
      if (tokens) {
        client.auth.setAccount(0);
        const authentication = client.auth.getAccount();
        const account: Account = {
          id: device,
          firstName: authentication.prenom,
          lastName: authentication.nom,
          schoolName: authentication.nomEtablissement,
          services: [
            {
              id: device,
              auth: {
                additionals: {
                  "username": username,
                  "token": authentication.accessToken,
                  "cn": keys?.cn ?? "",
                  "cv": keys?.cv ?? "",
                  "deviceUUID": device
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
      }
      alert.showAlert({
        title: "Erreur d'authentification",
        description: "Une erreur est survenue lors de la connexion, elle a donc été abandonnée.",
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(e),
        withoutNavbar: true,
      });
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
      queueMicrotask(() => void handleLogin(username, password, keys));
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
            {t("ONBOARDING_LOGIN_CREDENTIALS")} Ecole Directe
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
              if (!isLoggingIn && username.trim() && password.trim()) { loginED(); }
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
          onPress={loginED}
          disabled={isLoggingIn}
          loading={isLoggingIn}
        />
      </Stack>

      <OnboardingBackButton />

      <Modal
        visible={challengeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChallengeModalVisible(false)}
      >
        <OnboardingScrollingFlatList
          title={doubleAuthChallenge?.question ?? "Double Auth"}
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
