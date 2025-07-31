import React from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Image, View } from "react-native";
var PapillonAvatar = function (_a) {
    var source = _a.source, badge = _a.badge, _b = _a.badgeOffset, badgeOffset = _b === void 0 ? 4 : _b, style = _a.style;
    var theme = useTheme();
    return (<View style={{
            position: "relative",
        }}>
      <Image source={source} style={[
            {
                width: 38,
                height: 38,
                borderRadius: 20,
                borderColor: theme.colors.text + "20",
                borderWidth: 1,
            },
            style
        ]} resizeMode="cover"/>

      {badge && (<View style={{
                position: "absolute",
                bottom: 0 - badgeOffset,
                right: 0 - badgeOffset,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: theme.colors.card,
            }}>
          {badge}
        </View>)}
    </View>);
};
export default PapillonAvatar;
