import * as Papicons from '@getpapillon/papicons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Keyboard, Linking, Pressable, StyleSheet, TextInput, View } from "react-native";
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import Button from '@/ui/components/Button';
import Icon from '@/ui/components/Icon';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import ViewContainer from '@/ui/components/ViewContainer';
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { login, tokenize } from 'ezly';
import { useAlert } from '@/ui/components/AlertProvider';
import { useAccountStore } from '@/stores/account';
import { ServiceAccount, Services } from '@/stores/account/types';
import uuid from '@/utils/uuid/uuid';
import { log } from '@/utils/logger/logger';
import { useTranslation } from 'react-i18next';

const COLLAPSED_HEIGHT = 270;
const KEYBOARD_HEIGHT = 270;
const ANIMATION_DURATION = 100;
const OPACITY_THRESHOLD = 400;

const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressableContainer: {
    flex: 1,
  },
  stackContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    paddingBottom: 34,
    borderCurve: "continuous",
    height: "100%",
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 200,
    backgroundColor: '#ffffff42',
    padding: 10,
    borderRadius: 100,
  },
  inputContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F2F2F2",
    borderRadius: 300,
    borderWidth: 1,
    borderColor: "#0000001F",
  },
  textInput: {
    color: "#5B5B5B",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  iconBackground: {
    backgroundColor: "transparent",
  },
});

