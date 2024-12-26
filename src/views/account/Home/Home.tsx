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
// |                  ╰( ͡° ͜ʖ ͡° )つ──☆*:・ﾟ                  |
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
import {useCurrentAccount} from "@/stores/account";
import getCorners from "@/utils/ui/corner-radius";
import {useIsFocused, useTheme} from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  StatusBar,
  View
} from "react-native";
import Reanimated, { interpolateColor } from "react-native-reanimated";
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
import ModalContent from "@/views/account/Home/ModalContent";
import {AnimatedScrollView} from "react-native-reanimated/lib/typescript/reanimated2/component/ScrollView";

const Home: Screen<"HomeScreen"> = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const corners = useMemo(() => getCorners(), []);
  const focused = useIsFocused();

  let scrollRef = useAnimatedRef<AnimatedScrollView>();
  let scrollOffset = useScrollViewOffset(scrollRef);

  let account = useCurrentAccount(store => store.account!);


  const [modalOpen, setModalOpen] = useState(false);
  const [scrool, setScrool] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const windowHeight = Dimensions.get("window").height;
  const tabbarHeight = useBottomTabBarHeight();

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const isModalFullyOpen = scrollOffset.value >= 265;
    const backgroundColor = !modalOpen
      ? interpolateColor(scrollOffset.value, [0, 195], [colors.primary, colors.primary])
      : interpolateColor(scrollOffset.value, [0, 265], [colors.primary, colors.card]);

    return {
      backgroundColor: isModalFullyOpen ? colors.card : backgroundColor,
    };
  });

  const widgetAnimatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === "android") {
      if (modalOpen) {
        return {
          transform: [{ scale: 1 }],
          opacity: 1,
        };
      }

      const translateY = interpolate(
        scrollOffset.value,
        [0, 265],
        [0, 0],
        Extrapolation.CLAMP
      );
      const scale = interpolate(
        scrollOffset.value,
        [0, 265],
        [1, 0.95],
        Extrapolation.CLAMP
      );
      const opacity = interpolate(
        scrollOffset.value,
        [0, 200, 265],
        [1, 1, 0],
        Extrapolation.CLAMP
      );

      return {
        paddingTop: insets.top,
        opacity,
        transform: [{ translateY }, { scale }],
      };
    } else {
      return {
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
      };
    }
  });

  const modalAnimatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === "android") {
      const isScrolling = scrollOffset.value > 0;

      const borderRadius = isScrolling
        ? 0
        : interpolate(
          scrollOffset.value,
          [0, 100, 265 + insets.top - 1, 265 + insets.top],
          [12, 12, corners, 0],
          Extrapolation.CLAMP
        );

      const scale = isScrolling
        ? 1
        : interpolate(
          scrollOffset.value,
          [0, 200, 260 + insets.top - 40, 260 + insets.top],
          [1, 0.95, 0.95, 1],
          Extrapolation.CLAMP
        );

      const translateY = interpolate(
        scrollOffset.value,
        [-1000, 0, 125, 265],
        [-1000, 0, 105, 0],
        Extrapolation.CLAMP
      );

      return {
        flex: 1,
        minHeight: windowHeight - tabbarHeight - 8,
        backgroundColor: colors.card,
        overflow: "hidden",
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
        transform: [{ scale }, { translateY }],
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
      };
    } else {
      return {
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

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,

        flex: 1,
        minHeight: windowHeight - tabbarHeight - 8,
        backgroundColor: colors.card,
        overflow: "hidden",
        transform: [
          {scale: interpolate(
            scrollOffset.value,
            [0, 200, (260 + insets.top) - 40, 260 + insets.top],
            [1, 0.95, 0.95, 1],
            Extrapolation.CLAMP
          )},
          {translateY: interpolate(
            scrollOffset.value,
            [-1000, 0, 125, 265 ],
            [-1000, 0, 105, 0],
            Extrapolation.CLAMP
          )}
        ],
      };
    }
  });

  const modalIndicatorAnimatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === "android") {
      const isScrolling = scrollOffset.value > 0;

      return {
        position: "absolute",
        top: 10,
        left: "50%",
        transform: [
          {
            translateX: isScrolling
              ? -2
              : interpolate(
                scrollOffset.value,
                [125, 200],
                [-25, -2],
                Extrapolation.CLAMP
              ),
          },
        ],
        width: isScrolling
          ? 4
          : interpolate(
            scrollOffset.value,
            [125, 200],
            [50, 4],
            Extrapolation.CLAMP
          ),
        height: 4,
        backgroundColor: colors.text + "20",
        zIndex: 100,
        borderRadius: 5,
        opacity: isScrolling
          ? 0
          : interpolate(
            scrollOffset.value,
            [125, 180, 200],
            [1, 0.5, 0],
            Extrapolation.CLAMP
          ),
      };
    } else {
      return {
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
      };
    }
  });

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

  return (
    <Animated.View style={[{ flex: 1 }, backgroundAnimatedStyle]}>
      <View style={{flex: 1}}>
        {!modalOpen && focused && (
          <StatusBar
            barStyle="light-content"
            backgroundColor={"transparent"}
            translucent
          />
        )}
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
        <Reanimated.ScrollView
          ref={scrollRef}
          onScrollEndDrag={(e) => {
            if (modalOpen && e.nativeEvent.contentOffset.y < 275 + insets.top) {
              scrollRef.current?.scrollTo({ y: 0, animated: true });
              setModalOpen(false);
            } else if (!modalOpen && e.nativeEvent.contentOffset.y > 50) {
              scrollRef.current?.scrollTo({ y: 275 + insets.top, animated: true });
              setModalOpen(true);
            }
            setScrool(true);
          }}
        >
          <Animated.View style={widgetAnimatedStyle}>
            <Header scrolled={false} navigation={navigation} />
          </Animated.View>

          <Animated.View style={[
            modalAnimatedStyle,
            {
              borderCurve: "continuous",
              shadowOffset: {
                width: 0,
                height: 2,
              },
            }
          ]}
          >
            <Animated.View style={modalIndicatorAnimatedStyle} />
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
    </Animated.View>
  );
};

export default protectScreenComponent(Home);
