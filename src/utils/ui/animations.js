import { Easing, withTiming } from "react-native-reanimated";
var SPRING_CONFIG = { mass: 1, damping: 20, stiffness: 300 };
var TIMING_CONFIG = { duration: 300, easing: Easing.bezier(0.3, 0.3, 0, 1) };
var ENTER_CONFIG = {
    duration: 180,
    scaleX: 0.8,
    scaleY: 0.65,
    easing: Easing.bezier(0.3, 0.3, 0, 1),
};
var EXIT_CONFIG = {
    duration: 120,
    scaleX: 0.9,
    scaleY: 0.7,
    easing: Easing.bezier(0.3, 0.3, 0, 1),
};
var animPapillon = function (a) {
    return a === null || a === void 0 ? void 0 : a.springify().mass(SPRING_CONFIG.mass).damping(SPRING_CONFIG.damping).stiffness(SPRING_CONFIG.stiffness);
};
var anim2Papillon = function (a) {
    return a === null || a === void 0 ? void 0 : a.duration(TIMING_CONFIG.duration).easing(TIMING_CONFIG.easing);
};
var ENTER_TIMING = {
    duration: ENTER_CONFIG.duration,
    easing: ENTER_CONFIG.easing,
};
var EXIT_TIMING = {
    duration: EXIT_CONFIG.duration,
    easing: EXIT_CONFIG.easing,
};
var PapillonContextEnter = function () {
    "worklet";
    return {
        initialValues: {
            opacity: 0,
            transform: [
                { scaleX: ENTER_CONFIG.scaleX },
                { scaleY: ENTER_CONFIG.scaleY },
            ],
        },
        animations: {
            opacity: withTiming(1, ENTER_TIMING),
            transform: [
                { scaleX: withTiming(1, ENTER_TIMING) },
                { scaleY: withTiming(1, ENTER_TIMING) },
            ],
        },
    };
};
var PapillonContextExit = function () {
    "worklet";
    return {
        initialValues: {
            opacity: 1,
            transform: [{ scaleX: 1 }, { scaleY: 1 }],
        },
        animations: {
            opacity: withTiming(0, EXIT_TIMING),
            transform: [
                { scaleX: withTiming(EXIT_CONFIG.scaleX, EXIT_TIMING) },
                { scaleY: withTiming(EXIT_CONFIG.scaleY, EXIT_TIMING) },
            ],
        },
    };
};
export { animPapillon, anim2Papillon, PapillonContextEnter, PapillonContextExit, };
