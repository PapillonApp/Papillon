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
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { CircularProgress } from "@/ui/components/CircularProgress";
import Calendar from "@/ui/components/Calendar";
import { AlignCenter, Search } from "lucide-react-native";
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


  const [fullyScrolled, setFullyScrolled] = useState(false);
  const scrollHandler = useCallback((event: any) => {
    const isFullyScrolled = scrollOffset.value / windowHeight >= 0.2;
    if (isFullyScrolled !== fullyScrolled) {
      setFullyScrolled(isFullyScrolled);
    }
  }, [windowHeight, insets.top, fullyScrolled]);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollOffset.value, [0, 50], [0, 35], Extrapolate.EXTEND) },
      { scale: interpolate(scrollOffset.value, [0, 50 + insets.top + 125], [1, 0.8], Extrapolate.CLAMP) },
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
      onScroll={scrollHandler}
      style={[{
        flex: 1,
        backgroundColor: "#F7E8F5",
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
        <NativeHeaderSide side="Left">
          <NativeHeaderPressable
            onPress={() => {
              console.log("Add new grade pressed");
            }}
          >
            <AlignCenter color={colors.text} />
          </NativeHeaderPressable>
        </NativeHeaderSide>
        <NativeHeaderTitle key={`header-title-${fullyScrolled}`}>
          <NativeHeaderTopPressable onPress={toggleDatePicker} layout={Animation(LinearTransition)}>
            <Dynamic
              style={
                fullyScrolled
                  ? { flexDirection: "column", alignItems: "center", gap: 4, marginTop: 10 }
                  : { flexDirection: "column", alignItems: "center", gap: 4 }
              }
            >
              <Dynamic style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Dynamic animated>
                  <Typography variant="navigation">Semaine</Typography>
                </Dynamic>
                <Dynamic animated>
                  <View
                    style={{
                      paddingVertical: 2,
                      paddingHorizontal: 6,
                      borderRadius: 8,
                      backgroundColor: "#9E00861A",
                    }}
                  >
                    <Typography variant="navigation" style={{ color: "#C54CB3" }}>
                      16
                    </Typography>
                  </View>
                </Dynamic>
              </Dynamic>
              {fullyScrolled && (
                <Dynamic animated key="tasks-visible">
                  <Typography variant={"body2"} style={{ color: "#C54CB3" }}>Encore 3 tâches</Typography>
                </Dynamic>
              )}
            </Dynamic>
          </NativeHeaderTopPressable>
        </NativeHeaderTitle>
        <NativeHeaderSide side="Right">
          <NativeHeaderPressable
            onPress={() => {
              console.log("Add new grade pressed");
            }}
          >
            <Search color={colors.text} />
          </NativeHeaderPressable>
        </NativeHeaderSide>
        <Stack direction={"horizontal"} hAlign={"center"} style={{ padding: 16 }}>
          <Stack direction={"vertical"} gap={0} style={{ flex: 1 }}>
            <Typography variant={"h1"} style={{ fontSize: 32 }} color={"#C54CB3"}>3</Typography>
            <Typography variant={"title"} color={"#C54CB3"}>tâches restantes</Typography>
            <Typography variant={"title"} color={"#C54CB3"}>cette semaine</Typography>
          </Stack>
          <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}>
            <CircularProgress backgroundColor={"#FFFFFF"} percentageComplete={75} radius={35} strokeWidth={7} fill={"#C54CB3"} />
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