//+——————————————————————————————————————————————————————————+
// |                                                          |
// |           _   _   _             _   _                    |
// |          / \ | |_| |_ ___ _ __ | |_(_) ___  _ __         |
// |         / _ \| __| __/ _ \ '_ \| __| |/ _ \| '_ \        |
// |        / ___ \ |_| ||  __/ | | | |_| | (_) | | | |       |
// |       /_/   \_\__|\__\___|_| |_|\__|_|\___/|_| |_|       |
// |                                                          |
// |Il semblerait que tu essaies de modifier la page d'accueil|
// |  de Papillon, mais malheureusement pour toi, ce fichier  |
// |  ne contiendra pas grand-chose qui puisse t'intéresser.  |
// |                                                          |
// |        Heureusement pour toi, je suis magicien !         |
// |                  ╰( ͡° ͜ʖ ͡° )つ──☆*:・ﾟ                    |
// |                                                          |
// |          Si tu souhaites modifier les widgets :          |
// |                      ~/src/widgets                       |
// |                                                          |
// |      Si tu souhaites ajouter un widget à la modal :      |
// |            ~/src/views/account/Home/Elements             |
// |      (N'oublie pas de l'ajouter à ElementIndex.tsx)      |
// |                                                          |
// |    Si tu souhaites modifier le contenu de la modal :     |
// |        ~/src/views/account/Home/ModalContent.tsx         |
// |                                                          |
// |            Si tu veux une pizza à l'ananas :             |
// |                         Alt + F4                         |
// |                            ;)                            |
// |                                                          |
// |               Sur ce, bonne continuation !               |
// |                                                          |
// +——————————————————————————————————————————————————————————+

import { protectScreenComponent } from "@/router/helpers/protected-screen";
import type { Screen } from "@/router/helpers/types";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import getCorners from "@/utils/ui/corner-radius";
import { useIsFocused, useTheme } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Linking, Platform, RefreshControl, StatusBar, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AccountSwitcher from "@/components/Home/AccountSwitcher";
import ContextMenu from "@/components/Home/AccountSwitcherContextMenu";
import Header from "@/components/Home/Header";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import ModalContent from "@/views/account/Home/ModalContent";
import { AnimatedScrollView } from "react-native-reanimated/lib/typescript/reanimated2/component/ScrollView";
import useScreenDimensions from "@/hooks/useScreenDimensions";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { useAlert } from "@/providers/AlertProvider";
import { ArrowLeft, Menu, Plus } from "lucide-react-native";

