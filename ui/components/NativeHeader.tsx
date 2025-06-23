import React from "react";
import { useNavigation } from "expo-router";
import { Pressable, PressableProps, View, ViewProps } from "react-native";
import Typography from "./Typography";

interface NativeSideProps extends ViewProps {
  children?: React.ReactNode;
  side: 'Left' | 'Right';
}

export function NativeHeaderSide({ children, side }: NativeSideProps) {
  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({
      [`header${side}`]: () => (
        <View
          style={{
            height: 36,
            minWidth: 36,
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </View>
      ),
    });
  }, [children, navigation, side]);

  return null;
}

interface NativeHeaderTitleProps extends ViewProps {
  children?: React.ReactNode;
  headerLargeTitle?: boolean;
}

export function NativeHeaderTitle({ children, headerLargeTitle = false }: NativeHeaderTitleProps) {
  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View
          style={{
            height: 36,
            minWidth: 36,
            flexDirection: "row",
            gap: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </View>
      ),
      headerLargeTitle: headerLargeTitle,
    });
  }, [children, navigation]);

  return null;
}

export function NativeHeaderPressable(props: PressableProps) {
  return (
    <Pressable {...props} style={{ height: 36, minWidth: 36, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 4 }} />
  )
}

interface NativeHeaderHighlightProps extends ViewProps {
  children?: React.ReactNode;
  color?: string;
}

export function NativeHeaderHighlight({ children, color = "#29947A" }: NativeHeaderHighlightProps) {
  return (
    <View
      style={{
        backgroundColor: color + "22",
        borderRadius: 10,
        borderCurve: "continuous",
        paddingHorizontal: 6,
        marginHorizontal: 2,
        paddingVertical: 2,
        alignItems: "center",
        justifyContent: "center",
      }}
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
}