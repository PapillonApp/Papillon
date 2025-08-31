import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import { useAlert } from "@/ui/components/AlertProvider";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import uuid from "@/utils/uuid/uuid";
import { useTheme } from "@react-navigation/native";
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { checkDoubleAuth, DoubleAuthChallenge, DoubleAuthRequired, initDoubleAuth, login, Session } from "pawdirecte";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import OnboardingScrollingFlatList from "@/components/onboarding/OnboardingScrollingFlatList";
import { error } from "@/utils/logger/logger";
import { useTranslation } from "react-i18next";
import OnboardingInput from "@/components/onboarding/OnboardingInput";

const ANIMATION_DURATION = 170;


export default function EDLoginWithCredentials() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;

  const alert = useAlert();
  const { t } = useTranslation();
  const [session, setSession] = useState<Session>();
  const [challengeModalVisible, setChallengeModalVisible] = useState<boolean>(false);
  const [doubleAuthChallenge, setDoubleAuthChallenge] = useState<DoubleAuthChallenge | null>(null);
  const [doubleAuthAnswer, setDoubleAuthAnswer] = useState<string | null>(null);

  const [username, setUsername] = useState<string>("")
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

  function handleDoubleAuthLogin() {
    if (!session || !doubleAuthAnswer) {
      error("Skill Issue");
    }

    const correct = checkDoubleAuth(session, doubleAuthAnswer);
    if (!correct) {
      console.log(correct);
    }

    queueMicrotask(() => void handleLogin("", session));
  }

  async function handleLogin(password: string, session: Session) {
    try {
      const store = useAccountStore.getState();
      const accounts = await login(session, password);
      const EDAccount = accounts[0];

      const account: Account = {
        id: session.device_uuid,
        firstName: EDAccount?.firstName ?? "",
        lastName: EDAccount?.lastName ?? "",
        schoolName: EDAccount?.schoolName,
        className: EDAccount?.class.short,
        services: [
          {
            id: session.device_uuid,
            auth: {
              session: session,
            },
            serviceId: Services.ECOLEDIRECTE,
            createdAt: (new Date()).toISOString(),
            updatedAt: (new Date()).toISOString(),
          },
        ],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      };

      store.addAccount(account);
      store.setLastUsedAccount(session.device_uuid);

      return router.push({
        pathname: "../end/color",
        params: {
          accountId: session.device_uuid,
        },
      });
    } catch (error) {
      if (error instanceof DoubleAuthRequired) {
        setSession(session);
        setDoubleAuthChallenge(await initDoubleAuth(session));
        setChallengeModalVisible(true);
      }

      if (error instanceof Error) {
        alert.showAlert({
          title: "Erreur d'authentification",
          description: "Les identifiants que tu as saisis sont incorrects ou tu essaies de te connecter avec un compte parent. Ce type de compte n’est pas encore pris en charge par Papillon.",
          icon: "TriangleAlert",
          color: "#D60046",
          withoutNavbar: true,
        });
      }
    }
  }

  function questionComponent({ item, index }: { item: string, index: number }) {
    return (
      <Reanimated.View
        entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
        exiting={FadeOutUp.springify().duration(400).delay(index * 80 + 150)}
      >
        <AnimatedPressable
          pointerEvents={"auto"}
          onPress={() => {
            setDoubleAuthAnswer(item);
            if (session && doubleAuthAnswer) {
              handleDoubleAuthLogin();
            }
          }}
          style={[
            {
              paddingHorizontal: 10,
              paddingVertical: 10,
              paddingRight: 18,
              borderColor: colors.border,
              borderWidth: 1.5,
              borderRadius: 80,
              borderCurve: "continuous",
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              overflow: "hidden",
              display: "flex",
            },
          ]}
        >
          <Stack
            width={45}
            height={45}
            vAlign="center"
            hAlign="center"
            radius={80}
            backgroundColor={colors.border}
          >
            <Typography
              variant="h4"
              color={colors.text}
            >
              {index + 1}
            </Typography>
          </Stack>
          <Stack gap={0}
                 style={{ width: "80%" }}
          >
            <Typography
              style={{ width: "100%" }}
              nowrap={true}
              variant="title"
            >
              {item}
            </Typography>
          </Stack>
        </AnimatedPressable>
      </Reanimated.View>
    );
  }

  const loginED = () => {
    if (!username.trim() && !password.trim()) return;
    const device_uuid = uuid();
    if (!session) {
      const newSession = { username, device_uuid };
      setSession(newSession);
    }
    handleLogin(password, session!);
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
            {t("ONBOARDING_LOGIN_CREDENTIALS")} Ecole Directe
          </Typography>
        </Stack>
      </View>
      <Stack padding={20}
             gap={10}
      >
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
        onRequestClose={() => {
          setChallengeModalVisible(false);
        }}
      >
        <OnboardingScrollingFlatList
          title={doubleAuthChallenge?.question ?? "Tu as les crampté ?"}
          color={"#E50052"}
          step={3}
          hasReturnButton={false}
          totalSteps={3}
          elements={doubleAuthChallenge?.answers ?? ["Quoi", "cou", "beh"]}
          renderItem={questionComponent}
        />
        );
      </Modal>
    </KeyboardAvoidingView>
  );
}