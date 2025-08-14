import React from 'react';
import { StyleSheet, Dimensions, FlatList, Pressable, View, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { RelativePathString, router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';

import * as Papicons from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';
import ViewContainer from '@/ui/components/ViewContainer';
import { getLoginMethods, LoginMethod } from '../utils/constants';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Reanimated, { Extrapolate, FadeInDown, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedFlatList = Reanimated.createAnimatedComponent(FlatList);

const { width } = Dimensions.get('window');

const height = 680;

export default function WelcomeScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const animation = React.useRef<LottieView>(null);
  const local = useGlobalSearchParams();

  const scrollY = React.useRef(useSharedValue(0)).current;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const AnimatedHeaderStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(
      scrollY.value,
      [0, height - 270],
      [height, 270],
      Extrapolate.CLAMP
    ),
    height: height,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  }));

  const AnimatedLottieContainerStyle = useAnimatedStyle(() => ({
    paddingBottom: 110,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    opacity: interpolate(
      scrollY.value,
      [0, height - 270],
      [1, 0],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [0, height - 270],
          [1, 0.8],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const loginMethods = getLoginMethods((path: { pathname: string }) => {
    router.push(path.pathname as unknown as RelativePathString);
  });

  useFocusEffect(
    React.useCallback(() => {
      if (animation.current) {
        animation.current.reset();
        animation.current.play();
      }
    }, [])
  );

  return (
    <ViewContainer>
      <KeyboardAvoidingView>
        <Reanimated.View
          style={AnimatedHeaderStyle}
        >
          <Stack
            padding={32}
            backgroundColor='#C6C6C6'
            gap={20}
            style={{
              alignItems: 'center',
              justifyContent: 'flex-end',
              borderBottomLeftRadius: 42,
              borderBottomRightRadius: 42,
              paddingBottom: 34,
              borderCurve: "continuous",
              height: "100%",
            }}
          >
            <Reanimated.View style={AnimatedLottieContainerStyle}>
              <LinkIcon />
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
                  style={{ color: "#2F2F2F", lineHeight: 22, fontSize: 18 }}
                >
                  Étape 2
                </Typography>
                <Typography
                  variant="h5"
                  style={{ color: "#2F2F2FA6", lineHeight: 22, fontSize: 18 }}
                >
                  sur 3
                </Typography>
              </Stack>
              <Typography
                variant="h1"
                style={{ color: "#2F2F2F", fontSize: 32, lineHeight: 34 }}
              >
                Indique l’adresse URL de ton établissement
              </Typography>
            </Stack>
          </Stack>
        </Reanimated.View >

        <AnimatedFlatList
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          data={loginMethods.filter(methods => methods.availableFor.includes(Number(local.service)))}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: height + 16,
            paddingHorizontal: 16,
            gap: 9,
            paddingBottom: insets.bottom + 16,
          }}
          renderItem={({ item, index }) =>
          (
            <Reanimated.View
              entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
            >
              <AnimatedPressable
                key={(item as LoginMethod).id}
                onPress={(item as LoginMethod).onPress}
                style={[
                  {
                    paddingHorizontal: 18,
                    paddingVertical: 14,
                    borderColor: colors.border,
                    borderWidth: 1.5,
                    borderRadius: 80,
                    borderCurve: "continuous",
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                  }
                ]}
              >
                <Icon papicon>
                  {(item as LoginMethod).icon}
                </Icon>
                <Typography style={{ flex: 1 }} numberOfLines={1} variant='title' color={undefined}>
                  {(item as LoginMethod).description}
                </Typography>
              </AnimatedPressable>
            </Reanimated.View>
          )}
        />

        <Pressable
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            left: 16,
            top: insets.top + 4,
            zIndex: 200,
            backgroundColor: '#ffffff42',
            padding: 10,
            borderRadius: 100,
          }}
        >
          <Icon size={26} fill={"#fff"} papicon>
            <Papicons.Back />
          </Icon>
        </Pressable>
      </KeyboardAvoidingView>

    </ViewContainer >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});

const LinkIcon = () => (
  <Svg
    width={182}
    height={139}
    fill="none"
  >
    <Path
      fill="#fff"
      d="M139.878 31.3C130.977 13.247 112.399.814 90.887.814L51.86.884C23 2.348.062 26.2.062 55.413l.07 2.795c1.242 24.52 18.64 44.755 41.765 50.294 8.51 17.265 25.866 29.387 46.193 30.419l39.027.069c29.214 0 53.067-22.937 54.53-51.799l.068-2.795c0-25.76-17.835-47.347-41.837-53.096Z"
    />
    <Path
      fill="#9A9A9A"
      d="M90.887 15.558c18.262 0 33.655 12.285 38.368 29.041 21.016 1.111 37.716 18.504 37.716 39.797l-.05 2.05c-1.067 21.056-18.481 37.8-39.804 37.8H90.89l-2.053-.051c-17.356-.88-31.782-12.864-36.316-28.99-20.338-1.074-36.633-17.394-37.664-37.743l-.051-2.05c0-21.321 16.744-38.735 37.8-39.803l2.054-.05h36.227Zm38.979 48.187c-3.832 18.009-19.827 31.518-38.979 31.518H73.115c3.661 5.977 10.252 9.965 17.775 9.965h36.227c11.505 0 20.836-9.327 20.836-20.832 0-10.573-7.88-19.306-18.087-20.651Zm-38.976-.18c-8.612 0-16.002 5.226-19.175 12.679h19.172c8.612 0 16.004-5.226 19.179-12.679H90.89ZM54.66 34.581c-11.505 0-20.832 9.326-20.832 20.832.001 10.573 7.878 19.305 18.083 20.65 3.694-17.363 18.692-30.546 36.926-31.47l2.053-.051h17.773C105 38.567 98.408 34.58 90.887 34.58H54.66Z"
    />
  </Svg>
)