import React from "react";

export interface TipAction {
  id: string;
  title: string;
}

export type TipStatus = "available" | "pending" | "invalidated" | "unknown";

export interface PapillonTipViewProps {
  tipId: string;
  title: string;
  message?: string;
  systemImage?: string;
  presentation?: "popover" | "inline";
  arrowEdge?: "top" | "bottom" | "leading" | "trailing";
  actions?: TipAction[];
  tintColor?: string;
  anchorWidth?: number;
  anchorHeight?: number;
  onAction?: (event: { nativeEvent: { id: string } }) => void;
  onStatusChange?: (event: { nativeEvent: { status: TipStatus; reason?: string } }) => void;
  children?: React.ReactNode;
}

/** TipKit is iOS-only; this web implementation deliberately renders nothing. */
export function PapillonTipView(_props: PapillonTipViewProps) {
  return null;
}
