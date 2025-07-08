import React, { useEffect, useRef } from "react";
import { useNavigation } from "expo-router";
import { Pressable, PressableProps, View, ViewProps, StyleSheet, PressableStateCallbackType, Platform, TouchableNativeFeedback } from "react-native";
import Typography from "./Typography";

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
    maxWidth: 200,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  titleAndroid: {
    marginHorizontal: 8,
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
  },
});

// Pre-computed style arrays to avoid array creation on every render
const PRESSABLE_STYLE_CACHE = new WeakMap();
const getPressableStyle = (userStyle: any) => {
  if (!userStyle) return styles.pressable;
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

  // Update refs without triggering re-renders
  propsRef.current = props;
  childrenRef.current = children;

  useEffect(() => {
    const headerKey = `header${side}`;
    const renderComponent = () => (
      <View style={[
        styles.side
      ]} {...propsRef.current}>
        {childrenRef.current}
      </View>
    );

    navigation.setOptions({ [headerKey]: renderComponent });

    return () => {
      navigation.setOptions({ [headerKey]: undefined });
    };
  }, [navigation, side]); // Only side and navigation as dependencies

  return null;
});

interface NativeHeaderTitleProps extends ViewProps {
  children?: React.ReactNode;
  headerLargeTitle?: boolean;
  search?: boolean;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const NativeHeaderTitle = React.memo(function NativeHeaderTitle({
  children,
  headerLargeTitle = false,
  search = false,
  placeholder = "Rechercher",
  onSearch,
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
      if (onSearchRef.current) onSearchRef.current(e.nativeEvent.text);
    };

    const renderTitle = () => (
      <View style={[
        styles.title,
        Platform.OS === 'android' ? styles.titleAndroid : {},
      ]} {...propsRef.current}>
        {childrenRef.current}
      </View>
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
  // Pre-optimized style function using cache
  if (typeof props.style === 'function') {
    const styleFunction = (state: PressableStateCallbackType) => {
      const userStyle = props.style as (state: PressableStateCallbackType) => any;
      const styleResult = userStyle(state);
      return getPressableStyle(styleResult);
    };

    return <Pressable {...props} style={styleFunction} />;
  }

  // Static style - use cached version
  const style = getPressableStyle(props.style);
  return <Pressable {...props} style={style} />;
});

interface NativeHeaderHighlightProps extends ViewProps {
  children?: React.ReactNode;
  color?: string;
}

const NativeHeaderHighlight = React.memo(function NativeHeaderHighlight({
  children,
  color = DEFAULT_COLOR,
  style,
  ...props
}: NativeHeaderHighlightProps) {
  // Use cached background color
  const backgroundColor = color === DEFAULT_COLOR ? DEFAULT_BACKGROUND_COLOR : getBackgroundColor(color);

  // Pre-compute style array once
  const viewStyle = style ? [styles.highlight, { backgroundColor }, style] : [styles.highlight, { backgroundColor }];

  return (
    <View style={viewStyle} {...props}>
      {typeof children === 'string' ? (
        <Typography variant="navigation" style={{ color }}>
          {children}
        </Typography>
      ) : (
        children
      )}
    </View>
  );
});

export { NativeHeaderSide, NativeHeaderTitle, NativeHeaderPressable, NativeHeaderHighlight };