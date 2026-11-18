import { useTheme } from "expo-router/react-navigation";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo } from "react";
import { StyleProp, Text, TextStyle } from "react-native";

import { type Variant, VARIANTS } from "@/ui/components/Typography";
import { type FontAlias, useFont } from "@/utils/theme/fonts";

import { type HomeworkTextStyle, parseHomeworkHTML } from "./html";

export interface FormattedHomeworkTextProps {
  html: string;
  numberOfLines?: number;
  variant?: Variant;
  weight?: FontAlias;
  color?: string;
  style?: StyleProp<TextStyle>;
  interactiveLinks?: boolean;
}

function resolveTextDecoration(
  textStyle: HomeworkTextStyle
): TextStyle["textDecorationLine"] {
  const underline = Boolean(textStyle.underline || textStyle.href);
  const strikethrough = Boolean(textStyle.strikethrough);

  if (underline && strikethrough) {
    return "underline line-through";
  }
  if (underline) {
    return "underline";
  }
  if (strikethrough) {
    return "line-through";
  }
  return undefined;
}

function openExternalLink(href: string) {
  void WebBrowser.openBrowserAsync(href, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
  });
}

export default function FormattedHomeworkText({
  html,
  numberOfLines,
  variant = "body1",
  weight,
  color = "textPrimary",
  style,
  interactiveLinks = false,
}: FormattedHomeworkTextProps) {
  const { colors } = useTheme();
  const font = useFont();

  const spans = useMemo(() => parseHomeworkHTML(html), [html]);

  const variantConfig = VARIANTS[variant] ?? VARIANTS.body1;
  const baseWeight = weight ?? (variantConfig.fontFamily as FontAlias);
  const resolvedBaseColor =
    color === "textPrimary" || color === "text"
      ? colors.text
      : color === "textSecondary" || color === "secondary"
        ? String(colors.text) + "88"
        : color === "primary"
          ? colors.primary
          : color;

  const baseTextStyle: TextStyle = {
    fontSize: variantConfig.fontSize,
    lineHeight: variantConfig.lineHeight,
    letterSpacing:
      "letterSpacing" in variantConfig ? variantConfig.letterSpacing : undefined,
    fontFamily: font(baseWeight),
    color: resolvedBaseColor,
  };

  if (spans.length === 0) {
    return null;
  }

  return (
    <Text numberOfLines={numberOfLines} style={[baseTextStyle, style]}>
      {spans.map((span, index) => {
        const spanWeight =
          span.style.bold === true
            ? "bold"
            : span.style.bold === false
              ? "regular"
              : baseWeight;

        const spanStyle: TextStyle = {
          fontFamily: font(spanWeight),
          fontStyle: span.style.italic ? "italic" : undefined,
          textDecorationLine: resolveTextDecoration(span.style),
          backgroundColor: span.style.highlightColor,
          color: span.style.href ? colors.primary : undefined,
        };

        const href = interactiveLinks ? span.style.href : undefined;

        return (
          <Text
            key={index}
            style={spanStyle}
            onPress={href ? () => openExternalLink(href) : undefined}
          >
            {span.text}
          </Text>
        );
      })}
    </Text>
  );
}
