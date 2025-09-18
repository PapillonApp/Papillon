import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  View,
} from "react-native";
import Reanimated, {
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { useAlert } from "@/ui/components/AlertProvider";
import { useAccountStore } from "@/stores/account";
import { ServiceAccount, Services } from "@/stores/account/types";
import uuid from "@/utils/uuid/uuid";
import { useTranslation } from "react-i18next";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { INSTANCES, loginWithCredentials } from "appscho";

const ANIMATION_DURATION = 100;

export default function AppSchoCredentials() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { instanceId } = useLocalSearchParams<{ instanceId: string }>();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const instance = INSTANCES.find(inst => inst.id === instanceId);

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

  async function handleLogin(username: string, password: string) {
    if (!instance) {
      alert.showAlert({
        title: "Erreur",
        description: "Instance non trouvée",
        icon: "TriangleAlert",
        color: "#D60046",
        withoutNavbar: true,
      });
      return;
    }

    if (!username.trim() || !password.trim()) {
      alert.showAlert({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        icon: "TriangleAlert",
        color: "#D60046",
        withoutNavbar: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginWithCredentials(instance.id, username, password);

      const id = uuid();
      const service: ServiceAccount = {
        id,
        auth: {
          additionals: {
            instanceId: instance.id,
            username: username,
            password: password,
          },
        },
        serviceId: Services.APPSCHO,
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      };

      const store = useAccountStore.getState();

      store.addAccount({
        id,
        firstName: response.firstname,
        lastName: response.lastname,
        schoolName: instance.name,
        className: response.program ?? undefined,
        services: [service],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      });

      store.setLastUsedAccount(id);

      return router.push({
        pathname: "/(onboarding)/end/color",
        params: {
          accountId: id,
        },
      });
    } catch (error) {
      alert.showAlert({
        title: "Erreur d'authentification",
        description: "Une erreur est survenue lors de la connexion, elle a donc �t� abandonn�e.",
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(error),
        withoutNavbar: true,
      });
    } finally {
      setIsLoading(false);
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
          backgroundColor: "#1E3035",
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
            source={require("@/assets/lotties/uni-services.json")}
            autoPlay
            loop={false}
            style={{
              aspectRatio: 1,
              height: "100%",
              maxHeight: 250,
            }}
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
            {t("ONBOARDING_LOGIN_CREDENTIALS")} {instance?.name || "AppScho"}
          </Typography>
        </Stack>
      </View>

      {isLoading ? (
        <View
          style={{
            alignItems: "center",
            gap: 10,
            padding: 20,
            height: 200,
            justifyContent: "center",
          }}
        >
          <ActivityIndicator />
          <View>
            <Typography variant="h4" color="text" align="center">
              {t("WAITING")}
            </Typography>
            <Typography variant="body2" color="secondary" align="center">
              {t("ONBOARDING_LOADING_LOGIN")}
            </Typography>
          </View>
        </View>
      ) : (
        <Stack padding={20} gap={10}>
          <OnboardingInput
            icon="User"
            placeholder={t("INPUT_USERNAME")}
            text={username}
            setText={setUsername}
            isPassword={false}
            inputProps={{
              autoCapitalize: "none",
              autoCorrect: false,
              spellCheck: false,
              textContentType: "username",
            }}
          />
          <OnboardingInput
            icon="Lock"
            placeholder={t("INPUT_PASSWORD")}
            text={password}
            setText={setPassword}
            isPassword={true}
            inputProps={{
              autoCapitalize: "none",
              autoCorrect: false,
              spellCheck: false,
              textContentType: "password",
              onSubmitEditing: () => {
                Keyboard.dismiss();
                handleLogin(username, password);
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
            onPress={() => handleLogin(username, password)}
          />
        </Stack>
      )}
      
      <OnboardingBackButton />
    </KeyboardAvoidingView>
  );
}