import React, { memo } from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { View, Text, ActivityIndicator } from "react-native";

const WidgetHeader: React.FC<{
  title: string;
  icon?: React.ReactElement;
  loading?: boolean;
}> = ({ icon, title, loading }) => {
  const theme = useTheme();
  const { colors } = theme;

  const clonedIcon = icon && React.cloneElement(icon, {
    size: 20,
    strokeWidth: 2.3,
    color: colors.text,
  });

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        opacity: 0.5,
      }}
    >
      {clonedIcon}
      <Text
        style={{
          color: colors.text,
          fontFamily: "semibold",
          fontSize: 15,
          flex: 1,
        }}
      >
        {title}
      </Text>
      {loading && <ActivityIndicator />}
    </View>
  );
};

export default memo(WidgetHeader);
