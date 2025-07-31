import React, { memo } from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { View, Text, ActivityIndicator } from "react-native";
var WidgetHeader = function (_a) {
    var icon = _a.icon, title = _a.title, loading = _a.loading;
    var theme = useTheme();
    var colors = theme.colors;
    var clonedIcon = icon && React.cloneElement(icon, {
        size: 20,
        strokeWidth: 2.3,
        color: colors.text,
    });
    return (<View style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            opacity: 0.5,
        }}>
      {clonedIcon}
      <Text style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 15,
            flex: 1,
        }}>
        {title}
      </Text>
      {loading && <ActivityIndicator />}
    </View>);
};
export default memo(WidgetHeader);
