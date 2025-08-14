import React from 'react';
import { View, StyleSheet, Image, Dimensions, FlatList, Pressable, Platform, StatusBar } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import Button from '@/ui/components/Button';
import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';
import { Services } from '@/stores/account/types';

import * as Papicons from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';
import { log } from '@/utils/logger/logger';
import ViewContainer from '@/ui/components/ViewContainer';
import { getLoginMethods, getSupportedServices, getSupportedUniversities } from '../utils/constants';
import TableFlatList from '@/ui/components/TableFlatList';
import { HeaderBackButton } from '@react-navigation/elements';
import { NativeHeaderSide } from '@/ui/components/NativeHeader';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import { Extrapolate, FadeInDown, FadeInUp, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import Reanimated from "react-native-reanimated";
import { he } from 'date-fns/locale';
const AnimatedFlatList = Reanimated.createAnimatedComponent(FlatList);

const { width } = Dimensions.get('window');

const height = 480;

export default function WelcomeScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const animation = React.useRef<LottieView>(null);

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

  const loginMethods = getLoginMethods((redirect) => {
    router.push(redirect);
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
            <Typography
              variant="h5"
              style={{ color: "#FFFFFF80", lineHeight: 22, fontSize: 18 }}
            >
              Étape 2 sur 3
            </Typography>
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
          <AnimatedPressable
            key={item.id}
            onPress={item.onPress}
            entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
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
              {item.icon}
            </Icon>
            <Typography style={{ flex: 1 }} numberOfLines={1} variant='title' color={item.type == "other" ? "white" : undefined}>
              {item.description}
            </Typography>
          </AnimatedPressable>
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
    </ViewContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
