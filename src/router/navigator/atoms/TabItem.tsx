import * as React from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { StyleSheet, Platform, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import colorsList from "@/utils/data/colors.json";
import * as Haptics from "expo-haptics";
import Reanimated, { FadeIn, FadeOut, LinearTransition, ZoomIn } from "react-native-reanimated";
import { anim2Papillon } from "@/utils/ui/animations";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";

const TabItem: React.FC<{
  route: any;
  descriptor: any;
  navigation: any;
  isFocused: boolean;
  settings: any;
}> = React.memo(({ route, descriptor, navigation, isFocused, settings }) => {
  const theme = useTheme();
  const { playHaptics } = useSoundHapticsWrapper();

  const { options } = descriptor;
  const label: string = options.tabBarLabel ?? options.title ?? route.name;

  const onPress = React.useCallback(() => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }

    if (lottieRef.current) {
      lottieRef.current.play();
    }

    playHaptics("impact", {
      impact: Haptics.ImpactFeedbackStyle.Light,
    });
  }, [isFocused, navigation, playHaptics, route.key, route.name]);

  const onLongPress = React.useCallback(() => {
    navigation.emit({
      type: "tabLongPress",
      target: route.key
    });
  }, [navigation, route.key]);

  const lottieRef = React.useRef<LottieView>(null);

  const autoColor = React.useMemo(() => {
    return colorsList.find(c => c.hex.primary === theme.colors.primary) || colorsList[0];
  }, [theme.colors.primary]);

  const tabColor = React.useMemo(() => {
    return isFocused
      ? autoColor?.hex?.lighter
        ? theme.dark
          ? autoColor?.hex?.lighter
          : autoColor.hex.dark
        : theme.colors.primary
      : theme.dark
        ? "#656c72"
        : "#8C9398";
  }, [isFocused, autoColor, theme.dark, theme.colors.primary]);

  return (
    <Reanimated.View
      key={"tab-tabButton-" + route.key}
      style={styles.tabItemContainer}
      layout={anim2Papillon(LinearTransition)}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onTouchStart={onPress}
        onLongPress={onLongPress}
        style={[styles.tabItem, settings.hideTabTitles && styles.tabItemNoText]}
      >
        <Reanimated.View
          entering={anim2Papillon(ZoomIn)}
          exiting={anim2Papillon(FadeOut)}
          style={[
            settings.showTabBackground && {
              padding: settings.hideTabTitles ? 6 : 4,
              paddingHorizontal: settings.hideTabTitles ? undefined : 16,
            },
          ]}
        >
          {settings.showTabBackground && isFocused && (
            <Reanimated.View
              entering={anim2Papillon(ZoomIn)}
              exiting={anim2Papillon(FadeOut)}
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: tabColor + "22",
                  borderRadius: settings.hideTabTitles ? 8 : 80,
                  borderCurve: "continuous",
                },
              ]}
            />
          )}

          {options.tabBarLottie && (
            <LottieView
              loop={false}
              source={options.tabBarLottie}
              colorFilters={[{
                keypath: "*",
                color: tabColor,
              }]}
              style={{
                width: settings.hideTabTitles ? 28 : 26,
                height: settings.hideTabTitles ? 28 : 26,
              }}
              ref={lottieRef}
            />
          )}
        </Reanimated.View>

        {!settings.hideTabTitles && (
          <Reanimated.Text
            style={[
              styles.tabText,
              { color: tabColor },
              Platform.OS === "android" && { fontFamily: undefined }
            ]}
            numberOfLines={1}
            entering={anim2Papillon(FadeIn)}
            exiting={anim2Papillon(FadeOut)}
          >
            {label}
          </Reanimated.Text>
        )}
      </Pressable>
    </Reanimated.View>
  );
});

const styles = StyleSheet.create({
  tabItemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    gap: 4,
  },
  tabItemNoText: {
    padding: 2,
  },
  tabText: {
    fontSize: 13,
    textAlign: "center",
    fontFamily: "medium",
  },
});

export default TabItem;
