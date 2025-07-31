import { Platform } from "react-native";
import { NativeText } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { useRef, useEffect } from "react";
var AnimatedNumber = function (_a) {
    var value = _a.value, style = _a.style, contentContainerStyle = _a.contentContainerStyle;
    var isFirstRender = useRef(true);
    useEffect(function () {
        if (isFirstRender.current) {
            isFirstRender.current = false;
        }
    }, []);
    var shouldAnimate = !isFirstRender.current && Platform.OS !== "android";
    return (<Reanimated.View style={[{
                flexDirection: "row",
                alignItems: "flex-end",
                overflow: "hidden",
                paddingHorizontal: 3,
                marginHorizontal: -5,
                paddingVertical: 2,
                marginVertical: -2,
            }, contentContainerStyle]} layout={shouldAnimate ? animPapillon(LinearTransition) : undefined}>
      {value.toString().split("").map(function (n, i) { return (<Reanimated.View key={"".concat(n, "_").concat(i)} entering={shouldAnimate ? animPapillon(FadeInDown).delay(i * 20 + 20).mass(1).damping(30).stiffness(700) : undefined} exiting={shouldAnimate ? animPapillon(FadeOutUp).delay(i * 30) : undefined} layout={shouldAnimate ? animPapillon(LinearTransition) : undefined}>
          <NativeText style={style}>
            {n}
          </NativeText>
        </Reanimated.View>); })}
    </Reanimated.View>);
};
export default AnimatedNumber;
