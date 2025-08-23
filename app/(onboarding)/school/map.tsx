import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Pressable, Keyboard, View, ActivityIndicator } from 'react-native';
import { RelativePathString, router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

import Typography from '@/ui/components/Typography';
import Stack from '@/ui/components/Stack';

import { getProfileColorByName } from "@/utils/chats/colors"

import * as Papicons from '@getpapillon/papicons';
import Icon from '@/ui/components/Icon';
import ViewContainer from '@/ui/components/ViewContainer';
import Reanimated, {
  Extrapolate,
  interpolate,
  LinearTransition,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Mask, Path } from 'react-native-svg';
import { calculateDistanceBetweenPositions, CurrentPosition, getCurrentPosition } from '@/utils/native/position';
import { Alert, useAlert } from '@/ui/components/AlertProvider';
import { Services } from '@/stores/account/types';
import { geolocation } from 'pawnote';
import TableFlatList from '@/ui/components/TableFlatList';
import { getInitials } from '@/utils/chats/initials';
import { log } from '@/utils/logger/logger';
import { GeographicQuerying, GeographicReverse } from '@/utils/native/georeverse';
import { SearchSchools } from 'skolengojs';

const INITIAL_HEIGHT = 450;
const COLLAPSED_HEIGHT = 300;

const AnimatedFlatList = Reanimated.createAnimatedComponent(TableFlatList);

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
  iconBackground: {
    backgroundColor: "transparent",
  },
});

const MapIcon = React.memo(() => (
  <Svg
    width={117}
    height={131}
    fill="none"
  >
    <Mask
      id="a"
      width={127.369}
      height={139.247}
      x={-4.187}
      y={-3.99}
      fill="#000"
      maskUnits="userSpaceOnUse"
    >
      <Path fill="#fff" d="M-4.187-3.99h127.369v139.247H-4.187z" />
      <Path d="M54.88 12.834c35.383-2.825 62.674 32.76 43.413 62.617-8.019 12.43-19.837 28.807-27.269 38.938a10.147 10.147 0 0 1-15.294 1.271c-9.003-8.764-23.364-22.965-33.325-33.9-23.927-26.265-2.888-65.87 32.476-68.926Z" />
    </Mask>
    <Path
      fill="#DB006E"
      d="M54.88 12.834c35.383-2.825 62.674 32.76 43.413 62.617-8.019 12.43-19.837 28.807-27.269 38.938a10.147 10.147 0 0 1-15.294 1.271c-9.003-8.764-23.364-22.965-33.325-33.9-23.927-26.265-2.888-65.87 32.476-68.926Z"
    />
    <Path
      fill="#fff"
      d="m54.88 12.834-.932-11.676-.038.003-.038.004 1.009 11.67Zm43.413 62.617-9.842-6.35 9.842 6.35Zm-27.269 38.938 9.445 6.928-9.444-6.928ZM55.73 115.66l-8.17 8.393 8.17-8.393Zm-33.325-33.9-8.66 7.888 8.66-7.888ZM54.88 12.834l.932 11.676c13.491-1.077 25.248 5.177 31.76 14.22 6.34 8.807 7.613 19.93.878 30.37l9.842 6.35 9.843 6.35c12.525-19.415 9.783-41.013-1.552-56.757C95.419 9.536 75.839-.59 53.948 1.158l.933 11.676Zm43.412 62.617-9.842-6.35C80.64 81.206 69.01 97.333 61.58 107.46l9.444 6.929 9.444 6.928c7.434-10.134 19.439-26.762 27.667-39.517l-9.843-6.35Zm-27.269 38.938-9.444-6.929c.541-.737 1.665-.831 2.32-.193l-8.17 8.393-8.17 8.393c9.54 9.288 25.033 7.999 32.909-2.736l-9.444-6.928ZM55.73 115.66l8.17-8.393c-9-8.76-23.135-22.745-32.836-33.395l-8.66 7.888-8.658 7.888c10.222 11.221 24.807 25.638 33.813 34.405l8.17-8.393Zm-33.325-33.9 8.659-7.888c-8.367-9.185-8.949-20.365-4.15-30.098 4.929-9.995 15.491-18.105 28.975-19.27l-1.008-11.67-1.009-11.67c-21.88 1.891-39.518 15.112-47.968 32.25-8.58 17.4-7.718 39.154 7.842 56.234l8.659-7.888Z"
      mask="url(#a)"
    />
    <Circle
      cx={57.462}
      cy={54.521}
      r={15.529}
      fill="#fff"
      transform="rotate(-4.753 57.462 54.52)"
    />
  </Svg>
));
MapIcon.displayName = 'MapIcon';

