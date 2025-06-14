import { ActivityIndicator, Pressable, PressableProps } from "react-native";
import Typography from "./Typography";
import React, { useCallback, useMemo } from "react";
import { useTheme } from "@react-navigation/native";
import Reanimated, { FadeIn, FadeOut, LinearTransition, useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from "react-native-reanimated";
import { Animation } from "../utils/Animation";
import { PapillonZoomIn, PapillonZoomOut, Transition } from "../utils/Transition";

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'outline' | 'light';
type Color = 'primary' | 'text' | 'light' | 'danger';

interface ButtonProps extends PressableProps {
  variant?: Variant;
  color?: Color;
  title?: string;
  inline?: boolean;
  loading?: boolean;
  onPress?: () => void;
}

const defaultProps = {
  variant: 'primary' as Variant,
  color: 'primary' as Color,
  title: 'Button',
  inline: false,
  loading: false,
  onPress: () => {},
};

const Button: React.FC<ButtonProps> = React.memo(({
  variant = defaultProps.variant,
  color = defaultProps.color,
  title = defaultProps.title,
  inline = defaultProps.inline,
  loading = defaultProps.loading,
  onPress = defaultProps.onPress,
  style,
  ...rest
}) => {
  const { colors } = useTheme();
  
  const colorsList: Record<Color, string> = React.useMemo(() => ({
    primary: colors.primary,
    text: colors.text,
    light: '#FFFFFF',
    danger: '#DC1400',
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
    switch (variant) {
      case 'outline':
        return 'transparent';
      case 'light':
        return colorsList[color as Color] + '30';
      case 'primary':
      default:
        return colorsList[color as Color];
    }
  }, [variant, colorsList, color]);

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
      height: 48,
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
    inline && { width: undefined },
    style,
    animatedStyle,
  ], [inline, colors.primary, style, animatedStyle]);

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
      {rest.children ? rest.children : (
        <>
          {loading && (
            <Reanimated.View layout={Animation(LinearTransition)} entering={PapillonZoomIn} exiting={PapillonZoomOut}>
              <ActivityIndicator color={textColor} />
            </Reanimated.View>
          )}
          <Reanimated.View layout={Animation(LinearTransition)}>
            <Typography variant="button" color={textColor}>
              {title}
            </Typography>
          </Reanimated.View>
        </>
      )}
    </AnimatedPressable>
  );
});

Button.displayName = "Button";

export default Button;