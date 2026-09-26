import React from "react";

// @callstack/liquid-glass ships no web build at all, and merely importing it
// crashes on load (it registers a native view at module scope). Every real
// call site already checks isLiquidGlassSupported / runsIOS26 before
// rendering LiquidGlassView, and that's always false outside iOS 26+, so on
// web this stub is never actually shown — it exists purely so the
// unconditional import doesn't crash the app.
export const isLiquidGlassSupported = false;

export function LiquidGlassView({ children }: { children?: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children ?? null);
}