import { School as SkolengoSkool } from 'skolengojs';

export interface School {
  name: string,
  distance: number,
  url: string,
  ref?: SkolengoSkool
}

async function fetchSchools(service: Services, alert: ReturnType<typeof useAlert>, city?: string): Promise<School[]> {
  let pos = null
  if (!city) {
    pos = await getCurrentPosition();

    if (pos === null) {
      alert.showAlert({
        title: "Impossible de récuperer la position",
        description: "Nous n'avons pas pu récupérer votre position. Veuillez vérifier que le mode avion est désactivé et que l'application dispose des autorisations nécessaires.",
        icon: "TriangleAlert",
        color: "#D60046",
        withoutNavbar: true
      });
    }
  }

  if (city) {
    pos = await GeographicQuerying(city)
  }

  if (service === Services.PRONOTE) {
    const schools = await geolocation({ latitude: pos?.latitude ?? 0, longitude: pos?.longitude ?? 0 })
    return schools.map(item => ({
      name: item.name,
      distance: item.distance,
      url: item.url
    }))
  }

  if (service === Services.SKOLENGO) {
    let cityName: string = city || (await GeographicReverse(pos?.latitude ?? 0, pos?.longitude ?? 0)).city
    const schools = await SearchSchools(cityName, 50);
    const list: School[] = []

    for (const school of schools) {
      const position = await GeographicQuerying(`${school.location.addressLine} ${school.location.city} ${school.location.zipCode}`)
      const distance = calculateDistanceBetweenPositions(pos?.latitude ?? 0, pos?.longitude ?? 0, position.longitude, position.latitude)
      list.push({
        name: school.name,
        distance: distance / 1000,
        url: "",
        ref: school
      })
    }

    return list
  }

  return []
}

