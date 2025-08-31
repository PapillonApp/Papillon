import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { checkDoubleAuth, DoubleAuthChallenge, DoubleAuthRequired, initDoubleAuth, login, Session } from "pawdirecte";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [doubleAuthAnswer, setDoubleAuthAnswer] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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

  async function handleDoubleAuthLogin() {
    if (!sessionRef.current || !doubleAuthAnswer) {
      error("Error during login");
      return;
    }

    const correct = checkDoubleAuth(sessionRef.current, doubleAuthAnswer);
    if (!correct) {
      console.log("Mauvaise réponse double auth");
      return;
    }

    await handleLogin("");
  }

  async function handleLogin(passwordParam: string) {
    try {
      const store = useAccountStore.getState();

      sessionRef.current ??= {
        username,
        device_uuid: uuid(),
      };

      const accounts = await login(sessionRef.current, passwordParam || password);
      const EDAccount = accounts[0];

      const account: Account = {
        id: sessionRef.current.device_uuid,
        firstName: EDAccount?.firstName ?? "",
        lastName: EDAccount?.lastName ?? "",
        schoolName: EDAccount?.schoolName,
        className: EDAccount?.class.short,
        services: [
          {
            id: sessionRef.current.device_uuid,
            auth: { session: sessionRef.current },
            serviceId: Services.ECOLEDIRECTE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.addAccount(account);
      store.setLastUsedAccount(sessionRef.current.device_uuid);

      router.push({
        pathname: "../end/color",
        params: { accountId: sessionRef.current.device_uuid },
      });
    } catch (err) {
      if (err instanceof DoubleAuthRequired && sessionRef.current) {
        const challenge = await initDoubleAuth(sessionRef.current);
        setDoubleAuthChallenge(challenge);
        setChallengeModalVisible(true);
      } else if (err instanceof Error) {
        alert.showAlert({
          title: "Erreur d'authentification",
          description:
            "Les identifiants que tu as saisis sont incorrects ou tu essaies de te connecter avec un compte parent. Ce type de compte n’est pas encore pris en charge par Papillon.",
          icon: "TriangleAlert",
          color: "#D60046",
          withoutNavbar: true,
        });
      }
    }
  }

  const loginED = () => {
    if (!username.trim() || !password.trim()) { return; }
    handleLogin(password);
  };

  function questionComponent({ item, index }: { item: string; index: number }) {
    return (
      <Reanimated.View
        entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
        exiting={FadeOutUp.springify().duration(400).delay(index * 80 + 150)}
      >
        <AnimatedPressable
          onPress={() => {
            setDoubleAuthAnswer(item);
            handleDoubleAuthLogin();
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
              {t("STEP")} 3
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
              loginED();
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
          onPress={loginED}
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