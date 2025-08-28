import * as Papicons from '@getpapillon/papicons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Authenticator } from 'pawrd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput } from 'react-native';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';
import Button from '@/ui/components/Button';
import Icon from '@/ui/components/Icon';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import ViewContainer from '@/ui/components/ViewContainer';
import uuid from '@/utils/uuid/uuid';
import OnboardingBackButton from "@/components/onboarding/OnboardingBackButton";

const INITIAL_HEIGHT = 500;
const COLLAPSED_HEIGHT = 270;
const KEYBOARD_HEIGHT = 250;
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
  const insets = useSafeAreaInsets();
  const animation = React.useRef<LottieView>(null);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [siteId, setSiteId] = useState<string>("");
  const params = useLocalSearchParams();
  const action = String(params.action);

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

  return (
    <Pressable style={staticStyles.pressableContainer} onPress={Keyboard.dismiss}>
      <ViewContainer>
        <Reanimated.View style={AnimatedHeaderStyle}>
          <Stack
            padding={32}
            backgroundColor={'#275F8A'}
            gap={20}
            style={staticStyles.stackContainer}
          >
            <Reanimated.View style={AnimatedLottieContainerStyle}>
              <LottieView
                autoPlay
                loop={false}
                style={{ width: 230, height: 230 }}
                source={require('@/assets/lotties/ard.json')}
              />
            </Reanimated.View>
            <Stack
              vAlign='start'
              hAlign='start'
              width="100%"
              gap={12}
            >
              <Stack flex direction="horizontal">
                <Typography
                  variant="h5"
                  style={{ color: "white", lineHeight: 22, fontSize: 18 }}
                >
                  Étape 3
                </Typography>
                <Typography
                  variant="h5"
                  style={{ color: "#FFFFFFA6", lineHeight: 22, fontSize: 18 }}
                >
                  sur 3
                </Typography>
              </Stack>
              <Typography
                variant="h1"
                style={{ color: "white", fontSize: 32, lineHeight: 34 }}
              >
                Connecte-toi à ton compte ARD
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
              style={staticStyles.inputContainer}
            >
              <Icon
                papicon
                size={24}
                fill="#5B5B5B"
                style={staticStyles.iconBackground}
              >
                <Papicons.Link />
              </Icon>
              <TextInput
                placeholder="Identifiant de ton établissement"
                placeholderTextColor="#5B5B5B"
                onChangeText={setSiteId}
                value={siteId}
                style={staticStyles.textInput}
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
                placeholder="Nom d'utilisateur"
                placeholderTextColor="#5B5B5B"
                onChangeText={setUsername}
                value={username}
                style={staticStyles.textInput}
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
                placeholder="Mot de passe"
                placeholderTextColor="#5B5B5B"
                onChangeText={setPassword}
                value={password}
                style={staticStyles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="url"
                secureTextEntry
                keyboardType="default"
              />
            </Stack>
          </Stack>
          <Button
            title='Se connecter'
            color='black'
            size='large'
            disableAnimation
            onPress={async () => {
              const authenticator = new Authenticator();
              const authentification = await authenticator.fromCredentials(siteId, username, password)
              const accountId = uuid()
              const store = useAccountStore.getState()
              const service = {
                id: accountId,
                auth: {
                  additionals: {
                    schoolId: siteId,
                    password,
                    username
                  }
                },
                serviceId: Services.ARD,
                createdAt: (new Date()).toISOString(),
                updatedAt: (new Date()).toISOString()
              }

              if (action === "addService") {
                store.addServiceToAccount(store.lastUsedAccount, service)
                router.back()
                return router.back()
              }

              store.addAccount({
                id: accountId,
                firstName: "",
                lastName: "",
                schoolName: authentification.schoolName,
                services: [service],
                createdAt: (new Date()).toISOString(),
                updatedAt: (new Date()).toISOString()
              })

              store.setLastUsedAccount(accountId)
              return router.push({
                pathname: "../end/color",
                params: {
                  accountId
                }
              });

            }}
          />
        </Reanimated.View>

        <OnboardingBackButton/>
      </ViewContainer >
    </Pressable>
  );
}