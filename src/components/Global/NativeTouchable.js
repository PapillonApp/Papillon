var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Platform, TouchableHighlight, TouchableNativeFeedback, View } from "react-native";
var NativeTouchable = function (_a) {
    var children = _a.children, contentContainerStyle = _a.contentContainerStyle, props = __rest(_a, ["children", "contentContainerStyle"]);
    if (Platform.OS === "android") {
        return (<TouchableNativeFeedback {...props} style={contentContainerStyle}>
        <View style={props.style}>
          {children}
        </View>
      </TouchableNativeFeedback>);
    }
    return (<TouchableHighlight underlayColor={"rgba(0, 0, 0, 0.1)"} {...props}>
      {children}
    </TouchableHighlight>);
};
export default NativeTouchable;
