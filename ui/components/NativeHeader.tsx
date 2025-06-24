import React, { useEffect, useMemo } from "react";
import { useNavigation } from "expo-router";
import { Pressable, PressableProps, View, ViewProps, StyleSheet, PressableStateCallbackType } from "react-native";
import Typography from "./Typography";

// Styles extraits pour éviter la recréation à chaque render
const styles = StyleSheet.create({
  side: {
    height: 36,
    minWidth: 36,
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

interface NativeSideProps extends ViewProps {
  children?: React.ReactNode;
  side: 'Left' | 'Right';
}

const NativeHeaderSide = React.memo(function NativeHeaderSide({ children, side, ...props }: NativeSideProps) {
  const navigation = useNavigation();
  const memoChildren = useMemo(() => children, [children]);

  useEffect(() => {
    navigation.setOptions({
      [`header${side}`]: () => (
        <View style={styles.side} {...props}>
          {memoChildren}
        </View>
      ),
    });
  }, [memoChildren, navigation, side, props]);

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
  const memoChildren = useMemo(() => children, [children]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.title} {...props}>
          {memoChildren}
        </View>
      ),
      headerLargeTitle: headerLargeTitle,
      headerSearchBarOptions: search ? {
        placeholder: placeholder,
        onChangeText: (e) => {
          if (onSearch) {
            onSearch(e.nativeEvent.text);
          }
        }
      } : undefined,
    });
    return () => {
      navigation.setOptions({ headerTitle: undefined });
    };
  }, [memoChildren, navigation, headerLargeTitle, props]);

  return null;
});

const NativeHeaderPressable = React.memo(function NativeHeaderPressable(props: PressableProps) {
  // Correction du typage pour la prop style
  const composedStyle = React.useCallback(
    (state: PressableStateCallbackType) => {
      if (typeof props.style === 'function') {
        const styleResult = props.style(state);
        return [styles.pressable, styleResult];
      }
      return [styles.pressable, props.style];
    },
    [props.style]
  );
  return (
    <Pressable {...props} style={composedStyle} />
  );
});

interface NativeHeaderHighlightProps extends ViewProps {
  children?: React.ReactNode;
  color?: string;
}

const NativeHeaderHighlight = React.memo(function NativeHeaderHighlight({ children, color = "#29947A", ...props }: NativeHeaderHighlightProps) {
  const backgroundColor = useMemo(() => color + "22", [color]);
  return (
    <View
      style={[styles.highlight, { backgroundColor }, props.style]}
      {...props}
    >
      {typeof children === 'string' ? (
        <Typography variant="navigation" style={{ color: color }}>
          {children}
        </Typography>
      ) : (
        children
      )}
    </View>
  );
});

export { NativeHeaderSide, NativeHeaderTitle, NativeHeaderPressable, NativeHeaderHighlight };