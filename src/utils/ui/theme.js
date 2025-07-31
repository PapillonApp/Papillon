import { useTheme } from "@react-navigation/native";
import { useMemo } from "react";
export function usePapillonTheme() {
    var theme = useTheme();
    return useMemo(function () { return theme; }, [theme]);
}
