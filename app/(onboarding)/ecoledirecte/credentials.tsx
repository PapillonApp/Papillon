/* eslint-disable camelcase */
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { checkDoubleAuth, DoubleAuthChallenge, DoubleAuthRequired, initDoubleAuth, login, Session, setAccessToken } from "pawdirecte";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
import { error } from "@/utils/logger/logger";
import uuid from "@/utils/uuid/uuid";

const ANIMATION_DURATION = 170;

export default function EDLoginWithCredentials() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;

  const alert = useAlert();
  const { t } = useTranslation();

  const [challengeModalVisible, setChallengeModalVisible] = useState<boolean>(false);
  const [doubleAuthChallenge, setDoubleAuthChallenge] = useState<DoubleAuthChallenge | null>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [cachedPassword, setCachedPassword] = useState<string>("");

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

  const handleLogin = async (username: string, password: string, currentSession = session) => {
    try {
      const store = useAccountStore.getState();

      if (currentSession === null) {
        const accountID = uuid();
        currentSession = { username, device_uuid: accountID };
        setCachedPassword(password);
      }

      const accounts = await login(currentSession, password || cachedPassword);
      const userAccount = accounts[0];

      setAccessToken(currentSession, userAccount);
      const account: Account = {
        id: currentSession.device_uuid,
        firstName: userAccount.firstName,
        lastName: userAccount.lastName,
        schoolName: userAccount.schoolName,
        className: userAccount.class.short,
        services: [
          {
            id: currentSession.device_uuid,
            auth: { session: currentSession },
            serviceId: Services.ECOLEDIRECTE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            additionals: userAccount
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.addAccount(account);
      store.setLastUsedAccount(currentSession.device_uuid);

      queueMicrotask(() => {
        router.push({
          pathname: "../end/color",
          params: { accountId: currentSession!.device_uuid },
        });
      });
    } catch (err) {
      if (err instanceof DoubleAuthRequired) {
        const challenge = await initDoubleAuth(currentSession!).catch((e) => {
          alert.showAlert({
            title: "Erreur",
            technical: String(e)
          })
          return null;
        });
        setDoubleAuthChallenge(challenge);
        setSession(currentSession);
        setChallengeModalVisible(true);
        return;
      }
      if (error instanceof Error) {
        alert.showAlert({
          title: "Erreur d'authentification",
          description:
            "Les identifiants que tu as saisis sont incorrects ou tu essaies de te connecter avec un compte parent. Ce type de compte n’est pas encore pris en charge par Papillon.",
          icon: "TriangleAlert",
          color: "#D60046",
          withoutNavbar: true,
        });
      }
      else {
        alert.showAlert({
          title: "Erreur d'authentification",
          description: "Une erreur inconnue est survenue...",
          technical: String(err),
          icon: "TriangleAlert",
          color: "#D60046",
          withoutNavbar: true,
        });
      }
    }
  }

  const loginED = async () => {
    if (!username.trim() || !password.trim()) { return; }
    setIsLoggingIn(true);
    try {
      Keyboard.dismiss();
      await handleLogin(username, password);
    } catch (e) {

    } finally {
      setIsLoggingIn(false);
    }
  };

  async function handleChallenge(answer: string) {
    setChallengeModalVisible(false);

    if (!session) { return }
    const currentSession = { ...session };
    const correct = await checkDoubleAuth(currentSession, answer)

    if (!correct) {
      alert.showAlert({
        title: "Erreur d'authentification",
        description:
          "Les identifiants que tu as saisis sont incorrects ou tu essaies de te connecter avec un compte parent. Ce type de compte n’est pas encore pris en charge par Papillon.",
        icon: "TriangleAlert",
        color: "#D60046",
        withoutNavbar: true,
      });
      setDoubleAuthChallenge(null);
      setSession(null);
      return;
    }

    queueMicrotask(() => void handleLogin("", "", currentSession));
  }

  function questionComponent({ item, index }: { item: string; index: number }) {
    return (
      <Reanimated.View
        entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
        exiting={FadeOutUp.springify().duration(400).delay(index * 80 + 150)}
      >
        <AnimatedPressable
          onPress={() => {
            handleChallenge(item);
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
              {item}
            </Typography>
          </Stack>
        </AnimatedPressable>
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
              if (!isLoggingIn && username.trim() && password.trim())
                loginED();
            },
            returnKeyType: "done",
            editable: !isLoggingIn,
          }}
        />
        <Button
          title={isLoggingIn ? t("LOGIN_LOGINING") : t("LOGIN_BTN")}
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
          elements={doubleAuthChallenge?.answers ?? []}
          renderItem={questionComponent}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}
