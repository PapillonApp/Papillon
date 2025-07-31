import React from "react";
import { View } from "react-native";
import { NativeText } from "../Global/NativeComponents";
import { UsersRound } from "lucide-react-native";
var InitialIndicator = function (_a) {
    var initial = _a.initial, color = _a.color, _b = _a.textColor, textColor = _b === void 0 ? "#FFF" : _b, _c = _a.size, size = _c === void 0 ? 42 : _c;
    return (<View style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            marginLeft: -1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: color,
        }}>
      {initial === "group" ? (<UsersRound size={size / 2} color={textColor}/>) : (<NativeText variant="title" style={{
                color: textColor,
                fontSize: size / 2.25,
                lineHeight: size,
            }}>
          {initial
                .substr(0, 2)
                .toUpperCase()}
        </NativeText>)}
    </View>);
};
export default InitialIndicator;
