import { useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, Pressable, PressableProps } from "react-native";
import Reanimated, { Easing, FadeIn, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import { Animation } from "../utils/Animation";
import { PapillonZoomIn, PapillonZoomOut } from "../utils/Transition";
import Typography from "./Typography";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'outline' | 'light';
export type Color = 'primary' | 'text' | 'light' | 'danger' | 'cherry';
type Size = 'small' | 'medium' | 'large';

interface ButtonProps extends PressableProps {
  variant?: Variant;
  icon?: React.ReactNode;
  color?: Color;
  size?: Size;
  title?: string;
  inline?: boolean;
  loading?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

const defaultProps = {
  variant: 'primary' as Variant,
  icon: null,
  color: 'primary' as Color,
  size: 'medium' as Size,
  title: undefined,
  inline: false,
  loading: false,
  onPress: () => { },
  disabled: false,
};

const Button: React.FC<ButtonProps> = React.memo(({
  variant = defaultProps.variant,
  icon = defaultProps.icon,
  color = defaultProps.color,
  size = defaultProps.size,
  title = defaultProps.title,
  inline = defaultProps.inline,
  loading = defaultProps.loading,
  onPress = defaultProps.onPress,
  disabled = defaultProps.disabled,
  style,
  ...rest
}) => {
  const { colors } = useTheme();

  const colorsList: Record<Color, string> = React.useMemo(() => ({
    primary: colors.primary,
    text: colors.text,
    light: '#FFFFFF',
    danger: '#DC1400',
    cherry: '#D60046',
  }), [colors]);

  // Animation scale
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }), []);

  const handlePressIn = useCallback(() => {
    "use worklet";
    scale.value = withTiming(0.97, { duration: 100, easing: Easing.out(Easing.exp) });
    opacity.value = withTiming(0.7, { duration: 50, easing: Easing.out(Easing.exp) });
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    "use worklet";
    scale.value = withSpring(1, { mass: 1, damping: 20, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
  }, [scale, opacity]);

  const backgroundColor = useMemo(() => {
    if (disabled) {return colorsList.text + '30';} // Light color with 30% opacity for disabled state

    switch (variant) {
    case 'outline':
      return 'transparent';
    case 'light':
      return colorsList[color as Color] + '30';
    case 'primary':
    default:
      return colorsList[color as Color];
    }
  }, [variant, colorsList, color, disabled]);

  const textColor = useMemo(() => {
    switch (variant) {
    case 'primary':
      return colorsList.light;
    default:
      return colorsList[color as Color];
    }
  }, [variant, colorsList, color]);

  const buttonStyle = useMemo(() => [
    {
      width: inline ? 'auto' : '100%',
      borderRadius: 50,
      borderCurve: 'continuous',
      backgroundColor: backgroundColor,
      overflow: 'hidden',
      height: 50,
      paddingHorizontal: 18,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      alignItems: 'center',
    },
    variant === 'outline' && {
      borderWidth: 1,
      borderColor: colorsList[color as Color],
    },
    size === 'small' && {
      height: 40,
      paddingHorizontal: 12,
    },
    size === 'large' && {
      height: 60,
      paddingHorizontal: 24,
    },
    inline && { width: undefined },
    style,
    animatedStyle,
  ], [inline, colors.primary, style, animatedStyle]);

  const buttonIcon = useMemo(() => {
    if (icon) {
      return React.cloneElement(icon as React.ReactElement, {
        // @ts-expect-error
        color: textColor,
        size: 22,
        strokeWidth: 2,
      });
    }
    return null;
  }, [icon, textColor]);

  return (
    <AnimatedPressable
      {...rest}
      layout={Animation(LinearTransition)}
      entering={FadeIn}
      exiting={FadeOut}
      style={buttonStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {(rest.children && !title) ? rest.children : (
        <>
          {loading && (
            <Reanimated.View layout={Animation(LinearTransition)} entering={PapillonZoomIn} exiting={PapillonZoomOut}>
              <ActivityIndicator color={textColor} />
            </Reanimated.View>
          )}
          {buttonIcon && (
            <Reanimated.View layout={Animation(LinearTransition)} entering={PapillonZoomIn} exiting={PapillonZoomOut}>
              {buttonIcon}
            </Reanimated.View>
          )}
          <Reanimated.View layout={Animation(LinearTransition)}>
            <Typography variant="button" color={textColor}>
              {title || "Button"}
            </Typography>
          </Reanimated.View>
          {rest.children && typeof rest.children !== "function" && (
            <Reanimated.View layout={Animation(LinearTransition)} entering={PapillonZoomIn} exiting={PapillonZoomOut}>
              {rest.children}
            </Reanimated.View>
          )}
        </>
      )}
    </AnimatedPressable>
  );
});

Button.displayName = "Button";

export default Button;