import { Papicons } from '@getpapillon/papicons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Keyboard, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Reanimated, {
  Extrapolate,
  FadeInDown,
  FadeOutUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { useAccountStore } from '@/stores/account';
import { Account, Services } from '@/stores/account/types';
import { useAlert } from '@/ui/components/AlertProvider';
import Button from '@/ui/components/Button';
import Icon from '@/ui/components/Icon';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import ViewContainer from '@/ui/components/ViewContainer';
import uuid from '@/utils/uuid/uuid';
import { useTheme } from '@react-navigation/native';
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import { authWithCredentials } from 'esup-multi.js';
import { error } from '@/utils/logger/logger';
import { useTranslation } from 'react-i18next';

const COLLAPSED_HEIGHT = 270;
const KEYBOARD_HEIGHT = 270;
const ANIMATION_DURATION = 170;
const OPACITY_THRESHOLD = 600;


export default function MultiLoginWithCredentials() {
  const animation = React.useRef<LottieView>(null);
  const theme = useTheme();
  const { colors } = theme;

  const alert = useAlert()
  const { t } = useTranslation();
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("");
  const [challengeModalVisible, setChallengeModalVisible] = useState<boolean>(false);
  const [doubleAuthAnswer, setDoubleAuthAnswer] = useState<string | null>(null);
  const param = useLocalSearchParams();
  const instanceUrl = String(param.url);
  const university = String(param.university);
  const color = String(param.color);

  const { height: screenHeight } = Dimensions.get("screen");
  const INITIAL_HEIGHT = screenHeight / 1.5;
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

  async function handleLogin(password: string, username: string) {
    try {
      const store = useAccountStore.getState()
      const MultiAccount = await authWithCredentials(instanceUrl, { username, password });
      const accountUUID = String(uuid());

      const account: Account = {
        id: accountUUID,
        firstName: MultiAccount?.userData.firstname ?? "",
        lastName: MultiAccount?.userData.name ?? "",
        schoolName: university,
        services: [
          {
            id: uuid(),
            auth: {
              refreshToken: MultiAccount.userData.refreshAuthToken,
              additionals: { instanceURL: instanceUrl },
            },
            serviceId: Services.MULTI,
            createdAt: (new Date()).toISOString(),
            updatedAt: (new Date()).toISOString()
          }
        ],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString()
      }

      store.addAccount(account)
      store.setLastUsedAccount(accountUUID)

      return router.push({
        pathname: "../../end/color",
        params: {
          accountId: accountUUID
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        alert.showAlert({
          title: "Erreur d'authentification",
          description: "Les identifiants que tu as saisis sont incorrects ou tu essaies de te connecter avec un compte parent. Ce type de compte n’est pas encore pris en charge par Papillon.",
          icon: "TriangleAlert",
          color: "#D60046",
          withoutNavbar: true
        });
      }
    }
  }

  return (
    <Pressable style={styles.pressableContainer} onPress={Keyboard.dismiss}>
      <ViewContainer>
        <Reanimated.View style={AnimatedHeaderStyle}>
          <Stack
            padding={32}
            backgroundColor={color}
            gap={20}
            style={styles.stackContainer}
          >
            <Stack
              vAlign='start'
              hAlign='start'
              width="100%"
              gap={12}
            >
              <Stack flex direction="horizontal">
                <Typography
                  variant="h5"
                  style={{ color: "#FFFFFF", lineHeight: 22, fontSize: 18 }}
                >
                  {t("STEP")} 3
                </Typography>
                <Typography
                  variant="h5"
                  style={{ color: "#FFFFFF" + "A6", lineHeight: 22, fontSize: 18 }}
                >
                  {t("STEP_OUTOF")} 3
                </Typography>
              </Stack>
              <Typography
                variant="h1"
                style={{ color: "#FFFFFF", fontSize: 32, lineHeight: 34 }}
              >
                {t("ONBOARDING_LOGIN_CREDENTIALS")} {university}
              </Typography>
            </Stack>
          </Stack>
        </Reanimated.View>

        <Reanimated.View style={AnimatedInputContainerStyle}>
          <Stack flex direction="horizontal" hAlign="center" vAlign="center">
            <Stack
              flex
              direction="horizontal"
              vAlign="center"
              hAlign="center"
              style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Icon
                papicon
                size={24}
                fill="#5B5B5B"
                style={styles.iconBackground}
              >
                <Papicons name={"User"} />
              </Icon>
              <TextInput
                placeholder={t("INPUT_USERNAME")}
                placeholderTextColor="#5B5B5B"
                onChangeText={setUsername}
                value={username}
                style={[styles.textInput, { color: colors.text }]}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="url"
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
              style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Icon
                papicon
                size={24}
                fill="#5B5B5B"
                style={styles.iconBackground}
              >
                <Papicons name={"Lock"} />
              </Icon>
              <TextInput
                placeholder={t("INPUT_PASSWORD")}
                placeholderTextColor="#5B5B5B"
                onChangeText={setPassword}
                value={password}
                style={styles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="url"
                secureTextEntry
                keyboardType="default"
                onSubmitEditing={async () => {
                  handleLogin(password, username);
                }}
              />
            </Stack>
          </Stack>
          <Button
            title={t("LOGIN_BTN")}
            color='black'
            size='large'
            style={{ borderColor: colors.border, borderWidth: 1 }}
            disableAnimation
            onPress={async () => {
              handleLogin(password, username);
            }}
          />
        </Reanimated.View>
        <OnboardingBackButton />
      </ViewContainer >
    </Pressable>
  );
}

const styles = StyleSheet.create({
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