export default function SelectSchoolOnMap() {
  const insets = useSafeAreaInsets();
  const animation = React.useRef<LottieView>(null);

  const alert = useAlert()

  const scrollY = useSharedValue(0);
  const height = useSharedValue(INITIAL_HEIGHT);
  const [position, setPosition] = useState<CurrentPosition | null>();
  const [schools, setSchools] = useState<Array<School>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const local = useGlobalSearchParams();

  const getPosition = useCallback(async () => {
    const fetchedSchools = await fetchSchools(Number(local.service), alert, local.method === "manual" ? String(local.city) : undefined);
    setSchools(fetchedSchools);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    getPosition();
  }, [getPosition]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const AnimatedHeaderStyle = useAnimatedStyle(() => {
    'worklet';
    const heightDiff = height.value - COLLAPSED_HEIGHT;

    return {
      maxHeight: interpolate(
        scrollY.value,
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

  const AnimatedLottieContainerStyle = useAnimatedStyle(() => {
    'worklet';
    const heightDiff = height.value - COLLAPSED_HEIGHT;

    const opacity = interpolate(
      scrollY.value,
      [0, heightDiff],
      [1, 0],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, heightDiff],
      [1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
      opacity: withTiming(opacity, { duration: 100 }),
      transform: [{ scale }]
    };
  }, []);

  const animationCallback = useCallback(() => {
    if (animation.current) {
      animation.current.reset();
      animation.current.play();
    }
  }, []);

  const schoolsItem = useMemo(() => {
    const sanitizeSchoolName = (name: string) => {
      return name.replace(/\b(lycée|collège|techn|technologique|générale|professionnel|privé)\.?/gi, '').trim();
    };

    return schools.map(school => {
      const sanitizedSchoolName = sanitizeSchoolName(school.name);
      return {
        title: school.name,
        description: "à " + (school.distance / 100).toFixed(2) + "km de " + (local.method === "manual" ? local.city : "toi"),
        leading: <View style={{ width: 32, height: 32, backgroundColor: getProfileColorByName(sanitizedSchoolName) + 50, borderRadius: 8, alignItems: "center" }}>
          <Typography variant="h6" color={getProfileColorByName(sanitizedSchoolName)}>
            {getInitials(sanitizedSchoolName)}
          </Typography>
        </View>,
        onPress: () => {
          log("Opening Webview for service " + Services[Number(local.service)] + " and URL " + school.url);
          if (Number(local.service) === Services.SKOLENGO) {
            return router.push({
              pathname: "../" + Services[Number(local.service)].toLowerCase() + "/webview" as unknown as RelativePathString,
              params: { ref: JSON.stringify(school.ref) }
            })
          }
          return router.push({
            pathname: "../" + Services[Number(local.service)].toLowerCase() + "/webview" as unknown as RelativePathString,
            params: { url: school.url }
          })
        }
      };
    });
  }, [schools]);

  useFocusEffect(animationCallback);

  return (
    <Pressable style={staticStyles.pressableContainer} onPress={Keyboard.dismiss}>
      <ViewContainer>
        <Reanimated.View style={AnimatedHeaderStyle}>
          <Stack
            padding={32}
            backgroundColor='#E50052'
            gap={20}
            style={staticStyles.stackContainer}
          >
            <Reanimated.View style={AnimatedLottieContainerStyle}>
              <MapIcon />
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
                Choisis ton établissement dans la liste
              </Typography>
            </Stack>
          </Stack>
        </Reanimated.View>
        {loading ? (
          <Stack direction={"vertical"} gap={10} style={{ flex: 1, paddingTop: INITIAL_HEIGHT + 80, padding: 23 }} hAlign="center">
            <ActivityIndicator size="large" color="#7F7F7F" />
            <Typography color="#7F7F7F" variant="h4">
              Chargement...
            </Typography>
            <Typography color="#7F7F7F" variant="body1" align="center">
              Nous sommes en train de récupérer les établissements aux alentours, patience, la magie opère...
            </Typography>
          </Stack>
        ) : (() => {
          const noSchoolsFound = position !== null && schools.length === 0;
          const schoolsList = (
            <AnimatedFlatList
              showsVerticalScrollIndicator={false}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              layout={LinearTransition.springify()}
              style={{
                paddingTop: height.value + 16,
                paddingHorizontal: 10,
                gap: 9,
                paddingBottom: insets.bottom + 16,
              }}
              sections={[
                {
                  title: "Établissement(s)",
                  hideTitle: true,
                  items: schoolsItem,
                },
              ]}
            />
          );

          return noSchoolsFound ? (
            <Stack
              direction={"vertical"}
              gap={10}
              style={{
                flex: 1,
                paddingTop: INITIAL_HEIGHT + 80,
                padding: 23,
              }}
              hAlign="center"
            >
              <Icon papicon size={65} fill="#C9C9C9">
                <Papicons.Search />
              </Icon>
              <Typography color="#7F7F7F" variant="h4">
                Aucun établissement
              </Typography>
              <Typography color="#7F7F7F" variant="body1" align="center">
                Nous n'avons trouvé aucun lycée autour de votre position
              </Typography>
            </Stack>
          ) : (
            schoolsList
          );
        })()}
        <Pressable
          onPress={() => router.back()}
          style={[
            staticStyles.backButton,
            { top: insets.top + 4 }
          ]}
        >
          <Icon size={26} fill="white" papicon>
            <Papicons.ArrowLeft />
          </Icon>
        </Pressable>
      </ViewContainer >
    </Pressable >
  );
}