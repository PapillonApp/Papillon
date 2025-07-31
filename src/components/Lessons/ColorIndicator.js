var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React from "react";
import { View, Image } from "react-native";
var ColorIndicator = function (_a) {
    var color = _a.color, style = _a.style, width = _a.width, borderRadius = _a.borderRadius;
    return (<View style={__assign({ flex: (style === null || style === void 0 ? void 0 : style.flex) || 1, justifyContent: "center", alignItems: "center" }, style)}>
      <View style={{
            backgroundColor: color + "88",
            width: width || 10,
            flex: 1,
            borderRadius: borderRadius || 0,
            overflow: "hidden",
        }}>
        <Image source={require("../../../assets/images/mask_lesson.png")} resizeMode="cover" style={{ width: "100%", height: "100%", tintColor: color }}/>
      </View>
    </View>);
};
export default React.memo(ColorIndicator);
