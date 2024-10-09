import {protectScreenComponent} from "@/router/helpers/protected-screen";
import type {Screen} from "@/router/helpers/types";
import {useCurrentAccount} from "@/stores/account";
import getCorners from "@/utils/ui/corner-radius";
import {useTheme} from "@react-navigation/native";
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import PackageJSON from "../../../../package.json";
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import Reanimated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  FlipInXDown,
  LinearTransition,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultTabs } from "@/consts/DefaultTabs";

import AccountSwitcher from "@/components/Home/AccountSwitcher";
import ContextMenu from "@/components/Home/AccountSwitcherContextMenu";
import Header from "@/components/Home/Header";
import HomeOnboard from "@/components/Home/HomeOnboard";
import {
  accountSwitcherAnim,
  backdropStyleAnim,
  cardStyleAnim,
  cornerStyleAnim,
  overHeaderAnimAnim,
  paddingTopItemStyleAnim,
  stylezAnim
} from "./Animations/HomeAnimations";

import {NativeItem, NativeList, NativeText} from "@/components/Global/NativeComponents";
import {Gift, Sparkles, WifiOff} from "lucide-react-native";

import NetInfo from "@react-native-community/netinfo";
import {getErrorTitle} from "@/utils/format/get_papillon_error_title";
import {Elements} from "./ElementIndex";
import {animPapillon} from "@/utils/ui/animations";
import {useBottomTabBarHeight} from "@react-navigation/bottom-tabs";
import { useFlagsStore } from "@/stores/flags";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { th } from "date-fns/locale";
import MissingItem from "@/components/Global/MissingItem";

let headerHeight = Dimensions.get("window").height / 2.75;
if (headerHeight < 275) {
  headerHeight = 275;
}
const overHeaderHeight = Platform.OS === "ios" ? 46 : 52;

