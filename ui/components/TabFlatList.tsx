import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Dimensions, Platform, FlatListProps, Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Reanimated, { Extrapolate, interpolate, runOnJS, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";

import LinearGradient from "react-native-linear-gradient";
import { Circle, G, Path } from "react-native-svg";

import { LegendList, LegendListProps } from "@legendapp/list";

const AnimatedLegendList = Reanimated.createAnimatedComponent(LegendList);

const patterns = {
  dots: require('@/assets/images/patterns/dots.png'),
  checks: require('@/assets/images/patterns/checks.png'),
  grades: require('@/assets/images/patterns/grades.png'),
};

interface TabFlatListProps extends LegendListProps<any>, FlatListProps<any> {
  header?: React.ReactNode;
  backgroundColor?: string;
  foregroundColor?: string;
  pattern?: keyof typeof patterns;
  height?: number;
  padding?: number;
  radius?: number;
  gap?: number;
  onFullyScrolled?: (isFullyScrolled: boolean) => void;
}

const TabFlatList: React.FC<TabFlatListProps> = ({
  header,
  backgroundColor = "#F7E8F5",
  foregroundColor = "#29947A",
  pattern,
  height = 120,
  padding = 16,
  radius = 28,
  gap = 0,
  onFullyScrolled,
  ...rest
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const screenHeight = Dimensions.get('window').height;
  const headerInset = useHeaderHeight() - 10;
  const finalHeight = height + headerInset;

  // Memoize shared values for scroll position and threshold
  const scrollY = React.useRef(useSharedValue(0)).current;
  const isScrolledPastThreshold = React.useRef(useSharedValue(false)).current;

  // Memoize scroll handler for performance
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      const y = event.contentOffset.y;
      scrollY.value = y;


      const wasScrolledPast = isScrolledPastThreshold.value;
      const isNowScrolledPast = y > height - 24;
      if (wasScrolledPast !== isNowScrolledPast) {
        isScrolledPastThreshold.value = isNowScrolledPast;
        if (onFullyScrolled) {
          runOnJS(onFullyScrolled)(isNowScrolledPast);
        }
      }
    }
  });

  // Memoize header animation style for performance
  const headerStyle = useAnimatedStyle(() => {
    'worklet';
    const y = scrollY.value;
    return {
      transform: [
        {
          scale: interpolate(
            y,
            [0, finalHeight],
            [1, 0.5],
            Extrapolate.CLAMP
          ),
        },
        {
          translateY: interpolate(
            y,
            [0, finalHeight],
            [0, -100],
            Extrapolate.EXTEND
          ),
        }
      ],
      opacity: interpolate(y, [0, finalHeight - 150], [1, 0], Extrapolate.CLAMP),
      willChange: 'transform, opacity',
    };
  }, [finalHeight]);

  // Memoize header container style for performance
  const headerContainerStyle = useAnimatedStyle(() => {
    'worklet';
    const y = scrollY.value;
    return {
      height: interpolate(
        y,
        [0, finalHeight],
        [finalHeight, 0],
        Extrapolate.EXTEND
      ),
    };
  }, [finalHeight]);

  // Memoize derived value and scroll indicator state
  const isScrolledPastThresholdDerived = useDerivedValue(() => isScrolledPastThreshold.value);
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(false);

  // Use useAnimatedReaction directly (not inside useEffect)
  useAnimatedReaction(
    () => isScrolledPastThresholdDerived.value,
    (currentValue) => {
      runOnJS(setShowScrollIndicator)(currentValue);
    }
  );

  try {
    return (
      <>
        {/* Header */}
        <Reanimated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10001,
              overflow: 'hidden',
            },
            headerContainerStyle
          ]}
          pointerEvents={showScrollIndicator ? "none" : "auto"}
        >
          <View style={{ height: finalHeight, paddingTop: headerInset }}>
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
        </Reanimated.View>

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
          {pattern && patterns[pattern] ? (
            <Image
              source={patterns[pattern] as any}
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
          ) : null}
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
          // scrollEventThrottle is not supported by LegendList, so removed for type safety

          ListFooterComponent={<View style={{ height: Platform.OS === 'android' ? 180 : 92 }} />}

          showsVerticalScrollIndicator={Platform.OS === 'android' ? false : showScrollIndicator}
          scrollIndicatorInsets={{
            top: 28
          }}

          style={{
            flex: 1,
            zIndex: 9999,
          }}

          contentContainerStyle={{
            minHeight: screenHeight,
            backgroundColor: colors.background,
            marginTop: finalHeight,
            borderRadius: radius,
            borderCurve: 'continuous',
            padding: padding,
            paddingTop: padding - 15,
            gap: gap,
          }}
        />
      </>
    )
  }
  catch (error) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
};

export default TabFlatList;