import { useTheme } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, Pressable, PressableProps } from "react-native";
import Reanimated, { Easing, FadeIn, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import { Animation } from "../utils/Animation";
import { PapillonZoomIn, PapillonZoomOut } from "../utils/Transition";
import Typography from "./Typography";
import * as ExpoHaptics from "expo-haptics";
import { runsIOS26 } from "../utils/IsLiquidGlass";

import {
  LiquidGlassView
} from '@callstack/liquid-glass';

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'outline' | 'light' | 'ghost' | 'service';
export type Color = 'primary' | 'text' | 'light' | 'danger' | 'cherry' | 'black' | 'card' | 'blue' | 'orange';
type Size = 'small' | 'medium' | 'large';
type Alignment = 'start' | 'center' | 'end';

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
  disableAnimation?: boolean;
  alignment?: Alignment;
}

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
  disableAnimation: false,
  alignment: 'center' as Alignment,
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
  alignment = defaultProps.alignment,
  disableAnimation = defaultProps.disableAnimation,
  style,
  ...rest
}) => {
  const { colors } = useTheme();

  const colorsList: Record<Color, string> = React.useMemo(() => ({
    primary: colors.primary,
    text: colors.text,
    card: colors.card,
    light: '#FFFFFF',
    danger: '#DC1400',
    cherry: '#D60046',
    black: '#000000',
    blue: '#0059DD',
    orange: '#C94F1A',
  }), [colors]);

  // Animation scale
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }), []);

  const handlePressIn = useCallback(() => {
    ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Soft)
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
    if (disabled) { return colorsList.text + '30'; } // Light color with 30% opacity for disabled state

    switch (variant) {
      case 'outline':
      case 'ghost':
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
      case 'ghost':
        return colors.text + "70"
      case 'primary':
        return colorsList.light;
      case 'service':
        return colorsList.text;
      default:
        return colorsList[color as Color];
    }
  }, [variant, colorsList, color]);

  const justifyContent = useMemo(() => {
    switch (alignment) {
      case 'start':
        return 'flex-start';
      case 'end':
        return 'flex-end';
      case 'center':
      default:
        return 'center';
    }
  }, [alignment]);

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
      justifyContent: justifyContent,
      gap: 5,
      alignItems: 'center',
    },
    variant === 'outline' && {
      borderWidth: 1,
      borderColor: colorsList[color as Color],
      backgroundColor: 'transparent',
    },
    variant === 'service' && {
      borderWidth: 1,
      borderColor: colorsList.text + "30",
      backgroundColor: colorsList.card,
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
  ], [inline, backgroundColor, justifyContent, style, animatedStyle, variant, colorsList, color, size]);

  const buttonIcon = useMemo(() => {
    if (icon) {
      return React.cloneElement(icon as React.ReactElement, {
        // @ts-expect-error
        color: textColor,
        strokeWidth: 2,
      });
    }
    return null;
  }, [icon, textColor]);

  const ButtonContent = (
    (rest.children && !title) ? rest.children : (
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
    )
  )

  const buttonTint = (variant === 'outline' || variant === 'service')
    ? "transparent"
    : (
      (style && typeof style === 'object' && !Array.isArray(style) && 'backgroundColor' in style)
        ? (style as { backgroundColor?: string }).backgroundColor
        : backgroundColor
    );

  if (runsIOS26) {
    return (
      <LiquidGlassView
        key="button:liquid-glass"
        style={{
          width: inline ? undefined : '100%',
          height: 50,
          borderRadius: 160,
          borderCurve: 'continuous',
          backgroundColor: buttonTint,
          overflow: 'visible',
          paddingHorizontal: 18,
          justifyContent: justifyContent,
          alignItems: 'center',
          flexDirection: 'row',
          gap: 5,
          opacity: disabled ? 0.5 : 1,
        }}
        tintColor={
          buttonTint
        }
        {...rest}
        effect="regular"
        interactive={true}
      >
        <Pressable
          onPress={onPress}
          style={{
            width: '100%',
            height: '100%',
            justifyContent: justifyContent,
            alignItems: 'center',
            flexDirection: 'row',
            gap: 5,
          }}
          disabled={disabled}
          {...rest}
        >
          {ButtonContent}
        </Pressable>
      </LiquidGlassView>
    )
  }

  return (
    <AnimatedPressable
      {...rest}
      layout={disableAnimation ? undefined : Animation(LinearTransition)}
      entering={FadeIn}
      exiting={FadeOut}
      style={buttonStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {ButtonContent}
    </AnimatedPressable>
  );
});

Button.displayName = "Button";

export default Button;