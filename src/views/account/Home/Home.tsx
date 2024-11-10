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
import { useCurrentAccount } from "@/stores/account";
import getCorners from "@/utils/ui/corner-radius";
import { useIsFocused, useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AccountSwitcher from "@/components/Home/AccountSwitcher";
import ContextMenu from "@/components/Home/AccountSwitcherContextMenu";
import Header from "@/components/Home/Header";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import ModalContent from "@/views/account/Home/ModalContent";

const Home: Screen<"HomeScreen"> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const corners = useMemo(() => getCorners(), []);
  const focused = useIsFocused();

  let scrollRef = useAnimatedRef<Animated.ScrollView>();
  let scrollOffset = useScrollViewOffset(scrollRef);

  let account = useCurrentAccount(store => store.account!);

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
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    borderTopLeftRadius: interpolate(
      scrollOffset.value,
      [0, 100, 265 + insets.top - 1, 265 + insets.top],
      [12, 12, corners, 0],
      Extrapolation.CLAMP
    ),
    borderTopRightRadius: interpolate(
      scrollOffset.value,
      [0, 100, 265 + insets.top - 1, 265 + insets.top],
      [12, 12, corners, 0],
      Extrapolation.CLAMP
    ),
    flex: 1,
    minHeight: windowHeight - tabbarHeight - 8,
    backgroundColor: colors.card,
    overflow: "hidden",
  }));

  const modalContentAnimatedStyle = useAnimatedStyle(() => ({
    paddingHorizontal: 16,
    paddingBottom: 16 + insets.top + 56,
  }));

  const modalIndicatorAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 10,
    left: "45%",
    width: 50,
    height: 4,
    backgroundColor: colors.text + "20",
    zIndex: 100,
    borderRadius: 5,
  }));

  const scrollViewAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: scrollOffset.value > 265 + insets.top ? colors.card : colors.primary,
  }));

  return (
    <View style={{flex: 1}}>
      {!modalOpen && focused && (
        <StatusBar barStyle="light-content" backgroundColor={"transparent"} translucent />
      )}
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
      <Reanimated.ScrollView
        ref={scrollRef}
        snapToEnd={false}
        snapToStart={false}
        disableIntervalMomentum={true}
        style={scrollViewAnimatedStyle}
        snapToOffsets={[0, 265 + insets.top]}
        decelerationRate={modalFull || Platform.OS === "android" ? "normal" : 0}
        onScrollEndDrag={(e) => {
          if (e.nativeEvent.contentOffset.y < 265 + insets.top && modalOpen) {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }
        }}
        onScroll={(e) => {
          if (e.nativeEvent.contentOffset.y > 125 && canHaptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCanHaptics(false);
          } else if (e.nativeEvent.contentOffset.y < 125 && !canHaptics) {
            setCanHaptics(true);
          }

          setModalOpen(e.nativeEvent.contentOffset.y >= 195 + insets.top);
          setModalFull(e.nativeEvent.contentOffset.y >= 265 + insets.top);
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
          style={widgetAnimatedStyle}
        >
          <Header
            navigation={navigation}
            scrolled={false}
          />
        </Animated.View>

        <Animated.View style={
          [modalAnimatedStyle, {
            borderCurve: "continuous",
            shadowOffset: {
              width: 0,
              height: 2,
            },
          }]}
        >
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
