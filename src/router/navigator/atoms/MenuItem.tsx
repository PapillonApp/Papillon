import * as React from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { StyleSheet, Platform, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import colorsList from "@/utils/data/colors.json";
import * as Haptics from "expo-haptics";
import Reanimated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { anim2Papillon } from "@/utils/ui/animations";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";

const MenuItem: React.FC<{
  route: any;
  descriptor: any;
  navigation: any;
  isFocused: boolean;
}> = ({ route, descriptor, navigation, isFocused }) => {
  const theme = useTheme();
  const { playHaptics } = useSoundHapticsWrapper();

  const { options } = descriptor;
  const label = options.tabBarLabel ?? options.title ?? route.name;

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }

    lottieRef.current?.play();
    playHaptics("impact", {
      impact: Haptics.ImpactFeedbackStyle.Light,
    });
  };

  const onLongPress = () => {
    navigation.emit({
      type: "tabLongPress",
      target: route.key
    });
  };

  const lottieRef = React.useRef<LottieView>(null);

  const autoColor = colorsList.filter(c => c.hex.primary === theme.colors.primary)[0] || colorsList[0];

  const tabColor = isFocused ?
    (autoColor?.hex?.lighter ? (theme.dark ? autoColor?.hex?.lighter : autoColor.hex.dark) : theme.colors.primary) : (theme.dark ? "#656c72" : "#8C9398");

  return (
    <Reanimated.View
      key={"tab-tabButton-" + route.key}
      style={[
        styles.tabItemContainer,
        isFocused && {
          backgroundColor: theme.dark ? theme.colors.text + "10" : theme.colors.card,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.20,
          shadowRadius: 6,
          elevation: 5,
        }
      ]}
      layout={anim2Papillon(LinearTransition)}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.tabItem]}
      >
        {options.tabBarLottie && (
          <LottieView
            loop={false}
            source={options.tabBarLottie}
            colorFilters={[{
              keypath: "*",
              color: tabColor,
            }]}
            style={[
              {
                width: 24,
                height: 24,
              }
            ]}
            ref={lottieRef}
          />
        )}


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

      </Pressable>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  tabItemContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,

    alignItems: "flex-start",
    justifyContent: "center",

    borderRadius: 10,
    borderCurve: "continuous",
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 0,
    gap: 12,
    width: "100%",
  },
  tabText: {
    fontSize: 15,
    textAlign: "center",
    fontFamily: "medium",
  },
});

export default React.memo(MenuItem);
