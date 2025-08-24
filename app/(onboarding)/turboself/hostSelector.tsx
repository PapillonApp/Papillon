import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Pressable, TextInput, Keyboard, View, FlatList } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';

import * as Papicons from '@getpapillon/papicons';
import { authenticateWithCredentials, Host } from 'turboself-api'
import Icon from '@/ui/components/Icon';
import ViewContainer from '@/ui/components/ViewContainer';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import Button from '@/ui/components/Button';
import uuid from '@/utils/uuid/uuid';
import { useAccountStore } from '@/stores/account';
import { Services } from '@/stores/account/types';
import { useTheme } from '@react-navigation/native';
import AnimatedPressable from '@/ui/components/AnimatedPressable';

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
    fontWeight: "700",
    flex: 1,
  },
  iconBackground: {
    backgroundColor: "transparent",
  },
});

export default function TurboSelfSelectHost() {
  const insets = useSafeAreaInsets();
  const animation = React.useRef<LottieView>(null);

  const search = useLocalSearchParams();
  const height = useSharedValue(INITIAL_HEIGHT);

  const siblings = useMemo(() => {
    const parsedRef = Array.isArray(search.siblings)
      ? search.siblings
      : typeof search.siblings === "string"
        ? JSON.parse(search.siblings)
        : [];

    return parsedRef.map(
      (sibling: any) =>
        new Host(
          sibling.id,
          sibling.localId,
          sibling.etabId,
          sibling.firstName,
          sibling.lastName,
          sibling.mode,
          sibling.quality,
          sibling.division,
          sibling.lunchPrice,
          sibling.type,
          sibling.cardNumber,
          sibling.cafeteriaUrl,
          sibling.premissions
        )
    );
  }, [search.siblings]);

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
    return {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
      paddingBottom: 20
    };
  }, []);

  const theme = useTheme();
  const { colors } = theme;

  return (
    <Pressable style={staticStyles.pressableContainer} onPress={Keyboard.dismiss}>
      <ViewContainer>
        <Reanimated.View style={AnimatedHeaderStyle}>
          <Stack
            padding={32}
            backgroundColor={'#E70026'}
            gap={20}
            style={staticStyles.stackContainer}
          >
            <Reanimated.View style={AnimatedLottieContainerStyle}>
              <LottieView
                autoPlay
                loop={false}
                style={{ width: 230, height: 230 }}
                source={require('@/assets/lotties/turboself.json')}
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
                Choisis l'hôté assigné au compte
              </Typography>
            </Stack>
          </Stack>
        </Reanimated.View>

        <Reanimated.View style={[AnimatedInputContainerStyle, { gap: 10 }]}>
          <FlatList
            scrollEnabled={false}
            data={siblings}
            numColumns={2}
            renderItem={({ item }) => (
              <AnimatedPressable style={{ flex: 1 }} onPress={async () => {
                const user = item as Host
                const authentification = await authenticateWithCredentials(String(search.username), String(search.password), true, false, user.id)
                const accountId = uuid()
                const store = useAccountStore.getState()

                store.addAccount({
                  id: accountId,
                  firstName: authentification.host?.firstName ?? "N/A",
                  lastName: authentification.host?.lastName ?? "N/A",
                  schoolName: authentification.establishment?.name,
                  className: authentification.host?.division,
                  services: [{
                    id: accountId,
                    auth: {
                      additionals: {
                        username: String(search.username),
                        password: String(search.password),
                        "hoteId": authentification.host?.id ?? "N/A"
                      }
                    },
                    serviceId: Services.TURBOSELF,
                    createdAt: (new Date()).toISOString(),
                    updatedAt: (new Date()).toISOString()
                  }],
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
              }}>
                <Stack
                  hAlign="center"
                  style={{
                    flex: 1,
                    borderColor: colors.border,
                    borderWidth: 1,
                    padding: 15,
                    borderRadius: 25,
                    margin: 7.5,
                  }}
                >
                  <Icon papicon opacity={0.6} style={{ marginLeft: 4 }}>
                    <Papicons.User />
                  </Icon>
                  <Typography variant="body2" nowrap ellipsizeMode="tail">
                    {`${(item as Host).lastName.toUpperCase()} ${(item as Host).firstName}`}
                  </Typography>
                </Stack>
              </AnimatedPressable>
            )}
            keyExtractor={item => item.firstName}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ justifyContent: "space-between" }}
          />
        </Reanimated.View>

        <Pressable
          onPress={() => router.back()}
          style={[
            staticStyles.backButton,
            { top: insets.top + 4 }
          ]}
        >
          <Icon size={26} fill={"#FFFFFF"} papicon>
            <Papicons.ArrowLeft />
          </Icon>
        </Pressable>
      </ViewContainer >
    </Pressable>
  );
}