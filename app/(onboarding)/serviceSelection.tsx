import React from 'react';
import { View, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { RelativePathString, router, UnknownInputParams, useFocusEffect } from 'expo-router';
import LottieView from 'lottie-react-native';

import Typography from '@/ui/components/Typography';

import Icon from '@/ui/components/Icon';
import { GetSupportedServices, SupportedService } from './utils/constants';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import OnboardingScrollingFlatList from "@/components/onboarding/OnboardingScrollingFlatList";
import { useTranslation } from 'react-i18next';


export default function WelcomeScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const animation = React.useRef<LottieView>(null);

  const services = GetSupportedServices((path: { pathname: string, options?: UnknownInputParams }) => {
    router.push({
      pathname: path.pathname as unknown as RelativePathString,
      params: path.options ?? {} as unknown as UnknownInputParams
    });
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
    <OnboardingScrollingFlatList
      color={'#D51A67'}
      lottie={require('@/assets/lotties/school-services.json')}
      title={t("ONBOARDING_SELECT_SCHOOLSERVICE")}
      step={1}
      totalSteps={3}
      elements={services}
      renderItem={({ item, index }: { item: SupportedService, index: number }) => item.type === 'separator' ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            marginVertical: 6,
            opacity: 0.4,
            marginHorizontal: 32,
          }}
          onLayout={event => {
            console.log(event.nativeEvent.layout.height);
          }}
        >
          <View
            style={{
              flex: 1,
              height: 2,
              borderRadius: 4,
              backgroundColor: colors.text,
              opacity: 0.5
            }}
          />
          <Typography variant='title' inline>ou</Typography>
          <View
            style={{
              flex: 1,
              height: 2,
              borderRadius: 4,
              backgroundColor: colors.text,
              opacity: 0.5
            }}
          />
        </View>
      ) :
        (
          <Reanimated.View
            entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
          >
            <AnimatedPressable
              onPress={() => {
                requestAnimationFrame(() => {
                  item.onPress();
                });
              }}
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
                  display: 'flex',
                  gap: 16,
                },
                item.type == "other" && !item.color && {
                  backgroundColor: colors.text,
                  borderColor: colors.text,
                }
              ]}
            >
              <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                {item.icon ?
                  <Icon size={28} papicon fill={item.type == "other" && !item.color ? colors.background : undefined}>
                    {item.icon}
                  </Icon>
                  :
                  <Image
                    source={item.image}
                    style={{ width: 32, height: 32, borderRadius: 20 }}
                    resizeMode="cover"
                  />
                }
              </View>
              <Typography style={{ flex: 1 }} nowrap variant='title' color={item.type == "other" && !item.color ? colors.background : undefined}>
                {item.title}
              </Typography>
            </AnimatedPressable>
          </Reanimated.View>
        )}
    />
  );
}

