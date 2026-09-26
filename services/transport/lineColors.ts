import type { Line, TransitMode } from "papillon-transport";

import { colorCheck } from "@/utils/colorCheck";

export function contrast(line: Pick<Line, "color" | "textColor" | "mode">): string | undefined {
  if (!line.color) {
    return undefined;
  }
  if (line.textColor && colorCheck(line.textColor, [line.color])) {
    return line.textColor;
  }
  return colorCheck("#FFFFFF", [line.color]) ? "#FFFFFF" : "#000000";
}

export function icon(mode: TransitMode): "Bus" | "Metro" {
  return mode === "bus" || mode === "coach" ? "Bus" : "Metro";
}
