import React from 'react';
import { StyleSheet, Dimensions, FlatList, Pressable } from 'react-native';
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

const AnimatedFlatList = Reanimated.createAnimatedComponent(FlatList);

let height = 500;

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

  const loginMethods = getLoginMethods((path: { pathname: RelativePathString }) => {
    router.push({
      pathname: path.pathname,
      params: { service: local.service }
    });
  }).filter(service => service.availableFor.includes(Number(local.service)));

  height = 650 - 30 * loginMethods.length

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
      <Reanimated.View
        style={AnimatedHeaderStyle}
      >
        <Stack
          padding={32}
          backgroundColor='#E37900'
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
            <LottieView
              autoPlay
              loop={false}
              style={{ width: 230, height: 230 }}
              source={require('@/assets/lotties/connexion.json')}
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
                Étape 2
              </Typography>
              <Typography
                variant="h5"
                style={{ color: "#FFFFFF90", lineHeight: 22, fontSize: 18 }}
              >
                sur 3
              </Typography>
            </Stack>
            <Typography
              variant="h1"
              style={{ color: "white", fontSize: 32, lineHeight: 34 }}
            >
              Comment souhaites-tu te connecter ?
            </Typography>
          </Stack>
        </Stack>
      </Reanimated.View>

      <AnimatedFlatList
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        data={loginMethods}
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
              <Typography style={{ flex: 1 }} nowrap variant='title' color={undefined}>
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
          <Papicons.ArrowLeft />
        </Icon>
      </Pressable>
    </ViewContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
