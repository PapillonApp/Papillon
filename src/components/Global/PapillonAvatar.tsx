import React from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Image, type ImageSourcePropType, type ImageStyle, type StyleProp, View } from "react-native";

const PapillonAvatar: React.FC<{
  source: ImageSourcePropType
  badge: React.ReactNode
  badgeOffset?: number
  style?: StyleProp<ImageStyle>
}> = ({ source, badge, badgeOffset = 4, style }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        position: "relative",
      }}
    >
      <Image
        source={source}
        style={[
          {
            width: 38,
            height: 38,
            borderRadius: 20,
            borderColor: theme.colors.text + "20",
            borderWidth: 1,
          },
          style
        ]}
        resizeMode="cover"
      />

      {badge && (
        <View
          style={{
            position: "absolute",
            bottom: 0 - badgeOffset,
            right: 0 - badgeOffset,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: theme.colors.card,
          }}
        >
          {badge}
        </View>
      )}
    </View>
  );
};

export default PapillonAvatar;
