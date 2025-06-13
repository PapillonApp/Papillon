import { useTheme } from "@react-navigation/native";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";
import React from "react";

const VARIANTS = StyleSheet.create({
  body1: {
    fontSize: 16,
    fontFamily: "medium",
    lineHeight: 24,
  },
  body2: {
    fontSize: 15,
    fontFamily: "semibold",
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontFamily: "regular",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  button: {
    fontSize: 16,
    fontFamily: "semibold",
    lineHeight: 24,
  },
  h1: {
    fontSize: 32,
    fontFamily: "bold",
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontFamily: "bold",
    lineHeight: 34,
  },
  h3: {
    fontSize: 24,
    fontFamily: "bold",
    lineHeight: 30,
  },
  h4: {
    fontSize: 20,
    fontFamily: "bold",
    lineHeight: 26,
  },
  h5: {
    fontSize: 18,
    fontFamily: "semibold",
    lineHeight: 32,
  },
  h6: {
    fontSize: 17,
    fontFamily: "bold",
    lineHeight: 32,
  },
});

type Variant = keyof typeof VARIANTS;
type Color = 'primary' | 'text' | 'secondary';
type Alignment = 'left' | 'center' | 'right' | 'justify';

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: Color;
  align?: Alignment;
  style?: TextStyle | TextStyle[];
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'text',
  align = 'left',
  style,
  ...rest
}) => {
  const { colors } = useTheme();

  const colorsList: Record<Color, string> = React.useMemo(() => ({
    primary: colors.primary,
    text: colors.text,
    secondary: colors.text + '80',
  }), [colors]);

  return (
    <Text
      {...rest}
      style={[
        { color: colorsList[color] },
        { textAlign: align },
        VARIANTS[variant],
        style,
      ]}
    />
  );
};

export default Typography;