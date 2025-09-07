import React from 'react';
import { useTheme } from '@react-navigation/native';
import { RelativePathString, router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';

import Typography from '@/ui/components/Typography';
import Icon from '@/ui/components/Icon';
import { GetLoginMethods, LoginMethod } from '../utils/constants';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import OnboardingScrollingFlatList from "@/components/onboarding/OnboardingScrollingFlatList";
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen() {
  const theme = useTheme();
  const { colors } = theme;

  const { t } = useTranslation();

  const animation = React.useRef<LottieView>(null);
  const local = useGlobalSearchParams();

  const loginMethods = GetLoginMethods((path: { pathname: RelativePathString }) => {
    router.push({
      pathname: path.pathname,
      params: { service: local.service }
    });
  }).filter(service => service.availableFor.includes(Number(local.service)));

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
      lottie={require('@/assets/lotties/connexion.json')}
      title={t("ONBOARDING_LOGIN_METHOD")}
      color={'#E37900'}
      step={2}
      totalSteps={3}
      elements={loginMethods}
      renderItem={({ item, index }: { item: LoginMethod, index: number }) =>
      (
        <Reanimated.View
          entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
        >
          <AnimatedPressable
            key={item.id}
            onPress={item.onPress}
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
            <Typography style={{ flex: 1 }} nowrap variant='title'>
              {item.description}
            </Typography>
          </AnimatedPressable>
        </Reanimated.View>
      )}
    />
  );
}
