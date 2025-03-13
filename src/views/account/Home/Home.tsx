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

import {protectScreenComponent} from "@/router/helpers/protected-screen";
import type {Screen} from "@/router/helpers/types";
import {useAccounts, useCurrentAccount} from "@/stores/account";
import getCorners from "@/utils/ui/corner-radius";
import {useIsFocused, useTheme} from "@react-navigation/native";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
  Dimensions,
  Platform,
  RefreshControl,
  StatusBar,
  View
} from "react-native";
import Reanimated from "react-native-reanimated";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import AccountSwitcher from "@/components/Home/AccountSwitcher";
import ContextMenu from "@/components/Home/AccountSwitcherContextMenu";
import Header from "@/components/Home/Header";
import {useBottomTabBarHeight} from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import ModalContent from "@/views/account/Home/ModalContent";
import {AnimatedScrollView} from "react-native-reanimated/lib/typescript/reanimated2/component/ScrollView";
import useScreenDimensions from "@/hooks/useScreenDimensions";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";

const Home: Screen<"HomeScreen"> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const corners = useMemo(() => getCorners(), []);
  const focused = useIsFocused();
  const { playHaptics } = useSoundHapticsWrapper();

  const {isTablet} = useScreenDimensions();

  let scrollRef = useAnimatedRef<AnimatedScrollView>();
  let scrollOffset = useScrollViewOffset(scrollRef);

  let account = useCurrentAccount(store => store.account!);
  const accounts = useAccounts((store) => store.accounts);

  useEffect(() => {
    void async function () {
      if (!useAccounts.persist.hasHydrated()) return;

      // If there are no accounts, redirect the user to the first installation page.
      if (accounts.filter((account) => !account.isExternal).length === 0) {
        // Use the `reset` method to clear the navigation stack.
        navigation.reset({
          index: 0,
          routes: [{ name: "FirstInstallation" }],
        });
      }
    }();
  }, [accounts]);

  const [shouldOpenContextMenu, setShouldOpenContextMenu] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFull, setModalFull] = useState(false);

  const [canHaptics, setCanHaptics] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const openAccSwitcher = useCallback(() => {
    setShouldOpenContextMenu(false);
    setTimeout(() => {
      setShouldOpenContextMenu(true);
    }, 150);
  }, []);

  const windowHeight = Dimensions.get("window").height;
  const tabbarHeight = useBottomTabBarHeight();

  const widgetAnimatedStyle = useAnimatedStyle(() => ({
    paddingTop: insets.top,
    opacity: interpolate(
      scrollOffset.value,
      [0, 265 + insets.top],
      [1, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      { translateY: scrollOffset.value },
      { scale: interpolate(
        scrollOffset.value,
        [0, 265],
        [1, 0.9],
        Extrapolation.CLAMP
      )},
    ]
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    ...(Platform.OS === "android" ? {} : { borderCurve: "continuous" }),
    borderTopLeftRadius: interpolate(
      scrollOffset.value,
      [0, 100, 265 + insets.top - 0.1, 265 + insets.top],
      [12, 12, corners, 0],
      Extrapolation.CLAMP
    ),
    borderTopRightRadius: interpolate(
      scrollOffset.value,
      [0, 100, 265 + insets.top - 0.1, 265 + insets.top],
      [12, 12, corners, 0],
      Extrapolation.CLAMP
    ),

    shadowColor: "#000",
    ...(Platform.OS === "android" ? {} : {
      shadowOffset: {
        width: 0,
        height: 2,
      }
    }),
    shadowOpacity: 0.2,
    shadowRadius: 10,

    flex: 1,
    minHeight: windowHeight - tabbarHeight - 8,
    backgroundColor: colors.card,
    overflow: "hidden",
    transform: [
      {translateY: interpolate(
        scrollOffset.value,
        [-1000, 0, 125, 265 ],
        [-1000, 0, 105, 0],
        Extrapolation.CLAMP
      )}
    ],
  }));

  const navigationBarAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: scrollOffset.value - 270 - insets.top,
    left: 0,
    right: 0,
    height: interpolate(
      scrollOffset.value,
      [125, 265],
      [0, insets.top + 60],
      Extrapolation.CLAMP
    ),
    zIndex: 100,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderBottomWidth: 0.5,
  }));

  const modalContentAnimatedStyle = useAnimatedStyle(() => ({
    paddingHorizontal: 16,
    paddingBottom: 16 + insets.top + 56,
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-1000, 0, 125, 265 + insets.top],
          [1000, 0, 0, insets.top + 56],
          Extrapolation.CLAMP
        )
      }
    ]
  }));

  const modalIndicatorAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 10,
    left: "50%",
    transform: [
      {translateX: interpolate(
        scrollOffset.value,
        [125, 200],
        [-25, -2],
        Extrapolation.CLAMP
      )}
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
    opacity: interpolate(
      scrollOffset.value,
      [125, 180, 200],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    ),
  }));

  const scrollViewAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: scrollOffset.value > 265 + insets.top ? colors.card : colors.primary,
  }));

  return (
    <View style={{flex: 1}}>
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
          shouldOpenContextMenu={shouldOpenContextMenu}
        >
          <AccountSwitcher
            translationY={scrollOffset}
            modalOpen={modalOpen}
            loading={!account.instance}
          />
        </ContextMenu>
      )}
      <Reanimated.ScrollView
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
            playHaptics("impact", {
              impact: Haptics.ImpactFeedbackStyle.Light,
            });
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
          style={{zIndex: 100}}
          progressViewOffset={285 + insets.top}
        />}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            widgetAnimatedStyle,
            isTablet && {
              marginTop: 2 * (0 - insets.top),
            }
          ]}
        >
          <Header
            scrolled={false}
            // openAccountSwitcher={openAccSwitcher}
            navigation={navigation}
          />
        </Animated.View>

        <Animated.View style={modalAnimatedStyle}>
          <Animated.View
            style={modalIndicatorAnimatedStyle}
          />
          <Animated.View style={modalContentAnimatedStyle}>
            <ModalContent
              navigation={navigation}
              refresh={refreshing}
              endRefresh={() => setRefreshing(false)}
            />
          </Animated.View>
        </Animated.View>
      </Reanimated.ScrollView>
    </View>
  );
};

export default protectScreenComponent(Home);
