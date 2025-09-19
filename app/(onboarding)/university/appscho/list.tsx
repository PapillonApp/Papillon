import { Image, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import Reanimated, {
  FadeInDown
} from "react-native-reanimated";

import Typography from "@/ui/components/Typography";
import { useTranslation } from "react-i18next";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import OnboardingScrollingFlatList from "@/components/onboarding/OnboardingScrollingFlatList";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { RelativePathString, router } from "expo-router";
import { INSTANCES } from "appscho";


const UNIVERSITY_LOGOS: { [key: string]: any } = {
  alijia: require('@/assets/images/univ/alijia.webp'),
  bsb: require('@/assets/images/univ/bsb.webp'),
  digitalcampus: require('@/assets/images/univ/digitalcampus.webp'),
  edhec: require('@/assets/images/univ/edhec.webp'),
  eigsi: require('@/assets/images/univ/eigsi.webp'),
  emstra: require('@/assets/images/univ/emstra.webp'),
  epp: require('@/assets/images/univ/epp.webp'),
  esaip: require('@/assets/images/univ/esaip.webp'),
  esarc: require('@/assets/images/univ/esarc.webp'),
  esg: require('@/assets/images/univ/esg.webp'),
  esigelec: require('@/assets/images/univ/esigelec.webp'),
  essca: require('@/assets/images/univ/essca.webp'),
  essec: require('@/assets/images/univ/essec.webp'),
  estp: require('@/assets/images/univ/estp.webp'),
  hec: require('@/assets/images/univ/hec.webp'),
  icp: require('@/assets/images/univ/icp.png'),
  ieu: require('@/assets/images/univ/ieu.webp'),
  iicp: require('@/assets/images/univ/iicp.webp'),
  ipp: require('@/assets/images/univ/ipp.webp'),
  iseg: require('@/assets/images/univ/iseg.webp'),
  lisaa: require('@/assets/images/univ/lisaa.webp'),
  macromedia: require('@/assets/images/univ/macromedia.webp'),
  mbs: require('@/assets/images/univ/mbs.webp'),
  merkure: require('@/assets/images/univ/merkure.webp'),
  psb: require('@/assets/images/univ/psb.jpg'),
  pstb: require('@/assets/images/univ/pstb.webp'),
  regent: require('@/assets/images/univ/regent.webp'),
  sciencespo: require('@/assets/images/univ/sciencepo.webp'),
  scpoaix: require('@/assets/images/univ/scpoaix.webp'),
  ubmont: require('@/assets/images/univ/ubmont.webp'),
  uclouvain: require('@/assets/images/univ/uclouvain.webp'),
  ucly: require('@/assets/images/univ/ucly.webp'),
  ueve: require('@/assets/images/univ/ueve.webp'),
  uniassas: require('@/assets/images/univ/uniassas.webp'),
  unilyon3: require('@/assets/images/univ/unilyon3.webp'),
  unimes: require('@/assets/images/univ/unimes.webp'),
  unimons: require('@/assets/images/univ/unimons.webp'),
  unitoulon: require('@/assets/images/univ/unitoulon.webp'),
  univangers: require('@/assets/images/univ/univangers.webp'),
  unieiffel: require('@/assets/images/univ/univeiffel.webp'),
  univpoitiers: require('@/assets/images/univ/univpoitiers.webp'),
  upjv: require('@/assets/images/univ/upjv.webp'),
  wsfactory: require('@/assets/images/univ/wsfactory.png'),
};


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
                placeholder={t("SEARCH_UNIV_PLACEHOLDER")}
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
                    router.push({pathname: './webview', params: { instanceId: item.id }})
                  } else {
                    router.push({pathname: './credentials', params: { instanceId: item.id }})
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
                  {UNIVERSITY_LOGOS[item.id] ? (
                    <Image
                      source={UNIVERSITY_LOGOS[item.id]}
                      style={{ width: 32, height: 32 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ width: 32, height: 32, backgroundColor: colors.border, borderRadius: 16 }} />
                  )}
              </View>
              <Typography style={{ flex: 1 }} nowrap variant='title'>{item.name}</Typography>
            </AnimatedPressable>
          </Reanimated.View>
        );
      }}
    />
  );
}
