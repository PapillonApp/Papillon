import { Butterfly, Papicons } from '@getpapillon/papicons';
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import { AccountKind, createSessionHandle, loginCredentials, SecurityError } from 'pawnote';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Keyboard, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Reanimated, {
  Extrapolate,
  FadeInDown,
  FadeOutUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Fetcher } from "@literate.ink/utilities";

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
import { customFetcher } from '@/utils/pronote/fetcher';
import { checkDoubleAuth, DoubleAuthChallenge, DoubleAuthRequired, initDoubleAuth, login, Session } from 'pawdirecte';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import TableFlatList from '@/ui/components/TableFlatList';
import { Avatar } from '@/app/(features)/(news)/news';
import OnboardingScrollingFlatList from '@/components/onboarding/OnboardingScrollingFlatList';
import { error } from '@/utils/logger/logger';
import { useTranslation } from 'react-i18next';

const INITIAL_HEIGHT = 570;
const COLLAPSED_HEIGHT = 270;
const KEYBOARD_HEIGHT = 270;
const ANIMATION_DURATION = 170;
const OPACITY_THRESHOLD = 600;


export default function EDLoginWithCredentials() {
  const insets = useSafeAreaInsets();
  const animation = React.useRef<LottieView>(null);
  const theme = useTheme();
  const { colors } = theme;

  const alert = useAlert()
  const { t } = useTranslation();
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("");
  const [session, setSession] = useState<Session>();
  const [challengeModalVisible, setChallengeModalVisible] = useState<boolean>(false);
  const [doubleAuthChallenge, setDoubleAuthChallenge] = useState<DoubleAuthChallenge | null>(null);
  const [doubleAuthAnswer, setDoubleAuthAnswer] = useState<string | null>(null);

  const height = useSharedValue(INITIAL_HEIGHT);
  const local = useGlobalSearchParams();

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

  function handleDoubleAuthLogin() {
    if (!session || !doubleAuthAnswer) {
      error("Skill Issue")
    }

    const correct = checkDoubleAuth(session, doubleAuthAnswer)
    if (!correct) {
      console.log(correct)
    }

    queueMicrotask(() => void handleLogin("", session))
  }

  async function handleLogin(password: string, session: Session) {
    try {
      const store = useAccountStore.getState()
      const accounts = await login(session, password)
      const EDAccount = accounts[0]

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
              session: session
            },
            serviceId: Services.ECOLEDIRECTE,
            createdAt: (new Date()).toISOString(),
            updatedAt: (new Date()).toISOString()
          }
        ],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString()
      }

      store.addAccount(account)
      store.setLastUsedAccount(session.device_uuid)

      return router.push({
        pathname: "../end/color",
        params: {
          accountId: session.device_uuid
        }
      });
    } catch (error) {
      if (error instanceof DoubleAuthRequired) {
        setSession(session)
        setDoubleAuthChallenge(await initDoubleAuth(session));
        setChallengeModalVisible(true);
      }

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
              handleDoubleAuthLogin()
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
              overflow: 'hidden',
              display: 'flex',
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
          <Stack gap={0} style={{ width: "80%" }}>
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
    )
  }

  return (
    <Pressable style={styles.pressableContainer} onPress={Keyboard.dismiss}>
      <ViewContainer>
        <Reanimated.View style={AnimatedHeaderStyle}>
          <Stack
            padding={32}
            backgroundColor={"#E50052"}
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
                {t("ONBOARDING_LOGIN_CREDENTIALS")} Ecole Directe
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
              if (!username.trim() && !password.trim()) return;
              const device_uuid = uuid()
              if (!session) {
                const newSession = { username, device_uuid }
                setSession(newSession)
              }
              handleLogin(password, session!)
            }}
          />
        </Reanimated.View>
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