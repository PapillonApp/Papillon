import * as Papicons from '@getpapillon/papicons';
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import { finishLoginManually, SecurityError, securitySave, securitySource, SessionHandle } from 'pawnote';
import React, { useCallback, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput } from 'react-native';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';
import { useAlert } from '@/ui/components/AlertProvider';
import Button from '@/ui/components/Button';
import Icon from '@/ui/components/Icon';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';
import ViewContainer from '@/ui/components/ViewContainer';

const INITIAL_HEIGHT = 570;
const COLLAPSED_HEIGHT = 270;

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

export default function Pronote2FA() {
  const insets = useSafeAreaInsets();
  const animation = React.useRef<LottieView>(null);

  const alert = useAlert()

  const [pinCode, setPinCode] = useState<string>("");

  const height = useSharedValue(INITIAL_HEIGHT);
  const local = useGlobalSearchParams();

  const error = JSON.parse(String(local.error)) as SecurityError;
  const session = JSON.parse(String(local.session)) as SessionHandle;
  const device = String(local.device);

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

  const animationCallback = useCallback(() => {
    if (animation.current) {
      animation.current.reset();
      animation.current.play();
    }
  }, []);

  useFocusEffect(animationCallback);

  return (
    <Pressable style={staticStyles.pressableContainer} onPress={Keyboard.dismiss}>
      <ViewContainer>
        <Reanimated.View style={AnimatedHeaderStyle}>
          <Stack
            padding={32}
            backgroundColor={local.previousPage === "map" ? '#E50052' : "#C6C6C6"}
            gap={20}
            style={staticStyles.stackContainer}
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
                  style={{ color: local.previousPage === "map" ? "white" : "#2F2F2F", lineHeight: 22, fontSize: 18 }}
                >
                  Étape 3
                </Typography>
                <Typography
                  variant="h5"
                  style={{ color: local.previousPage === "map" ? "#FFFFFFA6" : "#2F2F2FA6", lineHeight: 22, fontSize: 18 }}
                >
                  sur 3
                </Typography>
              </Stack>
              <Typography
                variant="h1"
                style={{ color: local.previousPage === "map" ? "white" : "#2F2F2F", fontSize: 32, lineHeight: 34 }}
              >
                Connecte-toi à ton compte PRONOTE
              </Typography>
            </Stack>
          </Stack>
        </Reanimated.View>
        <TextInput
          placeholder='Code PIN'
          value={pinCode}
          onChangeText={setPinCode}
        />
        <Button
          title={"login"}
          onPress={async () => {
            await securitySource(session, "Papillon");
            await securitySave(session, error.handle, {
              pin: pinCode,
              deviceName: "Papillon"
            })

            const context = error.handle.context
            const refresh = await finishLoginManually(
              session,
              context.authentication,
              context.identity,
              context.initialUsername
            )

            const splittedUsername = session.user.name.split(" ")
            const firstName = splittedUsername[splittedUsername.length - 1]
            const lastName = splittedUsername.slice(0, splittedUsername.length - 1).join(" ")
            const schoolName = session.user.resources[0].establishmentName
            const className = session.user.resources[0].className

            const account = {
              id: device,
              firstName,
              lastName,
              schoolName,
              className,
              services: [{
                id: device,
                auth: {
                  accessToken: refresh.token,
                  refreshToken: refresh.token,
                  additionals: {
                    instanceURL: refresh.url,
                    kind: refresh.kind,
                    username: refresh.username,
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
        <Pressable
          onPress={() => router.back()}
          style={[
            staticStyles.backButton,
            { top: insets.top + 4 }
          ]}
        >
          <Icon size={26} fill={local.previousPage === "map" ? "#FFFFFF" : "#00000080"} papicon>
            <Papicons.ArrowLeft />
          </Icon>
        </Pressable>
      </ViewContainer >
    </Pressable>
  );
}