const Home: Screen<"HomeScreen"> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const corners = useMemo(() => getCorners(), []);
  const focused = useIsFocused();
  const { playHaptics } = useSoundHapticsWrapper();

  const { isTablet } = useScreenDimensions();
  const { showAlert } = useAlert();

  const scrollRef = useAnimatedRef<AnimatedScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const account = useCurrentAccount((store) => store.account!);
  const accounts = useAccounts((store) => store.accounts);

  useEffect(() => {
    const checkAccounts = async () => {
      if (!useAccounts.persist.hasHydrated()) return;

      if (accounts.filter((account) => !account.isExternal).length === 0) {
        navigation.reset({
          index: 0,
          routes: [{ name: "FirstInstallation" }],
        });
      } else {
        const url = await Linking.getInitialURL();
        manageIzlyLogin(url || "");
      }
    };

    checkAccounts();

    const handleUrl = (event: any) => {
      manageIzlyLogin(event.url);
    };

    Linking.addEventListener("url", handleUrl);
  }, [accounts, navigation]);

  const manageIzlyLogin = (url: string) => {
    if (url) {
      const scheme = url.split(":")[0];
      if (scheme === "izly") {
        setTimeout(() => {
          showAlert({
            title: "Activation de compte Izly",
            message: "Papillon gère la connexion au service Izly. Ouvrez les paramètres de services de cantine pour activer votre compte.",
            icon: <Menu />,
            actions: [
              { title: "Annuler", icon: <ArrowLeft /> },
              {
                title: "Ajouter mon compte",
                icon: <Plus />,
                onPress: () => navigation.navigate("SettingStack", { view: "IzlyActivation" }),
                primary: true,
              }
            ],
          });
        }, 1000);
      }
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFull, setModalFull] = useState(false);
  const [canHaptics, setCanHaptics] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const windowHeight = Dimensions.get("window").height;
  const tabbarHeight = useBottomTabBarHeight();

  const widgetAnimatedStyle = useAnimatedStyle(() => ({
    paddingTop: insets.top,
    opacity: interpolate(scrollOffset.value, [0, 265 + insets.top], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: scrollOffset.value },
      { scale: interpolate(
        scrollOffset.value,
        [0, 265],
        [1, 0.9],
        Extrapolation.CLAMP
      ) },
    ]
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    ...(Platform.OS === "android" ? {} : { borderCurve: "continuous" }),
    borderTopLeftRadius: interpolate(scrollOffset.value, [0, 100, 265 + insets.top - 0.1, 265 + insets.top], [12, 12, corners, 0], Extrapolation.CLAMP),
    borderTopRightRadius: interpolate(scrollOffset.value, [0, 100, 265 + insets.top - 0.1, 265 + insets.top], [12, 12, corners, 0], Extrapolation.CLAMP),
    shadowColor: "#000",
    ...(Platform.OS === "android" ? {} : { shadowOffset: { width: 0, height: 2 } }),
    shadowOpacity: 0.2,
    shadowRadius: 10,
    flex: 1,
    minHeight: windowHeight - tabbarHeight - 8,
    backgroundColor: colors.card,
    overflow: "hidden",
    transform: [
      { translateY: interpolate(
        scrollOffset.value,
        [-1000, 0, 125, 265 ],
        [-1000, 0, 105, 0],
        Extrapolation.CLAMP
      ) }
    ],
  }));

  const modalContentAnimatedStyle = useAnimatedStyle(() => ({
    paddingHorizontal: 16,
    paddingBottom: 16 + insets.top + 56,
    transform: [{ translateY: interpolate(scrollOffset.value, [-1000, 0, 125, 265 + insets.top], [1000, 0, 0, insets.top + 56], Extrapolation.CLAMP) }],
  }));

  const modalIndicatorAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 10,
    left: "50%",
    transform: [
      { translateX: interpolate(
        scrollOffset.value,
        [125, 200],
        [-25, -2],
        Extrapolation.CLAMP
      ) }
    ],
    width: interpolate(
      scrollOffset.value,
      [125, 200],
      [50, 4],
      Extrapolation.CLAMP
    ),
    height: 4,
    backgroundColor: colors.text + "20",
    zIndex: 100,
    borderRadius: 5,
    opacity: interpolate(scrollOffset.value, [125, 180, 200], [1, 0.5, 0], Extrapolation.CLAMP),
  }));

  const scrollViewAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: scrollOffset.value > 265 + insets.top ? colors.card : colors.primary,
  }));

  return (
    <View style={{ flex: 1 }}>
      {!modalOpen && focused && !isTablet && (
        <StatusBar barStyle="light-content" backgroundColor={"transparent"} translucent />
      )}
      {!isTablet && (
        <ContextMenu
          style={[{
            position: "absolute",
            top: insets.top + 8,
            left: 16,
            zIndex: 1000,
          }]}
        >
          <AccountSwitcher
            translationY={scrollOffset}
            modalOpen={modalOpen}
            loading={!account.instance}
          />
        </ContextMenu>
      )}
      <Animated.ScrollView
        ref={scrollRef}
        snapToEnd={false}
        snapToStart={false}
        style={scrollViewAnimatedStyle}
        snapToOffsets={[0, 265 + insets.top]}
        decelerationRate={modalFull || Platform.OS === "android" ? "normal" : 0}
        onScrollEndDrag={(e) => {
          if (e.nativeEvent.contentOffset.y < 265 + insets.top && modalOpen) {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }
        }}
        onScroll={(e) => {
          const scrollY = e.nativeEvent.contentOffset.y;
          if (scrollY > 125 && canHaptics) {
            playHaptics("impact", { impact: Haptics.ImpactFeedbackStyle.Light });
            setCanHaptics(false);
          } else if (scrollY < 125 && !canHaptics) {
            setCanHaptics(true);
          }

          setModalOpen(scrollY >= 195 + insets.top);
          setModalFull(scrollY >= 265 + insets.top);
        }}
        refreshControl={<RefreshControl
          refreshing={refreshing}
          onRefresh={() => setRefreshing(true)}
          style={{ zIndex: 100 }}
          progressViewOffset={285 + insets.top}
        />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[widgetAnimatedStyle, isTablet && { marginTop: 2 * (0 - insets.top) }]}>
          <Header scrolled={false} navigation={navigation} />
        </Animated.View>

        <Animated.View style={modalAnimatedStyle}>
          <Animated.View style={modalIndicatorAnimatedStyle} />
          <Animated.View style={modalContentAnimatedStyle}>
            <ModalContent navigation={navigation} refresh={refreshing} endRefresh={() => setRefreshing(false)} />
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

export default protectScreenComponent(Home);
