import React, { useCallback, useState } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useScrollViewOffset,
  useAnimatedRef,
  AnimatedRef,
  LinearTransition,
} from "react-native-reanimated";

import { Animation, PapillonFadeIn, PapillonFadeOut } from "@/ui/utils/Animation";
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
import PatternBackground from "@/ui/components/PatternBackground";
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from "@react-native-masked-view/masked-view";
import { Circle, G, Path } from "react-native-svg";

const PatternTile = ({ x, y }: { x: number; y: number }) => (
  <G opacity="0.24" transform={`translate(${x}, ${y})`}>
    <Path
      d="M3.2583 -2.20435L8.44284 4.98312M13.6274 12.1706L8.44284 4.98312M15.6303 -0.201414L8.44284 4.98312M1.25537 10.1677L8.44284 4.98312"
      stroke="#9E0086"
      strokeOpacity="0.27"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Path
      d="M21.1685 22.625L26.353 29.8125M31.5375 36.9999L26.353 29.8125M33.5405 24.6279L26.353 29.8125M19.1655 34.997L26.353 29.8125"
      stroke="#9E0086"
      strokeOpacity="0.27"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Circle
      cx="29.8125"
      cy="8.44284"
      r="6.26654"
      transform="rotate(9.19595 29.8125 8.44284)"
      stroke="#9E0086"
      strokeOpacity="0.27"
      fill={"transparent"}
      strokeWidth={3}
    />
    <Circle
      cx="4.98312"
      cy="26.353"
      r="6.26654"
      transform="rotate(9.19595 4.98312 26.353)"
      stroke="#9E0086"
      strokeOpacity="0.27"
      strokeWidth={3}
      fill={"transparent"}
    />
  </G>
);

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const scrollViewRef: AnimatedRef<AnimatedScrollView> = useAnimatedRef();

  const scrollOffset = useScrollViewOffset(scrollViewRef);

  const windowHeight = Dimensions.get("window").height;
  const toggleDatePicker = useCallback(() => {
    setShowDatePicker((prev) => !prev);
  }, []);

  const [fullyScrolled, setFullyScrolled] = useState(false);
  const scrollHandler = useCallback(() => {
    const isFullyScrolled = scrollOffset.value / windowHeight >= 0.2;
    if (isFullyScrolled !== fullyScrolled) {
      setFullyScrolled(isFullyScrolled);
    }
  }, [windowHeight, fullyScrolled]);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollOffset.value, [0, 50], [0, 35], Extrapolate.EXTEND),
      },
      {
        scale: interpolate(scrollOffset.value, [0, 50 + insets.top + 125], [1, 0.5], Extrapolate.CLAMP),
      },
    ],
    opacity: interpolate(scrollOffset.value, [0, 50 + 125], [1, 0], Extrapolate.CLAMP),
  }));

  const modalStyle = useAnimatedStyle(() => ({
    borderTopRightRadius: interpolate(scrollOffset.value, [0, 50 + insets.top + 125], [25, 10], Extrapolate.CLAMP),
    borderTopLeftRadius: interpolate(scrollOffset.value, [0, 50 + insets.top + 125], [25, 10], Extrapolate.CLAMP),
  }));

  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: "#f7e8f5" }}>
      <MaskedView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 350
        }}
        maskElement={
          <LinearGradient
            colors={['rgba(247, 232, 245, 0.00)', '#f7e8f5', 'rgba(247, 232, 245, 0.00)']}
            locations={[0.1, 0.5, 0.8]}
            start={{x: 0.9, y: 0.1}}
            end={{x: 0, y: 0.7}}
            style={{ flex: 1 }}
          />
        }
      >
        <PatternBackground PatternTile={PatternTile} />
      </MaskedView>

      <Animated.ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        style={[
          {
            flex: 1,
            backgroundColor: "transparent",
            paddingTop: 50 + insets.top,
          },
        ]}
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
          style={[
            {
              height: 125,
              alignItems: "center",
              justifyContent: "center",
            },
            headerStyle,
          ]}
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
                animated={false}
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
                  <Animated.View key="tasks-visible" entering={PapillonFadeIn} exiting={PapillonFadeOut}>
                    <Typography variant={"body2"} style={{ color: "#C54CB3" }}>
                      Encore 3 tâches
                    </Typography>
                  </Animated.View>
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
          <Stack direction={"horizontal"} hAlign={"center"} style={{ padding: 25 }}>
            <Stack direction={"vertical"} gap={0} style={{ flex: 1 }}>
              <Typography variant={"h1"} style={{ fontSize: 32 }} color={"#C54CB3"}>
                3
              </Typography>
              <Typography variant={"title"} color={"#C54CB3"}>
                tâches restantes
              </Typography>
              <Typography variant={"title"} color={"#C54CB3"}>
                cette semaine
              </Typography>
            </Stack>
            <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}>
              <CircularProgress backgroundColor={"#FFFFFF"} percentageComplete={75} radius={35} strokeWidth={7} fill={"#C54CB3"} />
            </View>
          </Stack>
        </Animated.View>

        <Animated.View
          style={[
            {
              boxShadow: "0px 0px 5px 0px rgba(0, 0, 0, 0.15)",
              backgroundColor: "#FFF",
              padding: 16,
              paddingBottom: 16 + insets.bottom,
            },
            modalStyle,
          ]}
        >
          <View style={{ height: windowHeight }}></View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}