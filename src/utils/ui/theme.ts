import { useTheme } from "@react-navigation/native";
import { useMemo } from "react";

export function usePapillonTheme () {
  const theme = useTheme();
  return useMemo(() => theme, [theme]);
}
