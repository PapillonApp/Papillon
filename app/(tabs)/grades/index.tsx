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
import Calendar from "@/ui/components/Calendar";
import { ChevronDown } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const scrollViewRef: AnimatedRef<AnimatedScrollView> = useAnimatedRef();

  const scrollOffset = useScrollViewOffset(scrollViewRef);

  const windowHeight = Dimensions.get('window').height;
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

  const { colors } = useTheme();

  return (
    <Animated.ScrollView
      ref={scrollViewRef}
      scrollEventThrottle={16}
      style={[{
        flex: 1,
        backgroundColor: "#E5F5F6",
        paddingTop: 50 + insets.top,
      }]}
    >
      <Calendar
        key={"calendar-" + date.toISOString()}
        date={date}
        onDateChange={(newDate) => {
          setDate(newDate);
        }}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
      />

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
                <View style={{ paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, backgroundColor: "#FFFFFF"}}>
                  <Typography variant="navigation" style={{ color: "#009EA7" }}>2025</Typography>
                </View>
              </Dynamic>
              <Dynamic animated>
                <Typography variant="navigation">Semestre 2</Typography>
              </Dynamic>
              <Dynamic animated>
                <ChevronDown color={colors.text} opacity={0.7} />
              </Dynamic>
            </Dynamic>
          </NativeHeaderTopPressable>
        </NativeHeaderTitle>
        <Stack direction={"horizontal"} hAlign={"center"} style={{ padding: 16 }}>
          <Stack direction={"vertical"} gap={0} style={{ flex: 1 }}>
            <Stack direction={"horizontal"} gap={3} hAlign={"end"}>
              <Typography variant={"h1"} style={{ fontSize: 32 }} color={"#009EA7"}>15</Typography>
              <Typography variant={"h2"} style={{ paddingBottom: 2}} color={"#009EA7"}>.72</Typography>
              <Typography variant={"h5"} color={"#009EA7"}>/20</Typography>
            </Stack>
            <Stack direction={"horizontal"} hAlign={"center"} gap={3}>
              <Typography variant={"h4"} color={"#009EA7"}>Moyenne des matières</Typography>
              <ChevronDown color={"#009EA7"} />
            </Stack>
            <Typography variant={"body1"} color={"#009EA7"}>Pondération</Typography>
          </Stack>
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