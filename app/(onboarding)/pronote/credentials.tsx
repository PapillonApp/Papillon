import { useTheme } from '@react-navigation/native';
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import { AccountKind, createSessionHandle, loginCredentials, SecurityError } from 'pawnote';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { useAccountStore } from '@/stores/account';
import { Account, Services } from '@/stores/account/types';
import { useAlert } from '@/ui/components/AlertProvider';
import Button from '@/ui/components/Button';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import ViewContainer from '@/ui/components/ViewContainer';
import { URLToBase64 } from '@/utils/attachments/helper';
import { customFetcher } from '@/utils/pronote/fetcher';
import { GetIdentityFromPronoteUsername } from '@/utils/pronote/name';
import uuid from '@/utils/uuid/uuid';

const INITIAL_HEIGHT = 570;
const COLLAPSED_HEIGHT = 270;
const KEYBOARD_HEIGHT = 270;
const ANIMATION_DURATION = 170;


export default function PronoteLoginWithCredentials() {
  const animation = React.useRef<LottieView>(null);
  const theme = useTheme();
  const { colors } = theme;

  const alert = useAlert()
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("");

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

  const { t } = useTranslation();

  return (
    <Pressable style={styles.pressableContainer} onPress={Keyboard.dismiss}>
      <ViewContainer>
        <Reanimated.View style={AnimatedHeaderStyle}>
          <Stack
            padding={32}
            backgroundColor={theme.dark ? '#2f2f2fff' : '#C6C6C6'}
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
                  style={{ color: colors.text, lineHeight: 22, fontSize: 18 }}
                >
                  {t("STEP")} 3
                </Typography>
                <Typography
                  variant="h5"
                  style={{ color: colors.text + "A6", lineHeight: 22, fontSize: 18 }}
                >
                  {t("STEP_OUTOF")} 3
                </Typography>
              </Stack>
              <Typography
                variant="h1"
                style={{ color: colors.text, fontSize: 32, lineHeight: 34 }}
              >
                {t("ONBOARDING_LOGIN_CREDENTIALS")} PRONOTE
              </Typography>
            </Stack>
          </Stack>
        </Reanimated.View>

        <Reanimated.View style={AnimatedInputContainerStyle}>
          <OnboardingInput
            icon={"User"}
            placeholder={t("INPUT_USERNAME")}
            text={username}
            setText={setUsername}
            isPassword={false}
            keyboardType={"default"}
            inputProps={{}}
          />
          <OnboardingInput
            icon={"Lock"}
            placeholder={t("INPUT_PASSWORD")}
            text={password}
            setText={setPassword}
            isPassword={true}
            keyboardType={"default"}
            inputProps={{}}
          />
          <Button
            title={t("LOGIN_BTN")}
            style={{
              backgroundColor: theme.dark ? theme.colors.border : "black",
            }}
            size='large'
            disableAnimation
            onPress={async () => {
              if (!username.trim() || !password.trim()) { return; }
              const device = uuid()
              const session = createSessionHandle(customFetcher)
              let authentication = null;
              try {
                authentication = await loginCredentials(session, {
                  url: String(local.url),
                  deviceUUID: device,
                  kind: AccountKind.STUDENT,
                  username: username.trim(),
                  password: password.trim()
                }).catch((error) => {
                  if (error instanceof SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
                    router.push({
                      pathname: "/(onboarding)/pronote/2fa",
                      params: {
                        error: JSON.stringify(error),
                        session: JSON.stringify(session),
                        deviceId: device
                      }
                    })
                  } else {
                    throw error;
                  }
                });
              } catch (error) {
                return alert.showAlert({
                  title: "Identifiants incorrects",
                  description: "Nous n’avons pas réussi à te connecter à ton compte Pronote. Vérifie ton identifiant et ton mot de passe puis essaie de nouveau.",
                  icon: "TriangleAlert",
                  color: "#D60046",
                  technical: String(error),
                  withoutNavbar: true
                })
              }

              if (!authentication) {
                return alert.showAlert({
                  title: "Erreur d'authentification",
                  description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
                  icon: "TriangleAlert",
                  color: "#D60046",
                  withoutNavbar: true
                });
              }

              const { firstName, lastName } = GetIdentityFromPronoteUsername(session.user.name)
              const schoolName = session.user.resources[0].establishmentName
              const className = session.user.resources[0].className
              let pp = "";
              if (session.user.resources[0].profilePicture?.url) {
                pp = await URLToBase64(session.user.resources[0].profilePicture?.url)
              }
              const account: Account = {
                id: device,
                firstName,
                lastName,
                schoolName,
                className,
                customisation: {
                  profilePicture: pp,
                  subjects: {}
                },
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