import React, { type ReactNode, isValidElement, Children, useMemo, memo } from "react";
import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle, type TextStyle, Platform, TouchableNativeFeedback } from "react-native";
import Reanimated, { type AnimatedProps, LayoutAnimation, LinearTransition } from "react-native-reanimated";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { ChevronRight } from "lucide-react-native";
import { animPapillon } from "@/utils/ui/animations";
import { LinearGradient } from "expo-linear-gradient";

type EntryOrExitLayoutType = NonNullable<AnimatedProps<{}>["entering"]>;

// Predefine styles to avoid recreating them
const listStyles = StyleSheet.create({
  list: {
    borderRadius: 16,
    borderCurve: "continuous",
    flexDirection: "column",
    overflow: "visible",
    marginTop: 24,
  },
  item: {}
});

const listHeaderStyles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 24,
    marginBottom: -10,
    paddingHorizontal: 6,
  },
  icon: {
    opacity: 0.4,
  },
  label: {
    opacity: 0.4,
    fontSize: 13,
    fontFamily: "semibold",
    letterSpacing: 1,
    textTransform: "uppercase",
    flex: 1,
  }
});

const itemStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
  },
  part: {
    padding: 0,
  },
  leading: {
    padding: 9,
    marginRight: 5,
    marginLeft: 6,
  },
  trailing: {
    padding: 9
  },
  content: {
    flex: 1,
    gap: 3,
    paddingVertical: 10,
  }
});

// Memoize frequently used components
const MemoizedChevronRight = ChevronRight;
const MemoizedLinearGradient = LinearGradient;

interface NativeListProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  inline?: boolean;
  animated?: boolean;
  layout?: LayoutAnimation;
  entering?: EntryOrExitLayoutType;
  exiting?: EntryOrExitLayoutType;
}

