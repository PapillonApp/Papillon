import React, { useCallback, useState } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate, useScrollViewOffset, useAnimatedRef, AnimatedRef, LinearTransition,
} from "react-native-reanimated";

import { Animation } from "@/ui/utils/Animation";
import Typography from "@/ui/components/Typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedScrollView } from "react-native-reanimated/lib/typescript/component/ScrollView";
import Stack from "@/ui/components/Stack";
import { Dynamic } from "@/ui/components/Dynamic";
import { NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { CircularProgress } from "@/ui/components/CircularProgress";

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();

  const scrollViewRef: AnimatedRef<AnimatedScrollView> = useAnimatedRef();

  const scrollOffset = useScrollViewOffset(scrollViewRef);

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker((prev) => !prev);
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollOffset.value, [0, 50], [0, 35], Extrapolate.EXTEND) },
      { scale: interpolate(scrollOffset.value, [0, 50 + insets.top + 125], [1, 0.5], Extrapolate.CLAMP) },
    ],
    opacity: interpolate(scrollOffset.value, [0, 50 + 125], [1, 0], Extrapolate.CLAMP),
  }));

  const modalStyle = useAnimatedStyle(() => ({
    borderTopRightRadius: interpolate(
      scrollOffset.value,
      [0, 50 + insets.top + 125],
      [25, 10],
      Extrapolate.CLAMP
    ),
    borderTopLeftRadius: interpolate(
      scrollOffset.value,
      [0, 50 + insets.top + 125],
      [25, 10],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <Animated.ScrollView
      ref={scrollViewRef}
      scrollEventThrottle={16}
      style={[{
        flex: 1,
        backgroundColor: "#F7E8F5",
        paddingTop: 50 + insets.top,
      }]}
    >
      <Animated.View
        style={[{
          height: 125,
          alignItems: "center",
          justifyContent: "center",
        }, headerStyle]}
      >
        <NativeHeaderTitle>
          <NativeHeaderTopPressable
            onPress={toggleDatePicker}
            layout={Animation(LinearTransition)}
          >
            <Dynamic style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Dynamic animated>
                <Typography variant="navigation">Semaine</Typography>
              </Dynamic>
              <Dynamic animated>
                <View style={{ paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, backgroundColor: "#9E00861A"}}>
                  <Typography variant="navigation" style={{ color: "#C54CB3" }}>16</Typography>
                </View>
              </Dynamic>
            </Dynamic>
          </NativeHeaderTopPressable>
        </NativeHeaderTitle>
        <Stack direction={"horizontal"} hAlign={"center"} style={{ padding: 16 }}>
          <Stack direction={"vertical"} gap={0} style={{ flex: 1 }}>
            <Typography variant={"h1"} style={{ fontSize: 32 }} color={"#C54CB3"}>3</Typography>
            <Typography variant={"title"} color={"#C54CB3"}>tâches restantes</Typography>
            <Typography variant={"title"} color={"#C54CB3"}>cette semaine</Typography>
          </Stack>
          <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}>
            <CircularProgress backgroundColor={"#FFFFFF"} percentageComplete={75} radius={35} strokeWidth={7} fill={"#C54CB3"}/>
          </View>
        </Stack>
      </Animated.View>
      <Animated.View
        style={[{
          boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.15)",
          backgroundColor: "#FFF",
          padding: 16,
          paddingBottom: 16 + insets.bottom,
        }, modalStyle]}
      >
        <View style={{ height: windowHeight }}>

        </View>
      </Animated.View>

    </Animated.ScrollView>
  );
}