export default function TurboSelfLoginWithCredentials() {
  const animation = React.useRef<LottieView>(null);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [linkSended, setLinkSended] = useState<boolean>(false);

  const params = useLocalSearchParams();
  const action = String(params.action)

  const INITIAL_HEIGHT = Dimensions.get("window").height / 1.5;
  const height = useSharedValue(INITIAL_HEIGHT);

  const keyboardListeners = useMemo(() => ({
    show: () => {
      'worklet';
      height.value = withTiming(KEYBOARD_HEIGHT, { duration: ANIMATION_DURATION });
    },
    hide: () => {
      'worklet';
      height.value = withTiming(INITIAL_HEIGHT, { duration: ANIMATION_DURATION });
    }
  }), [height]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      const scheme = url.split(":")[0];
      if (scheme === "izly") {
        log("[IzlyActivation] Activation link received:", url);
        handleActivation(url);
      } else {
        log("[IzlyActivation] Ignoring link:", url);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    Linking.addEventListener("url", handleDeepLink);

    const showSub = Keyboard.addListener('keyboardWillShow', keyboardListeners.show);
    const hideSub = Keyboard.addListener('keyboardWillHide', keyboardListeners.hide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardListeners]);

  const AnimatedHeaderStyle = useAnimatedStyle(() => {
    'worklet';
    const heightDiff = height.value - COLLAPSED_HEIGHT;

    return {
      maxHeight: interpolate(
        0,
        [0, heightDiff],
        [height.value, COLLAPSED_HEIGHT],
        Extrapolate.CLAMP
      ),
      height: height.value,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2,
    };
  }, []);

  const AnimatedInputContainerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      paddingTop: height.value + 16,
      paddingHorizontal: 21,
      gap: 9
    };
  }, []);

  const animationCallback = useCallback(() => {
    if (animation.current) {
      animation.current.reset();
      animation.current.play();
    }
  }, []);

  useFocusEffect(animationCallback);

  const { t } = useTranslation();

  const AnimatedLottieContainerStyle = useAnimatedStyle(() => {
    'worklet';
    const isKeyboardVisible = height.value < OPACITY_THRESHOLD;

    const opacity = isKeyboardVisible ? 0 : 1

    return {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
      opacity: withTiming(opacity, { duration: isKeyboardVisible ? 150 : 100 }),
      paddingBottom: 20
    };
  }, []);

  const alert = useAlert();
  const latestPassword = useRef<string>("");

  async function handleLogin(username: string, password: string) {
    try {
      latestPassword.current = password;
      await login(username, password)
      setLinkSended(true);
    } catch (error) {
      alert.showAlert({
        title: "Erreur d'authentification",
        description: "Une erreur est survenue lors de la connexion, elle a donc été abandonnée.",
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(error),
        withoutNavbar: true
      });
    }
  }

  async function handleActivation(url: string) {
    const id = uuid()
    const { identification, profile } = await tokenize(url)
    const service: ServiceAccount = {
      id,
      auth: {
        session: identification,
        additionals: {
          secret: latestPassword.current
        }
      },
      serviceId: Services.IZLY,
      createdAt: (new Date()).toISOString(),
      updatedAt: (new Date()).toISOString()
    }

    const store = useAccountStore.getState()

    if (action === "addService") {
      store.addServiceToAccount(store.lastUsedAccount, service)
      router.back()
      return router.back()
    }

    store.addAccount({
      id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      services: [service],
      createdAt: (new Date()).toISOString(),
      updatedAt: (new Date()).toISOString()
    })
    store.setLastUsedAccount(id)

    return router.push({
      pathname: "/(onboarding)/end/color",
      params: {
        accountId: id
      }
    });
  }

  return (
    <Pressable style={staticStyles.pressableContainer} onPress={Keyboard.dismiss}>
      <ViewContainer>
        <Reanimated.View style={AnimatedHeaderStyle}>
          <Stack
            padding={32}
            backgroundColor={'#56CEF5'}
            gap={20}
            style={staticStyles.stackContainer}
          >
            <Reanimated.View style={AnimatedLottieContainerStyle}>
              <LottieView
                autoPlay
                loop={false}
                style={{ width: 230, height: 230 }}
                source={require('@/assets/lotties/izly.json')}
              />
            </Reanimated.View>
            <Stack vAlign="start" hAlign="start" width="100%" gap={12}>
              <Stack flex direction="horizontal">
                <Typography
                  variant="h5"
                  style={{ color: "#000000", lineHeight: 22, fontSize: 18 }}
                >
                  {t("STEP")} 3
                </Typography>
                <Typography
                  variant="h5"
                  style={{ color: "#000000A6", lineHeight: 22, fontSize: 18 }}
                >
                  {t("STEP_OUTOF")} 3
                </Typography>
              </Stack>
              <Typography
                variant="h1"
                style={{ color: "#000000", fontSize: 32, lineHeight: 34 }}
              >
                {t("ONBOARDING_LOGIN_CREDENTIALS")} Izly
              </Typography>
            </Stack>
          </Stack>
        </Reanimated.View>

        {linkSended ? (
          <View
            style={{
              alignItems: "center",
              paddingTop: INITIAL_HEIGHT + 70,
              gap: 20,
            }}
          >
            <ActivityIndicator />
            <View>
              <Typography variant="h4" color="text" align="center">
                {t("WAITING")}
              </Typography>
              <Typography variant="body2" color="secondary" align="center">
                {t("IZLY_SMS_SEND")}
              </Typography>
            </View>
          </View>
        ) : (
          <Reanimated.View style={AnimatedInputContainerStyle}>
            <Stack flex direction="horizontal" hAlign="center" vAlign="center">
              <Stack
                flex
                direction="horizontal"
                vAlign="center"
                hAlign="center"
                style={staticStyles.inputContainer}
              >
                <Icon
                  papicon
                  size={24}
                  fill="#5B5B5B"
                  style={staticStyles.iconBackground}
                >
                  <Papicons.User />
                </Icon>
                <TextInput
                  placeholder={t("INPUT_PHONE_OR_MAIL")}
                  placeholderTextColor="#5B5B5B"
                  onChangeText={setUsername}
                  value={username}
                  style={staticStyles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                />
              </Stack>
            </Stack>

            <Stack flex direction="horizontal" hAlign="center" vAlign="center">
              <Stack
                flex
                direction="horizontal"
                vAlign="center"
                hAlign="center"
                style={staticStyles.inputContainer}
              >
                <Icon
                  papicon
                  size={24}
                  fill="#5B5B5B"
                  style={staticStyles.iconBackground}
                >
                  <Papicons.Lock />
                </Icon>
                <TextInput
                  placeholder={t("INPUT_PASSWORD_CODE")}
                  placeholderTextColor="#5B5B5B"
                  onChangeText={setPassword}
                  value={password}
                  style={staticStyles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  secureTextEntry
                  keyboardType="numeric"
                />
              </Stack>
            </Stack>

            <Button
              title={t("LOGIN_BTN")}
              color="black"
              size="large"
              disableAnimation
              onPress={() => handleLogin(username, password)}
            />
          </Reanimated.View>
        )}

        <OnboardingBackButton />
      </ViewContainer>
    </Pressable>
  );
}