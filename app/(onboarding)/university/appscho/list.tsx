import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import Reanimated, {
  FadeInDown,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import LottieView from "lottie-react-native";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { useTranslation } from "react-i18next";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import OnboardingScrollingFlatList from "@/components/onboarding/OnboardingScrollingFlatList";
import { RelativePathString, router } from "expo-router";
import { INSTANCES } from "appscho";
import OnboardingInput from "@/components/onboarding/OnboardingInput";


export default function AppschoInstancesList() {
  const theme = useTheme();
  const { colors } = theme;

  const [search, setSearch] = useState<string>("");
  const { t } = useTranslation();

  const filteredInstances = useMemo(() => {
    if (!search.trim()) return INSTANCES;
    return INSTANCES.filter(instance => 
      instance.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <OnboardingScrollingFlatList
      color={'#1E3035'}
      lottie={require('@/assets/lotties/uni-services.json')}
      title={t("ONBOARDING_SELECT_UNIVERSITIESERVICE")}
      step={1}
      totalSteps={3}
      elements={[
        { isSearchBar: true },
        ...filteredInstances
      ]}
      renderItem={({ item, index }) => {
        if (item.isSearchBar) {
          return (
            <View style={{ marginBottom: 15 }}>
              <OnboardingInput
                placeholder={t("SEARCH_PLACEHOLDER", "Rechercher une instance...")}
                text={search}
                setText={setSearch}
                icon="Search"
                inputProps={{}}
              />
            </View>
          );
        }

        return (
          <Reanimated.View
            entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
          >
            <AnimatedPressable
              onPress={() => {
                requestAnimationFrame(() => {
                  if (item.casurl) {
                    router.push(`./webview?instanceId=${item.id}` as RelativePathString);
                  } else {
                    router.push(`./credentials?instanceId=${item.id}` as RelativePathString);
                  }
                });
              }}
              style={{
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
              }}
            >
              <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: colors.primary,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant='title' color="white">{item.name.charAt(0).toUpperCase()}</Typography>
                </View>
              </View>
              <Typography style={{ flex: 1 }} nowrap variant='title'>{item.name}</Typography>
            </AnimatedPressable>
          </Reanimated.View>
        );
      }}
    />
  );
}