const NativeListComponent: React.FC<NativeListProps> = ({
  children,
  style,
  inline,
  animated,
  layout,
  entering,
  exiting
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const listStyle = useMemo(() => [
    listStyles.list,
    {
      borderWidth: 0.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      shadowColor: "black",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    inline && { marginTop: 16 },
    style,
  ], [colors.border, colors.card, inline, style]);

  const defaultAnimation = useMemo(() => animPapillon(LinearTransition), []);

  const childrenWithProps = useMemo(() => Children.map(children, (child, index) => {
    if (!isValidElement(child)) return null;

    const separator = (child.props.separator !== false) && index < (React.Children.count(children) - 1);
    const newChild = React.cloneElement(child as React.ReactElement<any>, { separator });

    return (
      <Reanimated.View
        style={listStyles.item}
        layout={animated && (layout ?? defaultAnimation)}
        key={newChild.props.identifier || index}
      >
        {newChild}
      </Reanimated.View>
    );
  }), [children, animated, layout, defaultAnimation]);

  return (
    <Reanimated.View
      style={listStyle}
      layout={animated && (layout ?? defaultAnimation)}
      entering={entering}
      exiting={exiting}
    >
      <Reanimated.View
        style={[{
          borderRadius: 16,
          borderCurve: "continuous",
          overflow: "hidden",
        }]}
        layout={animated && (layout ?? defaultAnimation)}
      >
        {childrenWithProps}
      </Reanimated.View>
    </Reanimated.View>
  );
};

export const NativeList = memo(NativeListComponent);

interface NativeListHeaderProps {
  icon?: ReactNode
  label: string
  leading?: ReactNode
  trailing?: ReactNode
  animated?: boolean
  layout?: LayoutAnimation
  entering?: EntryOrExitLayoutType
  exiting?: EntryOrExitLayoutType
  style?: StyleProp<ViewStyle>
}

const NativeListHeaderComponent: React.FC<NativeListHeaderProps> = ({
  icon,
  label,
  leading,
  trailing,
  animated,
  layout,
  entering,
  exiting,
  style
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const defaultAnimation = useMemo(() => animPapillon(LinearTransition), []);

  const newIcon = useMemo(() => icon && React.cloneElement(icon as React.ReactElement<any>, {
    size: 20,
    strokeWidth: 2.2,
    color: colors.text,
  }), [icon, colors.text]);

  return (
    <Reanimated.View
      style={[listHeaderStyles.container, style]}
      layout={animated && (layout ?? defaultAnimation)}
      entering={entering}
      exiting={exiting}
    >
      {icon && (
        <View style={listHeaderStyles.icon}>
          {newIcon}
        </View>
      )}
      {leading}
      <Text
        style={[
          { color: colors.text },
          listHeaderStyles.label,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        {trailing}
      </View>
    </Reanimated.View>
  );
};

export const NativeListHeader = memo(NativeListHeaderComponent);

type NativePressableProps = React.ComponentProps<typeof Pressable> & {
  androidStyle?: StyleProp<ViewStyle>
};

const NativePressableComponent: React.FC<NativePressableProps> = (props) => {
  if (Platform.OS === "android") {
    return (
      <TouchableNativeFeedback {...props as React.ComponentProps<typeof TouchableNativeFeedback>}>
        <View style={[{ flexDirection: "row", alignItems: "center" }, props.style as StyleProp<ViewStyle>, props.androidStyle]}>
          {props.children as ReactNode}
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <Pressable {...props}>
      {props.children}
    </Pressable>
  );
};

export const NativePressable = memo(NativePressableComponent);

interface NativeItemProps {
  children?: ReactNode;
  onPress?: () => void;
  separator?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  entering?: EntryOrExitLayoutType;
  exiting?: EntryOrExitLayoutType;
  onLongPress?: () => void;
  delayLongPress?: number;
  icon?: ReactNode;
  iconStyle?: ViewStyle;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  androidStyle?: StyleProp<ViewStyle>;
  title?: string;
  subtitle?: string;
  endPadding?: number;
  disabled?: boolean;
  pointerEvents?: any;
}

const NativeItemComponent: React.FC<NativeItemProps> = ({
  children,
  onPress,
  onLongPress,
  delayLongPress,
  separator,
  leading,
  trailing,
  chevron,
  style,
  animated,
  entering,
  exiting,
  icon,
  iconStyle,
  onTouchStart,
  onTouchEnd,
  androidStyle,
  title,
  subtitle,
  endPadding,
  disabled,
  pointerEvents
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const defaultAnimation = useMemo(() => animPapillon(LinearTransition), []);

  const iconProps = useMemo(() => ({
    size: 24,
    strokeWidth: 2.5,
    color: colors.text,
    style: {
      opacity: 0.6,
      marginRight: 6,
    },
  }), [colors.text]);

  const clonedIcon = useMemo(() => {
    if (!icon || !React.isValidElement(icon)) return null;

    return React.cloneElement(icon as React.ReactElement<any>, {
      size: icon.props.size || 24,
      color: icon.props.color || colors.text,
      style: {
        ...icon.props.style,
        marginRight: 16,
        opacity: 0.8,
        marginLeft: 0,
        ...iconStyle,
      },
    });
  }, [icon, colors.text, iconStyle]);

  return (
    <Reanimated.View
      layout={animated && defaultAnimation}
      entering={entering}
      exiting={exiting}
      pointerEvents={pointerEvents}
    >
      <NativePressable
        onPress={!disabled ? onPress : undefined}
        onLongPress={!disabled ? onLongPress : undefined}
        delayLongPress={delayLongPress}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        androidStyle={androidStyle}
        style={({ pressed }) => [
          itemStyles.item,
          onPress && {
            backgroundColor: pressed && !disabled ? colors.text + "12" : "transparent",
          },
          style,
          disabled && {
            opacity: 0.5,
          },
        ]}
      >
        <View style={[itemStyles.part, itemStyles.leading]}>
          {leading && !icon && leading}
          {clonedIcon}
        </View>
        <View style={[
          {
            flex: 1,
            height: "100%",
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            borderBottomWidth: separator ? 0.5 : 0,
            borderColor: colors.border,
          },
          !leading && { marginLeft: -15 },
        ]}>
          <View style={[itemStyles.part, itemStyles.content]}>
            {title && (
              <NativeText variant="title">
                {title}
              </NativeText>
            )}
            {subtitle && (
              <NativeText variant="subtitle">
                {subtitle}
              </NativeText>
            )}
            {children}
          </View>
          <View style={[itemStyles.part, itemStyles.trailing, { paddingRight: endPadding ?? 9 }]}>
            {trailing}
          </View>
          {onPress && chevron !== false && (
            <MemoizedChevronRight {...iconProps} />
          )}
        </View>
      </NativePressable>
    </Reanimated.View>
  );
};

export const NativeItem = memo(NativeItemComponent);

interface NativeIconProps {
  icon: ReactNode;
  color: string;
  style?: StyleProp<ViewStyle>;
}

const NativeIconComponent: React.FC<NativeIconProps> = ({ icon, color, style }) => {
  const iconProps = useMemo(() => ({
    size: 22,
    strokeWidth: 2.4,
    color: "#FFFFFF",
  }), []);

  return (
    <View style={[{
      backgroundColor: color,
      borderRadius: 9,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }, style]}>
      {React.cloneElement(icon as React.ReactElement<any>, iconProps)}
    </View>
  );
};

export const NativeIcon = memo(NativeIconComponent);

interface NativeIconGradientprops {
  icon: ReactNode;
  colors?: string[];
  locations?: number[];
  style?: StyleProp<ViewStyle>;
}

const NativeIconGradientComponent: React.FC<NativeIconGradientprops> = ({
  icon,
  colors = ["#000", "#000"],
  locations = [0, 1],
  style
}) => {
  const iconProps = useMemo(() => ({
    size: 22,
    strokeWidth: 2.4,
    color: "#FFFFFF",
  }), []);

  return (
    <MemoizedLinearGradient
      colors={colors}
      locations={locations}
      style={[{
        backgroundColor: "#000",
        borderRadius: 9,
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
      }, style]}
    >
      {React.cloneElement(icon as React.ReactElement<any>, iconProps)}
    </MemoizedLinearGradient>
  );
};

export const NativeIconGradient = memo(NativeIconGradientComponent);

interface NativeTextProps {
  children: ReactNode;
  variant?: "title" | "titleLarge" | "subtitle" | "overtitle" | "body"| "default" | "titleLarge2";
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  animated?: boolean;
  entering?: EntryOrExitLayoutType;
  exiting?: EntryOrExitLayoutType;
}

const fontStyles = {
  title: { fontFamily: "semibold", fontSize: 17, lineHeight: 20 },
  titleLarge: { fontFamily: "semibold", fontSize: 19, lineHeight: 24 },
  titleLarge2: { fontFamily: "bold", fontSize: 24, lineHeight: 28 },
  subtitle: { fontFamily: "medium", fontSize: 15, lineHeight: 18, opacity: 0.6 },
  overtitle: { fontFamily: "semibold", fontSize: 16, lineHeight: 18 },
  default: { fontFamily: "medium", fontSize: 16, lineHeight: 19 },
};

const NativeTextComponent: React.FC<NativeTextProps> = (props) => {
  const theme = useTheme();
  const { colors } = theme;

  const defaultAnimation = useMemo(() => animPapillon(LinearTransition), []);
  // @ts-expect-error
  const fontStyle = fontStyles[props.variant || "default"];

  return (
    <Reanimated.Text
      {...props}
      style={[{
        fontFamily: "medium",
        fontSize: 16,
        color: props.color || colors.text,
      }, fontStyle, props.style]}
      layout={props.animated && defaultAnimation}
      entering={props.entering}
      exiting={props.exiting}
    >
      {props.children}
    </Reanimated.Text>
  );
};

export const NativeText = memo(NativeTextComponent);