const Home: Screen<"HomeScreen"> = ({ route, navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const tabBarHeight = useBottomTabBarHeight();

  const errorTitle = useMemo(() => getErrorTitle(), []);

  const dims = Dimensions.get("window");
  const tablet = dims.width > 600;

  if (tablet) {
    headerHeight = 230;
  }

  const insets = useSafeAreaInsets();

  const [shouldOpenContextMenu, setShouldOpenContextMenu] = useState(false);
  const openContextMenu = useCallback(() => {
    setShouldOpenContextMenu(false);
    setTimeout(() => {
      setShouldOpenContextMenu(true);
    }, 150);
  }, []);

  const [onboard, setOnboard] = useState(route.params?.onboard);
  const corners = useMemo(() => getCorners(), []);
  const translationY = useSharedValue(0);

  const [scrolled, setScrolled] = useState(false);
  const [fullyScrolled, setFullyScrolled] = useState(false);
  const [fullScreenScrolled, setFullScreenScrolled] = useState(false);
  const [showCardContent, setShowCardContent] = useState(true);
  const [canDisableOnboard, setCanDisableOnboard] = useState(false);

  const scrollRef = useRef<Reanimated.ScrollView>(null);

  const account = useCurrentAccount(store => store.account!);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  const stylez = stylezAnim(translationY, headerHeight);
  const overHeaderAnim = overHeaderAnimAnim(translationY, headerHeight);
  const cardStyle = cardStyleAnim(translationY, headerHeight);
  const cornerStyle = cornerStyleAnim(translationY, headerHeight, corners);
  const backdropStyle = backdropStyleAnim(translationY, headerHeight);
  const paddingTopItemStyle = paddingTopItemStyleAnim(translationY, insets, headerHeight, overHeaderHeight);
  const accountSwitcherStyle = accountSwitcherAnim(translationY, insets, headerHeight);

  const [updatedRecently, setUpdatedRecently] = useState(false);
  const defined = useFlagsStore(state => state.defined);

  useEffect(() => {
    AsyncStorage.getItem("changelog.lastUpdate")
      .then((value) => {
        if (value) {
          const currentVersion = PackageJSON.version;
          if (value !== currentVersion) {
            setUpdatedRecently(true);
          }
        }
        else {
          setUpdatedRecently(true);
        }
      });
  }, []);

  const checkForNewTabs = useCallback(() => {
    const storedTabs = account.personalization.tabs || [];
    const newTabs = defaultTabs.filter(defaultTab =>
      !storedTabs.some(storedTab => storedTab.name === defaultTab.tab)
    );

    if (newTabs.length > 0) {
      const updatedTabs = [
        ...storedTabs,
        ...newTabs.map(tab => ({
          name: tab.tab,
          enabled: false,
          installed: true
        }))
      ];

      mutateProperty("personalization", {
        ...account.personalization,
        tabs: updatedTabs,
      });

      setUpdatedRecently(true);
    }
  }, [account.personalization.tabs, mutateProperty]);

  useEffect(() => {
    checkForNewTabs();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      checkForNewTabs();
    });

    return unsubscribe;
  }, [navigation, checkForNewTabs]);

  const openAccSwitcher = useCallback(() => {
    scrollRef.current?.scrollTo({ y: headerHeight, animated: true });
    setShowCardContent(false);
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "AccountSelector" }],
      });
    }, 300);
  }, [navigation]);

  const LayoutScrollView = useCallback(() => {
    if (onboard) {
      scrollRef.current?.scrollTo({ y: headerHeight, animated: false });
      setScrolled(true);
      setCanDisableOnboard(true);
    }
  }, [onboard]);

  useEffect(() => {
    if (!scrolled) {
      setShowCardContent(true);
      if (canDisableOnboard) {
        setOnboard(false);
      }
    }
  }, [scrolled, canDisableOnboard]);

  useEffect(() => {
    return navigation.addListener("focus", () => {
      if (!onboard) {
        setShowCardContent(true);
      }
    });
  }, [navigation, onboard]);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const yOffset = event.contentOffset.y;

    if (translationY.value !== yOffset) {
      translationY.value = yOffset;
    }

    const shouldBeScrolled = yOffset >= headerHeight - insets.top;
    const shouldBeFullyScrolled = yOffset >= headerHeight + 1;
    const shouldBeFullScreenScrolled = yOffset >= headerHeight - 1;

    if (scrolled !== shouldBeScrolled) {
      runOnJS(setScrolled)(shouldBeScrolled);
    }
    if (fullyScrolled !== shouldBeFullyScrolled) {
      runOnJS(setFullyScrolled)(shouldBeFullyScrolled);
    }
    if (fullScreenScrolled !== shouldBeFullScreenScrolled) {
      runOnJS(setFullScreenScrolled)(shouldBeFullScreenScrolled);
    }
  });

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    return navigation.addListener("focus", () => {
      setIsFocused(true);
    });
  }, [navigation]);

  useLayoutEffect(() => {
    return navigation.addListener("blur", () => {
      setIsFocused(false);
    });
  }, [navigation]);

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: Platform.OS === "android" ? corners - 3 : void 0,
        overflow: "hidden",
      }}
    >
      {isFocused && !tablet && (
        <StatusBar
          animated={scrolled}
          backgroundColor={"transparent"}
          translucent={true}
          barStyle={
            scrolled ?
              theme.dark ? "light-content" : "dark-content"
              :
              "light-content"
          }
        />
      )}

      {showCardContent && !onboard &&
        <Reanimated.View
          style={[{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1000,
          },
          Platform.OS === "ios" && accountSwitcherStyle]}
        >
          <ContextMenu
            style={[{
              position: "absolute",
              top: insets.top + 3,
              left: 16,
              zIndex: 1000,
            }]}
            shouldOpenContextMenu={shouldOpenContextMenu}
          >
            <AccountSwitcher
              translationY={translationY}
              scrolled={scrolled}
              loading={!account.instance}
            />
          </ContextMenu>
        </Reanimated.View>
      }

      {showCardContent && !onboard && Platform.OS === "ios" &&
        <Reanimated.View
          style={[
            {
              height: overHeaderHeight + insets.top,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 90,
              pointerEvents: scrolled ? "auto" : "none",
            },
            Platform.OS === "ios" ? {
              borderColor: colors.border,
              borderBottomWidth: 0.5,
              backgroundColor: fullyScrolled ? colors.card : "transparent",
              justifyContent: "center",
            } : {
              elevation: 4,
              backgroundColor: colors.card,
              justifyContent: "flex-start",
            },
            Platform.OS === "ios" && overHeaderAnim
          ]}
          entering={Platform.OS !== "ios" ? FadeInUp.duration(150) : void 0}
          exiting={Platform.OS !== "ios" ? FadeOutUp.duration(150) : void 0}
        >
          <Reanimated.View
            style={[{
              flex: 1,
              width: "100%",
              height: "100%",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingTop: insets.top,
              backgroundColor: fullyScrolled ? colors.primary + "09" : "transparent",
            }]}
          >
            <TouchableOpacity
              onPress={() => {
                // scroll to top
                scrollRef.current?.scrollTo({ y: 0, animated: true });
                setTimeout(() => {
                  openContextMenu();
                }, 100);
              }}
            >
              <AccountSwitcher
                translationY={translationY}
                scrolled={scrolled}
                small
              />
            </TouchableOpacity>

            <Pressable
              style={{
                flex: 1,
                height: "100%",
              }}
              onPress={() => {
                // scroll to top
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}
            />
          </Reanimated.View>
        </Reanimated.View>
      }

      <Reanimated.ScrollView
        ref={scrollRef}
        onLayout={LayoutScrollView}
        style={{flex: 1, backgroundColor: colors.primary }}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={Platform.OS == "ios" ? 8 : 32}
        snapToOffsets={[0, headerHeight]}
        bounces={!scrolled}
        decelerationRate={
          Platform.OS === "ios" ?
            fullyScrolled ? "normal" : "fast"
            : "normal"
        }
        snapToEnd={false}
        showsVerticalScrollIndicator={scrolled}
        scrollIndicatorInsets={{top: (0 - headerHeight / 2) + insets.top }}
      >

        <Reanimated.View
          style={[
            {
              height: headerHeight,
              alignItems: "center",
              justifyContent: "center",
              paddingTop: insets.top - 10,
            },
            styles.header,
            Platform.OS === "ios" && stylez
          ]}
        >
          <Header
            scrolled={false}
            // openAccountSwitcher={openAccSwitcher}
            navigation={navigation}
          />
        </Reanimated.View>

        {Platform.OS === "ios" && (
          <Reanimated.View
            pointerEvents={"none"}
            style={[
              {
                backgroundColor: "#000000",
                zIndex: -80,
                width: "100%",
                height: "200%",
                position: "absolute",
                top: -700,
                left: 0,
              },
              backdropStyle
            ]}
          />
        )}

        <Reanimated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.background,
              minHeight:
                Platform.OS === "ios" ?
                  Dimensions.get("window").height - tabBarHeight - 13
                  :
                  Dimensions.get("window").height + headerHeight  - tabBarHeight - 13
              ,
              overflow: "hidden",
            },
            Platform.OS === "ios" ? cornerStyle : {
              borderTopLeftRadius: corners,
              borderTopRightRadius: corners,
            },
            Platform.OS === "ios" && cardStyle,
          ]}
        >
          <Reanimated.View
            style={[
              {
                backgroundColor: colors.background,
                width: "100%",
                height: 1000,
                position: "absolute",
                bottom: -1000,
              },
            ]}
          >
            <Reanimated.View
              style={[
                {
                  backgroundColor: (onboard || !showCardContent) ? "transparent" : colors.primary + "11",
                  width: "100%",
                  height: "100%",
                },
              ]}
            />
          </Reanimated.View>

          {onboard && (
            <Reanimated.View
              style={{
                flex: 1,
                width: "100%",
                backgroundColor: colors.background,
              }}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <HomeOnboard />
            </Reanimated.View>
          )}

          {showCardContent && !onboard && (
            <Reanimated.View
              style={[
                {
                  flex: 1,
                  width: "100%",
                  backgroundColor: theme.dark ? colors.primary + "09" : colors.primary + "11",
                  paddingHorizontal: 16,
                },
                Platform.OS === "ios" ? cornerStyle : {
                  borderTopLeftRadius: corners,
                  borderTopRightRadius: corners,
                },
              ]}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              {!scrolled &&
                <Reanimated.View
                  style={[styles.cardHandle, { backgroundColor: colors.text + "20" }]}
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                />
              }

              <Reanimated.View
                style={[paddingTopItemStyle]}
              />

              {(defined("force_changelog") || updatedRecently) && (
                <NativeList
                  animated
                  entering={animPapillon(FadeInUp)}
                  exiting={animPapillon(FadeOutDown)}
                >
                  <NativeItem
                    leading={
                      <Gift
                        color={theme.colors.primary}
                        size={28}
                        strokeWidth={2}
                      />
                    }
                    onPress={() => navigation.navigate("ChangelogScreen")}
                    style={{
                      backgroundColor: theme.colors.primary + "30",
                    }}
                    androidStyle={{
                      backgroundColor: theme.colors.primary + "20",
                    }}
                  >
                    <NativeText variant="title">
                      Papillon {PackageJSON.version} est arrivé !
                    </NativeText>
                    <NativeText variant="subtitle">
                      Découvrez les nouveautés de cette nouvelle version en appuyant ici.
                    </NativeText>
                  </NativeItem>
                </NativeList>
              )}

              {!isOnline &&
                <Reanimated.View
                  entering={FlipInXDown.springify().mass(1).damping(20).stiffness(300)}
                  exiting={FadeOutUp.springify().mass(1).damping(20).stiffness(300)}
                  layout={animPapillon(LinearTransition)}
                >
                  <NativeList inline>
                    <NativeItem
                      icon={<WifiOff />}
                    >
                      <NativeText variant="title" style={{ paddingVertical: 2, marginBottom: -4 }}>
                        {errorTitle.label} {errorTitle.emoji}
                      </NativeText>
                      <NativeText variant="subtitle">
                        Vous êtes hors ligne. Les données affichées peuvent être obsolètes.
                      </NativeText>
                    </NativeItem>
                  </NativeList>
                </Reanimated.View>
              }

              <Reanimated.View
                layout={animPapillon(LinearTransition)}
              >
                {Elements.map((Element, index) => (Element &&
                  <Reanimated.View
                    key={index}
                    layout={animPapillon(LinearTransition)}
                    entering={animPapillon(FadeInUp)}
                    exiting={animPapillon(FadeOutDown)}
                  >
                    <Element
                      navigation={navigation}
                    />
                  </Reanimated.View>
                ))}
              </Reanimated.View>

              <InsetsBottomView />
            </Reanimated.View>
          )}
        </Reanimated.View>
      </Reanimated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    zIndex: -9,
  },

  card: {
    minHeight: "100%",
    borderCurve: "continuous",
    zIndex: 9,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  cardHandle: {
    height: 4,
    width: 50,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
    position: "absolute",
  },
});

export default protectScreenComponent(Home);
