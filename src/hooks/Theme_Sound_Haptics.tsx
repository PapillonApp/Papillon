/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SoundHapticsContext = createContext({
  whatTheme: 0,
  enableSon: true,
  enableHaptics: true,
  setWhatTheme: (value: number) => {},
  setEnableSon: (value: boolean) => {},
  setEnableHaptics: (value: boolean) => {},
});

export const SoundHapticsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [whatTheme, setWhatTheme] = useState(0);
  const [enableSon, setEnableSon] = useState(true);
  const [enableHaptics, setEnableHaptics] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("theme").then((value) =>
      setWhatTheme(parseInt(value ?? "0"))
    );
    AsyncStorage.getItem("son").then((value) =>
      setEnableSon(value === "true" || value === null)
    );
    AsyncStorage.getItem("haptics").then((value) =>
      setEnableHaptics(value === "true" || value === null)
    );
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("theme", String(whatTheme));
  }, [whatTheme]);

  useEffect(() => {
    AsyncStorage.setItem("son", String(enableSon));
  }, [enableSon]);

  useEffect(() => {
    AsyncStorage.setItem("haptics", String(enableHaptics));
  }, [enableHaptics]);

  return (
    <SoundHapticsContext.Provider
      value={{
        whatTheme,
        enableSon,
        enableHaptics,
        setWhatTheme,
        setEnableSon,
        setEnableHaptics,
      }}
    >
      {children}
    </SoundHapticsContext.Provider>
  );
};

export const useThemeSoundHaptics = () => useContext(SoundHapticsContext);
