import { useTheme } from '@react-navigation/native';
import { RelativePathString, router, UnknownInputParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';

import OnboardingScrollingFlatList from "@/components/onboarding/OnboardingScrollingFlatList";
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Typography from '@/ui/components/Typography';

import { GetSupportedUniversities, SupportedUniversity } from "../utils/constants";

export default function WelcomeScreen() {
  const theme = useTheme();
  const { colors } = theme;

  const { t } = useTranslation()

  const services = GetSupportedUniversities((path: { pathname: string, options?: UnknownInputParams }) => {
    router.push({ pathname: path.pathname as unknown as RelativePathString, params: path.options ?? {} as unknown as UnknownInputParams });
  });

  return (
    <OnboardingScrollingFlatList
      color={'#1E3035'}
      lottie={require('@/assets/lotties/uni-services.json')}
      title={t("ONBOARDING_SELECT_UNIVERSITIESERVICE")}
      step={1}
      totalSteps={3}
      elements={services}
      renderItem={({ item, index }) =>
        (item as SupportedUniversity).type === 'separator' ? (
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
            <Typography variant='title' inline>{(item as SupportedUniversity).title}</Typography>
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
                    (item as SupportedUniversity).onPress();
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
                    justifyContent: 'flex-start',
                    display: 'flex',
                    gap: 16,
                  },
                  (item as SupportedUniversity).type == "other" && {
                    backgroundColor: colors.text,
                    borderColor: colors.text,
                  }
                ]}
              >
                <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    source={(item as SupportedUniversity).image}
                    style={{ width: 32, height: 32 }}
                    resizeMode="cover"
                  />
                </View>
                <Typography style={{ flex: 1 }} nowrap variant='title' color={(item as SupportedUniversity).type == "other" ? "white" : undefined}>{(item as SupportedUniversity).title}</Typography>
              </AnimatedPressable>
            </Reanimated.View>
          )}
    />
  );
}