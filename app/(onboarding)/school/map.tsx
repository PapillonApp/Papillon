import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { RelativePathString, router, useFocusEffect, useGlobalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";

import Typography from "@/ui/components/Typography";
import Stack from "@/ui/components/Stack";

import { getProfileColorByName } from "@/utils/chats/colors";

import Reanimated, { FadeInDown, FadeOutUp, } from "react-native-reanimated";
import { calculateDistanceBetweenPositions, getCurrentPosition } from "@/utils/native/position";
import { useAlert } from "@/ui/components/AlertProvider";
import { Services } from "@/stores/account/types";
import { geolocation } from "pawnote";
import { getInitials } from "@/utils/chats/initials";
import { log } from "@/utils/logger/logger";
import { GeographicQuerying, GeographicReverse } from "@/utils/native/georeverse";
import { SearchSchools } from "skolengojs";

import { School as SkolengoSkool } from "skolengojs";
import OnboardingScrollingFlatList from "@/components/onboarding/OnboardingScrollingFlatList";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export interface School {
  name: string,
  distance: number,
  url: string,
  ref?: SkolengoSkool
}

async function fetchSchools(service: Services, alert: ReturnType<typeof useAlert>, city?: string): Promise<School[]> {
  let pos = null;
  if (!city) {
    pos = await getCurrentPosition();

    if (pos === null) {
      alert.showAlert({
        title: "Impossible de récuperer la position",
        description: "Nous n'avons pas pu récupérer votre position. Veuillez vérifier que le mode avion est désactivé et que l'application dispose des autorisations nécessaires.",
        icon: "TriangleAlert",
        color: "#D60046",
        withoutNavbar: true,
      });
    }
  }

  if (city && service !== Services.SKOLENGO) {
    pos = await GeographicQuerying(city);
  }

  if (service === Services.PRONOTE) {
    const schools = await geolocation({ latitude: pos?.latitude ?? 0, longitude: pos?.longitude ?? 0 });
    return schools.map(item => ({
      name: item.name,
      distance: item.distance / 10,
      url: item.url,
    }));
  }

  if (service === Services.SKOLENGO) {
    let cityName: string | undefined;

    if (city) {
      cityName = city;
    }
    else if (pos?.latitude && pos?.longitude) {
      cityName = (await GeographicReverse(pos.latitude, pos.longitude)).city;
    }
    else {
      return [];
    }

    const schools = await SearchSchools(cityName, 50);
    const list: School[] = [];

    for (const school of schools) {
      let distance = 0;

      if (pos?.latitude && pos?.longitude) {
        if (school.location.addressLine?.trim() && school.location.city?.trim() && school.location.zipCode?.trim()) {
          const position = await GeographicQuerying(
            `${school.location.addressLine} ${school.location.city} ${school.location.zipCode}`
          );
          distance = calculateDistanceBetweenPositions(
            pos.latitude,
            pos.longitude,
            position.longitude,
            position.latitude
          );
        }
      }

      list.push({
        name: school.name,
        distance: distance / 1000,
        url: "",
        ref: school,
      });
    }

    return list;
  }


  return [];
}

type SchoolItem = {
  title: string,
  description: string,
  initials: string,
  distance: number,
  onPress: () => void
}

export default function SelectSchoolOnMap() {
  const { colors } = useTheme();
  const animation = React.useRef<LottieView>(null);

  const alert = useAlert();

  const [schools, setSchools] = useState<Array<School>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const local = useGlobalSearchParams();
  console.log(local)
  const city = local.method === "manual" ? local.city : undefined
  const getPosition = useCallback(async () => {
    const fetchedSchools = await fetchSchools(Number(local.service), alert, city?.toString());
    setSchools([]);
    setTimeout(() => { setSchools(fetchedSchools); }, 10); // For letting placeholder animation play correctly
    setLoading(false);
  }, []);

  React.useEffect(() => {
    getPosition();
  }, [getPosition]);

  const animationCallback = useCallback(() => {
    if (animation.current) {
      animation.current.reset();
      animation.current.play();
    }
  }, []);

  const schoolsItem = useMemo(() => {
    const sanitizeSchoolName = (name: string) => {
      return name.replace(/\b(lycée|collège|techn|technologique|générale|professionnel|privé)\.?/gi, "").trim();
    };

    return schools.map(school => {
      const sanitizedSchoolName = sanitizeSchoolName(school.name);
      return {
        title: school.name,
        distance: school.distance,
        description: "à " + ((school.distance / 100).toFixed(2)) + "km de " + (local.method === "manual" ? local.city : "toi"),
        initials: getInitials(sanitizedSchoolName),
        onPress: () => {
          log("Opening Webview for service " + Services[Number(local.service)] + " and URL " + school.url);
          if (Number(local.service) === Services.SKOLENGO) {
            return router.push({
              pathname: "../" + Services[Number(local.service)].toLowerCase() + "/webview" as unknown as RelativePathString,
              params: { ref: JSON.stringify(school.ref) },
            });
          }
          return router.push({
            pathname: "../" + Services[Number(local.service)].toLowerCase() + "/webview" as unknown as RelativePathString,
            params: { url: school.url },
          });
        },
      };
    });
  }, [schools]);

  useFocusEffect(animationCallback);

  const loadingArray: SchoolItem[] = new Array(3).fill({
    title: "",
    description: "",
    initials: "",
    onPress: () => { }
  })

  const { t } = useTranslation();

  return (
    <OnboardingScrollingFlatList
      lottie={require("@/assets/lotties/location.json")}
      title={t("ONBOARDING_SELECT_SCHOOL")}
      color={"#E50052"}
      step={2}
      totalSteps={3}
      elements={loading ? loadingArray : schoolsItem}
      renderItem={({ item, index }: { item: SchoolItem, index: number }) => (
        <Reanimated.View
          entering={FadeInDown.springify().duration(400).delay(index * 80 + 150)}
          exiting={FadeOutUp.springify().duration(400).delay(index * 80 + 150)}
        >
          <AnimatedPressable
            pointerEvents={loading ? "none" : "auto"}
            onPress={item.onPress}
            style={[
              {
                paddingHorizontal: 10,
                paddingVertical: 10,
                paddingRight: 18,
                borderColor: colors.border,
                borderWidth: 1.5,
                borderRadius: 80,
                borderCurve: "continuous",
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                overflow: 'hidden',
                display: 'flex',
              },
            ]}
          >
            <Stack
              width={45}
              height={45}
              vAlign="center"
              hAlign="center"
              radius={80}
              backgroundColor={loading ? colors.text + "20" : getProfileColorByName(item.initials) + "50"}
            >
              {!loading && (
                <Typography
                  variant="h4"
                  color={getProfileColorByName(item.initials)}
                >
                  {item.initials}
                </Typography>
              )}
            </Stack>
            <Stack gap={loading ? 5 : 0} style={{ width: "80%" }}>
              {
                loading ? (
                  <View style={{ width: "70%", height: 18, borderRadius: 5, backgroundColor: colors.text + "20" }} />
                ) : (
                  <Typography
                    style={{ width: "100%" }}
                    nowrap={true}
                    variant="title"
                  >
                    {item.title}
                  </Typography>
                )
              }

              {
                loading ? (
                  <View style={{ width: "40%", height: 12, borderRadius: 5, backgroundColor: colors.text + "20" }} />
                ) : (
                  item.distance !== 0 && (
                    <Typography
                      style={{ flex: 1 }}
                      nowrap
                      variant="caption"
                      color={colors.text + "99"}
                    >
                      {item.description}
                    </Typography>
                  )
                )
              }
            </Stack>
          </AnimatedPressable>
        </Reanimated.View>
      )}
    />
  );
}