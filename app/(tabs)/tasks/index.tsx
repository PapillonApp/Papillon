import { useCallback, useState } from "react";
import React from "react";
import { StyleSheet, View, SafeAreaView, Dimensions } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { Dynamic } from "@/ui/components/Dynamic";
import { NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { LinearTransition } from "react-native-reanimated";
import { Animation } from "@/ui/utils/Animation";

const { height: screenHeight } = Dimensions.get("window");

export default function TabOneScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker((prev) => !prev);
  }, []);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedScrollView = useAnimatedStyle(() => {
    const topOffset = interpolate(
      scrollY.value,
      [0, 150],
      [250, 0],
      Extrapolate.CLAMP
    );

    return {
      top: topOffset,
      borderTopLeftRadius: interpolate(scrollY.value, [0, 150], [25, 0], Extrapolate.CLAMP),
      borderTopRightRadius: interpolate(scrollY.value, [0, 150], [25, 0], Extrapolate.CLAMP),
    };
  });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
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
                <View style={styles.weekBox}>
                  <Typography variant="navigation" style={styles.weekText}>16</Typography>
                </View>
              </Dynamic>
            </Dynamic>
          </NativeHeaderTopPressable>
        </NativeHeaderTitle>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        style={[styles.list, animatedScrollView]}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={{ marginBottom: 20 }}>
            <Typography variant="h2">Item {i + 1}</Typography>
          </View>
        ))}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#C54CB330",
  },
  header: {
    height: 150,
    backgroundColor: "red",
    padding: 16,
    justifyContent: "center",
    zIndex: 1,
  },
  list: {
    position: "absolute",
    top: 200,
    left: 0,
    right: 0,
    height: screenHeight,
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    zIndex: 2,
  },
  weekBox: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#9E00861A",
  },
  weekText: {
    color: "#C54CB3",
  },
});
