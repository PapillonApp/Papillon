import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Dimensions, FlatList, FlatListProps, Image, ListRenderItem, View } from "react-native";
import { useSafeAreaFrame, useSafeAreaInsets } from "react-native-safe-area-context";

import Reanimated, { Extrapolate, interpolate, runOnJS, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";

import PatternBackground from "./PatternBackground";
import { X } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";
import { Circle, G, Path } from "react-native-svg";

import { LegendList, LegendListProps } from "@legendapp/list";

const AnimatedLegendList = Reanimated.createAnimatedComponent(LegendList);

const PatternTile = ({ x, y, color }: { x: number; y: number, color: string }) => (
  <G opacity="0.24" transform={`translate(${x}, ${y})`}>
    <Path
      d="M3.2583 -2.20435L8.44284 4.98312M13.6274 12.1706L8.44284 4.98312M15.6303 -0.201414L8.44284 4.98312M1.25537 10.1677L8.44284 4.98312"
      stroke={color}
      strokeOpacity="0.27"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Path
      d="M21.1685 22.625L26.353 29.8125M31.5375 36.9999L26.353 29.8125M33.5405 24.6279L26.353 29.8125M19.1655 34.997L26.353 29.8125"
      stroke={color}
      strokeOpacity="0.27"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Circle
      cx="29.8125"
      cy="8.44284"
      r="6.26654"
      transform="rotate(9.19595 29.8125 8.44284)"
      stroke={color}
      strokeOpacity="0.27"
      fill={"transparent"}
      strokeWidth={3}
    />
    <Circle
      cx="4.98312"
      cy="26.353"
      r="6.26654"
      transform="rotate(9.19595 4.98312 26.353)"
      stroke={color}
      strokeOpacity="0.27"
      strokeWidth={3}
      fill={"transparent"}
    />
  </G>
);

interface TabFlatListProps extends LegendListProps<any>, FlatListProps<any> {
  header: React.ReactNode;
  backgroundColor?: string;
  foregroundColor?: string;
  height?: number;
  padding?: number;
  gap?: number;
  onFullyScrolled?: (isFullyScrolled: boolean) => void;
}

const TabFlatList: React.FC<TabFlatListProps> = ({
  header,
  backgroundColor = "#F7E8F5",
  foregroundColor = "#29947A",
  height = 120,
  padding = 16,
  gap = 0,
  onFullyScrolled,
  ...rest
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const screenHeight = Dimensions.get('window').height;
  const headerInset = useHeaderHeight() - 10;
  const finalHeight = height + headerInset;

  const scrollY = useSharedValue(0);
  const isScrolledPastThreshold = useSharedValue(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;

      if (onFullyScrolled) {
        const wasScrolledPast = isScrolledPastThreshold.value;
        const isNowScrolledPast = event.contentOffset.y > height - 24;

        if (wasScrolledPast !== isNowScrolledPast) {
          isScrolledPastThreshold.value = isNowScrolledPast;
          runOnJS(onFullyScrolled)(isNowScrolledPast);
        }
      }
    }
  });

  const headerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [0, finalHeight],
            [1, 0.5],
            Extrapolate.CLAMP
          ),
        },
        {
          translateY: interpolate(
            scrollY.value,
            [0, finalHeight],
            [0, -100],
            Extrapolate.EXTEND
          ),
        }
      ],
      opacity: interpolate(scrollY.value, [0, finalHeight - 150], [1, 0], Extrapolate.CLAMP),
      willChange: 'transform, opacity', // Hint for native optimization
    };
  });

  const isScrolledPastThresholdDerived = useDerivedValue(() => isScrolledPastThreshold.value);
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(false);

  useAnimatedReaction(
    () => isScrolledPastThresholdDerived.value,
    (currentValue) => {
      runOnJS(setShowScrollIndicator)(currentValue);
    }
  );

  return (
    <>
      {/* Header */}
      <View
        style={{
          height: finalHeight,
          paddingTop: headerInset,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      >
        <Reanimated.View
          style={[
            {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              height: finalHeight,
              width: '100%',
            },
            headerStyle,
          ]}>
          {header}
        </Reanimated.View>
      </View>

      <MaskedView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 350,
          zIndex: 999,
          backgroundColor: backgroundColor,
        }}
        maskElement={
          <LinearGradient
            colors={['rgba(247, 232, 245, 0.00)', '#f7e8f5', 'rgba(247, 232, 245, 0.00)']}
            locations={[0.1, 0.5, 0.8]}
            start={{ x: 0.99, y: 0.0 }}
            end={{ x: 0, y: 0.7 }}
            style={{ flex: 1 }}
          />
        }
      >
        <Image
          source={require('@/assets/images/patterns/dots.png')}
          tintColor={foregroundColor}
          resizeMethod="resize"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0.10,
          }}
        />
      </MaskedView>

      {/* Background */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: backgroundColor,
        }}
      >
      </View>

      {/* FlatList */}
      <AnimatedLegendList
        {...rest}

        onScroll={scrollHandler}
        /* snapToOffsets={[0, height - 16]} // Snap to header and modal positions */
        decelerationRate="normal" // Faster deceleration for smoother feel
        snapToEnd={false} // Disable snap to end for better control

        ListFooterComponent={<View style={{ height: 92 }} />}

        showsVerticalScrollIndicator={showScrollIndicator}
        scrollIndicatorInsets={{
          top: 28
        }}

        style={{
          flex: 1,
          zIndex: 9999
        }}

        contentContainerStyle={{
          minHeight: screenHeight,
          backgroundColor: colors.background,
          marginTop: finalHeight,
          borderRadius: 28,
          borderCurve: 'continuous',
          padding: padding,
          paddingTop: padding - 12,
          gap: gap
        }}
      />
    </>
  )
};

export default TabFlatList;