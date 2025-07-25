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

  const headerContainerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      height: interpolate(
        scrollY.value,
        [0, finalHeight],
        [finalHeight, 0],
        Extrapolate.EXTEND
      ),
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
          {patterns[pattern] && pattern && (
            <Image
              source={patterns[pattern]}
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
          )}
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
          scrollEventThrottle={16} // Update scroll position every frame

          ListFooterComponent={<View style={{ height: Platform.OS === 'android' ? 180 : 92 }} />}

          showsVerticalScrollIndicator={Platform.OS === 'android' ? false : showScrollIndicator}
          scrollIndicatorInsets={{
            top: 28
          }}

          style={{
            flex: 1,
            zIndex: 9999,
            pointerEvents: 'box-none',
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
            pointerEvents: 'box-none',
          }}
          pointerEvents="none"
        />
      </>
    )
  }
  catch (error) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
};

export default TabFlatList;