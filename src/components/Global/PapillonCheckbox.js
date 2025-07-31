import React, { useEffect, useRef, useState } from "react";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import Reanimated, { LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { PressableScale } from "react-native-pressable-scale";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import PapillonSpinner from "./PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
var PapillonCheckbox = function (_a) {
    var checked = _a.checked, loading = _a.loading, onPress = _a.onPress, style = _a.style, color = _a.color, _b = _a.loaded, loaded = _b === void 0 ? true : _b;
    var theme = useTheme();
    var firstRender = useRef(true);
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    useEffect(function () {
        if (firstRender.current) {
            firstRender.current = false;
        }
    }, []);
    var _c = useState(false), hasPressed = _c[0], setHasPressed = _c[1];
    var pressAction = function () {
        onPress();
        playHaptics("impact", {
            impact: Haptics.ImpactFeedbackStyle.Light,
        });
        setHasPressed(true);
    };
    // on checked change
    useEffect(function () {
        if (checked && hasPressed && loaded) {
            playHaptics("notification", {
                notification: Haptics.NotificationFeedbackType.Success,
            });
        }
    }, [checked, hasPressed]);
    return (<Reanimated.View layout={animPapillon(LinearTransition)}>
      <PressableScale style={[{
                width: 26,
                height: 26,
                borderRadius: 300,
                backgroundColor: theme.colors.text + "00",
                justifyContent: "center",
                alignItems: "center",
            }, style]} onPress={pressAction} activeScale={0.8} weight="light">
        <Reanimated.View style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 300,
            borderColor: theme.colors.text + "22",
            borderWidth: 2,
        }}/>

        {loading && (<Reanimated.View entering={ZoomIn.springify().mass(1).damping(20).stiffness(300).delay(100)} exiting={ZoomOut.duration(100)}>
            <PapillonSpinner size={26} strokeWidth={4} color={color}/>
          </Reanimated.View>)}

        {checked && !loading && (<Reanimated.View style={{
                width: "100%",
                height: "100%",
                borderRadius: 300,
                backgroundColor: color || theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 100,
            }} entering={loaded ?
                ZoomIn
                    .springify()
                    .mass(1)
                    .damping(20)
                    .stiffness(300)
                : void 0} exiting={ZoomOut.duration(100)}>
            {checked && (<Reanimated.View entering={loaded ?
                    ZoomIn
                        .springify()
                        .mass(1)
                        .damping(20)
                        .stiffness(300)
                        .delay(100)
                    : void 0}>
                <Check size={18} strokeWidth={3.5} color="#fff"/>
              </Reanimated.View>)}
          </Reanimated.View>)}
      </PressableScale>
    </Reanimated.View>);
};
export default PapillonCheckbox;
