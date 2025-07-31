import React from "react";
import { TextInput } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import useScreenDimensions from "@/hooks/useScreenDimensions";
var ResponsiveTextInput = React.forwardRef(function (_a, ref) {
    var defaultValue = _a.defaultValue, value = _a.value, onChangeText = _a.onChangeText, placeholder = _a.placeholder, _b = _a.secureTextEntry, secureTextEntry = _b === void 0 ? false : _b, _c = _a.autoCapitalize, autoCapitalize = _c === void 0 ? "none" : _c, _d = _a.keyboardType, keyboardType = _d === void 0 ? "default" : _d, style = _a.style;
    var theme = useTheme();
    var colors = theme.colors;
    var isTablet = useScreenDimensions().isTablet;
    return (<TextInput style={[
            style,
            {
                borderColor: colors.border,
                color: colors.text,
                maxWidth: isTablet ? "50%" : "100%",
            },
        ]} defaultValue={defaultValue} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.text + "88"} secureTextEntry={secureTextEntry} autoCapitalize={autoCapitalize} keyboardType={keyboardType} ref={ref}/>);
});
export default React.memo(ResponsiveTextInput);
