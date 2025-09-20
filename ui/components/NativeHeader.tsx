import { useTheme } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Platform, Pressable, PressableProps, PressableStateCallbackType, StyleSheet, View, ViewProps } from "react-native";
import Reanimated, { LayoutAnimationConfig, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { runsIOS26 } from "../utils/IsLiquidGlass";
import Typography from "./Typography";
import AnimatedNumber from "./AnimatedNumber";
const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

// Pre-computed styles for maximum performance
const styles = StyleSheet.create({
  side: {
    height: 36,
    minWidth: 36,
    alignSelf: "center",
    flexShrink: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    height: 36,
    width: "100%",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  titleAndroid: {
    alignItems: "center",
    justifyContent: "flex-start",
    maxWidth: 300,
  },
  pressable: {
    height: 36,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  highlight: {
    borderRadius: 10,
    borderCurve: "continuous",
    paddingHorizontal: 6,
    marginHorizontal: 2,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

// Pre-computed style arrays to avoid array creation on every render
const PRESSABLE_STYLE_CACHE = new WeakMap();
const getPressableStyle = (userStyle: any) => {
  if (!userStyle) { return styles.pressable; }
  if (PRESSABLE_STYLE_CACHE.has(userStyle)) {
    return PRESSABLE_STYLE_CACHE.get(userStyle);
  }
  const combined = [styles.pressable, userStyle];
  PRESSABLE_STYLE_CACHE.set(userStyle, combined);
  return combined;
};

// Pre-computed color cache to avoid string concatenation
const COLOR_CACHE = new Map();
const getBackgroundColor = (color: string) => {
  if (COLOR_CACHE.has(color)) {
    return COLOR_CACHE.get(color);
  }
  const bgColor = color + "22";
  COLOR_CACHE.set(color, bgColor);
  return bgColor;
};

// Default color constant
const DEFAULT_COLOR = "#29947A";
const DEFAULT_BACKGROUND_COLOR = getBackgroundColor(DEFAULT_COLOR);

interface NativeSideProps extends ViewProps {
  children?: React.ReactNode;
  side: 'Left' | 'Right';
}

const NativeHeaderSide = React.memo(function NativeHeaderSide({ children, side, ...props }: NativeSideProps) {
  const navigation = useNavigation();
  const propsRef = useRef(props);
  const childrenRef = useRef(children);
  const theme = useTheme();

  // Update refs without triggering re-renders
  propsRef.current = props;
  childrenRef.current = children;

  useEffect(() => {
    const headerKey = `header${side}`;
    const renderComponent = () => (
      <View style={[
        styles.side,
        Platform.OS === 'android' ? {
          marginRight: side === 'Left' ? 16 : 0,
          marginLeft: side === 'Right' ? 16 : 0,
        } : {},
      ]} {...propsRef.current}>
        {childrenRef.current}
      </View>
    );

    navigation.setOptions({ [headerKey]: renderComponent });

    return () => {
      navigation.setOptions({ [headerKey]: undefined });
    };
  }, [navigation, side, theme]); // Add theme as a dependency

  return null;
});

interface NativeHeaderTitleProps extends ViewProps {
  children?: React.ReactNode;
  headerLargeTitle?: boolean;
  search?: boolean;
  placeholder?: string;
  onSearch?: (query: string) => void;
  maxWidth?: number;
  ignoreTouch?: boolean;
}

const NativeHeaderTitle = React.memo(function NativeHeaderTitle({
  children,
  headerLargeTitle = false,
  search = false,
  placeholder = "Rechercher",
  onSearch,
  ignoreTouch,
  maxWidth,
  ...props
}: NativeHeaderTitleProps) {
  const navigation = useNavigation();
  const propsRef = useRef(props);
  const childrenRef = useRef(children);
  const onSearchRef = useRef(onSearch);

  // Update refs without triggering re-renders
  propsRef.current = props;
  childrenRef.current = children;
  onSearchRef.current = onSearch;

  useEffect(() => {
    const handleSearch = (e: any) => {
      if (onSearchRef.current) { onSearchRef.current(e.nativeEvent.text); }
    };

    const renderTitle = () => (
      <LayoutAnimationConfig skipEntering>
        <View style={[
          styles.title,
          { maxWidth: maxWidth ?? 200 },
          Platform.OS === 'android' ? styles.titleAndroid : {},
        ]} {...propsRef.current}
          pointerEvents={ignoreTouch ? "none" : "auto"}
        >
          {childrenRef.current}
        </View>
      </LayoutAnimationConfig>
    );

    const searchOptions = search ? {
      placeholder,
      onChangeText: handleSearch,
    } : undefined;

    navigation.setOptions({
      headerTitle: renderTitle,
      headerLargeTitle,
      headerSearchBarOptions: searchOptions,
    });

    return () => {
      navigation.setOptions({
        headerTitle: undefined,
        headerLargeTitle: undefined,
        headerSearchBarOptions: undefined
      });
    };
  }, [navigation, headerLargeTitle, search, placeholder]); // Minimal dependencies

  return null;
});

const NativeHeaderPressable = React.memo(function NativeHeaderPressable(props: PressableProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    opacity.value = withTiming(runsIOS26 ? 0.5 : 0.3, { duration: 20 });
    scale.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    opacity.value = withTiming(1, { duration: 150 });
    scale.value = withTiming(1, { duration: 150 });
  };

  if (typeof props.style === 'function') {
    const styleFunction = (state: PressableStateCallbackType) => {
      const userStyle = props.style as (state: PressableStateCallbackType) => any;
      const styleResult = userStyle(state);
      return [getPressableStyle(styleResult), animatedStyle];
    };

    return (
      <AnimatedPressable
        {...props}
        style={styleFunction}
        onPressIn={(e) => {
          handlePressIn();
          props.onPressIn?.(e);
        }}
        onPressOut={(e) => {
          handlePressOut();
          props.onPressOut?.(e);
        }}
        hitSlop={(runsIOS26 || Platform.OS === 'android') ? 32 : undefined}
      />
    );
  }

  const style = [getPressableStyle(props.style), animatedStyle];
  return (
    <AnimatedPressable
      {...props}
      style={style}
      onPressIn={(e) => {
        handlePressIn();
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        handlePressOut();
        props.onPressOut?.(e);
      }}
      hitSlop={(runsIOS26 || Platform.OS === 'android') ? 32 : undefined}
    />
  );
});

interface NativeHeaderHighlightProps extends ViewProps {
  children?: React.ReactNode;
  color?: string;
  light?: boolean;
}

const NativeHeaderHighlight = React.memo(function NativeHeaderHighlight({
  children,
  color = DEFAULT_COLOR,
  light = false,
  style,
  ...props
}: NativeHeaderHighlightProps) {
  // Use cached background color
  const backgroundColor = light ? 'transparent' : color === DEFAULT_COLOR ? DEFAULT_BACKGROUND_COLOR : getBackgroundColor(color);

  // Pre-compute style array once
  const viewStyle = style ? [styles.highlight, { backgroundColor }, style, light ? { padding: 0 } : {}] : [styles.highlight, { backgroundColor }, light ? { padding: 0 } : {}];

  return (
    <LayoutAnimationConfig skipEntering>
      <View style={viewStyle} {...props}>
        {typeof children === 'string' ? (
          <AnimatedNumber variant="navigation" style={{ color }}>
            {children}
          </AnimatedNumber>
        ) : (
          children
        )}
      </View>
    </LayoutAnimationConfig>
  );
});

export { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle };