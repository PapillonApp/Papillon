import { useState, useEffect } from "react";
import { Dimensions } from "react-native";
export default function useScreenDimensions() {
    var _a = useState(function () { return Dimensions.get("screen"); }), screenDimensions = _a[0], setScreenDimensions = _a[1];
    useEffect(function () {
        var handleDimensionsChange = function (_a) {
            var screen = _a.screen;
            setScreenDimensions(screen);
        };
        var subscription = Dimensions.addEventListener("change", handleDimensionsChange);
        return function () {
            subscription === null || subscription === void 0 ? void 0 : subscription.remove();
        };
    }, []);
    return {
        width: screenDimensions.width,
        height: screenDimensions.height,
        isTablet: screenDimensions.width > screenDimensions.height,
    };
}
