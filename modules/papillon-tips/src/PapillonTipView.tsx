import { type CommonViewModifierProps } from "@expo/ui/swift-ui";
import { createViewModifierEventListener } from "@expo/ui/swift-ui/modifiers";
import { requireNativeView } from "expo";
import React from "react";
import { Platform } from "react-native";
import { type SFSymbol } from "sf-symbols-typescript";

import { tipsAreSupported } from "./PapillonTipsModule";

export interface TipAction {
  /** Reported back by `onAction`. */
  id: string;
  title: string;
}

export type TipStatus = "available" | "pending" | "invalidated" | "unknown";

export interface PapillonTipViewProps extends CommonViewModifierProps {
  /**
   * Identifies the tip for as long as the app is installed: TipKit files the
   * dismissal under it. Never reuse one for a different hint, and never change
   * one unless the tip is meant to come back for everybody.
   */
  tipId: string;
  title: string;
  message?: string;
  systemImage?: SFSymbol;
  /**
   * `popover` points a callout at this view; `inline` lays a card out in the
   * flow, taking up room like any other view.
   * @default 'popover'
   */
  presentation?: "popover" | "inline";
  /** Side the arrow leaves from. `top` points upwards, at whatever is above. */
  arrowEdge?: "top" | "bottom" | "leading" | "trailing";
  actions?: TipAction[];
  /**
   * Recolors the tip's symbol and action buttons. TipKit draws them in the
   * accent color, so this tints the whole tip rather than one element.
   */
  tintColor?: string;
  /**
   * Size of the invisible box a popover attaches to. SwiftUI centers the arrow
   * on it, so it should roughly match the control being pointed at. Ignored
   * when children are given — they are the anchor then.
   */
  anchorWidth?: number;
  anchorHeight?: number;
  onAction?: (event: { nativeEvent: { id: string } }) => void;
  onStatusChange?: (event: { nativeEvent: { status: TipStatus; reason?: string } }) => void;
  children?: React.ReactNode;
}

// Autolinked on iOS only, and only in builds made since this module landed.
const NativeTipView =
  Platform.OS === "ios" && tipsAreSupported
    ? requireNativeView<PapillonTipViewProps>("PapillonTips", "PapillonTipView")
    : null;

/**
 * A TipKit tip, to be placed inside an `@expo/ui` `Host`.
 *
 * Rendering it only makes the tip *eligible*; TipKit decides whether it is
 * actually shown and remembers a dismissal across launches. So mount it
 * unconditionally and let TipKit do the bookkeeping — there is no "have they
 * seen it yet" flag to keep on the JavaScript side.
 */
export function PapillonTipView({ modifiers, ...restProps }: PapillonTipViewProps) {
  if (!NativeTipView) {
    return null;
  }

  return (
    <NativeTipView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...restProps}
    />
  );
}
