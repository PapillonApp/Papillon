import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
var SoundHapticsContext = createContext({
    whatTheme: 0,
    enableSon: true,
    enableHaptics: true,
    setWhatTheme: function (value) { },
    setEnableSon: function (value) { },
    setEnableHaptics: function (value) { },
});
export var SoundHapticsProvider = function (_a) {
    var children = _a.children;
    var _b = useState(0), whatTheme = _b[0], setWhatTheme = _b[1];
    var _c = useState(true), enableSon = _c[0], setEnableSon = _c[1];
    var _d = useState(true), enableHaptics = _d[0], setEnableHaptics = _d[1];
    useEffect(function () {
        AsyncStorage.getItem("theme").then(function (value) {
            return setWhatTheme(parseInt(value !== null && value !== void 0 ? value : "0"));
        });
        AsyncStorage.getItem("son").then(function (value) {
            return setEnableSon(value === "true" || value === null);
        });
        AsyncStorage.getItem("haptics").then(function (value) {
            return setEnableHaptics(value === "true" || value === null);
        });
    }, []);
    useEffect(function () {
        AsyncStorage.setItem("theme", String(whatTheme));
    }, [whatTheme]);
    useEffect(function () {
        AsyncStorage.setItem("son", String(enableSon));
    }, [enableSon]);
    useEffect(function () {
        AsyncStorage.setItem("haptics", String(enableHaptics));
    }, [enableHaptics]);
    return (<SoundHapticsContext.Provider value={{
            whatTheme: whatTheme,
            enableSon: enableSon,
            enableHaptics: enableHaptics,
            setWhatTheme: setWhatTheme,
            setEnableSon: setEnableSon,
            setEnableHaptics: setEnableHaptics,
        }}>
      {children}
    </SoundHapticsContext.Provider>);
};
export var useThemeSoundHaptics = function () { return useContext(SoundHapticsContext); };
