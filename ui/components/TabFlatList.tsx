import { LegendList } from "@legendapp/list";
import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { Dimensions, FlatList, FlatListProps, Platform, View } from "react-native";
import Reanimated, { Extrapolate, interpolate, runOnJS, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AvailablePatterns, Pattern } from "@/ui/components/Pattern/Pattern";

const AnimatedLegendList = Reanimated.createAnimatedComponent(LegendList);
const AnimatedFlatList = Reanimated.createAnimatedComponent(FlatList);
const AnimatedFlashList = Reanimated.createAnimatedComponent(FlashList);

interface TabFlatListProps extends FlatListProps<any> {
  header?: React.ReactNode;
  backgroundColor?: string;
  foregroundColor?: string;
  pattern?: AvailablePatterns;
  height?: number;
  padding?: number;
  paddingTop?: number;
  radius?: number;
  gap?: number;
  engine?: 'FlatList' | 'LegendList' | 'FlashList';
  translucent?: boolean;
  onFullyScrolled?: (isFullyScrolled: boolean) => void;
}

const TabFlatList: React.FC<TabFlatListProps> = ({
  header,
  backgroundColor = "#F7E8F5",
  foregroundColor = "#29947A",
  pattern,
  height = 120,
  padding = 16,
  paddingTop,
  radius = 28,
  gap = 0,
  engine = "FlatList",
  translucent = false,
  onFullyScrolled,
  ...rest
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const screenHeight = Dimensions.get('window').height;
  const headerInset = insets.top + 40;
  const finalHeight = height + headerInset;
  let tabBarHeight = 0;
  try {
    tabBarHeight = 80;
    if (isNaN(tabBarHeight)) tabBarHeight = 0;
  } catch {
    tabBarHeight = 0;
  }

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

  const ListEngine = engine === "LegendList" ? AnimatedLegendList : engine === "FlashList" ? AnimatedFlashList : AnimatedFlatList;

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

        {/* Header Pattern */}
        {pattern && (
          <Pattern pattern={pattern} color={foregroundColor} height={finalHeight} />
        )}

        {/* Background */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -10000,
            backgroundColor: backgroundColor,
          }}
        >
        </View>

        {/* FlatList */}
        <ListEngine
          {...rest}

          onScroll={scrollHandler}
          /* snapToOffsets={[0, height - 16]} // Snap to header and modal positions */
          decelerationRate="normal" // Faster deceleration for smoother feel
          snapToEnd={false} // Disable snap to end for better control
          // scrollEventThrottle is not supported by LegendList, so removed for type safety

          ListFooterComponent={
            <>
              <View style={{ height: Platform.OS === 'ios' ? tabBarHeight + 12 : 260 }} />

              {Platform.OS === 'ios' && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: -995,
                    left: -100,
                    height: 1000,
                    width: Dimensions.get('window').width + 200,
                    backgroundColor: colors.background,
                  }}
                />
              )}
            </>
          }

          showsVerticalScrollIndicator={Platform.OS === 'android' ? false : showScrollIndicator}
          scrollIndicatorInsets={{
            top: 28
          }}

          style={{
            flex: 1,
            zIndex: 9999,
          }}

          contentContainerStyle={{
            minHeight: screenHeight - finalHeight,
            backgroundColor: translucent ? "transparent" : colors.background,
            marginTop: finalHeight,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderCurve: 'continuous',
            padding: padding,
            paddingVertical: padding,
            paddingTop: paddingTop ?? padding,
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