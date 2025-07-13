import { useCallback, useState } from "react";
import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate, useScrollViewOffset, useAnimatedRef, AnimatedRef,
} from "react-native-reanimated";

import Typography from "@/ui/components/Typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedScrollView } from "react-native-reanimated/lib/typescript/component/ScrollView";

//  <View style={styles.header}>
//         <NativeHeaderTitle>
//           <NativeHeaderTopPressable
//             onPress={toggleDatePicker}
//             layout={Animation(LinearTransition)}
//           >
//             <Dynamic style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
//               <Dynamic animated>
//                 <Typography variant="navigation">Semaine</Typography>
//               </Dynamic>
//               <Dynamic animated>
//                 <View style={styles.weekBox}>
//                   <Typography variant="navigation" style={styles.weekText}>16</Typography>
//                 </View>
//               </Dynamic>
//             </Dynamic>
//           </NativeHeaderTopPressable>
//         </NativeHeaderTitle>
//       </View>

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();

  const scrollViewRef: AnimatedRef<AnimatedScrollView> = useAnimatedRef();
  
  const scrollOffset = useScrollViewOffset(scrollViewRef);

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
        <Typography variant={"h1"}>3</Typography>
        <Typography variant={"body1"}>tâches restantes cette semaine</Typography>
      </Animated.View>
      <Animated.View
        style={[{
          backgroundColor: "#FFF",
          padding: 16,
          paddingBottom: 16 + insets.bottom,
        }, modalStyle]}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i}
                style={{ marginBottom: 20 }}
          >
            <Typography variant="h2">Item {i + 1}</Typography>
          </View>
        ))}
      </Animated.View>

    </Animated.ScrollView>
  );
}